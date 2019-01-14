const { default: magister, getSchools } = require('magister.js');
var moment = require('moment-business-days');
const {google} = require('googleapis');
const RestNio = require('restnio');

var user = require('./login');

let server = new RestNio((router, restnio) => {
	router.all('/', {
		func: (params, client) => {
			console.log(params.username)
			return getSchools(params.school)
			.then((schools) => schools[0])
			.then((school) => magister({
				school,
				username: params.username,
				password: params.password,
			}))
			.then((m) => m.appointments(day(-1), day(4)))
			// .then((m) = {
			// 	pushCalendar(m)
			// })

			// return getSchools(user.magister.school)
			// .then((schools) => schools[0])
			// .then((school) => magister({
			// 	school,
			// 	username: user.magister.username,
			// 	password: user.magister.password,
			// }))
			// .then((m) => m.appointments(day(-1), day(4)));
		}
	});
}, {
	port: 8080
});
server.bind();

function pushCalendar(m, auth) {
	// delEvents(auth)
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
		// calendar.events.insert({
		// 		auth: auth,
		// 		calendarId: user.calendar.calendarid,
		// 		resource: event,
		// 	}, function(err, event) {
		// 	if (err) {
		// 		console.log('There was an error contacting the Calendar service: ' + err);
		// 		return;
		// 	}
		// })
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

// var user = require('./login');
// getSchools(user.magister.school)
// 	.then((schools) => schools[0])
// 	.then((school) => magister({
// 		school,
// 		username: user.magister.username,
// 		password: user.magister.password,
// 	}))
// 	.then((m) => {
// 		m.appointments(day(-1), day(4))
// 		.then((m => {
// 			pushCalendar(m)
// 		}))
// 	}, (err) => {
// 		console.error('something went wrong:', err);
// 		});




// getSchools(user.magister.school)
// 	.then((schools) => schools[0])
// 	.then((school) => magister({
// 		school,
// 		username: user.magister.username,
// 		password: user.magister.password,
// 	}))
// 	.then((m) => {
//         m.appointments(day(-1), day(4))
//         .then((m => {
// 			console.dir(m)
// 			//pushCalendar(m)
//         }))
// 	}, (err) => {
// 		console.error('something went wrong:', err);
//     });