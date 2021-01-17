export type TFriend = {
    isHostMode: boolean
  }

import { makeObservable, observable } from 'mobx';
import Sdk from '../sdk'
import Caller from './caller'
  
export function createStore() {
  
  const apiUrl = 'http://192.168.0.7:3000';
  var cfg = {
    'iceServers': [{'url': 'stun:23.21.150.121'}],
    
  }

  const store = {
    isHostMode: false,
    localOffer: null,
    steam: null,
    room: null,
    caller: new Caller(),

    remoteStreams: observable.array([]),
    api: new Sdk({
      apiUrl,
    }),
    init() {
      this.caller.start(this.gotLocalStream)
      
      this.refreshRoom();
    },
    
    gotLocalStream(stream) {
      this.stream = stream;
      this.caller.call({remoteStreamCallback: this.gotRemoteStream})
    },

    gotRemoteStream(stream) {
      this.remoteStreams.push(stream);
      console.log("REMOTE STREAMS", this.remoteStreams)
    },

    refreshRoom() {
      const roomId = location.hash ? location.hash.replace(/^#/, '') : null
      if (!roomId) return ;
      this.api.getRoom(roomId).then(({room}) => {
        this.room = room
        const raw = atob(room.offer);
        const offer = JSON.parse(raw)
        var offerDesc = new RTCSessionDescription(offer)
        console.log('Received remote offer', offerDesc)
        // writeToChatLog('Received remote offer', 'text-success')
        // this.connectOffer(offerDesc)
        if (this.isHostMode) {
          this.caller.call((stream) => this.gotRemoteStream(stream))
        } else {

        }
      })

    },
    
    createRoom() {
      this.api.createRoom({offer: this.localOffer}).then(({room}) => {
        location.hash = room.alias;
        this.refreshRoom(true);
      })
    },
    useHostMode(isHost: boolean) {
      this.isHostMode = isHost;
    },
  }
  return store;
}

function encodeOffer(offer: RTCSessionDescription, password: string = "") {
  return btoa(JSON.stringify(offer));
}
function decodeOffer(payload: string, password: string = ""): RTCSessionDescription {
  return JSON.parse(atob(payload));
}
  export type TStore = ReturnType<typeof createStore>