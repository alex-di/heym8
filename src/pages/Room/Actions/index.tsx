import { useActor } from "@xstate/react";
import React = require("react");
import { Button } from "react-bootstrap"
import { GlobalStateContext } from "../../../components";
import { CallAction, CallState } from "../../../store";

export const Actions = () => {

    const globalServices = React.useContext(GlobalStateContext);
    const [appStore] = useActor(globalServices.appService);


    const [store, send] = useActor(Object.values(appStore.children)[0]);
    return store?.value == CallState.ONAIR 
        ? <Button variant="warning" onClick={() => send({ type: CallAction.HANGUP })}>Hangup</Button>
        :<Button variant="primary" onClick={() => send({ type: CallAction.JOIN })}>Join call</Button>
}