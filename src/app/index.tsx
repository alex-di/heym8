import React from 'react'
import Container from 'react-bootstrap/Container';
import Col from 'react-bootstrap/Col';
import Row from 'react-bootstrap/Row';

import RemoteDashboard from './remoteDashboard'
import LocalStream from './localStream';
import Chat from './chat';
import { StoreProvider } from '../store';

const App = () => {
    return <Container fluid>
        <StoreProvider >
            <div className="d-flex flex-column">
                <Row className="flex-fill">
                    <Col>
                        <RemoteDashboard></RemoteDashboard>
                    </Col>
                </Row>
                <Row className="bottomPanel">
                    <Col xs={3}>
                        <LocalStream></LocalStream>
                    </Col>
                    <Col>
                        <Chat></Chat>
                    </Col>
                </Row>

            </div>
        </StoreProvider>
    </Container>
} 

export default App;