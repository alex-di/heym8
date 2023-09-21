import React, { useEffect, useState } from 'react'
import { observer } from 'mobx-react'

import {useStore} from '../store'
import { Button } from 'react-bootstrap';


export default observer(() => {
    const store = useStore();

    if (!store.users) {
        return null
    }

    return  store.users.length ? <>
        <h4>Users online:</h4>
        <div>{store.users.map((user) => <div>{user}</div>)}</div>
        { <Button variant="primary" onClick={() => store.enableCall()}>Join call</Button>}
    </> : <h4>Waiting for folks</h4>
})