import React, {useContext, useState} from 'react'
import { LayoutContext } from "./context";
import { Offcanvas } from 'react-bootstrap';

import { Outlet } from 'react-router-dom';
import { ContractList } from './ContractList';

export function Layout({  }) {
  const [open, setOpen] = useState(LayoutContext);
    return <LayoutContext.Provider value={{ open, setOpen }}><>
      <Offcanvas show={open} onHide={() => setOpen(false)}>
      <Offcanvas.Header closeButton>
        <Offcanvas.Title>Rooms</Offcanvas.Title>
      </Offcanvas.Header>
      <Offcanvas.Body>
        <ContractList></ContractList>
      </Offcanvas.Body>
    </Offcanvas>
      <Outlet></Outlet>
    </></LayoutContext.Provider>
}