var http = require('http');
const {google} = require('googleapis');
const { default: magister, getSchools } = require('magister.js');
var moment = require('moment-business-days');

var user = require('./login');
var secret = require('./secret');
const oauth2Client = new google.auth.OAuth2(
  '312564690694-duurunfnut127m50dh0j1ajlhe9oq598.apps.googleusercontent.com',
  secret.clientsecret,
  'http://localhost:8080'
);

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

http.createServer(function(req,res){
    req.params=params(req);
    console.log(req.params.code);
    poep(req.params.code)
}).listen(8080);

const poep = async function(code) {
  const {tokens} = await oauth2Client.getToken(code)
  oauth2Client.setCredentials(tokens);
  // listEvents(oauth2Client)
  var user = require('./login');
  getSchools(user.magister.school)
  	.then((schools) => schools[0])
  	.then((school) => magister({
  		school,
  		username: user.magister.username,
  		password: user.magister.password,
  	}))
  	.then((m) => {
  		m.appointments(day(-1), day(4))
  		.then((m => {
  			pushCalendar(oauth2Client, m)
  		}))
  	}, (err) => {
  		console.error('something went wrong:', err);
  		});
}

function pushCalendar(auth, m) {
	delEvents(auth)
	const calendar = google.calendar({version: 'v3', auth});
	for(var i = 0; m.length - 1 >= i; i++){
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
				calendarId: user.calendar.calendarid,
				resource: event,
			}, function(err, event) {
			if (err) {
				console.log('There was an error contacting the Calendar service: ' + err);
				return;
			}
		})
	}
}

function delEvents(auth) {
	const calendar = google.calendar({version: 'v3', auth});
	calendar.events.list({
	  calendarId: user.calendar.calendarid,
	  singleEvents: true,
	  orderBy: 'startTime',
	}, (err, res) => {
	  if (err) return console.log('The API returned an error: ' + err);
	  const events = res.data.items;
	  if (events.length) {
		events.map((event, i) => {
		  calendar.events.delete({
			calendarId: user.calendar.calendarid,
			eventId: event.id
		  });
		});
	  } else {
		console.log('No upcoming events found.');
	  }
	});
  }