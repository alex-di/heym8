
import React, {useState} from 'react'
import Button from 'react-bootstrap/Button';
import { useStore } from '../../../store';

export default ({user}) => {
    const store = useStore();
    return <>
    
        <Button variant="success" onClick={() => store.callUser(user)}>Success</Button>{' '}
        <Button variant="warning">Warning</Button>{' '}
        </>
};