
import React, { } from 'react';

import {Chat} from './chat';
import UserList from './userList';
import { Col, Row, Stack } from 'react-bootstrap';
import { Actions } from './Actions';
import { Profile } from './Profile';


export const ChatState = ({ }) => {
    return <Row style={{ height: '100%'}}>
    <Col xs={3}  >
        <Stack gap={3}>
            <Profile></Profile>
            <Actions></Actions>
            <UserList></UserList> 
        </Stack>
    </Col>
    <Col xs={9}>
        <Chat ></Chat>
    </Col>
  </Row>
    // return <div className="d-flex flex-column rooms-container">

    // </div>   
}

