const WebSocket = require('ws');
const api_func = require('./api_func');

const ws = new WebSocket('wss://eventsub-beta.wss.twitch.tv/ws');

var sessionID = 0;

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
        sessionID = incmessage.payload.session.id;

        //send default subscription to keep connection open
        let subscrURL = "https://api.twitch.tv/helix/eventsub/subscriptions";
        let header_info = {
            "Authorization": api_func.APIcred.token,
            "Client-Id": api_func.APIcred.client_id,
            "Content-Type": "application/json"
        };
        let body_info = {
            "type":"stream.online",
            "version":"1",
            "condition":{"broadcaster_user_id":"593403053"},
            "transport":{
                "method":"websocket",
                "session_id":sessionID
            }
        };

        fetch(subscrURL, {
            method: "POST",
            headers: header_info,
            body: JSON.stringify(body_info)
        })
        .then((response) =>{
            var responsetype = response.status;
            console.log(responsetype);
            if (!response.ok) {
                throw new Error(`HTTP error: ${response.status}`);
            }
            return response.json();
        })
        .then((data) => {
            console.log(data);
        })
        .catch((error) => {
            console.error(`Could not get products: ${error}`);
        });
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
