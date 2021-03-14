import { observer } from 'mobx-react'
import React from 'react'
import {useStore} from '../store'
import Video from './video'


export default observer(() => {
    const store = useStore();
    console.log("!!! RENDER SCREEN", {
        store
    })

    return <div className="screen">
        <div>
        {store.ongoingCall && store.localStream && store.localStream.id && <div className="screenMain">
            <p>Local</p>
            <Video id="screenVideo1" stream={store.localStream}></Video>
        </div>}
        {store.ongoingCall && store.remoteStream && store.remoteStream.id && <div className="screenMain">
            <p>First remote</p>
            <Video id="screenVideo1" stream={store.remoteStream}></Video>
        </div>}
        </div>
        {/* {store.remoteStreams.map((s, i) => (<Video id={s.id} key={i} stream={s}></Video>))} */}
    </div>
})