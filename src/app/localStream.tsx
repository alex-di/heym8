import { observer } from 'mobx-react'
import React from 'react'
import {useStore} from '../store'
import Video from './video'


export default observer(() => {
    const store = useStore();
    return store.ongoingCall && store.localStream && store.localStream.id && <div className="streamWrapper">
        <Video id="localStream" stream={store.localStream}></Video>
    </div>
    
})