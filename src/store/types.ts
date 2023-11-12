
import { EventObject } from "xstate"
import { CallEvents, CallState, ChainEvent } from "./enums"
import { ICaller } from "../services/caller/types"

export interface IChainContext {
    network: number,
    address?: string,
    error?: unknown,
    music: boolean,
    users: IUser[],
    messages: IMessage[],
}

export type ChainEventObject = {
    [key in ChainEvent]: {
        type: key
    }
}

export interface IUser {
    address: string
}

export interface IMessage {
    sender: string,
    text: string,
    timestamp: string,
}

export interface ICallContext {
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