import { EventEmitter } from "events";
import { Socket, io } from "socket.io-client";
import { IoEventType } from "./types";

export class WsConnector extends EventEmitter {
  private io: Socket

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
    
    serverUrl = "http://localhost:5001";
    // serverUrl = process.env.ROUTER_URI || "wss://heym8-router-3ae6aec9f735.herokuapp.com/ws";
    // serverUrl = scheme + "://" + this.myHostname + port + "/ws";
  

    this.io = io(`${serverUrl}/admin`, {
      reconnectionDelayMax: 10000,
      auth: {
        token: "123"
      },
      query: {
        "my-key": "my-value"
      }
    });

    this.io.on("connect", () => {
      console.log(this.io.id); // x8WIv7-mJelg7on_ALbx
      onOpen()
    });

    this.io.on("disconnect", (evt) => console.dir(this.io, evt));
  
    Object.values(IoEventType).forEach((eventType) => this.io.on(eventType, (msg) => this.emit(eventType, msg)))
  }

  send({type, ...msg}) {
    this.io.emit(type, msg);
  }
}