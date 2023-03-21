//API variables and tokens
var fs = require('fs');

//Set list url for upcoming shows
const lineup_url = fs.readFileSync(process.cwd() + '/settings/lineup_url.txt').toString();

let text = fs.readFileSync(process.cwd() + '/settings/token.json');
let token_info = JSON.parse(text);

text = fs.readFileSync(process.cwd() + '/settings/client_info.json');
let client_info = JSON.parse(text);

let  APIcred = {
    client_id: client_info.client_id,
    token: "Bearer " + token_info.access_token
};


module.exports = {
    lineup_url,
    token_info,
    client_info,
    APIcred,
    
    test_API_token: async function(header_info){
        var status_code = 0;
        var functionbool = false;
        var testurl = "https://api.twitch.tv/helix/users?login=emp_radio";
        console.log("Test function!");

        console.log("headerinfo:");
        console.log("token " + header_info.token);
        console.log("client_id " + header_info.client_id);



        fetch(testurl, {
            method: "GET",
            headers: {
                "Authorization": header_info.token,
                "Client-Id": header_info.client_id,
            }
        })
        .then((response) => {
            status_code = response.status;
            console.log("Status: " + status_code);

            if (!response.ok) {
                throw new Error(`HTTP error: ${response.status}`);
            }
            console.log("islive status code: " + response.status);
            return response.json();
        })
        .then((body) => {
            console.log(body);
        })
        .catch((error) => {
            console.error(`Could not get products: ${error}`);
        });

        console.log(status_code);
        if (status_code == 200) {
            functionbool = true;
        }
        return status_code;
    },
    getToken: async function(refresh_tkn){
        //Load API Info
        var text = fs.readFileSync(process.cwd() + '/settings/client_info.json');
        var twitchAPI = JSON.parse(text);
        var urltext= "https://id.twitch.tv/oauth2/token";
        var token_headers= {
            "Content-Type": "application/x-www-form-urlencoded"
        };
        var datatext = [ "grant_type=refresh_token&refresh_token=" + refresh_tkn + "&client_id=" + twitchAPI.client_id  + "&client_secret=" + twitchAPI.client_secret ];
    
        return await fetch(urltext, {
            method: "POST",
            headers: token_headers,
            body: datatext
        })
        .then((response) => {
            responsetype = response.status;
            if (!response.ok) {
                throw new Error(`HTTP error: ${response.status}`);
            }
            return response.json();
        })
        .then((data) => {
            var temp_data = JSON.stringify(data);
            fs.writeFile(process.cwd() + '/settings/token.json', temp_data, (err) => {
                if (err) {
                    throw err;
                }
            });
            console.log("Created new token");
            return data;
        })
        .catch((error) => {
            console.error(`Could not get products: ${error}`);
        });
    }
};