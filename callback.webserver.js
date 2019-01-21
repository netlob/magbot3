var http = require('http');
const {google} = require('googleapis');
const fs = require('fs');
var CryptoJS = require("crypto-js");
var AES = require("crypto-js/aes");
var SHA256 = require("crypto-js/sha256");
var request = require("request");

var loginFunc = require('./login.function');
var delCalendar = require('./delCalendar.function')
var pushCalendar = require('./pushCalendar.function');

var key = require('./key')

var secret = require('./secret')
const oauth2Client = new google.auth.OAuth2(
  '312564690694-duurunfnut127m50dh0j1ajlhe9oq598.apps.googleusercontent.com',
  secret.clientsecret,
  'http://www.magbot.tk'
);

server = http.createServer( function(req, res) {
	console.dir(req.method)
	if (req.method == 'POST') {
		console.log("SIGNUP");
		console.dir(req.headers.code)
		getTokens(req.headers)
		.then((tokens => {
			signup(tokens, req.headers)
			res.setHeader('Access-Control-Allow-Credentials', 'true');
			res.setHeader('Access-Control-Allow-Origin', "http://www.magbot.tk");
			res.setHeader('Access-Control-Request-Method', 'OPTIONS, POST');
			res.setHeader('Access-Control-Allow-Methods', 'OPTIONS, POST');
			res.setHeader('Access-Control-Allow-Headers', 'assistant,cancelled,code,notify,password,school,username,mail,email');
			res.writeHead(200, {'Content-Type': 'text/html'});
			res.end('succes');
		}), (err) => {
				console.error('something went wrong:', err);
				res.end(err)
			});
	} else {
		res.setHeader('Access-Control-Allow-Credentials', 'true');
		res.setHeader('Access-Control-Allow-Origin', "http://www.magbot.tk");
		res.setHeader('Access-Control-Request-Method', 'OPTIONS, POST');
		res.setHeader('Access-Control-Allow-Methods', 'OPTIONS, POST');
		res.setHeader('Access-Control-Allow-Headers', 'assistant,cancelled,code,notify,password,school,username,mail,email');
		res.writeHead(200);
		res.end('fail');
		return;
	}
});
server.listen(80, '116.202.22.6');

const getTokens = async function(params) {
	const { tokens } = await oauth2Client.getToken(params.code)
	return tokens;
}

function signup(tokens, params) {
	oauth2Client.setCredentials(tokens);
	console.log(oauth2Client.credentials.access_token)
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
		var path = 'db/'+login.school+'-'+login.username+'-login.json';

		fs.writeFile(path.toLowerCase(), encLogin, 'utf8', () => {
			console.log('Login saved at: db/'+login.school+'-'+login.username+'-login.json');
		});
		// console.dir())
		loginFunc(login)
		.then((all => {
			console.dir('Dit is m: ' + all)
		}))
	});
}