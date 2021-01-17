import { observer } from 'mobx-react'
import React from 'react'
import {useStore} from '../store'
import Video from './video'


export default observer(() => {
    const store = useStore();
    if (!store.stream) {
        return null;
    }
    return <div className="screen">
        <div className="screenMain">
            <Video id="screenVideo" stream={store.stream}></Video>
        </div>
        {store.remoteStreams.map((s, i) => <Video id={s.id} key={i} stream={s}></Video>}
    </div>
})