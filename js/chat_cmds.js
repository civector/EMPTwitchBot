var fs = require('fs');


//**Variable declaration and initialization**//
//Bot Username
const bot_username = fs.readFileSync(process.cwd() + '/settings/twitch_bot_channel.txt').toString();

//Oauth Token
const oauth = fs.readFileSync(process.cwd() + '/settings/oauth.txt').toString();

//Load lists for variable arrays
// Bot Admins
let text = fs.readFileSync(process.cwd() + '/data/admins.json');
let admins = JSON.parse(text);

//Channels for the bot to be in
let open_channels = fs.readFileSync(process.cwd() + '/data/channels.txt').toString().split("\r\n");

//Simple Command List
text = fs.readFileSync(process.cwd() + '/data/commands.json');
let simple_commands = JSON.parse(text);



module.exports = {
    bot_username,
    oauth,
    admins,
    open_channels,
    simple_commands,
    //options,

    get_permissions: function(user){
        var permissions= {
            "broadcaster": false,
            "moderator": false,
            "admin": false,
            "follower": false,
            "subscriber": false
        };
        //broadcaster?
        if(user["room-id"] == user["user-id"]){
            permissions.broadcaster = true;
        }
        //moderator?
        if(user.hasOwnProperty('user-type')){
            if(user["user-type"] === 'mod'){
                permissions.moderator = true;
            }
        }
  
               //admin?
        if(this.admins.indexOf(user.username)!=-1){
            permissions.admin = true;
            permissions.moderator = true;
        }
  
        //vip?
  
        //follower?
  
        //subscriber?

        return permissions;
    }
}