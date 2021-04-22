//Emp Raio Twitch bot

//modules
var tmi = require('tmi.js');
var fs = require('fs');

//Load in username and oauth token
var bot_username = fs.readFileSync('/home/bot/twitchbot/settings/twitch_bot_channel.txt').toString();
console.log("Bot channel: " + bot_username);

var oauth = fs.readFileSync('/home/bot/twitchbot/settings/oauth.txt').toString();
console.log("oauth loaded");

//Load lists for variable arrays
var admins = ["civector", "capthzemp", "hellacopta_"];

//Load text files
var open_channels = fs.readFileSync('/home/bot/twitchbot/data/channels.txt').toString().split("\n");
console.log("load channel to open:");
for(i in open_channels){
    console.log(i + ": " + open_channels[i]);
}

//var admins = fs.readFileSync('admins.txt').toString().split("\n");
console.log("load admins:");
for(i in admins){
    console.log(i + ": " + admins[i]);
}

var set_list = fs.readFileSync('/home/bot/twitchbot/data/set_list.txt').toString().split("\n");
console.log("set list:");
for(i in set_list){
    console.log(i + ": " + set_list[i]);
}

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

var client = new tmi.client(options)

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
        //console.log("|" + user.username + "|");
        //console.log(typeof user.username);
        //console.log("|" + admins[0] + "|");
        //console.log(typeof admins[0]);
        if(admins.indexOf(user.username)!=-1){
            is_admin = true;
            is_mod = true;
        }

        console.log(user.username + ": admin: " + is_admin + ", mod: " + is_mod);

        //*** Commands avalible to all ***
        //Merch
        if(message === "!empmerch"){
            client.say(channel, "emp merch: https://teespring.com/stores/emp-radio");
        }

        //Links
        if(message === "!emplinks"){
            client.say(channel, "EMP links: https://linktr.ee/EMPradio");
        }

        //Releases link
        if(message === "!empreleases"){
            client.say(channel, "Check out our latest releases: https://empradio.bandcamp.com");
        }

        //help - list all avalible commands
        if(message === "!help" || message === "!h"){
            client.say(channel, "avalible commands: empmerch, emplinks, empreleases, help.\nmod only: empso \nadmin only: empjoin, emppart, emphost.");
        }

        //**** Mod only Commands  ****
        //Shoutout
        if(message.startsWith("!empso ") && is_mod){
            var so_channel = message.substr(7);
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
        if(message.startsWith("!empjoin ") && is_admin){
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
            //add in code to check if actually successful or not
            client.say(join_channel, "Hello, I'm the EMP Radio bot. type !help for commands.");
    
        }

        //channel leave
        if(message.startsWith("!emppart ") && is_admin){
            var join_channel = message.substr(9);
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
        if(message.startsWith("!emphost ") && is_admin){
            var join_channel = message.substr(9);
            if(join_channel.startsWith("@")){
                join_channel = join_channel.substr(1);
            }
            if(join_channel.includes(" ")){
                join_channel = join_channel.substr(0, join_channel.indexOf(" "));
            }
            client.say(channel, "hosting" + join_channel + "...");
            client.host("emp_radio", join_channel);
        }   
    }

});

client.on('connected', function(address, port) {
    console.log("Address: " + address + " Port: " + port);
});
