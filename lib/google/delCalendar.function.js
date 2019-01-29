const {google} = require('googleapis');

module.exports = function (all, callback) {
    var auth = all.oauth2Client;
    var login = all.login;
	var m = all.m;

	const calendar = google.calendar({version: 'v3', auth});
	calendar.events.list({
		calendarId: login.calendarid,
		singleEvents: true,
		orderBy: 'startTime',
	}, (err, res) => {
		if (err) return console.log('The API returned an error: ' + err);
		const events = res.data.items;
		console.dir(events)
		for(var i = 0; i < events.length; i++) {
			var params = {
				calendarId: login.calendarid,
				eventId: events[i].id,
			};
			calendar.events.delete(params, function(err) {
				if (err) {
					console.log('The API returned an error: ' + err);
					return;
				}
			});
			// return;
		}
	});
    callback(all);
}

function sleep(millis) {
    return new Promise(resolve => setTimeout(resolve, millis));
}