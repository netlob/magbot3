/**
 *   -= Magbot3 =-
 *  Sj3rd & 7kasper
 * Licensed under MIT
 *   -= Magbot3 =-
 */

'use strict';

// Imports
const {google} = require('googleapis');

/**
 * Function to clear upcoming calendar events.
 * This is done so changes in events are correctly rendered.
 * TODO: Actually update the events?
 */

module.exports = async function (all, callback) {
    let auth = all.oauth2Client;
    let login = all.login;

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
				eventId: events[i].id,
			};
			calendar.events.delete(params, function(err) {
				if (err) {
					console.log('The API returned an error: ' + err);
					return;
				}
			});
		}
	});
	// callback(all);
	return all
}

function sleep(millis) {
    return new Promise(resolve => setTimeout(resolve, millis));
}