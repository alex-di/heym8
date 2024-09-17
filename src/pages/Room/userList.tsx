import React, { useContext, useEffect, useState } from 'react'


import { useActor } from '@xstate/react';
import { Button } from 'react-bootstrap';

import { CallAction } from '../../store';
import { GlobalStateContext } from '../../components';


export default (() => {

    const globalServices = useContext(GlobalStateContext);
    const [appStore] = useActor(globalServices.appService);
    const [store, send] = useActor(Object.values(appStore.children)[0]);
    if (!store) {
        return <div>Loading...</div>
    }

    const ctx = store.context;


    const participants = Object.values(ctx.participants || {})

    return  participants.length ? <>
        <h4>Users online:</h4>
        <div>{participants.map((user) => <div key={user.id || user}>{JSON.stringify(user)}</div>)}</div>
    </> : <h4>Waiting for folks</h4>
})