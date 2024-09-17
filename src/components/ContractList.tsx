import React = require("react");
import { useActor } from "@xstate/react";
import { ListGroup } from "react-bootstrap";
import { GlobalStateContext } from "./context";
import { Link } from "react-router-dom";

export function ContractList() {

  const globalServices = React.useContext(GlobalStateContext);
  const [store] = useActor(globalServices.appService);

  const ctx = store.context

  return (
    <ListGroup>
        {ctx.available.length ? ctx.available.map((roomId) => 
            <ListGroup.Item key={roomId} ><Link to={"/"+roomId.toString()}>Main Contract ({roomId})</Link> </ListGroup.Item>
        ) : <div>No rooms</div>}
        {/* <ListGroup.Item>Dapibus ac facilisis in</ListGroup.Item>
        <ListGroup.Item>Morbi leo risus</ListGroup.Item>
        <ListGroup.Item>Porta ac consectetur ac</ListGroup.Item>
        <ListGroup.Item>Vestibulum at eros</ListGroup.Item>  */}
    </ListGroup>
  );
}
