import React, { useContext } from 'react';
import { useActor } from '@xstate/react';

import { CallState, AppState } from '../../shared/store';
import { ActiveState } from './activeState';
import { ChatState } from './chatState';
import { GlobalStateContext } from '../../shared/ui';


export const RoomWrapper = () => {

    const globalServices = useContext(GlobalStateContext);
    const [appStore] = useActor(globalServices.appService);

    const [store] = useActor(Object.values(appStore.children)[0]);

    const state = store?.value || CallState.INIT;


    return state === CallState.ONAIR ? <ActiveState ></ActiveState> : <ChatState></ChatState>
}

