import React, {useState} from 'react'
import Col from 'react-bootstrap/Col';
import Row from 'react-bootstrap/Row';
import {Messages} from './messages';
import SendForm from './sendForm';

export const Chat = ({  }) => {
    return <div className="d-flex flex-column justify-content-end">         
                <Messages></Messages>
                <SendForm></SendForm>

        </div>
}