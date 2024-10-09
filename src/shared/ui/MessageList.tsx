import React = require("react")
import { useContext } from "react"
import { Message } from "./Message"
import { MessageContext } from './context'
export function MessageList() {
    const {list} = useContext(MessageContext)
    console.log( list )
    return list.map(message => <Message message={message}></Message>)
}