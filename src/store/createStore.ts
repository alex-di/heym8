import { observable } from 'mobx';
import { Caller } from './caller';
import { StoreEvent } from './storeEvent.enum';

export type TStore = ReturnType<typeof createStore>

export enum LocalStoreKey {
  USERNAME = 'username'
}

export function createStore() {
  let username = localStorage.getItem(LocalStoreKey.USERNAME)
  let isDefaultUsername = false;

  if (!username) {
    isDefaultUsername = true;
    username = btoa(Date.now().toString());
  }
  const caller = new Caller({
    username,
  });
  const store = observable({
    caller,
    username,

    isDefaultUsername,
    messages: observable.array([]),
    users: observable.array([]),
    remoteStream: null,
    localStream: null,
    ongoingCall: false,
    textingReady: false,
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
    }
  });

  caller.on(StoreEvent.CALL_CLOSED, () => {
    store.remoteStream = null;
    store.ongoingCall = false;
  })
  caller.on(StoreEvent.CONN_OPEN, () => {
    store.textingReady = true;
  })
  caller.on(StoreEvent.REMOTE_STREAM, (stream) => {
    store.remoteStream = stream;
    console.log({remoteStream: stream})
    store.ongoingCall = true
  })
  caller.on(StoreEvent.LOCAL_STREAM, (stream) => {
    store.localStream = stream;
    console.log({remoteStream: stream})
    store.ongoingCall = true
  })
  caller.on(StoreEvent.MESSAGE, (message: string) => {
    console.log('Store got message')
    store.messages.push(message)
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
    })
    
    newList.forEach(user => {
      if (!~store.users.indexOf(user)) {
        store.users.push(user)
      }
    })
  })
  return store
}
