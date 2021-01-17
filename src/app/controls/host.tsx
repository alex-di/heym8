import { observer } from 'mobx-react';
import React from 'react'
import Form from 'react-bootstrap/Form'
import Button from 'react-bootstrap/Button'

import {useStore} from '../../store'
export default observer(() => {

    const store = useStore();
    console.log("LOCAL OFFER", store.localOffer);
    return <Form.Group>
        <Button disabled={!store.localOffer} onClick={() => store.createRoom()
            }>Create room</Button>
        </Form.Group>
})