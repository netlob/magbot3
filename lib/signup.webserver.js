var http = require('http');
const {google} = require('googleapis');
const fs = require('fs');
var CryptoJS = require("crypto-js");
var request = require("request");
const database = '../db/'

var loginFunc = require('./magister/login.function');
var delCalendar = require('./google/delCalendar.function');
var pushCalendar = require('./google/pushCalendar.function');
var getAuthCode = require('./magister/api/authcode.exec');

var key = require('../key')

var secret = require('../secret')
const oauth2Client = new google.auth.OAuth2(
  '312564690694-duurunfnut127m50dh0j1ajlhe9oq598.apps.googleusercontent.com',
  secret.clientsecret,
  'https://beta.magbot.nl'
);

server = http.createServer( function(req, res) {
	if (req.method == 'POST') {
		console.log("SIGNUP");
		getTokens(req.headers)
		.then((tokens => {
			signup(tokens, req.headers)
			.then((state => {
				res.setHeader('Access-Control-Allow-Credentials', 'true');
				res.setHeader('Access-Control-Allow-Origin', "https://beta.magbot.nl");
				res.setHeader('Access-Control-Request-Method', 'OPTIONS, POST');
				res.setHeader('Access-Control-Allow-Methods', 'OPTIONS, POST');
				res.setHeader('Access-Control-Allow-Headers', 'assistant,cancelled,code,notify,password,school,username,mail,email');
				res.writeHead(200, {'Content-Type': 'text/html'});
				console.log(state)
				res.end(state);
			}, (err) => {
				res.setHeader('Access-Control-Allow-Credentials', 'true');
				res.setHeader('Access-Control-Allow-Origin', "https://beta.magbot.nl");
				res.setHeader('Access-Control-Request-Method', 'OPTIONS, POST');
				res.setHeader('Access-Control-Allow-Methods', 'OPTIONS, POST');
				res.setHeader('Access-Control-Allow-Headers', 'assistant,cancelled,code,notify,password,school,username,mail,email');
				res.writeHead(200, {'Content-Type': 'text/html'});
				res.end(err);
			}))
		}), (err) => {
				console.error('something went wrong:', err);
				res.end(err)
			});
	} else {
		res.setHeader('Access-Control-Allow-Credentials', 'true');
		res.setHeader('Access-Control-Allow-Origin', "https://beta.magbot.nl");
		res.setHeader('Access-Control-Request-Method', 'OPTIONS, POST');
		res.setHeader('Access-Control-Allow-Methods', 'OPTIONS, POST');
		res.setHeader('Access-Control-Allow-Headers', 'assistant,cancelled,code,notify,password,school,username,mail,email');
		res.writeHead(200);
		res.end('fail');
		return;
	}
});
server.listen(7070, '0.0.0.0');

const getTokens = async function(params) {
	const { tokens } = await oauth2Client.getToken(params.code)
	return tokens;
}

const signup = async function(tokens, params) {
	return new Promise(function(resolve, reject) {
		oauth2Client.setCredentials(tokens);
		var options = {
			method: 'POST',
			url: 'https://www.googleapis.com/calendar/v3/calendars',
			headers: {
				'Content-Type': 'application/json',
				'Accept': 'application/json',
				'Authorization': 'Bearer ' + oauth2Client.credentials.access_token
			},
			body: {
				summary: 'Magister',
				description: 'Deze calendar wordt automatisch geupdate door Magbot',
				colorId: 16
			},
			json: true
		};

		request(options, function (error, response, body) {
			if (error) throw new Error(error);
			if(body.id) {
				console.log(body.id)
				var login = {
					school: params.school,
					username: params.username,
					password: params.password,
					notify: params.notify,
					cancelled: params.cancelled,
					assistant: params.assistant,
					mail: params.mail,
					calendarid: body.id,
					tokens: tokens
				}

				var encLogin = CryptoJS.AES.encrypt(JSON.stringify(login), key.login);
				var path = database+login.school+'-'+login.username+'-login.json';

				fs.writeFile(path.toLowerCase(), encLogin, 'utf8', () => {
					console.log('Login saved at: db/'+login.school+'-'+login.username+'-login.json');
				});

				getAuthCode()
				.then((code => {
					login.authcode = code
					loginFunc(login, oauth2Client)
					.then((all => {
						delCalendar(all, pushCalendar)
						resolve('succes');
					}, (err) => {
						reject(err);
					}))
				}, (err) => {
					reject(err)
				}))
			} else {
				reject('error: geen geldig Google calendarId')
			}
		});
	}).catch(function(error) {
		reject(err);
	})
}
