import React, { useContext } from 'react';
import Button from 'react-bootstrap/Button';
import { ChainEvent, ChainState, chainMachine } from '../store';
import { useActor } from '@xstate/react';
import { GlobalStateContext } from './context';


export function SignIn() {


  const globalServices = useContext(GlobalStateContext);
  const [appStore] = useActor(globalServices.appService);
  const [store, send] = useActor(Object.values(appStore.children)[0]);
  
  return store?.value === ChainState.READY
  ? <pre>
    {JSON.stringify(store.context)}
    </pre>
  : <Button variant="primary" onClick={() => send(ChainEvent.CONNECT_WALLET)}>Sign In</Button> 
}