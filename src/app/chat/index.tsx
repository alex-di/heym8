import React, {useState} from 'react'
import Col from 'react-bootstrap/Col';
import Row from 'react-bootstrap/Row';
import Messages from './messages';
import SendForm from './sendForm';

export default () => {
    return <div className="d-flex flex-column justify-content-end">         
        <Row>
            <Col>
                <SendForm></SendForm>
            </Col>
         </Row>
         
        </div>
}