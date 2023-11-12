export enum CallerEvent {
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


export enum CallState {
  DISABLED = 'DISABLED',
  LOCAL_ONLY = 'LOCAL_ONLY',
  ACTIVE = 'ACTIVE',
  INIT = 'INIT',
}

export enum CallAction {
  SET_CALLER = 'setCaller',
  HANGUP = 'hangup',
  JOIN = 'join',
  ENABLE_KEYBOARD = 'enable_keyboard',
  DISABLE_KEYBOARD = 'disable_keyboard',
  SEND_MESSAGE = 'send_message',
}

export enum CallEvents {
  HANGUP = 'hangup',
  JOIN = 'join',
  NEW_PARTICIPANT = 'new_participant',
  DISABLE_KEYBOARD = 'disable_keyboard',
  ENABLE_KEYBOARD = 'enable_keyboard',
  SEND_MESSAGE = 'send_message',
  SET_MUTE = 'set_mute',
  SET_MUSIC = 'set_music',

  CONNECTION_OPEN = 'connection_open',
  LOCAL_STREAM = 'local_stream',
  REMOTE_STREAM = 'remote_stream',
  PLAY_NOTE = 'play_note',
  NEW_MESSAGE = 'new_message',
  USER_LIST = 'user_list',
}

export enum ChainState {
  INIT = 'INIT',
  UNAUTHORIZED = 'UNAUTHORIZED',
  CONNECTING = 'CONNECTING',
  READY = 'READY',
  ONAIR = 'ONAIR',
}

export enum ChainEvent {
  CONNECT_WALLET = 'CONNECT_WALLET',
  JOIN_CALL = 'JOIN_CALL',
}