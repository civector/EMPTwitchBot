var schedule = require('node-schedule');

const lineup_url = fs.readFileSync(process.cwd() + '/data/lineup_url.txt').toString().split("\r\n");

module.exports = {
    lineup_url,
    
}