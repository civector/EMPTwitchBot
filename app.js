//EMP Radio Twitch bot


//modules
var tmi = require('tmi.js');
var fs = require('fs');
var schedule = require('node-schedule');
var generalfn = require('./js/general.js');
const { setegid } = require('process');
const { Console } = require('console');

//Start Console Message
console.log("Twitch Bot Start");


//**Variable declaration and initialization**//
//Bot Username
var bot_username = fs.readFileSync(__dirname + '/settings/twitch_bot_channel.txt').toString();

//Oauth Token
var oauth = fs.readFileSync(__dirname + '/settings/oauth.txt').toString();

//Load lists for variable arrays
// Bot Admins
var text = fs.readFileSync(__dirname + '/data/admins.json');
var admins = JSON.parse(text);
console.log('bot admins: ' + admins);

//Channels for the bot to be in
var open_channels = fs.readFileSync(__dirname + '/data/channels.txt').toString().split("\n");
console.log('Joining Channels: ' + open_channels);

//Set list for next show
const lineup_url = fs.readFileSync(__dirname + '/settings/lineup_url.txt').toString();

//leave all current channels the bot is connected to
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


//Simple Command List
text = fs.readFileSync(__dirname + '/data/commands.json');
var commands = JSON.parse(text);

//tmi connection option
var options = {
    options: {
        debug: true
    },
    connection: {
        cluster: "aws",
        reconnect: true
    },
    identity: {
        username: bot_username,
        password: oauth
    },
    channels: open_channels
};

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


    if(self) return;
    
    //is message a command?
    var is_command = false;
    if(message.startsWith("!")){
        is_command = true;
    }

    //If message is a command, then check against commands
    if(is_command == true){
        //permission level calculation
        var is_mod = false;
        var is_admin = false;
        //if(user.badges.broadcaster == 1 || user.mod == true){
        if(user.mod == true){
            is_mod = true;
        }
        if(admins.indexOf(user.username)!=-1){
            is_admin = true;
            is_mod = true;
        }

        //create message object, with the command, and message
        var messagebreak = message.indexOf(" ");
        if(messagebreak >= 1 ){
            var commandmessage = {"command":message.substring(1,messagebreak), "text":message.substring(message.indexOf(" ")+1)};
        }else{
            var commandmessage = {"command":message.substring(1), "text":""};
        }
        console.log("command: '" + commandmessage.command + "'");
        console.log(user.username + ": admin: " + is_admin + ", mod: " + is_mod);

        //**** Mod only Commands  ****
        //Shoutout
        if((commandmessage.command === "empso") && is_mod){
            var so_channel = commandmessage.text;
            if(so_channel.startsWith("@")){
                so_channel = so_channel.substr(1);
            }
            if(so_channel.includes(" ")){
                so_channel = so_channel.substr(0, so_channel.indexOf(" "))
            }
            client.say(channel, "Check out @" + so_channel + "! https://twitch.tv/" + so_channel);

        }


        //**** admin only commands ****
        //channel join
        if((commandmessage.command === "empjoin") && is_admin){
            var join_channel = message.substr(9);
            if(join_channel.startsWith("@")){
                join_channel = join_channel.substr(1);
            }
            if(join_channel.includes(" ")){
                join_channel = join_channel.substr(0, join_channel.indexOf(" "));
            }
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
        if((commandmessage.command === "emppart") && is_admin){
            var join_channel = commandmessage.text;
            if(join_channel.startsWith("@")){
                join_channel = join_channel.substr(1);
            }
            if(join_channel.includes(" ")){
                join_channel = join_channel.substr(0, join_channel.indexOf(" "));
            }
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
        if((commandmessage.command === "empadd") && is_admin){
            var new_command;
            var new_response;
            var msg_data = commandmessage.text.trim();

            new_command = msg_data.substring(0, msg_data.indexOf(','));
            new_response = msg_data.substring(msg_data.indexOf(',') + 1);

            new_command = new_command.trim();
            new_response = new_response.trim();

            commands.push({"command":new_command, "text":new_response});
            client.say(channel, new_command + " command added");

            var temp_data = JSON.stringify(commands);

            // write JSON string to a file
            fs.writeFile(__dirname + '/data/commands.json', temp_data, (err) => {
                if (err) {
                    throw err;
                }
                console.log("JSON Command list is saved.");
            });
        }

        //edit basic command
        if((commandmessage.command === "empedit") && is_admin){
            var edit_command;
            var new_response;
            var msg_data = commandmessage.text.trim();
            var command_position = -1;

            edit_command = msg_data.substring(0, msg_data.indexOf(','));
            new_response = msg_data.substring(msg_data.indexOf(',') + 1);

            edit_command = edit_command.trim();
            new_response = new_response.trim();

           //find in array

           for(var i = 0, len = commands.length; i < len; i++){
               if(commands[i].command == edit_command){
                   command_position= i;
                   break;
               }
           }

            if (command_position > -1){
                //exists within array
                commands[command_position].text = new_response;
                client.say(channel, edit_command + " command edited");

                var temp_data = JSON.stringify(commands);

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
        if((commandmessage.command === "empremove") && is_admin){
            var edit_command;
            var msg_data = commandmessage.text.trim();
            var command_position = -1;

            edit_command = msg_data;

            //find in array

            for(var i = 0, len = commands.length; i < len; i++){
                if(commands[i].command == edit_command){
                    command_position= i;
                    break;
                }
            }

            if (command_position > -1){
                //exists within array
                commands.splice(command_position, 1);
                client.say(channel, edit_command + " command removed");

                var temp_data = JSON.stringify(commands);

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

        //*** Commands avalible to all ***

        //Check if bot is mod in channel
        if(commandmessage.command == 'is_mod'){
            
        }
        //help - list all avalible commands
        if(commandmessage.command === "help" || commandmessage.command === "h"){
            console.log("help");
            client.say(channel, "avalible commands: empmerch, emplinks, empreleases, help.\nmod only: empso \nadmin only: empjoin, emppart, emphost.");
        }

        //list basic commands
        if(commandmessage.command === "list_basic"){
            var command_list = "";

            for (var i = 0; i < commands.length; i++) {
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
                intResult = getRndInteger(0,1);

                client.say(channel, options[intResult]);
            }
        }

        //general command function
        var command_index = commands.findIndex(function(item, i){
                return item.command == commandmessage.command;
        });
        if(command_index > -1){
                console.log("Send command");
                client.say(channel, commands[command_index].text);
        }


    }

});

client.on('connected', function(address, port) {
    console.log("Address: " + address + " Port: " + port);
});

function getRndInteger(min, max) {
  return Math.floor(Math.random() * (max - min + 1) ) + min;
} 
