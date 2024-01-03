
export const connectWebsocket = () => {

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
    
    serverUrl = process.env.ROUTER_URI || "wss://heym8-router-3ae6aec9f735.herokuapp.com/ws";
    // serverUrl = scheme + "://" + this.myHostname + port + "/ws";
    return Promise.resolve(new WebSocket(serverUrl, "json"));
}


