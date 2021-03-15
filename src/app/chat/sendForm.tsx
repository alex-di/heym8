import { observer } from 'mobx-react';
import React, {useState} from 'react'

import {useStore} from '../../store'
import Form from 'react-bootstrap/Form';
import FormControl from 'react-bootstrap/FormControl';
import Button from 'react-bootstrap/Button';
import InputGroup from 'react-bootstrap/InputGroup';

export default observer(() => {
    const store = useStore();
    console.log("RENDER", store.messages)
    const [message, updateMessage] = useState('');
    const [showUsernameInput, toggleUNInput] = useState(store.isDefaultUsername);
    const [username, updateUsername] = useState(store.username);
    return <Form inline>
    <Form.Label size="sm" htmlFor="inlineFormInputGroupUsername2" srOnly>
        Username
    </Form.Label>
    <InputGroup size="sm" className="mb-2 mr-sm-2">
        <InputGroup.Prepend onClick={() => toggleUNInput(!showUsernameInput)}>
            <InputGroup.Text size="sm">@</InputGroup.Text>
        </InputGroup.Prepend>
        {showUsernameInput && <FormControl  size="sm"
            id="inlineFormInputGroupUsername2" 
            placeholder="Username" 
            value={username} 
            onChange={({target}) => updateUsername(target.value)} 
        />}
    </InputGroup>
    <Form.Label size="sm" htmlFor="inlineFormInputName2" srOnly>
        Message
    </Form.Label>
    <Form.Control size="sm"
        className="mb-2 mr-sm-2"
        id="inlineFormInputName2"
        placeholder="Hey mate"
        value={message}
        onChange={({target}) => updateMessage(target.value)}
    />
    <Button size="sm" type="submit" className="mb-2" onClick={e => {
        e.preventDefault();
        store.sendMessage(username, message);
        updateMessage("");
    }}>
        Send
    </Button>
</Form>
})