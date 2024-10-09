import { Typestate, assign, createMachine } from 'xstate';

import { AppEvent, AppState } from './enums';
import { IAppContext } from './types';
import { Caller } from '../../entities/caller';
import { roomMachine } from '../../entities/room/room.machine';
import { connectWallet } from '../api/signin';
import { connectWebsocket } from '../api/ws';

export type AppEventsObject = {
    type: AppEvent.CONNECT_WALLET,
    address: string
  } | {
    type: AppEvent.JOIN_CALL,
    caller: Caller,
  }


  export const appMachine = createMachine<IAppContext, AppEventsObject, Typestate<IAppContext>>({
    initial: AppState.INIT,
    states: {
      [AppState.INIT]: {
        invoke: {
            src: async (ctx, event) => await connectWallet(),
            onDone: {
              target: AppState.CONNECTING,
              actions: assign({
                address: (ctx, event) => event.data.address,
                owned: (ctx, event) => event.data.owned,
                available: (ctx, event) => event.data.available,
              })
            },
            onError: {
              target: AppState.UNAUTHORIZED,
              actions: assign({ error: (ctx, event) => event.data })
            }
        },
      },
      [AppState.UNAUTHORIZED]: {
        on: {
          [AppEvent.CONNECT_WALLET]: {
              target: AppState.CONNECTING,
          },
        }
      },
      [AppState.CONNECTING]: {
        invoke: {
          src: (ctx, event) => connectWebsocket(),

          onDone: {
            target: AppState.READY,
            actions: assign({
              connection: (ctx, event) => event.data,
            })
          },
          onError: {
            target: AppState.UNAUTHORIZED,
            actions: assign({ error: (ctx, event) => event.data })
          }
        },
      },
      [AppState.READY]: {
        invoke: [
        // {
        //   // src: roomMachine,
        //   id: 'call',
        //   src: callMachine,
        //   data: (ctx) => ({
        //     address: ctx.address[0],
        //     connection: ctx.connection,
            
        //   })
        // },
        {
          id: 'room',
          src: roomMachine,
          data: (ctx) => ({
            address: ctx.address[0],
            connection: ctx.connection,
          })
        }
      ]
      }
    },
  
    // The context (extended state) of the machine
    context: {
      network: 1,
      address: undefined,
      music: false,
      // users: [],
      // messages: [],
      owned: [],
      available: [],
      connection: undefined,
    },
    schema: {
      actions: {
        type: [] as unknown as string
      }
    }
  });