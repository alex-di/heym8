import React = require("react");
import { useActor } from "@xstate/react";
import { ListGroup } from "react-bootstrap";
import { GlobalStateContext } from "./context";
import { Link } from "react-router-dom";

export function RoomList() {

  const globalServices = React.useContext(GlobalStateContext);
  const [store] = useActor(globalServices.appService);

  const ctx = store.context

  return <>
      <h4>Rooms</h4>
      <ListGroup>
          {ctx.available.length ? ctx.available.map((roomId) => 
              <ListGroup.Item ><Link to={"/"+roomId.toString()}>General ({roomId})</Link> </ListGroup.Item>
              ) : <div>No rooms</div>}
          {/* <ListGroup.Item>Dapibus ac facilisis in</ListGroup.Item>
          <ListGroup.Item>Morbi leo risus</ListGroup.Item>
          <ListGroup.Item>Porta ac consectetur ac</ListGroup.Item>
        <ListGroup.Item>Vestibulum at eros</ListGroup.Item>  */}
      </ListGroup>

  </>
}
