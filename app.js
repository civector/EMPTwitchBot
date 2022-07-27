//EMP Radio Twitch bot


//modules
var tmi = require('tmi.js');
var fs = require('fs');
var schedule = require('node-schedule');
var generalfn = require('./js/general.js');
const { setegid } = require('process');
const { Console } = require('console');
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

//Set list for next show
text = fs.readFileSync(__dirname + '/data/set_list.json');
var set_cal = JSON.parse(text);

//temp trial of scheduler
var Set_scheduler = [];

var purge_scheduler_time = new schedule.RecurrenceRule();
purge_scheduler_time.hour = 4; 



const purge_scheduler = schedule.scheduleJob(purge_scheduler_time, function(){
    //leave all current channels the bot is connected to
    console.log("Purging connected channels...");
    /*for (var i = 0; i < client.getChannels().length; i++) {
        console.log("Purging connected channels...");
        console.log("leaving" + client.getChannels(i) + "...");
        client.part(client.getChannels(i));
    }
    */
    client.disconnect();
    //join channels in allowed list
    client.connect();
})
/*
temp_job[0] = schedule.scheduleJob('0 58 0 18 5 0', function(){
    console.log("This is when the job executes 0");
});

temp_job[1] = schedule.scheduleJob('30 58 0 18 5 0', function(){
    console.log("This is when the job executes 1");
});
*/

//Donantion list, includes channel and link text
var donationcsv = fs.readFileSync(__dirname + '/data/donations.txt').toString(); 
var donation_list = JSON.parse(generalfn.csvJSON(donationcsv));

//Simple Command List
text = fs.readFileSync(__dirname + '/data/commands.json');
var commands = JSON.parse(text);

//Delcare operational variables
var show_list_creation = false;
var temp_show_date = new Date();
var temp_set_list = [];
var set_step = 0;
var set_creator = "";

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


    if(self) return;

    //is message a command?
    var is_command = false;
    if(message.startsWith("!")){
        is_command = true;
    }

    //If message is a command, then check against commands
    if((is_command == true) || ((show_list_creation == true) && (channel == "#emp_radio"))){
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

        //list basic commands
        if(commandmessage.command === "list_basic"){
            var command_list = "";

            for (var i = 0; i < commands.length; i++) {
                command_list = command_list + commands[i].command + ", ";
            }
            console.log(command_list);
            client.say(channel, command_list);

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


        //create a new setlist
        if(((commandmessage.command === "addshow") && is_admin && (channel == "#emp_radio")) || ((show_list_creation == true) && (set_creator == user.username) && (channel == "#emp_radio"))){
            console.log("set_step: " + set_step);

            switch(set_step){
                case 0:
                    //1st step
                    show_list_creation = true;
                    set_creator = user.username;
                    client.say(channel, "So. You wanna create a new set list. What date will it be? (MM/DD/YYYY)");
                    console.log("1st_step: " + set_step);
                    break;
                case 1:
                    if(user.username == set_creator){
                        temp_show_date = new Date(message);
                        console.log(temp_show_date);
                        client.say(channel, "Ok. Now the full set list. Assumes PST/PDT. Comma to seperate time and user, semicolon for new line (Sample: \"12, emp_radio; 1, channel2\")");
                    }
                    break;
                case 2:
                    if(user.username == set_creator){
                        var data = message.trim();
                        var lines = data.split(";");

                        for (var i = 0; i < lines.length; i++) {
                            var line = lines[i].trim();
                            var show_info = line.split(",");
                            var line_date = new Date();
                            var set_hour = 0;
                            var set_min = 0;

                            //remove spaces if there to each value
                            for (var j = 0; j < show_info.length; j++){
                                show_info[j] = show_info[j].trim();
                            }
                            //prepare time info before using
                            console.log("time length: " + show_info[0].length);
                            if( show_info[0].length > 2){
                                var temp_data;
                                var temp_time;
                                var pm_add = 0;

                                temp_data = show_info[0].toLowerCase();
                                console.log("show_info: " + show_info[0]);
                                console.log("temp_data: " + temp_data);
                                if((temp_data.indexOf("pm")>-1) || (temp_data.indexOf("am")>-1)){
                                    if(temp_data.indexOf("pm")>-1){
                                        pm_add = 12;
                                    }else{
                                        pm_add = 0;
                                    }
                                    temp_data = temp_data.substring(0, temp_data.length-2);
                                    temp_data = temp_data.trim();
                                }
                                if(temp_data.indexOf(":")>-1){
                                    //contains ":" divider
                                    temp_time = temp_data.split(":");
                                    console.log("split hour " + temp_time[0]);
                                    set_hour = parseInt(temp_time[0]);
                                    console.log("set_hour " + set_hour);
                                    set_min = parseInt(temp_time[1]);
                                }else if(temp_data.length>2){
                                    set_hour = parseInt(temp_data.substr(0,2));
                                    set_time = parseInt(temp_data.substr(2));
                                }else{
                                    set_hour = parseInt(temp_data);
                                }

                                if(set_hour != 12){
                                    console
                                    set_hour = set_hour + pm_add;
                                }else{
                                    if(pm_add = 0){
                                        set_hour = 0;
                                    }else{
                                        pm_add = 0;
                                    }
                                }
                            }
                            console.log("input time: " + set_hour + " " + set_min);
                            //set time of each set
                            line_date = new Date(temp_show_date);
                            line_date.setHours(set_hour);
                            line_date.setMinutes(set_min);

                            console.log("time: " + line_date);
                            temp_set_list[i] = {"time":line_date, "channel":show_info[1]};
                            console.log("temp_set_list " + i + ": " + temp_set_list[i].time + " " + temp_set_list[i].channel);
                        }
                    }

                    client.say(channel, "Almost Done. Here is what I received: ");
                    var temp_message = "";
                    console.log("temp_set_list.length " + temp_set_list.length)
                    for (var i = 0; i < temp_set_list.length; i++){
                        temp_message = temp_message + temp_set_list[i].time + ", twitch.tv/" + temp_set_list[i].channel + ";\n";
                    }
                    console.log("temp+message: " + temp_message);
                    client.say(channel, temp_message);
                    client.say(channel, "Does this look correct? Y/N");
                    console.log("3rd_step: " + set_step);

                    break;
                case 3: 
                    if(user.username == set_creator){
                        console.log(message[0]);
                        var result = message[0].toLocaleLowerCase();
                        console.log("result " + result);
                        switch(result){
                            case "y":
                                //Add set to the linup
                                set_cal = temp_set_list;
                                temp_set_list = [];
                                temp_show_date = new Date();
                                set_creator = "";
                                show_list_creation = false;
                                set_step = -1;

                                client.say(channel, "Set submitted successfully.");
                                createSetScheduler();
                                console.log("set_cal: " + JSON.stringify(set_cal));
                                            // write JSON string to a file
                                fs.writeFile(__dirname + '/data/set_list.json', JSON.stringify(set_cal), (err) => {
                                    if (err) {
                                        throw err;
                                    }
                                    console.log("JSON Set list is saved.");
                                });
                                break;

                            case "n":
                                temp_set_list = [];
                                temp_show_date = new Date();
                                set_creator = "";
                                show_list_creation = false;
                                set_step = -1;
                                client.say(channel, "That's too bad. Start over!.")
                                break;

                            default:
                                client.say(channel, "Please answer y/n to submit set");
                                set_step--;
                        }

                    }
                    console.log("5th_step: " + set_step);
                    break;
            }
            set_step++;
            console.log("end of creation command and set step: " + set_step);

        }

    }

});

client.on('connected', function(address, port) {
    console.log("Address: " + address + " Port: " + port);
});

function getRndInteger(min, max) {
  return Math.floor(Math.random() * (max - min + 1) ) + min;
} 

function createSetScheduler(){
    var set_length = set_cal.length;
    for (var i = 0; i < set_length; i++) {
        console.log("add " + set_cal[i].channel + " to scheduler")
        Set_scheduler[i] = schedule.scheduleJob(set_cal[i].time, function(y){
            console.log(JSON.stringify(y));

            //have bot join channel
            client.join(y);

            //host channel
            client.host("emp_radio", y);

            //leave previous channel
            //if(i>0){
                //client.part(set_cal[i-1].channel);
            //}
        }.bind(null,set_cal[i].channel))
    }
}
