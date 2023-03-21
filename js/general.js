module.exports = {
    create_command_object: function(rawtext){
      var messagebreak = rawtext.indexOf(" ");
      if(messagebreak >= 1 ){
          var commandmessage = {"command":rawtext.substring(1,messagebreak), "text":rawtext.substring(rawtext.indexOf(" ")+1)};
      }else{
          var commandmessage = {"command":rawtext.substring(1), "text":""};
      }
      commandmessage.command = commandmessage.command.toLowerCase();
      console.log("command: '" + commandmessage.command + "'");
      return commandmessage;
    },
    clean_handle: function(rawtext){
        if(rawtext.startsWith("@")){
          rawtext = rawtext.substr(1);
        }
        if(rawtext.includes(" ")){
          rawtext = rawtext.substr(0, rawtext.indexOf(" "))
        }
        return rawtext;
    },
    getRndInteger: function(min, max) {
      return Math.floor(Math.random() * (max - min + 1) ) + min;
    }
};
