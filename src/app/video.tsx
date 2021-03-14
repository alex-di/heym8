
import React from 'react';

export default ({stream, id}) => 
    <video className="videoItem" playsInline autoPlay id={id} ref={el => { 
        if (!el || !stream) return;
        el.srcObject = stream;
        el.play();
    }}></video>
