var schedule = require('node-schedule');
var fs = require('fs');

const lineup_url = fs.readFileSync(process.cwd() + '/settings/lineup_url.txt').toString().split("\r\n");

module.exports = {
    lineup_url,
    
}