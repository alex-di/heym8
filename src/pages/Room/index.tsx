import React, { useContext } from 'react';
import { useActor } from '@xstate/react';

import {  AppState } from '../../shared/store';
import { RoomWrapper } from './Room';
import { GlobalStateContext } from '../../shared/ui';


export const RoomPage = () => {

    const globalServices = useContext(GlobalStateContext);
    const [store] = useActor(globalServices.appService);


    const state = store?.value || AppState.INIT;

    return <div className='rooms-container'>
        {state === AppState.READY ? <RoomWrapper></RoomWrapper> : <div>Loading... ({state.toString()})</div>}
    </div>
}

