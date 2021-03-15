import { observer } from 'mobx-react'
import React from 'react'
import {useStore} from '../store'
import Video from './video'


export default observer(() => {
    const store = useStore();
    console.log(store.remoteStreams)
    return <div className="remoteStreamsContainer d-flex">
        {store.ongoingCall && Object.entries(store.remoteStreams).map(([user, stream]) => 
        stream && stream.id && <div className="streamWrapper flex-fill">
            <div className="remoteInfo">{user}</div>
            <Video id="remoteStream" stream={stream}></Video>
        </div>) }
    </div>
})