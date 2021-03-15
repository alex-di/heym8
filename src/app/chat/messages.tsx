import { observer } from 'mobx-react';
import React, {useState} from 'react'
import { useStore } from '../../store';
import {renderMessage} from './message';

export default observer(() => {
    const store = useStore();
    return <div className="d-flex flex-column justify-content-end">{store.messages.map(renderMessage)}</div>
})