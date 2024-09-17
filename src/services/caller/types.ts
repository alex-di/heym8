
export interface ICaller {
  // Called when the "id" message is received; this message is sent by the
  // server to assign this login session a unique ID number; in response,
  // this function sends a "username" message to set our username for this
  // session.
  setUsername(myUsername: string): void 
  // Handles a click on the Send button (or pressing return/enter) by
  // building a "message" object and sending it to the server.
  sendText(text: string): void
  sendNote(note, octave): void

  sendReconnect(user): void
  closeVideoCall(user): void
  hangUpCall(): void
  muteLocalStream(): void

  unmuteLocalStream(): void
  
  // Handle a click on an item in the user list by inviting the clicked
  // user to video chat. Note that we don't actually send a message to
  // the callee here -- calling RTCPeerConnection.addTrack() issues
  // a |notificationneeded| event, so we'll let our handler for that
  // make the offer.
  
  invite(user): Promise<void> 


  
  reinvite(user): Promise<void> 
  joinCall(user?): Promise<void>
}


export enum IoEventType {
  CallerMessage = 'message',
  Username = 'username',
  Note = 'note',
  Reconnect = 'reconnect',
  VideoOffer = 'video-offer',
  VideoAnswer = 'video-answer',
  NewICECandidate = 'new-ice-candidate',
  Hangup = 'hang-up',
  Id = 'id',
  Userlist = 'userlist',
  RejectUsername = 'rejectusername',
}