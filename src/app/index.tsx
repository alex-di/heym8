import React from 'react'
import Container from 'react-bootstrap/Container';
import Col from 'react-bootstrap/Col';
import Row from 'react-bootstrap/Row';

import Screen from './screen'
import Chat from './chat';
import { StoreProvider } from '../store';

const App = () => {
    return <Container fluid>
        <StoreProvider >
            <Row>
                <Col>
                    <Screen></Screen>
                </Col>
                <Col>
                    <Chat></Chat>
                </Col>
            </Row>
        </StoreProvider>
    </Container>
} 

export default App;