
import React, { createContext, useContext } from 'react';
import Col from 'react-bootstrap/Col';
import Row from 'react-bootstrap/Row';
import RemoteDashboard from "./remoteDashboard"

import { useActor } from '@xstate/react';

import LocalStream from './localStream';
import { AppState } from '../../store';
import { GlobalStateContext } from '../../components';
import {Chat} from './chat';
import { initContractStorage } from '../../services/room';
import { useLoaderData } from 'react-router-dom';


export const ActiveState = ({ }) => {
    const globalServices = useContext(GlobalStateContext);
    const [store] = useActor(globalServices.appService);
    

    return <div className="d-flex flex-column rooms-container">
        <Row className="flex-fill">
            <Col className="p-0">
                <RemoteDashboard></RemoteDashboard>
            </Col>
        </Row>
        <div  className="bottomPanel d-flex">

        <div className="p-2 flex-grow-1">

        <Chat ></Chat>
        </div>
            <div className="lsWrapper flex-grow-0">
                {store.value === AppState.READY && <LocalStream></LocalStream>}
            </div>
        </div>

    </div>   
}

