
import React from 'react';

export default ({stream, id, muted = false }) => 
    <video className="videoItem" playsInline autoPlay muted={muted} id={id} ref={el => { 
        if (!el || !stream) return;
        el.srcObject = stream;
        el.play();
    }}></video>
