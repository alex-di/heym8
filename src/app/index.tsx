import React from 'react'

import Screen from './screen'
import Controls from './controls';
import { StoreProvider } from '../store';

const App = () => {
    return <StoreProvider >
            <Screen></Screen>
            <Controls></Controls>
    </StoreProvider>
} 

export default App;