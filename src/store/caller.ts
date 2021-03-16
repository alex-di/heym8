import {EventEmitter} from 'events';
import { MessageType, StoreEvent } from './enums';

export class Caller extends EventEmitter {
    private connection = null;
    private clientID = 0;
    private myHostname: string;
    private username: string;
    
    private myUsername = null;
    private peers = {};      // To store username of other peer
    private webcamStream = null;        // MediaStream from webcam
    
    
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
    
  
      constructor({ username }) {
        super();
          // Get our hostname
  
          var myHostname = window.location.hostname;
          if (!myHostname) {
            myHostname = "localhost";
          }
  
          this.myHostname = myHostname;
          this.username = username;
          this.log("Hostname: " + myHostname);
          this.connect();
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
        var msgJSON = JSON.stringify(msg);
  
        this.log("Sending '" + msg.type + "' message: " + msgJSON);
        this.connection.send(msgJSON);
      }
  
      
      
      // Open and configure the connection to the WebSocket server.
      
      private connect() {
        var serverUrl;
        var scheme = "ws";
      
        // If this is an HTTPS connection, we have to use a secure WebSocket
        // connection too, so add another "s" to the scheme.
      
        var port = '';
        if (document.location.protocol === "https:") {
          scheme += "s";
        } else {
          
          port += ':6503'
        }
        serverUrl = scheme + "://" + this.myHostname + port + "/ws";
      
        this.log(`Connecting to server: ${serverUrl}`);
        this.connection = new WebSocket(serverUrl, "json");
      
        this.connection.onopen = (evt) => {
          // document.getElementById("text").disabled = false;
          // document.getElementById("send").disabled = false;
          this.emit(StoreEvent.CONN_OPEN, evt)
        };
      
        this.connection.onerror = (evt) => {
          console.dir(evt);
        }
      
        this.connection.onmessage = (evt) => {
          // var chatBox = document.querySelector(".chatbox");
          var text = "";
          var msg = JSON.parse(evt.data);
          this.log("Message received: ");
          console.dir(msg);
          var time = new Date(msg.date);
          var timeStr = time.toLocaleTimeString();
      
          switch(msg.type) {
            case "id":
              this.clientID = msg.id;
              this.setUsername(this.username);
              break;
            case "userlist":      // Received an updated user list
              this.handleUserlistMsg(msg);
              break;
      
            // Signaling messages: these messages are used to trade WebRTC
            // signaling information during negotiations leading up to a video
            // call.
      
            case "video-offer":  // Invitation and offer to chat
              this.handleVideoOfferMsg(msg);
              break;
      
            case "video-answer":  // Callee has answered our offer
              this.handleVideoAnswerMsg(msg);
              break;
      
            case "new-ice-candidate": // A new ICE candidate has been received
              this.handleNewICECandidateMsg(msg);
              break;
      
            case "hang-up": // The other peer has hung up the call
              this.handleHangUpMsg(msg);
              break;
              
            case "username":
              text = JSON.stringify({ type: MessageType.USER_JOINED, time: timeStr, name: msg.name})
              break;
      
            case "message":
              text = JSON.stringify({ type: MessageType.USER_MESSAGE, time: timeStr, name: msg.name, text: msg.text })
              break;
      
            case "rejectusername":
              this.myUsername = msg.name;
              text = JSON.stringify({ type: MessageType.REJECT_USERNAME, time: timeStr, name: msg.name})
              break;
      
      
            // Unknown message; output to console for debugging.
      
            default:
              this.log_error("Unknown message received:");
              this.log_error(msg);
          }
      
          // If there's text to insert into the chat buffer, do so now, then
          // scroll the chat panel so that the new text is visible.
          
      
          if (text.length) {
            this.emit(StoreEvent.MESSAGE, text)
            // chatBox.innerHTML += text;
            // chatBox.scrollTop = chatBox.scrollHeight - chatBox.clientHeight;
          }
        };
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
      
      // Handler for keyboard events. This is used to intercept the return and
      // enter keys so that we can call send() to transmit the entered text
      // to the server.
      // private handleKey(evt) {
      //   if (evt.keyCode === 13 || evt.keyCode === 14) {
      //     if (!document.getElementById("send").disabled) {
      //       this.handleSendButton();
      //     }
      //   }
      // }
      
      // Create the RTCPeerConnection which knows how to talk to our
      // selected STUN/TURN server and then uses getUserMedia() to find
      // our camera and microphone and add that stream to the connection for
      // use in our video call. Then we configure event handlers to get
      // needed notifications on the call.
      
      private async createPeerConnection(user) {
        this.log("Setting up a connection...");
      
        // Create an RTCPeerConnection which knows to use our chosen
        // STUN server.
      
        const connection = this.peers[user] = new RTCPeerConnection({
          iceServers: [     // Information about ICE servers - Use your own!
            {
              urls: "turn:" + this.myHostname,  // A TURN server
              username: "webrtc",
              credential: "turnserver"
            },
            ...[
    "23.21.150.121:3478",
    "iphone-stun.strato-iphone.de:3478",
    "numb.viagenie.ca:3478",
    "s1.taraba.net:3478",
    "s2.taraba.net:3478",
    "stun.12connect.com:3478",
    "stun.12voip.com:3478",
    "stun.1und1.de:3478",
    "stun.2talk.co.nz:3478",
    "stun.2talk.com:3478",
    "stun.3clogic.com:3478",
    "stun.3cx.com:3478",
    "stun.a-mm.tv:3478",
    "stun.aa.net.uk:3478",
    "stun.acrobits.cz:3478",
    "stun.actionvoip.com:3478",
    "stun.advfn.com:3478",
    "stun.aeta-audio.com:3478",
    "stun.aeta.com:3478",
    "stun.alltel.com.au:3478",
    "stun.altar.com.pl:3478",
    "stun.annatel.net:3478",
    "stun.antisip.com:3478",
    "stun.arbuz.ru:3478",
    "stun.avigora.com:3478",
    "stun.avigora.fr:3478",
    "stun.awa-shima.com:3478",
    "stun.awt.be:3478",
    "stun.b2b2c.ca:3478",
    "stun.bahnhof.net:3478",
    "stun.barracuda.com:3478",
    "stun.bluesip.net:3478",
    "stun.bmwgs.cz:3478",
    "stun.botonakis.com:3478",
    "stun.budgetphone.nl:3478",
    "stun.budgetsip.com:3478",
    "stun.cablenet-as.net:3478",
    "stun.callromania.ro:3478",
    "stun.callwithus.com:3478",
    "stun.cbsys.net:3478",
    "stun.chathelp.ru:3478",
    "stun.cheapvoip.com:3478",
    "stun.ciktel.com:3478",
    "stun.cloopen.com:3478",
    "stun.colouredlines.com.au:3478",
    "stun.comfi.com:3478",
    "stun.commpeak.com:3478",
    "stun.comtube.com:3478",
    "stun.comtube.ru:3478",
    "stun.cope.es:3478",
    "stun.counterpath.com:3478",
    "stun.counterpath.net:3478",
    "stun.cryptonit.net:3478",
    "stun.darioflaccovio.it:3478",
    "stun.datamanagement.it:3478",
    "stun.dcalling.de:3478",
    "stun.decanet.fr:3478",
    "stun.demos.ru:3478",
    "stun.develz.org:3478",
    "stun.dingaling.ca:3478",
    "stun.doublerobotics.com:3478",
    "stun.drogon.net:3478",
    "stun.duocom.es:3478",
    "stun.dus.net:3478",
    "stun.e-fon.ch:3478",
    "stun.easybell.de:3478",
    "stun.easycall.pl:3478",
    "stun.easyvoip.com:3478",
    "stun.efficace-factory.com:3478",
    "stun.einsundeins.com:3478",
    "stun.einsundeins.de:3478",
    "stun.ekiga.net:3478",
    "stun.epygi.com:3478",
    "stun.etoilediese.fr:3478",
    "stun.eyeball.com:3478",
    "stun.faktortel.com.au:3478",
    "stun.freecall.com:3478",
    "stun.freeswitch.org:3478",
    "stun.freevoipdeal.com:3478",
    "stun.fuzemeeting.com:3478",
    "stun.gmx.de:3478",
    "stun.gmx.net:3478",
    "stun.gradwell.com:3478",
    "stun.halonet.pl:3478",
    "stun.hellonanu.com:3478",
    "stun.hoiio.com:3478",
    "stun.hosteurope.de:3478",
    "stun.ideasip.com:3478",
    "stun.imesh.com:3478",
    "stun.infra.net:3478",
    "stun.internetcalls.com:3478",
    "stun.intervoip.com:3478",
    "stun.ipcomms.net:3478",
    "stun.ipfire.org:3478",
    "stun.ippi.fr:3478",
    "stun.ipshka.com:3478",
    "stun.iptel.org:3478",
    "stun.irian.at:3478",
    "stun.it1.hr:3478",
    "stun.ivao.aero:3478",
    "stun.jappix.com:3478",
    "stun.jumblo.com:3478",
    "stun.justvoip.com:3478",
    "stun.kanet.ru:3478",
    "stun.kiwilink.co.nz:3478",
    "stun.kundenserver.de:3478",
    "stun.l.google.com:19302",
    "stun.linea7.net:3478",
    "stun.linphone.org:3478",
    "stun.liveo.fr:3478",
    "stun.lowratevoip.com:3478",
    "stun.lugosoft.com:3478",
    "stun.lundimatin.fr:3478",
    "stun.magnet.ie:3478",
    "stun.manle.com:3478",
    "stun.mgn.ru:3478",
    "stun.mit.de:3478",
    "stun.mitake.com.tw:3478",
    "stun.miwifi.com:3478",
    "stun.modulus.gr:3478",
    "stun.mozcom.com:3478",
    "stun.myvoiptraffic.com:3478",
    "stun.mywatson.it:3478",
    "stun.nas.net:3478",
    "stun.neotel.co.za:3478",
    "stun.netappel.com:3478",
    "stun.netappel.fr:3478",
    "stun.netgsm.com.tr:3478",
    "stun.nfon.net:3478",
    "stun.noblogs.org:3478",
    "stun.noc.ams-ix.net:3478",
    "stun.node4.co.uk:3478",
    "stun.nonoh.net:3478",
    "stun.nottingham.ac.uk:3478",
    "stun.nova.is:3478",
    "stun.nventure.com:3478",
    "stun.on.net.mk:3478",
    "stun.ooma.com:3478",
    "stun.ooonet.ru:3478",
    "stun.oriontelekom.rs:3478",
    "stun.outland-net.de:3478",
    "stun.ozekiphone.com:3478",
    "stun.patlive.com:3478",
    "stun.personal-voip.de:3478",
    "stun.petcube.com:3478",
    "stun.phone.com:3478",
    "stun.phoneserve.com:3478",
    "stun.pjsip.org:3478",
    "stun.poivy.com:3478",
    "stun.powerpbx.org:3478",
    "stun.powervoip.com:3478",
    "stun.ppdi.com:3478",
    "stun.prizee.com:3478",
    "stun.qq.com:3478",
    "stun.qvod.com:3478",
    "stun.rackco.com:3478",
    "stun.rapidnet.de:3478",
    "stun.rb-net.com:3478",
    "stun.refint.net:3478",
    "stun.remote-learner.net:3478",
    "stun.rixtelecom.se:3478",
    "stun.rockenstein.de:3478",
    "stun.rolmail.net:3478",
    "stun.rounds.com:3478",
    "stun.rynga.com:3478",
    "stun.samsungsmartcam.com:3478",
    "stun.schlund.de:3478",
    "stun.services.mozilla.com:3478",
    "stun.sigmavoip.com:3478",
    "stun.sip.us:3478",
    "stun.sipdiscount.com:3478",
    "stun.sipgate.net:10000",
    "stun.sipgate.net:3478",
    "stun.siplogin.de:3478",
    "stun.sipnet.net:3478",
    "stun.sipnet.ru:3478",
    "stun.siportal.it:3478",
    "stun.sippeer.dk:3478",
    "stun.siptraffic.com:3478",
    "stun.skylink.ru:3478",
    "stun.sma.de:3478",
    "stun.smartvoip.com:3478",
    "stun.smsdiscount.com:3478",
    "stun.snafu.de:3478",
    "stun.softjoys.com:3478",
    "stun.solcon.nl:3478",
    "stun.solnet.ch:3478",
    "stun.sonetel.com:3478",
    "stun.sonetel.net:3478",
    "stun.sovtest.ru:3478",
    "stun.speedy.com.ar:3478",
    "stun.spokn.com:3478",
    "stun.srce.hr:3478",
    "stun.ssl7.net:3478",
    "stun.stunprotocol.org:3478",
    "stun.symform.com:3478",
    "stun.symplicity.com:3478",
    "stun.sysadminman.net:3478",
    "stun.t-online.de:3478",
    "stun.tagan.ru:3478",
    "stun.tatneft.ru:3478",
    "stun.teachercreated.com:3478",
    "stun.tel.lu:3478",
    "stun.telbo.com:3478",
    "stun.telefacil.com:3478",
    "stun.tis-dialog.ru:3478",
    "stun.tng.de:3478",
    "stun.twt.it:3478",
    "stun.u-blox.com:3478",
    "stun.ucallweconn.net:3478",
    "stun.ucsb.edu:3478",
    "stun.ucw.cz:3478",
    "stun.uls.co.za:3478",
    "stun.unseen.is:3478",
    "stun.usfamily.net:3478",
    "stun.veoh.com:3478",
    "stun.vidyo.com:3478",
    "stun.vipgroup.net:3478",
    "stun.virtual-call.com:3478",
    "stun.viva.gr:3478",
    "stun.vivox.com:3478",
    "stun.vline.com:3478",
    "stun.vo.lu:3478",
    "stun.vodafone.ro:3478",
    "stun.voicetrading.com:3478",
    "stun.voip.aebc.com:3478",
    "stun.voip.blackberry.com:3478",
    "stun.voip.eutelia.it:3478",
    "stun.voiparound.com:3478",
    "stun.voipblast.com:3478",
    "stun.voipbuster.com:3478",
    "stun.voipbusterpro.com:3478",
    "stun.voipcheap.co.uk:3478",
    "stun.voipcheap.com:3478",
    "stun.voipfibre.com:3478",
    "stun.voipgain.com:3478",
    "stun.voipgate.com:3478",
    "stun.voipinfocenter.com:3478",
    "stun.voipplanet.nl:3478",
    "stun.voippro.com:3478",
    "stun.voipraider.com:3478",
    "stun.voipstunt.com:3478",
    "stun.voipwise.com:3478",
    "stun.voipzoom.com:3478",
    "stun.vopium.com:3478",
    "stun.voxgratia.org:3478",
    "stun.voxox.com:3478",
    "stun.voys.nl:3478",
    "stun.voztele.com:3478",
    "stun.vyke.com:3478",
    "stun.webcalldirect.com:3478",
    "stun.whoi.edu:3478",
    "stun.wifirst.net:3478",
    "stun.wwdl.net:3478",
    "stun.xs4all.nl:3478",
    "stun.xtratelecom.es:3478",
    "stun.yesss.at:3478",
    "stun.zadarma.com:3478",
    "stun.zadv.com:3478",
    "stun.zoiper.com:3478",
    "stun1.faktortel.com.au:3478",
    "stun1.l.google.com:19302",
    "stun1.voiceeclipse.net:3478",
    "stun2.l.google.com:19302",
    "stun3.l.google.com:19302",
    "stun4.l.google.com:19302",
    "stunserver.org:3478",].map(s => ({
      urls: 'stun:' + s,
    }))
          ]
        });
      
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
          this.log("---> Creating offer");
          const offer = await this.peers[user].createOffer();
      
          // If the connection hasn't yet achieved the "stable" state,
          // return to the caller. Another negotiationneeded event
          // will be fired when the state stabilizes.
      
          if (this.peers[user].signalingState != "stable") {
            this.log("     -- The connection isn't stable yet; postponing...")
            return;
          }
      
          // Establish the offer as the local peer's current
          // description.
      
          this.log("---> Setting local description to the offer");
          await this.peers[user].setLocalDescription(offer);
      
          // Send the offer to the remote peer.
      
          this.log("---> Sending the offer to the remote peer");
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
        // document.getElementById("received_video").srcObject = event.streams[0];
        // document.getElementById("hangup-button").disabled = false;
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
          case "disconnected":
            this.closeVideoCall(user);
            break;
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
      
      // Given a message containing a list of usernames, this function
      // populates the user list box with those names, making each item
      // clickable to allow starting a video call.
      
      private handleUserlistMsg(msg) {
        // var i;
        // var listElem = document.querySelector(".userlistbox");
      
        // Remove all current list members. We could do this smarter,
        // by adding and updating users instead of rebuilding from
        // scratch but this will do for this sample.
      
      //   while (listElem.firstChild) {
      //     listElem.removeChild(listElem.firstChild);
      //   }
      
      //   // Add member names from the received list.
      
      //   msg.users.forEach(function(username) {
      //     var item = document.createElement("li");
      //     item.appendChild(document.createTextNode(username));
      //     item.addEventListener("click", invite, false);
      
      //     listElem.appendChild(item);
      //   });
        this.emit(StoreEvent.USER_LIST, msg.users)
      }
      
      // Close the RTCPeerConnection and reset variables so that the user can
      // make or receive another call if they wish. This is called both
      // when the user hangs up, the other user hangs up, or if a connection
      // failure is detected.
      
      private closeVideoCall(user) {
        // var localVideo = document.getElementById("local_video");
      
        this.log("Closing the call");
        
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
        this.log("*** Received hang up notification from other peer");
      
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
      
      // Handle a click on an item in the user list by inviting the clicked
      // user to video chat. Note that we don't actually send a message to
      // the callee here -- calling RTCPeerConnection.addTrack() issues
      // a |notificationneeded| event, so we'll let our handler for that
      // make the offer.
      
      public async invite(user) {
        this.log("Starting to prepare an invitation");
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
            console.log("ADD TRA", user, this.peers)
            this.webcamStream.getTracks().forEach(
              track => this.peers[user].addTransceiver(track, {streams: [this.webcamStream]})
            );
          } catch(err) {
            this.handleGetUserMediaError(user, err);
          }
        }
      }
      
      // Accept an offer to video chat. We configure our local settings,
      // create our RTCPeerConnection, get and attach our local camera
      // stream, then create and send an answer to the caller.
      
      private async handleVideoOfferMsg(msg) {
        const user = msg.name;
      
        // If we're not already connected, create an RTCPeerConnection
        // to be linked to the caller.
      
        this.log("Received video chat offer from " + user);
        if (!this.peers[user]) {
          await this.createPeerConnection(user);
        }
      
        // We need to set the remote description to the received SDP offer
        // so that our local WebRTC layer knows how to talk to the caller.
      
        var desc = new RTCSessionDescription(msg.sdp);
      
        // If the connection isn't stable yet, wait for it...
      
        if (this.peers[user].signalingState != "stable") {
          this.log("  - But the signaling state isn't stable, so triggering rollback");
      
          // Set the local and remove descriptions for rollback; don't proceed
          // until both return.
          await Promise.all([
            this.peers[user].setLocalDescription({type: "rollback"}),
            this.peers[user].setRemoteDescription(desc)
          ]);
          return;
        } else {
          this.log ("  - Setting remote description");
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
      
        this.log("---> Creating and sending answer to caller");
      
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
        this.log("*** Call recipient has accepted our call");
      
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
      
        this.log("*** Adding received ICE candidate: " + JSON.stringify(candidate));
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
  
  
  
  
