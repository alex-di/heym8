import React, { useContext, useEffect, useState } from 'react'


import { useActor } from '@xstate/react';
import {PersonBadge} from 'react-bootstrap-icons';
import { GlobalStateContext } from '../../shared/ui';


export default (() => {

    const globalServices = useContext(GlobalStateContext);
    const [appStore] = useActor(globalServices.appService);
    // @TODO: Fix
    // const [store, send] = useActor(appStore.children.call);
    const [store, send] = useActor(appStore.children.room);
    if (!store) {
        return <div>Loading...</div>
    }


    console.log('!!!!STORE', store)
    const ctx = store.context;


    const participants = Object.values(ctx.participants || {})

    return  participants.length ? <>
        <h4>Users online:</h4>
        <div>{participants.map((user) => <div key={user.id || user}>
            <PersonBadge></PersonBadge>
            {" "}
            {user.id.slice(0,6)}...{user.id.slice(-4)}</div>)}
            </div>
    </> : <h4>Waiting for folks</h4>
})