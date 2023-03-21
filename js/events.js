const WebSocket = require('ws');

const ws = new WebSocket('wss://eventsub-beta.wss.twitch.tv/ws');

/*wss.on('connection', function connection(ws) {
  ws.on('message', function incoming(message) {
    console.log('received: %s', message);
  });

  ws.on('ping', function handlePing() {
    ws.pong();
  });
});*/
ws.on('open', function open() {
    console.log('connected');
});
  
ws.on('close', function close() {
    console.log('disconnected');
});

ws.on('message', function incoming(data) {
    let incmessage = JSON.parse(data);
    console.log(incmessage);

    //Session Welcome Message
    if(incmessage.metadata.message_type === "session_welcome"){
        //need to subcribe to an event to keep the socket open
        //save session ID

    }

    //keepalive message
    if(incmessage.metadata.message_type === "session_keepalive"){
        console.log("hello");
    }

    //Ping message
    if(incmessage.metadata.message_type === "ping"){
        console.log("hello");
    }

    //Notification message
    if(incmessage.metadata.message_type === "notification"){
        console.log("hello");
    }
});
