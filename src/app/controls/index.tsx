import React, {useState} from 'react'
import Form from 'react-bootstrap/Form';
import { observer } from "mobx-react"

import Join from './join';
import Host from './host'
import {useStore} from '../../store'

export default (observer((props) => {
    const store = useStore();
    return <div className='controls-container'><Form>
        <div key={`inline-radio`} className="mt-3 mb-3 ml-5">
            <Form.Check inline label="Join / Host" type="switch" id={`mode`} checked={store.isHostMode} onChange={(v) => store.useHostMode(v.target.checked)}/>
            {store.isHostMode ? <Host></Host> : <Join></Join>}
        </div>
    </Form></div>
}))