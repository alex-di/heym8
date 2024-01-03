import { Typestate, assign, createMachine, spawn } from 'xstate';
import { IRoomContext } from '../types';

import { RoomEvents, RoomState, RoomAction } from '../enums';
import { initCaller } from './manager';
import { initContractStorage } from '../../services/room';

export type RoomEventsObject = {
  type: RoomEvents.NEW_PARTICIPANT,
  address: string
} | {
  type: RoomEvents.HANGUP,
}| {
  type: RoomEvents.JOIN,
}

export const roomMachine = createMachine<IRoomContext, RoomEventsObject, Typestate<IRoomContext>>( {
  id: 'room',
  initial: RoomState.INIT,
  states: {
    [RoomState.INIT]: {
      invoke: [{
        src: (ctx, event) => {
          if (!ctx?.address) {
            return Promise.reject(new Error('No address provided for call init'))
          }
          console.log({ctx, event})
          
          const caller = initCaller(ctx.address, initContractStorage({roomId: '0' }))
          return { caller }
        },
        onDone: {
          target: RoomState.READY,
          actions: [assign({
            caller: (_ctx, { data }) => data.caller,
            messages: (_ctx, { data }) => data.messages,
          })]
        },
        onError: {
          target: RoomState.ERROR,
        }
      }]
    },
    [RoomState.READY]: {
      // invoke: observablesFactory(),
      on: {
        [RoomAction.JOIN]: {
          actions: [(ctx, event) => ctx.caller.joinCall(), assign({
            ongoingCall: (ctx, event) => true
          })]
        },
      }
    },
    [RoomState.ERROR]: {
      on: {
        [RoomEvents.JOIN]: {
          target: RoomState.INIT,
        }
      }
    },
  },
  
  schema: {
    actions: {
      type: '',
      [RoomAction.SET_CALLER]: assign({
        caller: (ctx, event) => event,
      })
    },
    events: {
    } as RoomEventsObject
  }
}, {
  
})




