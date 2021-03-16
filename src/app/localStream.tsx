import { observer } from 'mobx-react'
import React from 'react'
import {useStore} from '../store'
import Video from './video'


export default observer(() => {
    const store = useStore();
    return store.ongoingCall && store.localStream && store.localStream.id && <div className="streamWrapper local">
        <Video id="localStream" muted stream={store.localStream}></Video>
    </div>
    
})