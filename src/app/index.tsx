import React, { } from 'react';
import Container from 'react-bootstrap/Container';
import { useInterpret } from '@xstate/react';

import {StarrySky} from './layout';


import { GlobalStateContext } from './context';
import { chainMachine } from '../store';
import { StateContainer } from './state-container';

const App = () => {

    const appService = useInterpret(chainMachine)
    return <Container fluid>
        <StarrySky>
        <GlobalStateContext.Provider value={{ appService }} >
            <StateContainer></StateContainer>
        </GlobalStateContext.Provider>
        </StarrySky>
    </Container>
} 

export default App;