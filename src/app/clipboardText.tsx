import React, { useState } from 'react';
import Form from 'react-bootstrap/Form';
import Button from 'react-bootstrap/Button';
import InputGroup from 'react-bootstrap/InputGroup';


const BUTTON_TEXT_DEFAULT = 'Copy to clipboard'
const BUTTON_TEXT_COPIED = 'You can send now'

export default class CopyLink extends React.Component {
    constructor() {
        super()
        this.state = {
            copyText: false,
        }
    }

    componentDidMount () {
        this.clipboard = new Clipboard(this.button)
        this.clipboard.on('success', this.onCopySuccess.bind(this))
      }
      
    componentWillUnmount() {
       this.clipboard.destroy()
    }

    onCopySuccess() {
        this.setState({
            copyText: true
        })
        setTimeout(() => this.setState({
            copyText: false
        }), 3000)
    }
    render() {
        const {copyText} = this.state
        return <Form>
            <InputGroup size="lg" className=" mr-sm-2">
                <Form.Control value={location.href}></Form.Control>
                <InputGroup.Append>
                    <Button ref={(el => this.button = el)}class="" data-clipboard-text={location.href} disabled={copyText}>{copyText ? BUTTON_TEXT_COPIED : BUTTON_TEXT_DEFAULT}</Button>
                </InputGroup.Append>
            </InputGroup>
        </Form>
      }


    
}