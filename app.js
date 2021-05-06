//EMP Radio Twitch bot


//modules
var tmi = require('tmi.js');
var fs = require('fs');
var generalfn = require('./js/general.js');
console.log('./settings/twitch_bot_channel.txt');
console.log(process.cwd());
console.log(__dirname);


//**Variable declaration and initialization**//
//Bot Username
var bot_username = fs.readFileSync(__dirname + '/settings/twitch_bot_channel.txt').toString();
console.log("Bot channel: " + bot_username);

//Oauth Token
var oauth = fs.readFileSync(__dirname + '/settings/oauth.txt').toString();
console.log("oauth loaded");

//Load lists for variable arrays
// Bot Admins
var text = fs.readFileSync(__dirname + '/data/admins.json');
var admins = JSON.parse(text);

//Channels for the bot to be in
var open_channels = fs.readFileSync(__dirname + '/data/channels.txt').toString().split("\n");
//var open_channels = ["civector"];

//Set list for next show
var set_list = fs.readFileSync(__dirname + '/data/set_list.txt').toString().split("\n");

//Donantion list, includes channel and link text
var donationcsv = fs.readFileSync(__dirname + '/data/donations.txt').toString(); 
var donation_list = JSON.parse(generalfn.csvJSON(donationcsv));

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

client.connect();

//**Chat Commands**
client.on('chat', function(channel, user, message, self) {
    //is message a command?
    var is_command = false;
    if(message.startsWith("!")){
        is_command = true;
    }

    //If message is a command, then check against commands
    if(is_command == true){
        //permission level
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

        //*** Commands avalible to all ***

	    //general command function
        var command_index = commands.findIndex(function(item, i){
                return item.command == commandmessage.command;
        });
        if(command_index > -1){
                console.log("Send command");
                client.say(channel, commands[command_index].text);
        }


        //help - list all avalible commands
        if(commandmessage.command === "help" || commandmessage.command === "h"){
            console.log("help");
            client.say(channel, "avalible commands: empmerch, emplinks, empreleases, help.\nmod only: empso \nadmin only: empjoin, emppart, emphost.");
        }

	
        //Donation Link
        if(commandmessage.command === "donate"){
            //var channelindex = donation_list.channel.indexOf('capthzemp');
            var index = donation_list.findIndex(function(item, i){
                return item.channel === channel;
            });
            console.log("index: " + index);
            if(index > -1){
                client.say(channel, donation_list[index].text);
            }else{
                client.say(channel, "no donation link set for this channel");
            }
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
            client.join(join_channel);
            //client.say(join_channel, "Hello, I'm the EMP Radio bot. type !help for commands.");
    
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
            client.part(join_channel);
        }

        //host channel
        if((commandmessage.command === "emphost") && is_admin){
            var join_channel = commandmessage.text;
            if(join_channel.startsWith("@")){
                join_channel = join_channel.substr(1);
            }
            if(join_channel.includes(" ")){
                join_channel = join_channel.substr(0, join_channel.indexOf(" "));
            }
            client.say(channel, "hosting" + join_channel + "...");
            client.host("emp_radio", join_channel);
        }
        
        //add basic command
        if((commandmessage.command === "empadd") && is_admin){
            

        }

    }

});

client.on('connected', function(address, port) {
    console.log("Address: " + address + " Port: " + port);
});

function getRndInteger(min, max) {
  return Math.floor(Math.random() * (max - min + 1) ) + min;
} 
