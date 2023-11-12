
import { fromEvent, map } from "rxjs"

import { CallEvents, CallerEvent } from "../enums"

export const observablesFactory = () => {
    const events = {
        [CallEvents.LOCAL_STREAM]: CallerEvent.LOCAL_STREAM,
        [CallEvents.NEW_MESSAGE]: CallerEvent.MESSAGE,
        [CallEvents.REMOTE_STREAM]: CallerEvent.REMOTE_STREAM,
        [CallEvents.USER_LIST]: CallerEvent.USER_LIST,
    }
    return Object.entries(events).map(([id, event]) => ({ 
        id, 
        src: (ctx, evt) => {
            if (!ctx.caller) {
                return Promise.resolve()
            }
            return fromEvent(ctx.caller, event)
        }
     }))
}