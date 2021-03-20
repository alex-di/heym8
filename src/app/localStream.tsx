import { observer } from 'mobx-react'
import React, { useState } from 'react'
import {useStore} from '../store'
import Video from './video'
import Settings from './settings';


export default observer(() => {
    const store = useStore();
    return store.ongoingCall && store.localStream && store.localStream.id && <div className="streamWrapper local">
        <div className="settingsButtonWrapper" ><Settings></Settings></div>
        <Video id="localStream" muted stream={store.localStream}></Video>
    </div>   
})
