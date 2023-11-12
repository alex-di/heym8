import React, { createContext } from 'react';
import { InterpreterFrom } from 'xstate';
import { callMachine, chainMachine } from '../store/state';
export const GlobalStateContext = createContext({
    
} as {
    appService: InterpreterFrom<typeof chainMachine>,
});