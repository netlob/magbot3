var http = require('http');
const {google} = require('googleapis');
const fs = require('fs');
var CryptoJS = require("crypto-js");
var AES = require("crypto-js/aes");
var request = require("request");
const database = '../db/'

var loginFunc = require('./magister/login.function');
var delCalendar = require('./google/delCalendar.function');
var pushCalendar = require('./google/pushCalendar.function');
var getAuthCode = require('./magister/authcode.function');

var key = require('../key');

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
				console.log('------------------------========+++++========------------------------')
				console.dir(err.toString())
				console.log('------------------------========+++++========------------------------')
				res.end(err.toString());
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
		res.end('please use post');
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
		var path = database+params.school+'-'+params.username+'-login.json';
		if (fs.existsSync(path.toLowerCase())) {
			fs.readFile(path.toLowerCase(), function read(err, data) {
				var login  = AES.decrypt(data.toString(), key.login).toString(CryptoJS.enc.Utf8);
				login = JSON.parse(login);
				if(login.school == params.school && login.username == params.username && login.password == params.password && login.notify == params.notify && login.cancelled == params.cancelled && login.assistant == params.assistant && login.mail == params.mail) {
					resolve('user already exists')
				} else {
					oauth2Client.setCredentials(tokens);

					login.school = params.school;
					login.username = params.username;
					login.password = params.password;
					login.notify = params.notify;
					login.cancelled = params.cancelled;
					login.assistant = params.assistant;
					login.mail = params.mail;
					login.tokens = tokens;

					getAuthCode()
					.then((code => {
						login.authcode = code
						loginFunc(login, oauth2Client)
						.then((all => {
							if(all.m && all.login && all.oauth2Client) {
								console.log('Succesfully logged in, now deleting events & pushing magister to calendar')
								delCalendar(all, pushCalendar)

								var encLogin = CryptoJS.AES.encrypt(JSON.stringify(login), key.login);
								var pathDB = database+login.school+'-'+login.username+'-login.json';

								fs.writeFile(pathDB.toLowerCase(), encLogin, 'utf8', () => {
									console.log('Login saved at: db/'+login.school+'-'+login.username+'-login.json');
								});

								resolve('user updated')
							} else if(all.error) {
								resolve(all)
							} else {
								resolve('unknown error, please try again')
							}
						})).catch(error => {
							resolve(error)
						});
					})).catch(error => {
						resolve(error)
					});
				}
			});
		} else {
			oauth2Client.setCredentials(tokens);
			var login = {
				school: params.school,
				username: params.username,
				password: params.password,
				notify: params.notify,
				cancelled: params.cancelled,
				assistant: params.assistant,
				mail: params.mail,
				tokens: tokens
			}

			getAuthCode()
			.then((code => {
				login.authcode = code
				loginFunc(login, oauth2Client)
				.then((all => {
					if(all.m && all.login && all.oauth2Client) {
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
								description: 'Deze calendar wordt automatisch geupdate door Magbot.',
								timeZone: "CET",
								location: login.school.toString(),
								colorId: 16
							},
							json: true
						};
						request(options, function (error, response, body) {
							if(body.id) {
								if (error) throw new Error(error);

								all.login.calendarid = body.id
								all.info = ''
								console.log('Succesfully logged in, now deleting events & pushing magister to calendar')
								delCalendar(all, pushCalendar)

								var encLogin = CryptoJS.AES.encrypt(JSON.stringify(login), key.login);
								var pathDB = database+login.school+'-'+login.username+'-login.json';

								fs.writeFile(pathDB.toLowerCase(), encLogin, 'utf8', () => {
									console.log('Login saved at: db/'+login.school+'-'+login.username+'-login.json');
								});

								resolve('succes')
							} else {
								resolve('error: geen geldig Google calendarId')
							}
						})
					} else if(all.error) {
						resolve(all)
					} else {
						resolve('unknown error, please try again')
					}
				})).catch(error => {
					resolve(error)
				});
			})).catch(error => {
				resolve(error)
			});
		};
	})
}