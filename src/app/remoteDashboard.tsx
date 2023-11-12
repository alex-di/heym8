
import React, { useContext } from 'react'
import { useActor } from '@xstate/react';
import Video from './video'
import {SplashScreen, Loader} from './layout'
import { GlobalStateContext } from './context';
import { CallState } from '../store';

export default (() => {

    const globalServices = useContext(GlobalStateContext);
    const [appStore] = useActor(globalServices.appService);
    const [store] = useActor(Object.values(appStore.children)[0]);

    const ctx = store?.context;


    const streams = Object
        .values(ctx?.participants || {})
        .filter(({ stream }) => !!stream)

    return <div className="remoteStreamsContainer d-flex flex-wrap">

        {ctx?.ongoingCall ? streams?.map(({id, stream}) => <div className="streamWrapper flex-fill" key={id}>
            {/* <div>{JSON.stringify({user, stream})}</div> */}
            <div className="remoteInfo">{id}</div>
            <Video id="remoteStream" stream={stream}></Video>
        </div>) : <SplashScreen></SplashScreen> }
    </div>
})