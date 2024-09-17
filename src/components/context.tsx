import React, { createContext } from 'react';
import { InterpreterFrom } from 'xstate';
import { appMachine } from '../store';
export const GlobalStateContext = createContext({
    
} as {
    appService: InterpreterFrom<typeof appMachine>,
});


export const LayoutContext = createContext({
    open: true,
    setOpen(args: any) {}
})
export const MessageContext = createContext({   
    list: []
})