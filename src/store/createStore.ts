import { observable } from 'mobx';
import { Caller } from './caller';
import { MessageType, StoreEvent } from './enums';
import { createKeyboard } from './keyboard';

export type TStore = ReturnType<typeof createStore>

export enum LocalStoreKey {
  USERNAME = 'username'
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
    console.log('users', store.users, streams, stream, store.users.length < streams.length)

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

  const store = observable({
    caller,
    username,
    roomId: location.hash,

    isDefaultUsername,
    messages: observable.array([]),
    users: observable.array([]),
    remoteStreams: {},
    localStream: null,
    ongoingCall: false,
    textingReady: false,
    isUsersFull: false,
    muted: false,
    music: false,
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
      // console.log("CALL USER", user)
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
      // value ? this.caller.muteLocalStream() : this.caller.unmuteLocalStream()
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
    const toRemove = [];
    
    store.users.forEach((user) => {
      if (!~newList.indexOf(user)) {
        toRemove.push(user)
      } 
    })

    toRemove.forEach(user => {
      store.users.splice(store.users.indexOf(user), 1)
      store.systemMessage({type: MessageType.USER_LEFT, name: user})
      store.caller.closeVideoCall(user)
    })
    
    newList.forEach(user => {
      if (user !== store.username && !~store.users.indexOf(user)) {
        store.users.push(user)
        store.systemMessage({type: MessageType.USER_JOINED, name: user})
      }
    })

    if (!store.isUsersFull) {
      store.isUsersFull = true;
      store.users.forEach((user) => {
        if (user !== store.username) {

          setTimeout(() => {
            store.callUser(user);
          }, 500)
        }
      })
    }
  })
  return store
}
