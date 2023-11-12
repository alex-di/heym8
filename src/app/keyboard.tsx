import React, { useContext, useEffect, useState } from 'react'

import { useActor } from '@xstate/react';
import { GlobalStateContext } from './context';
import { CallEvents } from '../store';



export default (() => {

    const globalServices = useContext(GlobalStateContext);
    const [store, send] = useActor(globalServices.appService);

    const ctx = store.context;

    useEffect(() => {
        if (ctx.music) {
            send([{
                type: CallEvents.ENABLE_KEYBOARD,
            }])
            // store.enableKeyboard()
        }
        return () => {
            // store.disableKeyboard()

            send([{
                type: CallEvents.DISABLE_KEYBOARD,
            }])
        }
    })
    return ctx.music ? <div className="keyboard-wrap"><div id="keyboard" className="keyboard-holder"></div></div> : null
})
