
import React, { useContext, useState } from 'react'
import { useActor } from '@xstate/react';
import Video from './video'
import Settings from './settings';
import { GlobalStateContext } from './context';
import { CallState, ICallContext } from '../store';




export default () => {

    const globalServices = useContext(GlobalStateContext);
    const [appStore] = useActor(globalServices.appService);
    const [store] = useActor(Object.values(appStore.children)[0]);

    const Loader = () => <div>Loading...</div>;

    console.log(appStore.context, store)

    const ctx: ICallContext = store.context;
    // return <div>No call</div>
    if (store.value === CallState.INIT) {
        return <Loader/>
    }
    if (store.value === CallState.DISABLED) {
        return <div>Call initialization failed</div>
    }

    // return <pre>{JSON.stringify(store.context, null, '\t')}</pre>

    const isLoading = !ctx.ongoingCall || !ctx.localStream || !ctx.localStream.id;
    return isLoading ? <Loader /> : <div className="streamWrapper local">
        <div className="settingsButtonWrapper" ><Settings></Settings></div>
        <Video id="localStream" muted stream={ctx.localStream}></Video>
    </div> 
}