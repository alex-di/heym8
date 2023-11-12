
import React, {useContext, useState} from 'react'
import { useActor } from '@xstate/react';
import {renderMessage} from './message';
import { GlobalStateContext } from '../context';

export default (() => {

    const globalServices = useContext(GlobalStateContext);

    const [appStore] = useActor(globalServices.appService);
    const [store] = useActor(Object.values(appStore.children)[0]);

    const ctx = store.context;
    return <div className="d-flex flex-column justify-content-end">{ctx.messages.map(renderMessage)}</div>
})