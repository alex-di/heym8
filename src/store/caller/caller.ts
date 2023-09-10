import {EventEmitter} from 'events';
import { MessageType, StoreEvent } from '../enums';
import { ICaller } from './types';
import { WsConnector } from './ws-connector';
import { createRtcConnection } from './create-rtc-connection';

export class Caller extends EventEmitter implements ICaller {
  private clientID = 0;
  private myHostname: string;
  private username: string;
  private roomId: string;
  
  private myUsername = null;
  private peers = {};      // To store username of other peer
  private webcamStream = null;        // MediaStream from webcam

  private connector: WsConnector
  
  // The media constraints object describes what sort of stream we want
  // to request from the local A/V hardware (typically a webcam and
  // microphone). Here, we specify only that we want both audio and
  // video; however, you can be more specific. It's possible to state
  // that you would prefer (or require) specific resolutions of video,
  // whether to prefer the user-facing or rear-facing camera (if available),
  // and so on.
  //
  // See also:
  // https://developer.mozilla.org/en-US/docs/Web/API/MediaStreamConstraints
  // https://developer.mozilla.org/en-US/docs/Web/API/MediaDevices/getUserMedia
  private mediaConstraints = {
    audio: true,            // We want an audio track
    video: {
      aspectRatio: {
        ideal: 1.333333     // 3:2 aspect is preferred
      }
    }
  };


  constructor({ username, roomId }) {
    super();
    // Get our hostname

    var myHostname = window.location.hostname;
    if (!myHostname) {
      myHostname = "localhost";
    }

    this.roomId = roomId;
    this.myHostname = myHostname;
    this.username = username;
    this.log("Hostname: " + myHostname);
    this.connector = new WsConnector({
      onOpen: (evt) => {
        // document.getElementById("text").disabled = false;
        // document.getElementById("send").disabled = false;
        this.emit(StoreEvent.CONN_OPEN)
        this.setUsername(evt);
      }
    })

    
    // Received an updated user list 
    this.connector.on("userlist", (msg) => {
      this.handleUserlistMsg(msg);
    })

    // Signaling messages: these messages are used to trade WebRTC
    // signaling information during negotiations leading up to a video
    // call.
    
    // Invitation and offer to chat
    this.connector.on("video-offer", (msg) => {
      this.handleVideoOfferMsg(msg);
    })

    // Callee has answered our offer
    this.connector.on("video-answer",  (msg) => {
      this.handleVideoAnswerMsg(msg);
    })

    // A new ICE candidate has been received
    this.connector.on("new-ice-candidate", (msg) => {
      this.handleNewICECandidateMsg(msg);
    })

    // The other peer has hung up the call
    this.connector.on("hang-up", (msg) => {
      this.handleHangUpMsg(msg);
    })

    this.connector.on("username", (msg) => {
      const text = JSON.stringify({ type: MessageType.USER_JOINED, time: msg.time, name: msg.name})
      this.emit(StoreEvent.MESSAGE, text)
    })

    this.connector.on("message", (msg) => {
      const text = JSON.stringify({ type: MessageType.USER_MESSAGE, time: msg.time, name: msg.name, text: msg.text })
      this.emit(StoreEvent.MESSAGE, text)
    })

    this.connector.on("note", (msg) => {
      this.emit(StoreEvent.NOTE, JSON.parse(msg.text))
    })

    this.connector.on("reconnect", (msg) => {
      console.log('onReconnect', msg)
      this.emit(StoreEvent.RECONNECT, msg.text)
    })
    this.connector.on("rejectusername", (msg) => {
      this.myUsername = msg.name;
      const text = JSON.stringify({ type: MessageType.REJECT_USERNAME, time: msg.time, name: msg.name})
      this.emit(StoreEvent.MESSAGE, text)

    })     

    this.muteLocalStream = this.muteLocalStream.bind(this);
    this.unmuteLocalStream = this.unmuteLocalStream.bind(this);
  }

  // Called when the "id" message is received; this message is sent by the
  // server to assign this login session a unique ID number; in response,
  // this function sends a "username" message to set our username for this
  // session.
  public setUsername(myUsername: string) {
    this.myUsername = myUsername;

    this.sendToServer({
      name: myUsername,
      date: Date.now(),
      id: this.clientID,
      type: "username"
    });
  }

  private log(text) {
    var time = new Date();
    console.log("[" + time.toLocaleTimeString() + "] " + text);
  }

  // Output an error message to console.
  private log_error(text) {
    var time = new Date();
    console.trace("[" + time.toLocaleTimeString() + "] " + text);
  }


  private sendToServer(msg) {
    this.log("Sending '" + msg.type);
    this.connector.send({...msg, roomId: this.roomId})
  }
  
  // Handles a click on the Send button (or pressing return/enter) by
  // building a "message" object and sending it to the server.
  public sendText(text: string) {
    var msg = {
      text,
      type: "message",
      id: this.clientID,
      date: Date.now()
    };
    this.sendToServer(msg);
  }

  public sendNote(note, octave) {
    var msg = {
      text: JSON.stringify({ note, octave }),
      type: "note",
      id: this.clientID,
      date: Date.now()
    };
    this.sendToServer(msg);
  }

  public sendReconnect(user) {
    var msg = {
      type: "reconnect",
      text: this.myUsername,
      target: user,
      id: this.clientID,
      date: Date.now()
    };
    this.sendToServer(msg);
  }
  
  // Create the RTCPeerConnection which knows how to talk to our
  // selected STUN/TURN server and then uses getUserMedia() to find
  // our camera and microphone and add that stream to the connection for
  // use in our video call. Then we configure event handlers to get
  // needed notifications on the call.
  
  private async createPeerConnection(user) {
    const connection = this.peers[user] = createRtcConnection({ hostname: this.myHostname });
  
    // Set up event handlers for the ICE negotiation process.
  
    connection.onicecandidate = this.handleICECandidateEvent.bind(this, user);
    connection.oniceconnectionstatechange = this.handleICEConnectionStateChangeEvent.bind(this, user);
    connection.onicegatheringstatechange = this.handleICEGatheringStateChangeEvent.bind(this, user);
    connection.onsignalingstatechange = this.handleSignalingStateChangeEvent.bind(this, user);
    connection.onnegotiationneeded = this.handleNegotiationNeededEvent.bind(this, user);
    connection.ontrack = this.handleTrackEvent.bind(this, user);
    return connection;
  }
  
  // Called by the WebRTC layer to let us know when it's time to
  // begin, resume, or restart ICE negotiation.
  
  private async handleNegotiationNeededEvent(user) {
    this.log("*** Negotiation needed");
  
    try {
      // this.log("---> Creating offer");
      const offer = await this.peers[user].createOffer();
  
      // If the connection hasn't yet achieved the "stable" state,
      // return to the caller. Another negotiationneeded event
      // will be fired when the state stabilizes.
  
      if (this.peers[user].signalingState != "stable") {
        // this.log("     -- The connection isn't stable yet; postponing...")
        return;
      }
  
      // Establish the offer as the local peer's current
      // description.
  
      // this.log("---> Setting local description to the offer");
      await this.peers[user].setLocalDescription(offer);
  
      // Send the offer to the remote peer.
  
      // this.log("---> Sending the offer to the remote peer");
      this.sendToServer({
        name: this.myUsername,
        target: user,
        type: "video-offer",
        sdp: this.peers[user].localDescription
      });
    } catch(err) {
      this.log("*** The following error occurred while handling the negotiationneeded event:");
      this.reportError(err);
    };
  }
  
  // Called by the WebRTC layer when events occur on the media tracks
  // on our WebRTC call. This includes when streams are added to and
  // removed from the call.
  //
  // track events include the following fields:
  //
  // RTCRtpReceiver       receiver
  // MediaStreamTrack     track
  // MediaStream[]        streams
  // RTCRtpTransceiver    transceiver
  //
  // In our case, we're just taking the first stream found and attaching
  // it to the <video> element for incoming media.
  
  private handleTrackEvent(user, event) {
    this.log("*** Track event");
    this.emit(StoreEvent.REMOTE_STREAM, {id: user, stream: event.streams[0]})
  }
  
  // Handles |icecandidate| events by forwarding the specified
  // ICE candidate (created by our local ICE agent) to the other
  // peer through the signaling server.
  private handleICECandidateEvent(user, event) {
    if (event.candidate) {
      this.log("*** Outgoing ICE candidate: " + event.candidate.candidate);
  
      this.sendToServer({
        type: "new-ice-candidate",
        target: user,
        name: this.username,
        candidate: event.candidate
      });
    }
  }
  
  // Handle |iceconnectionstatechange| events. This will detect
  // when the ICE connection is closed, failed, or disconnected.
  //
  // This is called when the state of the ICE agent changes.
  private handleICEConnectionStateChangeEvent(user, event) {
    this.log("*** ICE connection state changed to " + this.peers[user].iceConnectionState);
  
    switch(this.peers[user].iceConnectionState) {
      case "closed":
      case "failed":
        break;
    
      case "disconnected":
        this.closeVideoCall(user);

        this.sendReconnect(user)
    }
  }
  
  // Set up a |signalingstatechange| event handler. This will detect when
  // the signaling connection is closed.
  //
  // NOTE: This will actually move to the new RTCPeerConnectionState enum
  // returned in the property RTCPeerConnection.connectionState when
  // browsers catch up with the latest version of the specification!
  private handleSignalingStateChangeEvent(user, event) {
    this.log("*** WebRTC signaling state changed to: " + this.peers[user].signalingState);
    switch(this.peers[user].signalingState) {
      case "closed":
        this.closeVideoCall(user);
        break;
    }
  }
  
  // Handle the |icegatheringstatechange| event. This lets us know what the
  // ICE engine is currently working on: "new" means no networking has happened
  // yet, "gathering" means the ICE engine is currently gathering candidates,
  // and "complete" means gathering is complete. Note that the engine can
  // alternate between "gathering" and "complete" repeatedly as needs and
  // circumstances change.
  //
  // We don't need to do anything when this happens, but we log it to the
  // console so you can see what's going on when playing with the sample.
  private handleICEGatheringStateChangeEvent(user, event) {
    this.log("*** ICE gathering state changed to: " + this.peers[user].iceGatheringState);
  }
  
  private handleUserlistMsg(msg) {
    this.emit(StoreEvent.USER_LIST, msg.users)
  }
  
  // Close the RTCPeerConnection and reset variables so that the user can
  // make or receive another call if they wish. This is called both
  // when the user hangs up, the other user hangs up, or if a connection
  // failure is detected.
  
  public closeVideoCall(user) {
    // this.log("Closing the call");
    // Close the RTCPeerConnection
    
    if (this.peers[user]) {
      this.log("--> Closing the peer connection");
      
      // Disconnect all our event listeners; we don't want stray events
      // to interfere with the hangup while it's ongoing.
      this.peers[user].ontrack = null;
      this.peers[user].onnicecandidate = null;
      this.peers[user].oniceconnectionstatechange = null;
      this.peers[user].onsignalingstatechange = null;
      this.peers[user].onicegatheringstatechange = null;
      this.peers[user].onnotificationneeded = null;
      
      // Stop all transceivers on the connection
      this.peers[user].getTransceivers().forEach(transceiver => {
        transceiver.stop();
      });
      
      // Stop the webcam preview as well by pausing the <video>
      // element, then stopping each of the getUserMedia() tracks
      // on it.
      
      // if (localVideo.srcObject) {
        //   localVideo.pause();
        //   localVideo.srcObject.getTracks().forEach(track => {
          //     track.stop();
          //   });
          // }
          
          // Close the peer connection
          
      this.peers[user].close();
      this.peers[user] = null;
      this.webcamStream = null;
      this.emit(StoreEvent.CALL_CLOSED, user)
    }
  }
  
  // Handle the "hang-up" message, which is sent if the other peer
  // has hung up the call or otherwise disconnected.
  private handleHangUpMsg({user}) {
    // this.log("*** Received hang up notification from other peer");
    this.closeVideoCall(user);
  }
  
  // Hang up the call by closing our end of the connection, then
  // sending a "hang-up" message to the other peer (keep in mind that
  // the signaling is done on a different connection). This notifies
  // the other peer that the connection should be terminated and the UI
  // returned to the "no call in progress" state.
  
  public hangUpCall() {
    Object.keys(this.peers).forEach((peer) => {
      this.closeVideoCall(peer);
    }) 
  
    this.sendToServer({
      name: this.myUsername,
      // target: this.targets[targetId],
      type: "hang-up"
    });
  }

  public muteLocalStream() {
    this.webcamStream.getAudioTracks().forEach(track => track.enabled = false)
  }

  public unmuteLocalStream() {
    this.webcamStream.getAudioTracks().forEach(track => track.enabled = true)
  }
  
  // Handle a click on an item in the user list by inviting the clicked
  // user to video chat. Note that we don't actually send a message to
  // the callee here -- calling RTCPeerConnection.addTrack() issues
  // a |notificationneeded| event, so we'll let our handler for that
  // make the offer.
  public async invite(user) {
    // this.log("Starting to prepare an invitation");
    if (this.peers[user]) {
      alert("You can't start a call because you already have one open!");
    } else {
      if (user === this.myUsername) {
        alert("I'm afraid I can't let you talk to yourself. That would be weird.");
        return;
      }
      this.peers[user] = await this.createPeerConnection(user);
  
      // Get access to the webcam stream and attach it to the
      // "preview" box (id "local_video").
  
      try {
        this.webcamStream = await navigator.mediaDevices.getUserMedia(this.mediaConstraints);
        this.emit(StoreEvent.LOCAL_STREAM, this.webcamStream)
      } catch(err) {
        this.handleGetUserMediaError(user, err);
        return;
      }
  
      // Add the tracks from the stream to the RTCPeerConnection
      try {
        this.webcamStream.getTracks().forEach(
          track => this.peers[user].addTransceiver(track, {streams: [this.webcamStream]})
        );
      } catch(err) {
        this.handleGetUserMediaError(user, err);
      }
    }
  }


  
  public async reinvite(user) {
    if (user === this.myUsername) {
      alert("I'm afraid I can't let you talk to yourself. That would be weird.");
      return;
    }
    // this.log("Starting to reinvite user");
    this.peers[user] = await this.createPeerConnection(user);
  
    // Get access to the webcam stream and attach it to the
    // "preview" box (id "local_video").
    try {
      this.webcamStream = await navigator.mediaDevices.getUserMedia(this.mediaConstraints);
      this.emit(StoreEvent.LOCAL_STREAM, this.webcamStream)
    } catch(err) {
      this.handleGetUserMediaError(user, err);
      return;
    }

    // Add the tracks from the stream to the RTCPeerConnection

    try {
      this.webcamStream.getTracks().forEach(
        track => this.peers[user].addTransceiver(track, {streams: [this.webcamStream]})
      );
    } catch(err) {
      this.handleGetUserMediaError(user, err);
    }
  
  }
  
  // Accept an offer to video chat. We configure our local settings,
  // create our RTCPeerConnection, get and attach our local camera
  // stream, then create and send an answer to the caller.
  
  private async handleVideoOfferMsg(msg) {
    const user = msg.name;
  
    // If we're not already connected, create an RTCPeerConnection
    // to be linked to the caller.
  
    // this.log("Received video chat offer from " + user);
    if (!this.peers[user]) {
      await this.createPeerConnection(user);
    }
  
    // We need to set the remote description to the received SDP offer
    // so that our local WebRTC layer knows how to talk to the caller.
  
    var desc = new RTCSessionDescription(msg.sdp);
  
    // If the connection isn't stable yet, wait for it...
  
    if (this.peers[user].signalingState != "stable") {
      // this.log("  - But the signaling state isn't stable, so triggering rollback");
  
      // Set the local and remove descriptions for rollback; don't proceed
      // until both return.
      await Promise.all([
        this.peers[user].setLocalDescription({type: "rollback"}),
        this.peers[user].setRemoteDescription(desc)
      ]);
      return;
    } else {
      // this.log ("  - Setting remote description");
      await this.peers[user].setRemoteDescription(desc);
    }
  
    // Get the webcam stream if we don't already have it
  
    if (!this.webcamStream) {
      try {
        this.webcamStream = await navigator.mediaDevices.getUserMedia(this.mediaConstraints);
      } catch(err) {
        this.handleGetUserMediaError(user, err);
        return;
      }
  
      this.emit('onLocalStream', this.webcamStream)
  
      // Add the camera stream to the RTCPeerConnection
  
      try {
        this.webcamStream.getTracks().forEach(
          track => this.peers[user].addTransceiver(track, {streams: [this.webcamStream]})
        );
      } catch(err) {
        this.handleGetUserMediaError(user, err);
      }
    }
  
    // this.log("---> Creating and sending answer to caller");
  
    await this.peers[user].setLocalDescription(await this.peers[user].createAnswer());
  
    this.sendToServer({
      name: this.myUsername,
      target: user,
      type: "video-answer",
      sdp: this.peers[user].localDescription
    });
  }
  
  // Responds to the "video-answer" message sent to the caller
  // once the callee has decided to accept our request to talk.
  
  private async handleVideoAnswerMsg(msg) {
    // this.log("*** Call recipient has accepted our call");
  
    // Configure the remote description, which is the SDP payload
    // in our "video-answer" message.
  
    var desc = new RTCSessionDescription(msg.sdp);
    await this.peers[msg.name].setRemoteDescription(desc).catch((e) => this.reportError(e));
  }
  
  // A new ICE candidate has been received from the other peer. Call
  // RTCPeerConnection.addIceCandidate() to send it along to the
  // local ICE framework.
  
  private async handleNewICECandidateMsg(msg) {
    var candidate = new RTCIceCandidate(msg.candidate);
  
    // this.log("*** Adding received ICE candidate: " + JSON.stringify(candidate));
    try {
      if (!this.peers[msg.name]) {
        return this.log('ICE CANDIDATE HAS NO PEER FOR USER ' + msg.name)
      }
      await this.peers[msg.name].addIceCandidate(candidate)
    } catch(err) {
      this.reportError(err);
    }
  }
  
  // Handle errors which occur when trying to access the local media
  // hardware; that is, exceptions thrown by getUserMedia(). The two most
  // likely scenarios are that the user has no camera and/or microphone
  // or that they declined to share their equipment when prompted. If
  // they simply opted not to share their media, that's not really an
  // error, so we won't present a message in that situation.
  
  private handleGetUserMediaError(user, e) {
    this.log_error(e);
    switch(e.name) {
      case "NotFoundError":
        alert("Unable to open your call because no camera and/or microphone" +
              "were found.");
        break;
      case "SecurityError":
      case "PermissionDeniedError":
        // Do nothing; this is the same as the user canceling the call.
        break;
      default:
        alert("Error opening your camera and/or microphone: " + e.message);
        break;
    }
  
    // Make sure we shut down our end of the RTCPeerConnection so we're
    // ready to try again.
  
    this.closeVideoCall(user);
  }
  
  // Handles reporting errors. Currently, we just dump stuff to console but
  // in a real-world application, an appropriate (and user-friendly)
  // error message should be displayed.
  
  private reportError(errMessage) {
    this.log_error(`Error ${errMessage.name}: ${errMessage.message}`);
  }
}
  
  
