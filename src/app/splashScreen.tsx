import React, { useState } from 'react';
import Jumbotron from 'react-bootstrap/Jumbotron';
import Button from 'react-bootstrap/Button';
import ClipboardText from './clipboardText'


export default () => {
    return <Jumbotron className="mx-auto mt-5 mb-5">
        <div className=" d-flex flex-column justify-content-center ">
            
  <h1>Hey mate!</h1>
  <p></p>
  <p>
    This is the lightweight app that allows you to have a video chat with your "mate" without a middleman.<br/>
    It stores nothing on the server and has no tracking or analytics.
  </p>
  <p>To connect with your friends just share this link and wait for them <br/>to enjoy private chatting limited only by your connection capabilities.</p>
  
    <ClipboardText></ClipboardText>
  <p>
    Messages and streams are transferred directly between peers using super secure WebRTC technology.
  </p>
  <p>
      Simple server just thansfers the routing messages and manages the rooms. <br/>Its open-source, just click the button to check details.
  </p>
  <p>
    <Button variant="primary" href="https://github.com/alex-di/heym8" target="_blank">Learn more</Button>
  </p>
    <p></p>
    <p></p>
    <p></p>
  <h3 className="text-right"><i>Cheers, Alex Di.</i></h3>
  <p></p>
  <p><i>P.S: I'd recomment using Chrome for this</i></p>
    </div>

</Jumbotron>
}