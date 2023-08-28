export enum StoreEvent {
  MESSAGE = 'onSystemInfo',
  CONN_OPEN = 'onConnectionOpen',
  REMOTE_STREAM = 'onRemoteStream',
  USER_LIST = 'onUserListUpdated',
  CALL_CLOSED = 'onCallClosed',
  LOCAL_STREAM = 'onLocalStream',
  NOTE = 'note',
  RECONNECT = 'onReconnect',
}

export enum MessageType {
  USER_MESSAGE = 'user_message',
  USER_JOINED = 'user_joined',
  USER_LEFT = 'user_left',
  REJECT_USERNAME = 'reject_username',
  NOTE = 'note',
  RECONNECT = 'reconnect',
}
