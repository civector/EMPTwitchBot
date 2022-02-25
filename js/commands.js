var methods = {

    simple_reply: function(command_name){
        if(command_name === "list_basic"){
            var command_list = "";

            for (var i = 0; i < commands.length; i++) {
                command_list = command_list + commands[i].command + ", ";
            }
            console.log(command_list);
            client.say(channel, command_list);
            return true;
        }else{
            return false;
        }
    }


}
module.exports = methods;