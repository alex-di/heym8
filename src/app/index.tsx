import React from 'react'
import Container from 'react-bootstrap/Container';
import Col from 'react-bootstrap/Col';
import Row from 'react-bootstrap/Row';

import RemoteDashboard from './remoteDashboard'
import LocalStream from './localStream';
import Chat from './chat';
import { StoreProvider } from '../store';
import {StarrySky} from './skyBackground';
import Keyboard from './keyboard';

const App = () => {
    return <Container fluid>
        <StarrySky>
        <StoreProvider >
            <Keyboard />
            <div className="d-flex flex-column">
                <Row className="flex-fill">
                    <Col className="p-0">
                        <RemoteDashboard></RemoteDashboard>
                    </Col>
                </Row>
                <div  className="bottomPanel d-flex">

                <div className="p-2 flex-grow-1">

                <Chat></Chat>
                </div>
                    <div className="lsWrapper flex-grow-0">

                        <LocalStream></LocalStream>
                    </div>
                </div>

            </div>
        </StoreProvider></StarrySky>
    </Container>
} 

export default App;