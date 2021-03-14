import React, {useState} from 'react'
import Col from 'react-bootstrap/Col';
import Row from 'react-bootstrap/Row';
import Users from './users';
import Messages from './messages';
import SendForm from './sendForm';

export default () => {
    return <div>
        <Row>
            <Col>
                <Users></Users>
            </Col>
        </Row>
        <Row>
            <Col>
                <Messages></Messages>
            </Col>
         </Row>
         
        <Row>
            <Col>
                <SendForm></SendForm>
            </Col>
         </Row>
         
        </div>
}