import React, {useState} from 'react'
import Col from 'react-bootstrap/Col';
import Row from 'react-bootstrap/Row';
import Messages from './messages';
import SendForm from './sendForm';

export default () => {
    return <div className="d-flex flex-column">
        <Row className="flex-fill mb-2">
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