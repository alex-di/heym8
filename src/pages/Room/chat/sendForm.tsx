
import React, {useContext, useState} from 'react'

import { useActor } from '@xstate/react';
import Form from 'react-bootstrap/Form';
import FormControl from 'react-bootstrap/FormControl';
import Button from 'react-bootstrap/Button';
import InputGroup from 'react-bootstrap/InputGroup';


import { CallEvents, CallState, AppState } from '../../../store';
import { GlobalStateContext } from '../../../components';


export default (() => {

    const globalServices = useContext(GlobalStateContext);
    const [appStore, send] = useActor(globalServices.appService);

    const [store] = useActor(Object.values(appStore.children)[0]);
    const ctx = store?.context || {};

    const [message, updateMessage] = useState('');
    const [showUsernameInput, toggleUNInput] = useState(ctx.isDefaultUsername);
    const [username, updateUsername] = useState(ctx.username);

    const isActive = appStore.value === AppState.READY && [
        CallState.ACTIVE, 
        CallState.ONAIR,
    ].includes(store.value )


    return !isActive ? <>
        <p>Messaging disabled, invalid app state {appStore.value}:{store?.value}</p>
        <p>{JSON.stringify(store?.context.error)}</p>
    </> : <div className="sendFormWrapper">
                <Form inline="true">
    
    <Form.Label size="sm" htmlFor="inlineFormInputName2" sronly="true">
        Message
    </Form.Label>
    <Form.Control size="sm"
        className="mb-2 mr-sm-2"
        id="inlineFormInputName2"
        placeholder="Hey mate"
        value={message}
        onChange={({target}) => updateMessage(target.value)}
    />
    <Form.Label size="sm" htmlFor="inlineFormInputGroupUsername2" sronly="true">
        Username
    </Form.Label>
    <InputGroup size="sm" className=" mr-sm-2">
        {/* <InputGroup onClick={() => toggleUNInput(!showUsernameInput)}> */}
            <InputGroup.Text style={{height: '31px'}} size="sm">@</InputGroup.Text>
        {/* </InputGroup.Prepend> */}
        {showUsernameInput && <FormControl  size="sm"
            id="inlineFormInputGroupUsername2" 
            placeholder="Username" 
            value={username} 
            onChange={({target}) => updateUsername(target.value)} 
        />}
        <Button size="sm" type="submit" className="mb-2" onClick={e => {
            e.preventDefault();
            send([ {
                type: RoomEvents.SEND_MESSAGE,
                data: { username, message }
            }]);
            updateMessage("");
        }}>
            Send
        </Button>
    </InputGroup>
</Form>
        </div>
})