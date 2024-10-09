import React = require("react");
import { useActor } from "@xstate/react";
import { Button } from "react-bootstrap"
import { CallAction, CallState } from "../../../shared/store";
import { GlobalStateContext } from "../../../shared/ui";

export const Actions = () => {

    const globalServices = React.useContext(GlobalStateContext);
    const [appStore] = useActor(globalServices.appService);


    const [store, send] = useActor(Object.values(appStore.children)[0]);
    return store?.value === CallState.ONAIR 
        ? <Button variant="warning" onClick={() => send({ type: CallAction.HANGUP })}>Hangup</Button>
        :<Button variant="primary" onClick={() => send({ type: CallAction.JOIN })}>Join call</Button>
}