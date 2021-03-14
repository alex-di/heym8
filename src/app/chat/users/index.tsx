import { observer } from 'mobx-react';
import React, {useState} from 'react'
import Accordion from 'react-bootstrap/Accordion';
import Card from 'react-bootstrap/Card';
import Button from 'react-bootstrap/Button';
import { useStore } from '../../../store';
import ProfileView from './profileView';
import CalleeMenu from './calleeMenu';

export default observer(() => {
    const store = useStore();
    return <Accordion defaultActiveKey={store.username}>
        {store.users.map((user) => 
            <Card key={user}>
                <Card.Header>
                    <Accordion.Toggle as={Button} variant="link" eventKey={user}>
                    {user}
                    </Accordion.Toggle>
                </Card.Header>
                <Accordion.Collapse eventKey={user}>
                    <Card.Body>{user === store.username ? <ProfileView></ProfileView> : <CalleeMenu user={user}></CalleeMenu>}</Card.Body>
                </Accordion.Collapse>
            </Card>
        )}
    </Accordion>
})