var request = require("request");
const fs = require('fs');

module.exports = async function (all) {
	var day = new Date().getUTCDate();
	var month = new Date().getUTCMonth() + 1;
	var year = new Date().getUTCFullYear();
	var dateNow = day+''+month+''+year;
	if(day == 1) {
		console.log('yeah')
		fs.readFile('../db/serveroptions.json', function read(err, data) {
			if (err) { throw err; };
			var options = JSON.parse(data)
			if(options.dateChecked != dateNow) {
				var options = { method: 'GET',
					url: 'https://www.googleapis.com/calendar/v3/users/me/calendarList',
					headers: {
						Accept: 'application/json',
						Authorization: 'Bearer ' + all.auth.tokens.access_token
					}
				};

				request(options, function (error, response, body) {
					if (error) throw new Error(error);
					console.log(body);
				});
			}
		})
	} else {
		console.log('nope')
		console.log(day)
	}
}