import React, { useContext } from 'react';
import Button from 'react-bootstrap/Button';

import { useActor } from '@xstate/react';
import { GlobalStateContext } from './context';
import { AppEvent, AppState } from '../store';



export function SignIn() {


  const globalServices = useContext(GlobalStateContext);
  const [appStore] = useActor(globalServices.appService);
  const [store, send] = useActor(Object.values(appStore.children)[0]);
  
  return store?.value === AppState.READY
  ? <pre>
    {JSON.stringify(store.context)}
    </pre>
  : <Button variant="primary" onClick={() => send(AppEvent.CONNECT_WALLET)}>Sign In</Button> 
}