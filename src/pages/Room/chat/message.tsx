import React, { useState } from 'react';
import Toast from 'react-bootstrap/Toast';
import { MessageType } from '../../../store/enums';

export function renderMessage(raw: string) {
    try {
        const {type, name, text, time} = JSON.parse(raw);
        const key = `${type}:${time}:${name}`;
        switch (type) {
            case MessageType.USER_JOINED:
                return <SystemMessage key={key} time={time}>{name} just joined. Say hello.</SystemMessage>
            case MessageType.USER_MESSAGE:
                return <UserMessage key={key} text={text} name={name} time={time}></UserMessage>
            case MessageType.REJECT_USERNAME:
                return <SystemMessage key={key} time={time}>Your username was changed to {name} due to conflict.</SystemMessage>
            default:
                return null
        }
        
    } catch (e) {
        return <SystemMessage time={null}>{raw}</SystemMessage>
    }
}

const SystemMessage = ({ children, time }) => {

    const [show, setShow] = useState(true)
    return <Toast 
        onClose={() => setShow(false)} 
        show={show} 
        delay={5000} 
        autohide
    >
        <Toast.Header><b className="mr-auto">Chat</b>
        {time && <small>{time}</small>}
        </Toast.Header>
        <Toast.Body>{children}</Toast.Body>
    </Toast>
}
const UserMessage = ({ text, name, time }) => {
    const [show, setShow] = useState(true)
    return <Toast 
            onClose={() => setShow(false)} 
            show={show} 
            delay={30000} 
            autohide>
        <Toast.Header>
            <b className="mr-auto">{name}</b>
            {time && <small>{time}</small>}
        </Toast.Header>
        <Toast.Body>{text}</Toast.Body>
    </Toast>
}