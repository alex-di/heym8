import React, { useContext, useEffect, useState } from 'react'


import { useActor } from '@xstate/react';
import { Button } from 'react-bootstrap';
import { GlobalStateContext } from './context';
import { CallAction } from '../store';


export default (() => {

    const globalServices = useContext(GlobalStateContext);
    const [appStore] = useActor(globalServices.appService);
    const [store, send] = useActor(Object.values(appStore.children)[0]);

    const ctx = store.context;

    const participants = Object.values(ctx.participants || {})

    return  participants.length ? <>
        <h4>Users online:</h4>
        <div>{participants.map((user) => <div key={user.id || user}>{JSON.stringify(user)}</div>)}</div>
        { <Button variant="primary" onClick={() => send({ type: CallAction.JOIN })}>Join call</Button>}
    </> : <h4>Waiting for folks</h4>
})