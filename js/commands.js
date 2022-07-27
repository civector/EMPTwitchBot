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
    ,
    help_reply: function(command_name){
        if(command_name === "help" || command_name === "h"){
            console.log("help");
            client.say(channel, "avalible commands: empmerch, emplinks, empreleases, help.\nmod only: empso \nadmin only: empjoin, emppart, emphost.");
        }
    }
    ,
    question_reply: function(command_name){
        if(command_name == ""){
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
    }

}
module.exports = methods;