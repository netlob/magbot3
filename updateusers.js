var https = require('https');
const {google} = require('googleapis');
const { default: magister, getSchools } = require('magister.js');
var moment = require('moment-business-days');
const fs = require('fs');
var CryptoJS = require("crypto-js");
var AES = require("crypto-js/aes");
const database = './db/'

var key = require('./key')

var secret = require('./secret')
const oauth2Client = new google.auth.OAuth2(
  '312564690694-duurunfnut127m50dh0j1ajlhe9oq598.apps.googleusercontent.com',
  secret.clientsecret,
  'http://www.magbot.tk'
);

getUsers();

function getUsers() {
	fs.readdirSync(database).forEach(file => {
		fs.readFile('db/'+file, function read(err, data) {
			if (err) { throw err; }
			var login  = AES.decrypt(data.toString(), key.login).toString(CryptoJS.enc.Utf8);
			loginFunc(login)
		});
	})
}

function loginFunc(login) {
	oauth2Client.setCredentials(login.tokens);
	var authcode = ''
	https.get('https://raw.githubusercontent.com/simplyGits/magisterjs-authcode/master/code.json', (resp) => {
		let data = '';
		resp.on('data', (chunk) => {
			data += chunk;
		});
		resp.on('end', () => {
			authcode = data.replace('"','').replace('"','').replace(/(\r\n\t|\n|\r\t)/gm, "");
			console.log(login.school)
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
		if(m[i].isCancelled == (login.cancelled == 'true')){
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
				'reminders': {
					'useDefault': false,
					'overrides': [
					  	{
							'method': 'popup',
							'minutes': Number(login.notify)
						},
					],
				},
				'colorId': 1
			};

			if(m[i].infoType > 1 && login.mail) {
				event.reminders.overrides = [
					{
						'method': 'popup',
						'minutes': Number(login.notify)
					},
					{
						'method': 'email',
						'minutes': 24 * 60 * 7
					}
				]
			}

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
