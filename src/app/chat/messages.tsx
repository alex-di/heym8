import { observer } from 'mobx-react';
import React, {useState} from 'react'
import { useStore } from '../../store';

export default observer(() => {
    const store = useStore();
    return <>{store.messages.map((user) => 
        <p key={user}>{user}</p>
    )}</>
})