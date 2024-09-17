
import { EventObject } from "xstate"
import { CallEvents, CallState, AppEvent } from "./enums"
import { ICaller } from "../services/caller/types"
import { IMessage } from "../services/room"

export interface IAppContext {
    network: number,
    address?: string,
    error?: unknown,
    owned: string[],
    available: string[]
    connection: WebSocket
    music: boolean,
}

export interface IRoomContext extends IAppContext {
    users: IUser[],
    messages: IMessage[],
    caller: ICaller
}

export type AppEventObject = {
    [key in AppEvent]: {
        type: key
    }
}

export interface IUser {
    address: string
}

export interface ICallContext extends IAppContext {

    ongoingCall: boolean
    enabled: boolean
    roomId: string
    participants: Record<string, {
        id: string
        stream?: MediaStream
        ref?: any
    }>,
    address: string
    caller: ICaller,
    localStream?: MediaStream
}


export interface ICallParticipant {
    
}

export enum ParticipantState { 
    INIT = 'INIT',
    CONNECTION_OPEN = 'CONNECTION_OPEN',
    ACTIVE = 'ACTIVE',
    STREAM_FAILED = 'STREAM_FAILED',
    CONNECTION_FAILED = 'CONNECTION_FAILED',
}


export type CallEvent = { type: CallEvents.JOIN } | { type: CallEvents.HANGUP } | { type: CallEvents.ENABLE_KEYBOARD }
export type CallTypestate = {
  value: CallState.ACTIVE,
  context: ICallContext,
} | {
    value: CallState.DISABLED,
    context: ICallContext,
  }