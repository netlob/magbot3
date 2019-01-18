var http = require('http');
var https = require('https');
const {google} = require('googleapis');
const { default: magister, getSchools } = require('magister.js');
var moment = require('moment-business-days');
const fs = require('fs');
var CryptoJS = require("crypto-js");
var AES = require("crypto-js/aes");
var SHA256 = require("crypto-js/sha256");
var request = require("request");

var key = require('./key')

var secret = require('./secret')
const oauth2Client = new google.auth.OAuth2(
  '312564690694-duurunfnut127m50dh0j1ajlhe9oq598.apps.googleusercontent.com',
  secret.clientsecret,
  'http://server.magbot.tk'
);

server = http.createServer( function(req, res) {
	console.dir(req.method)
	if (req.method == 'POST') {
		console.log("SIGNUP");
		console.dir(req.headers.code)
		signup(req.headers)
		res.setHeader('Access-Control-Allow-Credentials', 'true');
		res.setHeader('Access-Control-Allow-Origin', "http://www.magbot.tk");
		res.setHeader('Access-Control-Request-Method', 'OPTIONS, POST');
		res.setHeader('Access-Control-Allow-Methods', 'OPTIONS, POST');
		res.setHeader('Access-Control-Allow-Headers', 'assistant,cancelled,code,notify,password,school,username');
		res.writeHead(200, {'Content-Type': 'text/html'});
		res.end('succes');
	} else {
		res.setHeader('Access-Control-Allow-Credentials', 'true');
		res.setHeader('Access-Control-Allow-Origin', "http://www.magbot.tk");
		res.setHeader('Access-Control-Request-Method', 'OPTIONS, POST');
		res.setHeader('Access-Control-Allow-Methods', 'OPTIONS, POST');
		res.setHeader('Access-Control-Allow-Headers', 'assistant,cancelled,code,notify,password,school,username');
		res.writeHead(200);
		res.end('fail');
		return;
	}
});
server.listen(80, '116.202.22.6');

const signup = async function(params) {
	// const { tokens } = await oauth2Client.getToken(params.code)
	// oauth2Client.setCredentials(tokens);

	var options = { method: 'POST',
	url: 'https://www.googleapis.com/calendar/v3/calendars',
	headers: 
	 { 'cache-control': 'no-cache',
	   'Content-Type': 'application/json',
	   Accept: 'application/json',
	   Authorization: 'Bearer' },
	body: { summary: 'Magister', description: 'Deze calendar wordt automatisch geupdate door Magbot' },
	json: true };

	request(options, function (error, response, body) {
		if (error) throw new Error(error);
		console.log(body);
		// var login = {
		// 	school: params.school,
		// 	username: params.username,
		// 	password: params.password,
		// 	notify: params.notify,
		// 	cancelled: params.cancelled,
		// 	assistant: params.assistant,
		// 	calendarid: 
		// }
	
		// if(!fs.existsSync('db/'+login.school)){
		// 	fs.mkdirSync('db/'+login.school);
		// 	if(!fs.existsSync('db/'+login.school+'/'+login.username)){
		// 		fs.mkdirSync('db/'+login.school+'/'+login.username);
		// 	}
		// } else {
		// 	if(!fs.existsSync('db/'+login.school+'/'+login.username)){
		// 		fs.mkdirSync('db/'+login.school+'/'+login.username);
		// 	}
		// }
		
		// var encTokens = CryptoJS.AES.encrypt(JSON.stringify(tokens), key.token);
		// var encLogin = CryptoJS.AES.encrypt(JSON.stringify(login), key.login);
	
		// fs.writeFile('db/'+login.school+'/'+login.username+'/tokens.json', encTokens, 'utf8', () => {
		// 	console.log('Code saved at: db/'+login.school+'/'+login.username+'/tokens');
		// });
		// fs.writeFile('db/'+login.school+'/'+login.username+'/login.json', encLogin, 'utf8', () => {
		// 	console.log('Login saved at: db/'+login.school+'/'+login.username+'/login');
		// });
	
		// fs.readFile('db/'+login.school+'/'+login.username+'/tokens.json', function read(err, data) {
		// 	if (err) { throw err; }
		// 	var text  = CryptoJS.AES.decrypt(data.toString(), key.token).toString(CryptoJS.enc.Utf8);
		// 	console.log(text);
		// });
	});
}

const login = async function(login, tokens) {
	oauth2Client.setCredentials(tokens);
	var authcode = ''
	https.get('https://raw.githubusercontent.com/simplyGits/magisterjs-authcode/master/code.json', (resp) => {
		let data = '';
		resp.on('data', (chunk) => {
			data += chunk;
		});
		resp.on('end', () => {
			authcode = data.replace('"','').replace('"','').replace(/(\r\n\t|\n|\r\t)/gm, "");
			getSchools(login.school)
			.then((schools) => schools[0])
			.then((school) => magister({
				school,
				username: login.username,
				password: login.password,
			}))
			.then((m) => {
				m.appointments(day(-1), day(4))
				.then((m => {
					delEvents(oauth2Client, login)
					pushCalendar(oauth2Client, m)
				}))
			}, (err) => {
				console.error('something went wrong:', err);
				});
		});
	}).on("error", (err) => {
		console.log("Error: " + err.message);
	});
}

function pushCalendar(auth, login, m) {
	const calendar = google.calendar({version: 'v3', auth});
	for(var i = 0; m.length - 1 >= i; i++){
		if(!m[i].isCancelled){
			console.log(m[i].isCancelled)
			var event = {
				'summary': [m[i].classes[0]?toTitleCase(m[i].classes[0]):m[i].classes] + ' van ' + [m[i].teachers[0]?m[i].teachers[0].description:'niemand'],
				'location': isNaN(m[i].location)?m[i].location:'lokaal '+m[i].location,
				'description': m[i].annotation?m[i].annotation:m[i].description,
				'start': {
					'dateTime': m[i].start,
					'timeZone': 'Europe/Amsterdam',
				},
				'end': {
					'dateTime': m[i].end,
					'timeZone': 'Europe/Amsterdam',
				}
			};
			calendar.events.insert({
					auth: auth,
					calendarId: login.calendarid,
					resource: event,
				}, function(err, event) {
				if (err) {
					console.log('There was an error contacting the Calendar service: ' + err);
					return;
				}
			})
		}
	}
}

function delEvents(auth, login) {
	const calendar = google.calendar({version: 'v3', auth});
	calendar.events.list({
		calendarId: login.calendarid,
		singleEvents: true,
		orderBy: 'startTime',
	}, (err, res) => {
		if (err) return console.log('The API returned an error: ' + err);
		const events = res.data.items;
		var params = {
			calendarId: 'primary',
			eventId: eventId,
		};
	
		calendar.events.delete(params, function(err) {
		if (err) {
			console.log('The API returned an error: ' + err);
			return;
		}
		console.log('Event deleted.');
		});
	});
}

var params = {
	calendarId: 'primary',
	eventId: eventId,
  };

  calendar.events.delete(params, function(err) {
	if (err) {
	  console.log('The API returned an error: ' + err);
	  return;
	}
	console.log('Event deleted.');
  });

var params=function(req){
	let q=req.url.split('?'),result={};
	if(q.length>=2){
			q[1].split('&').forEach((item)=>{
					 try {
						 result[item.split('=')[0]]=item.split('=')[1];
					 } catch (e) {
						 result[item.split('=')[0]]='';
					 }
			})
	}
	return result;
}

function day(extra) {
	if(!extra){extra = 0}
	extra = extra + 1
	return moment().businessAdd(extra)._d
}

function toTitleCase(str) {
	return str.replace(
			/\w\S*/g,
			function(txt) {
					return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();
			}
	);
}