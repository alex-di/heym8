import React, { useState } from 'react'
import { observer } from 'mobx-react'
import Mute from 'react-bootstrap-icons/dist/icons/mic-mute.js'
import MuteOn from 'react-bootstrap-icons/dist/icons/mic-mute-fill.js'
import Music from 'react-bootstrap-icons/dist/icons/file-earmark.js'
import MusicOn from 'react-bootstrap-icons/dist/icons/file-earmark-fill.js'

import {useStore} from '../store'


export default observer(() => {
    const store = useStore();
    return <>
        {/* <div className={`settingsButton  ${store.muted ? 'active' : ''}`} onClick={() => store.setMute(!store.muted)}>
            {store.muted ? <MuteOn></MuteOn> : <Mute></Mute> }
        </div> */}
        <div className={`settingsButton  ${store.music ? 'active' : ''}`} onClick={() => store.setMusic(!store.music)}>
            {store.music ? <MusicOn></MusicOn> : <Music></Music> }
        </div>
    </>
})
