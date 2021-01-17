/*
 *  Copyright (c) 2015 The WebRTC project authors. All Rights Reserved.
 *
 *  Use of this source code is governed by a BSD-style license
 *  that can be found in the LICENSE file in the root of the source
 *  tree.
 */

'use strict';

// const video1 = document.querySelector('video#video1');
// const video2 = document.querySelector('video#video2');
// const video3 = document.querySelector('video#video3');

class Call {
    pc1Local;
    pc1Remote;
    pc2Local;
    pc2Remote;
    offerOptions = {
        offerToReceiveAudio: 1,
        offerToReceiveVideo: 1
    };
    localStream;

    servers = null;

    

    start(callback) {
        console.log('Requesting local stream');
        navigator.mediaDevices
            .getUserMedia({
                audio: true,
                video: true
            })
            .then((stream) => {
                this.localStream = stream;
                callback(stream);
            })
            .catch(e => console.log('getUserMedia() error: ', e));
    }

    call({
        remoteStreamCallback,
        // secondStreamCallback,
    }) {
        // callButton.disabled = true;
        // hangupButton.disabled = false;
        console.log('Starting calls');

        const audioTracks = this.localStream.getAudioTracks();
        const videoTracks = this.localStream.getVideoTracks();
        if (audioTracks.length > 0) {
            console.log(`Using audio device: ${audioTracks[0].label}`);
        }
        if (videoTracks.length > 0) {
            console.log(`Using video device: ${videoTracks[0].label}`);
        }
        // Create an RTCPeerConnection via the polyfill.
        this.pc1Remote = new RTCPeerConnection(this.servers);
        this.pc1Local = new RTCPeerConnection(this.servers);
        this.pc1Remote.ontrack = (e) => remoteStreamCallback(e.streams[0]);
        this.pc1Local.onicecandidate = this.iceCallback1Local.bind(this);
        this.pc1Remote.onicecandidate = this.iceCallback1Remote.bind(this);
        console.log('pc1: created local and remote peer connection objects');

        // this.pc2Local = new RTCPeerConnection(servers);
        // this.pc2Remote = new RTCPeerConnection(servers);
        // this.pc2Remote.ontrack = secondStreamCallback;
        // this.pc2Local.onicecandidate = this.iceCallback2Local;
        // this.pc2Remote.onicecandidate = this.iceCallback2Remote;
        // console.log('pc2: created local and remote peer connection objects');

        this.localStream.getTracks().forEach(track => this.pc1Local.addTrack(track, this.localStream));
        console.log('Adding local stream to pc1Local');
        this.pc1Local
            .createOffer(this.offerOptions)
            .then(this.gotDescription1Local.bind(this), this.onCreateSessionDescriptionError);

        // this.localStream.getTracks().forEach(track => this.pc2Local.addTrack(track, this.localStream));
        // console.log('Adding local stream to pc2Local');
        // this.pc2Local.createOffer(this.offerOptions)
        //     .then(this.gotDescription2Local, this.onCreateSessionDescriptionError);
    }

    onCreateSessionDescriptionError(error) {
        console.log(`Failed to create session description: ${error.toString()}`);
    }

    gotDescription1Local(desc) {
        this.pc1Local.setLocalDescription(desc);
        console.log(`Offer from pc1Local\n${desc.sdp}`);
        this.pc1Remote.setRemoteDescription(desc);
        // Since the 'remote' side has no media stream we need
        // to pass in the right constraints in order for it to
        // accept the incoming offer of audio and video.
        this.pc1Remote.createAnswer().then(this.gotDescription1Remote.bind(this), this.onCreateSessionDescriptionError);
    }

     gotDescription1Remote(desc) {
        this.pc1Remote.setLocalDescription(desc);
        console.log(`Answer from pc1Remote\n${desc.sdp}`);
        this.pc1Local.setRemoteDescription(desc);
    }

     gotDescription2Local(desc) {
        this.pc2Local.setLocalDescription(desc);
        console.log(`Offer from pc2Local\n${desc.sdp}`);
        this.pc2Remote.setRemoteDescription(desc);
        // Since the 'remote' side has no media stream we need
        // to pass in the right constraints in order for it to
        // accept the incoming offer of audio and video.
        this.pc2Remote.createAnswer().then(this.gotDescription2Remote, this.onCreateSessionDescriptionError);
    }

     gotDescription2Remote(desc) {
        this.pc2Remote.setLocalDescription(desc);
        console.log(`Answer from pc2Remote\n${desc.sdp}`);
        this.pc2Local.setRemoteDescription(desc);
    }

     hangup() {
        console.log('Ending calls');
        this.pc1Local.close();
        this.pc1Remote.close();
        this.pc2Local.close();
        this.pc2Remote.close();
        this.pc1Local = this.pc1Remote = null;
        this.pc2Local = this.pc2Remote = null;
        // this.hangupButton.disabled = true;
        // this.callButton.disabled = false;
    }

    iceCallback1Local(event) {
        this.handleCandidate(event.candidate, this.pc1Remote, 'pc1: ', 'local');
    }

    iceCallback1Remote(event) {
        this.handleCandidate(event.candidate, this.pc1Local, 'pc1: ', 'remote');
    }

    // iceCallback2Local(event) {
    //     this.handleCandidate(event.candidate, this.pc2Remote, 'pc2: ', 'local');
    // }

    // iceCallback2Remote(event) {
    //     this.handleCandidate(event.candidate, this.pc2Local, 'pc2: ', 'remote');
    // }

    handleCandidate(candidate, dest, prefix, type) {
        dest.addIceCandidate(candidate)
            .then(this.onAddIceCandidateSuccess, this.onAddIceCandidateError);
        console.log(`${prefix}New ${type} ICE candidate: ${candidate ? candidate.candidate : '(null)'}`);
    }

    onAddIceCandidateSuccess() {
        console.log('AddIceCandidate success.');
    }

    onAddIceCandidateError(error) {
        console.log(`Failed to add ICE candidate: ${error.toString()}`);
    }
}

export default Call