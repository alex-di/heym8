import { Typestate, assign, createMachine, spawn } from "xstate";
import { initCaller } from "./manager";
import { initContractStorage } from ".";
import { RoomEvents, IRoomContext, RoomState } from "../../shared/store";

export type RoomEventsObject =
  | {
      type: RoomEvents.NEW_PARTICIPANT;
      address: string;
    }
  | {
      type: RoomEvents.HANGUP;
    }
  | {
      type: RoomEvents.JOIN;
    }
  | {
      type: RoomEvents.CHANGE_ACTIVE_ROOM;
    }
  | {
      type: RoomEvents.SEND_MESSAGE;
      message: string;
    };

export const roomMachine = createMachine<
  IRoomContext,
  RoomEventsObject,
  Typestate<IRoomContext>
>(
  {
    id: "room",
    initial: RoomState.INIT,
    states: {
      [RoomState.INIT]: {
        invoke: [
          {
            src: async (ctx, event) => {
              if (!ctx?.address) {
                return Promise.reject(
                  new Error("No address provided for call init")
                );
              }
              console.log({ ctx, event });

              const caller = await initCaller(ctx.address, ctx.connection);
              return { caller };
            },
            onDone: {
              target: RoomState.LOADING_MESSAGES,
              actions: [
                assign({
                  caller: (_ctx, { data }) => data.caller,
                  activeRoom: "0",
                }),
              ],
            },
            onError: {
              target: RoomState.ERROR,
            },
          },
        ],
      },
      [RoomState.LOADING_MESSAGES]: {
        invoke: [
          {
            src: async (ctx, event) => {
              const db = await initContractStorage({ roomId: ctx.activeRoom });
              return await db.getAllFromIndex("messages", "createdAt");
            },
            onDone: {
              target: RoomState.READY,
              actions: [
                assign({
                  messages: (_ctx, { data }) => data,
                }),
              ],
            },
            onError: {
              target: RoomState.ERROR,
            },
          },
        ],
      },
      [RoomState.READY]: {
        // invoke: observablesFactory(),
        on: {
          [RoomEvents.SEND_MESSAGE]: {
            actions: [(ctx, event) => ctx.caller.sendText(event.message)],
          },
          [RoomEvents.NEW_PARTICIPANT]: {
            // actions: [(ctx, event) => ctx.caller.joinCall(), assign({
            //   ongoingCall: (ctx, event) => true
            // })]
          },
        },
      },
      [RoomState.ERROR]: {
        on: {
          [RoomEvents.JOIN]: {
            target: RoomState.INIT,
          },
        },
      },
    },

    schema: {
      actions: {
        type: "",
        // [RoomAction.CHANGE_ACTIVE_ROOM]: assign({
        //   activeRoom: (ctx, event) => event,
        //   messages: (ctx, event) => Promise.resolve([])
        // }),
        // [RoomAction.SEND_MESSAGE]: (ctx: IRoomContext, event) => {
        //   console.log(event);
        //   return ctx.caller.sendText(JSON.stringify(event))
        // }
      },
      events: {} as RoomEventsObject,
    },
  },
  {}
);
