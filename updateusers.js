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
  'http://www.magbot.tk'
);



const getTokens = async function(params) {
	const { tokens } = await oauth2Client.getToken(params.code)
	return tokens;
}

function loginFunc(login, tokens) {
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
					del(oauth2Client, login, m)
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
				},
				'colorId': 9
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

function del(auth, login, m) {
	const calendar = google.calendar({version: 'v3', auth});
	calendar.events.list({
		calendarId: login.calendarid,
		singleEvents: true,
		orderBy: 'startTime',
	}, (err, res) => {
		if (err) return console.log('The API returned an error: ' + err);
		const events = res.data.items;
		for(var i = 0; i < events.length; i++) {
			var params = {
				calendarId: login.calendarid,
				eventId: eventId,
			};
			calendar.events.delete(params, function(err) {
			if (err) {
				console.log('The API returned an error: ' + err);
				return;
			}
			});
		}
	});
	pushCalendar(auth, login, m)
}

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