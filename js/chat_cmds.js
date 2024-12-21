var fs = require('fs');


//**Variable declaration and initialization**//
//Bot Username
const bot_username = fs.readFileSync(appRoot + '/settings/twitch_bot_channel.txt').toString();

//Oauth Token
const oauth = fs.readFileSync(appRoot + '/settings/oauth.txt').toString();

//Load lists for variable arrays
let admins = require(appRoot + '/data/admins.json');
let simple_commands = require(appRoot + '/data/commands.json');
let default_channels = require(appRoot + '/data/default_channels.json');
let open_channels = require(appRoot + '/data/open_channels.json');

module.exports = {
    bot_username,
    oauth,
    admins,
    default_channels,
    open_channels,
    simple_commands,
    full_channel_list: function(){
        //combine both channel lists
        const combined = [...default_channels, ...open_channels];
        const returnlist = [...new Set(combined)];
        console.log(returnlist);
        return returnlist;
    },

    add_open_channels: function(channel_name){
        console.log('channel to add: ' + channel_name);
        open_channels.push(channel_name);
        const jsonstring = JSON.stringify(open_channels);
        console.log(jsonstring);
        fs.writeFile(appRoot + '/data/open_channels.json', jsonstring, 'utf8', (err) => {
            if (err){
                console.error('An error occurred while writing open channel list JSON to file:', err);
            } else {
                console.log('open channel list JSON file has been saved.');
            }
        });
    },

    remove_open_channel: function(channel_name){
        open_channels = open_channels.filter(item => item !== channel_name);
        console.log(open_channels);
        const jsonstring = JSON.stringify(open_channels);
        console.log(jsonstring);
        fs.writeFile(appRoot + '/data/open_channels.json', jsonstring, 'utf8', (err) => {
            if (err){
                console.error('An error occurred while writing open channel list JSON to file:', err);
            } else {
                console.log('open channel list JSON file has been saved.');
            }
        });
    },

    clear_open_channels: function(){
        const jsonstring = JSON.stringify('[]');
        fs.writeFile(appRoot + '/data/open_channels.json', jsonstring, 'utf8', (err) => {
            if (err){
                console.error('An error occurred while writing open channel list JSON to file:', err);
            } else {
                console.log('open channel list JSON file has been saved.');
            }
        });
    },

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