import { Typestate, assign, createMachine } from 'xstate';

import { callMachine } from './call';
import { connectWallet, Caller, connectWebsocket } from '../services';
import { AppEvent, AppState } from './enums';
import { IAppContext } from './types';
import { roomMachine } from './room/room.machine';

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
          src: (ctx, event) => connectWebsocket(ctx.address),

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
        invoke: {
          // src: roomMachine,
          src: callMachine,
          data: (ctx) => ({
            address: ctx.address[0],
            connection: ctx.connection,
            
          })
        // },{
        //   src: roomMachine,
        //   data: (ctx) => ({
        //     address: ctx.address[0],
        //     connection: ctx.connection,
            
        //   })
        }
      }
    },
  
    // The context (extended state) of the machine
    context: {
      network: 1,
      address: undefined,
      // music: false,
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