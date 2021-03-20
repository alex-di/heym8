import React, { useState } from 'react';
import Form from 'react-bootstrap/Form';
import Button from 'react-bootstrap/Button';
import InputGroup from 'react-bootstrap/InputGroup';



export default class CopyLink extends React.Component {

    componentDidMount () {
        this.clipboard = new Clipboard(this.button)
      }
      
    componentWillUnmount() {
       this.clipboard.destroy()
    }
    render() {
    
        return <Form>
            <InputGroup size="lg" className=" mr-sm-2">
                <Form.Control value={location.href}></Form.Control>
                <InputGroup.Append>
                    <Button ref={(el => this.button = el)}class="" data-clipboard-text={location.href}>Copy to clipboard</Button>
                </InputGroup.Append>
            </InputGroup>
        </Form>
      }
}