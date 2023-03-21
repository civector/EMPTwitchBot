/*
EMP Radio Twitch bot
website: emp.cx
Author: Civector
Testing if this will change anything
*/

//modules
var tmi = require('tmi.js');
var schedule = require('node-schedule');
var fs = require('fs');
const { setegid } = require('process');
const { Console } = require('console');

//local file "modules"
const general = require('./js/general');
const api_func = require('./js/api_func');
const chat_cmds = require('./js/chat_cmds');


//Purge function; to make sure the bot isn't in channels permanently
//leave all current channels the bot is connected to, rejoins the channels in whitelist
var purge_scheduler_time = new schedule.RecurrenceRule();
purge_scheduler_time.hour = 4; 
const purge_scheduler = schedule.scheduleJob(purge_scheduler_time, function(){
    console.log("Purging connected channels...");
    client.disconnect()
    .then((data) =>{
        console.log("Disconnected successfully/no errors: " + data);
    }).catch((err) =>{
        //probably "No response from twitch"
        console.log("disconnect error: " + err);
    });
    
    //join channels in allowed list
    client.connect()
    .then((data) =>{
        console.log("Connected successfully/no errors: " + data);
    }).catch((err) =>{
        //probably "No response from twitch"
        console.log("connect error: " + err);
    });
    
});

//tmi.js connection option
var options = {
    options: {
        debug: true
    },
    connection: {
        cluster: "aws",
        reconnect: true
    },
    identity: {
        username: chat_cmds.bot_username,
        password: chat_cmds.oauth
    },
    channels: chat_cmds.open_channels
};

//begin chat connection 
var client = new tmi.client(options);
client.connect()
.then((data) =>{
    console.log("Connected successfully/no errors: " + data);
}).catch((err) =>{
    //probably "No response from twitch"
    console.log("Connect error: " + err);
});

//**Chat Commands**
client.on('chat', function(channel, user, message, self) {

    //messages from the bot are ignored
    if(self) return;
    
    //does the message have the command character (an exclamation point)?
    var is_command = false;
    if(message.startsWith("!")){
        is_command = true;
    }

    //If the message is formatted as a command, then check against commands
    if(is_command == true){
        //permission level calculation
        /*var is_mod = false;
        var is_admin = false;

        if(user.mod == true){
            is_mod = true;
        }
        if(chat_cmds.admins.indexOf(user.username)!=-1){
            is_admin = true;
            is_mod = true;
        }
        */
        
        var perm  = chat_cmds.get_permissions(user);

        //create message object, with the command, and message
        var commandmessage = general.create_command_object(message);

        //**** mod only commands ****
        //Shoutout
        if((commandmessage.command === "empso") && perm.moderator){
            let so_channel = general.clean_handle(commandmessage.text);
            client.say(channel, "Check out @" + so_channel + "! https://twitch.tv/" + so_channel);
        }

        //**** admin only commands ****
        //channel join
        if((commandmessage.command === "empjoin") && perm.admin){
            var join_channel = general.clean_handle(commandmessage.text);

            console.log("joining " + join_channel + "...");
            client.say(channel, "joining " + join_channel + "...");
            client.join(join_channel)
            .then((data) =>{
                //joined successfully
                console.log("Join Successful/no errors: " + data);
            }).catch((err) =>{
                //probably "No response from twitch"
                console.log("Join error: " + data);
            });
    
        }

        //channel leave
        if((commandmessage.command === "emppart") && perm.admin){
            var join_channel = general.clean_handle(commandmessage.text);

            client.say(channel, "leaving " + join_channel + "...");
            client.part(join_channel)
            .then((data) =>{
                //left successfully
                console.log("Leave Successful/no errors: " + data);
            }).catch((err) =>{
                //probably "No response from twitch"
                console.log("Leave error: " + data);
            });;
        }
        
        //add basic command
        if((commandmessage.command === "empadd") && perm.admin){
            var new_command;
            var new_response;
            var msg_data = commandmessage.text.trim();

            new_command = msg_data.substring(0, msg_data.indexOf(','));
            new_response = msg_data.substring(msg_data.indexOf(',') + 1);

            new_command = new_command.trim();
            new_response = new_response.trim();

            chat_cmds.simple_commands.push({"command":new_command, "text":new_response});
            client.say(channel, new_command + " command added");

            var temp_data = JSON.stringify(chat_cmds.simple_commands);

            // write JSON string to a file
            fs.writeFile(__dirname + '/data/commands.json', temp_data, (err) => {
                if (err) {
                    throw err;
                }
                console.log("JSON Command list is saved.");
            });
        }

        //edit basic command
        if((commandmessage.command === "empedit") && perm.admin){
            var edit_command;
            var new_response;
            var msg_data = commandmessage.text.trim();
            var command_position = -1;

            edit_command = msg_data.substring(0, msg_data.indexOf(','));
            new_response = msg_data.substring(msg_data.indexOf(',') + 1);

            edit_command = edit_command.trim();
            new_response = new_response.trim();

           //find in array

           for(var i = 0, len = chat_cmds.simple_commands.length; i < len; i++){
               if(chat_cmds.simple_commands[i].command == edit_command){
                   command_position= i;
                   break;
               }
           }

            if (command_position > -1){
                //exists within array
                chat_cmds.simple_commands[command_position].text = new_response;
                client.say(channel, edit_command + " command edited");

                var temp_data = JSON.stringify(chat_cmds.simple_commands);

                // write JSON string to a file
                fs.writeFile(__dirname + '/data/commands.json', temp_data, (err) => {
                    if (err) {
                        throw err;
                    }
                    console.log("JSON Command list is saved.");
                });
            }else{
                client.say(channel, "Command does not exist. Please try again.");
            }
        }

        //remove basic command
        if((commandmessage.command === "empremove") && perm.admin){
            var edit_command;
            var msg_data = commandmessage.text.trim();
            var command_position = -1;

            edit_command = msg_data;

            //find in array

            for(var i = 0, len = chat_cmds.simple_commands.length; i < len; i++){
                if(chat_cmds.simple_commands[i].command == edit_command){
                    command_position= i;
                    break;
                }
            }

            if (command_position > -1){
                //exists within array
                chat_cmds.simple_commands.splice(command_position, 1);
                client.say(channel, edit_command + " command removed");

                var temp_data = JSON.stringify(chat_cmds.simple_commands);

                // write JSON string to a file
                fs.writeFile(__dirname + '/data/commands.json', temp_data, (err) => {
                    if (err) {
                        throw err;
                    }
                    console.log("JSON Command list is saved.");
                });
            }else{
                client.say(channel, "Command does not exist. Please try again.");
            }
        }

        //**** Commands avalible to all ****

        //Check if bot is mod in channel
        if(commandmessage.command == 'ismod'){
            var chat_permissions = chat_cmds.get_permissions(user);
        }

        //Check if channel is currently streaming
        if(commandmessage.command == 'islive'){
            var handle = general.clean_handle(commandmessage.text);
            var getstreamurl = "https://api.twitch.tv/helix/streams";
            var boollive = false;
            var reply = "";
            var responsetype = "";
            var repeatcount = 0;

            getstreamurl = getstreamurl + "?user_login=" + handle;

            fetch(getstreamurl, {
                method: "GET",
                headers:{
                    "Authorization": api_func.APIcred.token,
                    "Client-Id": api_func.APIcred.client_id,
                }
            })
            .then((response) => {
                responsetype = response.status;
                if (!response.ok) {
                    if(response.status == 400){
                        reply = "No account exists for: " + handle;
                        client.say(channel, reply);
                    }
                    throw new Error(`HTTP error: ${response.status}`);
                }
                return response.json();
            })
            .then((streamers) => {
                if(streamers.data.length){
                    if ((handle == streamers.data[0].user_login) && (streamers.data[0].type == "live")){
                        boollive = true;
                    }

                }
                console.log(boollive);
                if(boollive){
                    reply = "@" + handle + " is live!";
                }else{
                    reply = "@" + handle + " is nowhere to be seen";
                }
                client.say(channel, reply);

            })
            .catch((error) => {
                console.error(`Could not get products: ${error}`);

                if(responsetype === 401){
                    (async() => {
                        var temp_token = await api_func.getToken(api_func.token_info.refresh_token);
                        api_func.token_info = temp_token;
                        api_func.APIcred.token = "Bearer " + api_func.token_info.access_token;
                        client.say(channel, "/me *Yawns*");
                        client.say(channel, "....Huh? Can you say that command again? I was taking a nap");
                    })()
                    
                }
                
            });
        }

        //help - list all avalible commands
        if(commandmessage.command === "help" || commandmessage.command === "h"){
            console.log("help");
            client.say(channel, "avalible commands: empmerch, emplinks, empreleases, help.\nmod only: empso \nadmin only: empjoin, emppart, emphost.");
        }

        //list basic commands
        if(commandmessage.command === "list_basic"){
            var command_list = "";

            for (var i = 0; i < chat_cmds.simple_commands.length; i++) {
                command_list = command_list + commands[i].command + ", ";
            }
            console.log(command_list);
            client.say(channel, command_list);

        }
	
        //Lineup Response
        if(commandmessage.command == 'lineup'){
            var lineupmessage = "";
            const fetchPromise = fetch(lineup_url);

            fetchPromise
            .then((response) => {
                if (!response.ok) {
                throw new Error(`HTTP error: ${response.status}`);
                }
                return response.json();
            })
            .then((lineupnew) => {
                lineupmessage = 'Lineup for ' + lineupnew[0].Date + ' in PST: ';

                for (var i = 0; i < lineupnew.length; i++) {
                    var temp_lineup_date = new Date(lineupnew[i].Date);
                    temp_lineup_date.setHours(lineupnew[i].Hour);
                    var lineup_time = temp_lineup_date.toLocaleString("en-US", {
                        hour: "numeric",
                        hour12: true,
                    });
                    if( i < (lineupnew.length - 1)){
                        lineupmessage = lineupmessage + lineup_time + " → " + lineupnew[i].DJ_Name + ", ";
                    }else{
                        lineupmessage = lineupmessage + lineup_time + " → " + lineupnew[i].DJ_Name;
                    }
                }
                client.say(channel, lineupmessage);
            })
            .catch((error) => {
                console.error(`Could not get products: ${error}`);
            });


        }

        //Now playing response
        if(commandmessage.command == 'nowplaying' || commandmessage.command == 'np' || commandmessage.command == 'current'){
            //get current hour and date
            var currentDate = new Date();
            currentDate.setMilliseconds(0);
            currentDate.setSeconds(0);
            currentDate.setMinutes(0);
            const fetchPromise = fetch(lineup_url);

            fetchPromise
            .then((response) => {
                if (!response.ok) {
                throw new Error(`HTTP error: ${response.status}`);
                }
                return response.json();
            })
            .then((lineupnew) => {
                var is_playing = false;
                var nowplayingtext = "";
                var i = 0;
                while(i<lineupnew.length && is_playing == false){
                    //make new date object
                    var nowplayingDate = new Date(lineupnew[i].Date);
                    nowplayingDate.setHours(lineupnew[i].Hour);
                    if(nowplayingDate.getTime() == currentDate.getTime()){
                        is_playing = true;
                        console.log('found match at : ' + i);
                    }
                    i++;
                }
                i = i - 1;
                if(is_playing == true){
                    nowplayingtext = lineupnew[i].DJ_Name + ' is live! → https://www.twitch.tv/' + lineupnew[i].DJ_Channel;
                }else{
                    nowplayingtext = 'No one is currently live.';
                }

                client.say(channel, nowplayingtext);
            })
            .catch((error) => {
                console.error(`Could not get products: ${error}`);
            });
        }


        //Question response
        if(commandmessage.command == ""){
            //check for "or" and "?"
            var strmessage = JSON.stringify(commandmessage.text);
            var split_point = strmessage.indexOf(" or ");
            var question_point = strmessage.indexOf("?");
            var optioncount;
            var options = [];
            var intResult;
	    console.log('question point: ' + question_point);

            //there must be a question mark to work
            if(question_point > 1){
                //is there an " or "
                if(split_point > -1){
                    optioncount = 2;
                    count = 0;
                    if(question_point == -1){
                        question_point = strmessage.length;
                    }
                    
                    options[0] = strmessage.substring(1, split_point);
                    options[1] = strmessage.substring(split_point+4, question_point);

                }else{
                    optioncount = 2;
                    options[0] = "yes";
                    options[1] = "no";
                }
                console.log(options);
                intResult = general.getRndInteger(0,1);

                client.say(channel, options[intResult]);
            }
        }

        //general command function
        var command_index = chat_cmds.simple_commands.findIndex(function(item, i){
                return item.command == commandmessage.command;
        });
        if(command_index > -1){
                console.log("Send command");
                client.say(channel, chat_cmds.simple_commands[command_index].text);
        }
    }
});

client.on('connected', function(address, port) {
    console.log("Address: " + address + " Port: " + port);
});