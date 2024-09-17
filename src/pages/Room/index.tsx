
import React, { createContext, useContext } from 'react';
import Col from 'react-bootstrap/Col';
import Row from 'react-bootstrap/Row';
import RemoteDashboard from "./remoteDashboard"

import { useActor } from '@xstate/react';

import LocalStream from './localStream';
import { CallState, AppState } from '../../store';
import { GlobalStateContext } from '../../components';
import {Chat} from './chat';
import { IMessage, initContractStorage } from '../../services/room';
import { useLoaderData } from 'react-router-dom';
import { ActiveState } from './activeState';
import { IdleState } from './idleState';


export const RoomPage = () => {

    const globalServices = useContext(GlobalStateContext);
    const [appStore] = useActor(globalServices.appService);

    const [store] = useActor(Object.values(appStore.children)[0]);

    const state = store?.value || CallState.INIT;

    // const data = useLoaderData() as {
    //     messages: IMessage
    // }

    return <div className='rooms-container'>
        {state === CallState.ONAIR ? <ActiveState ></ActiveState> : <IdleState></IdleState>}
    </div>
}

