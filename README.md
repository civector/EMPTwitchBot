## EMP Radio Twitch Bot
============================

### Summary 
Node.js implemetation of a chatbot for twitch, inteded for multiple channels. Main module used for Twitch API access is tmi.js
 Currently adds a few chat commands, many centric to the EMP Radio group.

### Permission Levels
The bot has three levels of permissions built in. 

1st level - all chat users
The very base level permission, has access to all common chat commands. But cannot use higher level commands.

2nd level - moderator
This permission level is granted to users that are moderator in the channel that the user and bot are currently in. 

3rd level - admin
This is a special permission level intended for bot behavior across the twitch platform. Determined through the code itself, to be a list file in the future.
 
### Current Commands
All command start with 'EMP' in the case that there isn't overlap with other chatbots.

'''
!emplinks
'''

'''
!empmerch
'''

'''
!emp
