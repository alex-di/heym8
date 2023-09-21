import { observable } from 'mobx';
import { Caller } from '../caller';
import { MessageType, StoreEvent } from '../enums';
import { createKeyboard } from '../keyboard';
import { connectWallet, signInWithEthereum } from '../chain';

export type TStore = ReturnType<typeof createStore>

export enum LocalStoreKey {
  USERNAME = 'username',
  ADDRESS = 'address',
  SIGNED_MESSAGE = 'signed_message',
  SIGNATURE = 'signature',
}

export function createStore() {
  let username = localStorage.getItem(LocalStoreKey.USERNAME)
  let isDefaultUsername = false;

  if (!location.hash) {
    location.hash = btoa(Math.random().toString().substr(-5)).replace(/=/g, '')
  }

  if (!username) {
    isDefaultUsername = true;
    username = btoa(Date.now().toString());
  }
  const caller = new Caller({
    username,
    roomId: location.hash,
  });


  const keyboard = createKeyboard({
    onNote: (note, octave) => {
      caller.sendNote(note, octave);
    }
  })


  function checkRoom() {
    let nextCheck = 15000

    const streams = Object.keys(store.remoteStreams)

    const stream = store.remoteStreams[streams[0]]
    console.log('users', store.isUsersFull, store.users.toJSON())

    // if (store.users.length < streams.length) {
    //   const user = store.users.find((user) => user !== store.username);

    //   if (user) {

    //     const stream = store.remoteStreams[user];
    //     console.log('reinvite', user,  stream)
    //     caller.reinvite(user);
    //   }
    // }


    setTimeout(checkRoom, nextCheck) 
  }

  connectWallet()
  const store = observable({
    caller,
    username,
    roomId: location.hash,
    signature: null,
    address: null,
    isDefaultUsername,
    messages: observable.array([]),
    users: observable.array([]),
    remoteStreams: {},
    localStream: null,
    ongoingCall: false,
    textingReady: false,
    isUsersFull: false,
    callActive: false,
    muted: false,
    music: false,
    walletConnected: false,
    signedMessage: null,
    enableCall() {
      this.callActive = true
      this.updateUserlist(this.users)
    },
    async signIn() {
      console.log({ store: this })
      
      const signature = localStorage.getItem(LocalStoreKey.SIGNATURE)
      const address = localStorage.getItem(LocalStoreKey.ADDRESS)
      const rawMessage = localStorage.getItem(LocalStoreKey.SIGNED_MESSAGE)
      const message = rawMessage && JSON.parse(rawMessage)
      if (signature && address && message) {
        this.setSignature({ signature, address, message })
        return 
      }
      const data = await signInWithEthereum();
      this.setSignature(data)
      this.setUsername(data.address)
    },

    setSignature({signature, address, message}) {
      
      this.signature = signature
      this.address = address
      this.signedMessage = message
      localStorage.setItem(LocalStoreKey.SIGNATURE, signature)
      localStorage.setItem(LocalStoreKey.ADDRESS, address)
      localStorage.setItem(LocalStoreKey.SIGNED_MESSAGE, JSON.stringify(message))
      console.log("Signed in", { signature, address, message, store: this })
    },
    enableKeyboard() {
      keyboard.enable()
    },
    disableKeyboard() {
      keyboard.disable()
    },

    systemMessage(data) {
      var time = new Date();
      var timeStr = time.toLocaleTimeString();
      this.messages.push(JSON.stringify({
        ...data,
        time: timeStr,
      }))
    },
    sendMessage(uiUsername, message) {
      if (this.username !== uiUsername) {
        this.setUsername(uiUsername);
      }
      this.caller.sendText(message);
    },
    setUsername(newUsername) {
      this.caller.setUsername(newUsername)
      this.username = newUsername;
      localStorage.setItem(LocalStoreKey.USERNAME, newUsername)
      this.isDefaultUsername = false;
    },
    callUser(user) {
      setTimeout(() => {
        this.caller.invite(user);
      }, 100)
    },
    setMute(value = true) {
      this.muted = value;
      value ? this.caller.muteLocalStream() : this.caller.unmuteLocalStream()
    },
    setMusic(value = true) {
      this.music = value;
    },
    updateUserlist(newList) {

      const toRemove = [];
      
      this.users.forEach((user) => {
        if (!~newList.indexOf(user)) {
          toRemove.push(user)
        } 
      })

      toRemove.forEach(user => {
        this.users.splice(this.users.indexOf(user), 1)
        this.systemMessage({type: MessageType.USER_LEFT, name: user})
        this.caller.closeVideoCall(user)
      })
      
      newList.forEach(user => {
        if (user !== this.username && !~this.users.indexOf(user)) {
          this.users.push(user)
          this.systemMessage({type: MessageType.USER_JOINED, name: user})
        }
      })

      if (this.callActive && !this.isUsersFull) {
        this.isUsersFull = true;
        this.users.forEach((user) => {
          if (user !== this.username) {
            setTimeout(() => {
              this.callUser(user);
            }, 500)
          }
        })
      }

    }
  });

  caller.on(StoreEvent.CALL_CLOSED, (id) => {
    store.remoteStreams[id] = null;
    // store.ongoingCall = false;
  })
  caller.on(StoreEvent.CONN_OPEN, () => {

    console.log("CONNECTION OPEN")
    store.textingReady = true;
    setTimeout(checkRoom, 5000)
  })
  caller.on(StoreEvent.REMOTE_STREAM, ({id, stream}) => {
    store.remoteStreams[id] = stream;
    console.log({id, remoteStream: stream})
    store.ongoingCall = true
  })
  caller.on(StoreEvent.LOCAL_STREAM, (stream) => {
    store.localStream = stream;
    // console.log({remoteStream: stream})
    store.ongoingCall = true
  })
  caller.on(StoreEvent.MESSAGE, (message: string) => {
    // console.log('Store got message')
    store.messages.push(message)
    // setTimeout(() => {
    //   store.messages.shift()
    // }, 15000)
  })
  caller.on(StoreEvent.NOTE, (note) => {

    keyboard.playNote(note.note, note.octave)
    // setTimeout(() => {
    //   store.messages.shift()
    // }, 15000)
  })
  caller.on(StoreEvent.RECONNECT, (user) => {
    console.log("GOT RECONNECT")
    caller.reinvite(user)
    // keyboard.playNote(note.note, note.octave)
    // setTimeout(() => {
    //   store.messages.shift()
    // }, 15000)
  })

  caller.on(StoreEvent.USER_LIST, newList => {
    store.updateUserlist(newList)
  })
  return store
}
