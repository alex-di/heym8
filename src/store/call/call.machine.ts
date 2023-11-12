import {  Typestate, assign, createMachine, spawn } from 'xstate';
import {  ICallContext } from '../types';

import { CallEvents, CallState, CallAction, CallerEvent } from '../enums';
import { initCaller } from './manager';

import { observablesFactory } from './observables.factory';
import { participantMachine } from './participant.machine';

export type RemoteStreamCallEvent =  {
  type: CallerEvent.REMOTE_STREAM,
  data: {
    stream: MediaStream,
    id: string
  }
}

export type CallEventsObject = {
  type: CallEvents.NEW_PARTICIPANT,
  address: string
} | {
  type: CallEvents.HANGUP,
}| {
  type: CallEvents.JOIN,
} | {
  type: CallerEvent.LOCAL_STREAM,
  data: MediaStream
} | {
  type: CallerEvent.USER_LIST,
  data: string[]
}| RemoteStreamCallEvent




const updateParticipants = (ctx: ICallContext, { data: { id, stream }}: RemoteStreamCallEvent) => {
  const participants = ctx.participants;

  if (!participants[id]) {
    participants[id] = {
      id, 
      stream,
      ref: spawn(participantMachine, `participant-${id}`)
    }
  }

  if (!participants[id].ref) {
    participants[id].ref = spawn(participantMachine, `participant-${id}`)
  }
  
  participants[id].stream = stream
  
  return participants
}

export const callMachine = createMachine<ICallContext, CallEventsObject, Typestate<ICallContext>>( {
  id: 'call',
  initial: CallState.INIT,
  states: {
    [CallState.INIT]: {
      invoke: {
        src: (ctx, event) => {
          if (!ctx?.address) {
            return Promise.reject(new Error('No address provided for call init'))
          }
          console.log({ctx, event})
          return initCaller(ctx.address)
        },
        onDone: {
          target: CallState.ACTIVE,
          actions: [assign({
            caller: (_ctx, { data }) => data,
          })]
        },
        onError: {
          target: CallState.DISABLED,
        }
      }
    },
    [CallState.ACTIVE]: {
      invoke: observablesFactory(),
      on: {
        [CallerEvent.USER_LIST]: {
          actions: assign({
            participants: (ctx, event) => {
              console.log('USER LIST GOT PARTICIPANTS FROM STORE', event)
                return event.data.reduce((acc, id) => {
                  if (!acc[id]) {
                    acc[id] = { id }
                  }
                  return acc
                }, ctx.participants || {})
            }
          })
        },
        [CallerEvent.REMOTE_STREAM]: {
          actions: assign({
            ongoingCall: (ctx, event) => true,
            participants: updateParticipants,
          })
        },
        [CallerEvent.LOCAL_STREAM]: {
          actions: assign({
            localStream: (ctx, event) => event.data
          })
        },
        [CallAction.JOIN]: {
          actions: [(ctx, event) => ctx.caller.joinCall(), assign({
            ongoingCall: (ctx, event) => true
          })]
        },
      }
    },
    [CallState.DISABLED]: {
      on: {
        [CallEvents.JOIN]: {
          target: CallState.INIT,
        }
      }
    },
  },
  
  schema: {
    actions: {
      type: '',
      [CallAction.SET_CALLER]: assign({
        caller: (ctx, event) => event,
      })
    },
    events: {
    } as CallEventsObject
  }
}, {
  
})




