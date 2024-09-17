
import React, {useContext, useState} from 'react';
import {renderMessage} from './message';
import { useActor } from '@xstate/react';
import { GlobalStateContext } from '../../../components';


export const Messages = (({  }) => {

    const globalServices = useContext(GlobalStateContext);
    const [appStore] = useActor(globalServices.appService);
    const [store] = useActor(Object.values(appStore.children)[0]);


    const messages = store?.context.messages || []
    return <div className="d-flex flex-column justify-content-end">{
        messages.length 
            ? messages.map(renderMessage)
            : "No messages in this room"
    }</div>
})