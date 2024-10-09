import {  createMachine } from 'xstate';
import {   ParticipantState } from '../types';

import { CallState} from '../enums';

export const participantMachine = createMachine({
    initial: ParticipantState.INIT,
    states: {
      [ParticipantState.INIT]: {
        invoke: {
          src: () => {
            console.log("PARTICIPANT INIT")
            return Promise.resolve()
          },
          onDone: {
            target: ParticipantState.ACTIVE,
            // actions: [assign({
            //   caller: (_ctx, { data }) => data,
            // })]
          },
          onError: {
            target: ParticipantState.CONNECTION_FAILED,
          }
        }
      },
      [ParticipantState.CONNECTION_OPEN]: {

        invoke: {
            src: () => {
                console.log("PARTICIPANT CONNECTION OPEN")
                return Promise.resolve()
            }
        }
      },
      [ParticipantState.ACTIVE]: {
        invoke: {
            src: () => {
                console.log("PARTICIPANT ACTIVE")
                return Promise.resolve()
            }
        }
      },
      [ParticipantState.CONNECTION_FAILED]: {

        invoke: {
            src: () => {
                console.log("PARTICIPANT CONNECTION FAILED")
                return Promise.resolve()
            }
        }
      },
    }
  })