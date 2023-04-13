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
        var testurl = "https://api.twitch.tv/helix/channels?broadcaster_id=593403053";
        var token_headers= {
            "Authorization": header_info.token,
            "Client-Id": header_info.client_id,
        };

        return await fetch(testurl, {
            method: "GET",
            headers: token_headers
        })
        .then((response) => {
            var responsetype = response.status;
            if (!response.ok) {
                throw new Error(`HTTP error: ${response.status}`);
            }
            return response.json();
        })
        .then((data) => {
            console.log(body);
            console.log("test");
            return data;
        })
        .catch((error) => {
            console.error(`Could not get products: ${error}`);
        });

    },
    getToken: async function(){
        //Load API Info
        var refresh_tkn = this.token_info.refresh_token;
        //var text = fs.readFileSync(process.cwd() + '/settings/client_info.json');
        //var twitchAPI = JSON.parse(text);
        var twitchAPI = this.client_info;

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
            var responsetype = response.status;
            console.log(responsetype);
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
    },
    adv_fetch: async function(url_text, retries=3){
        //var url_text = "https://api.twitch.tv/helix/streams";
        var input_method = "GET";
        var input_headers = {
            "Authorization": api_func.APIcred.token,
            "Client-Id": api_func.APIcred.client_id,
        };
        var input_body = "";
        var hasbody = false;
        
        //check if input_body has length and is a string
        if(typeof input_body === 'string' && myVariable.length > 0) {
            hasbody = true;
        }

        //choose fetch method type
        if(input_method === "GET" && hasbody === false){
            //GET method
            return await fetch(url_text, {
                method: input_method,
                headers: input_headers,
            })
            .then((response) => {
                var responsetype = response.status;
                console.log(responsetype);
                if (!response.ok) {
                    throw new Error(`HTTP error: ${response.status}`);
                }
                return response.json();
            })
            .then((data) => {
                console.log("Fetch read data");
                return data;
            })
            .catch((error) => {
                console.error(`Could not get products: ${error}`);
                if(retries == 1){
                    throw new Error('Could not update API token. Needs manual fix');
                }    
                if(responsetype === 401){
                    (async() => {
                        var temp_token = await this.getToken();
                        token_info = temp_token;
                        APIcred.token = "Bearer " + token_info.access_token;
                        return await this.adv_fetch(retries - 1);
                    })()
    
                }
            });

        }else if(input_method === "POST" && hasbody === true){
            //POST method
            return await fetch(url_text, {
                method: input_method,
                headers: input_headers,
                body: input_body
            })
            .then((response) => {
                var responsetype = response.status;
                console.log(responsetype);
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
    }
};