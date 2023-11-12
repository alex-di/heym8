import { Typestate, assign, createMachine } from 'xstate';

import { callMachine } from './call';
import { connectWallet, signInWithEthereum, Caller } from '../services';
import { ChainEvent, ChainState } from './enums';
import { ChainEventObject, IChainContext } from './types';

export type ChainEventsObject = {
    type: ChainEvent.CONNECT_WALLET,
    address: string
  } | {
    type: ChainEvent.JOIN_CALL,
    caller: Caller,
  }


  export const chainMachine = createMachine<IChainContext, ChainEventsObject, Typestate<IChainContext>>({
    initial: ChainState.INIT,
    states: {
      [ChainState.INIT]: {
        invoke: {
            src: () => connectWallet(),
            onDone: {
              target: ChainState.READY,
              actions: assign({ address: (ctx, event) => event.data })
            },
            onError: {
              target: ChainState.UNAUTHORIZED,
              actions: assign({ error: (ctx, event) => event.data })
            }
        },
      },
      [ChainState.UNAUTHORIZED]: {
        on: {
          [ChainEvent.CONNECT_WALLET]: {
              target: ChainState.CONNECTING,
          },
        }
      },
      [ChainState.CONNECTING]: {
        invoke: {
            src: () => signInWithEthereum(),
            onDone: {
              target: ChainState.READY,
              actions: assign({ address: (ctx, event) => event.data })
            },
            onError: {
              target: ChainState.UNAUTHORIZED,
              actions: assign({ error: (ctx, event) => event.data })
            }
        },
      },
      [ChainState.READY]: {
        invoke: {
          src: callMachine,
          data: {
            address: (ctx) => ctx.address[0]
          }
        }
      }
    },
  
    // The context (extended state) of the machine
    context: {
      network: 1,
      address: undefined,
      music: false,
      users: [],
      messages: [],
    },
    schema: {
      actions: {
        type: [] as unknown as string
      }
    }
  });