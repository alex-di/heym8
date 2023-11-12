import React, { useContext } from 'react'

import Mute from 'react-bootstrap-icons/dist/icons/mic-mute.js'
import MuteOn from 'react-bootstrap-icons/dist/icons/mic-mute-fill.js'
import Music from 'react-bootstrap-icons/dist/icons/music-note.js'
import MusicOn from 'react-bootstrap-icons/dist/icons/music-note-list.js'

import { useActor } from '@xstate/react';
import { GlobalStateContext } from './context'
import { CallEvents } from '../store'



export default (() => {

    const globalServices = useContext(GlobalStateContext);
    const [appStore] = useActor(globalServices.appService);
    const [store, send] = useActor(Object.values(appStore.children)[0]);

    const ctx = store.context;
    return <>
        <div className={`settingsButton  ${ctx.muted ? 'active' : ''}`} onClick={() => send([{ type: CallEvents.SET_MUTE, enabled: !ctx.muted }]) }>
            {ctx.muted ? <MuteOn></MuteOn> : <Mute></Mute> }
        </div>
        <div className={`settingsButton  ${ctx.music ? 'active' : ''}`} onClick={() => send([{ type: CallEvents.SET_MUSIC, enabled: !ctx.music }]) }>
            {ctx.music ? <MusicOn></MusicOn> : <Music></Music> }
        </div>
    </>
})
