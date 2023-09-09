import { EventEmitter } from "events";
import { io } from "socket.io-client";

export class WsConnector extends EventEmitter {
  private connection = null;

  constructor({
      onOpen,
  }) {
    super()
    var serverUrl;
    var scheme = "ws";
  
    // If this is an HTTPS connection, we have to use a secure WebSocket
    // connection too, so add another "s" to the scheme.
  
    var port = '';
    if (document.location.protocol === "https:") {
      scheme += "s";
    } else {
      port += ':6503'
    }
    
    
    serverUrl = "ws://localhost:5001/ws";
    // serverUrl = process.env.ROUTER_URI || "wss://heym8-router-3ae6aec9f735.herokuapp.com/ws";
    // serverUrl = scheme + "://" + this.myHostname + port + "/ws";
    // 



    
  
    console.log(`Connecting to server: ${serverUrl}`);
    this.connection = new WebSocket(serverUrl, "json");
  
    this.connection.onopen = onOpen
  
    this.connection.onerror = (evt) => {
      console.dir(evt);
    }
  
    this.connection.onmessage = (evt) => {

      // var chatBox = document.querySelector(".chatbox");
      var {type, ...msg} = JSON.parse(evt.data);
      console.log(`Message [${type}] received: `);
      console.dir(msg);

      var time = new Date(msg.date);

      this.emit(type, { ...msg, time})
    }
  }

  send(msg) {
      var msgJSON = JSON.stringify(msg);
      this.connection.send(msgJSON);
  }
}