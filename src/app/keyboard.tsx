import React, { useEffect, useState } from 'react'
import { observer } from 'mobx-react'

import {useStore} from '../store'


export default observer(() => {
    const store = useStore();

    useEffect(() => {
        if (store.music) {
            store.enableKeyboard()
        }
        return () => {
            store.disableKeyboard()
        }
    })
    return store.music ? <div className="keyboard-wrap"><div id="keyboard" className="keyboard-holder"></div></div> : null
})
