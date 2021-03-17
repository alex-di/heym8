import React, { useState } from 'react'
import { observer } from 'mobx-react'
import Mute from 'react-bootstrap-icons/dist/icons/mic-mute'
import MuteOn from 'react-bootstrap-icons/dist/icons/mic-mute-fill'

import {useStore} from '../store'


export default observer(() => {
    const store = useStore();
    return <div className={`settingsButton  ${store.muted ? 'active' : ''}`} onClick={() => store.setMute(!store.muted)}>
        {store.muted ? <MuteOn></MuteOn> : <Mute></Mute> }
    </div>
    
})
