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
				fs.readdirSync(database).forEach(file => {
					fs.readFile('../db/'+file, function read(err, data) {
						if (err) { throw err; };
						var login  = AES.decrypt(data.toString(), key.login).toString(CryptoJS.enc.Utf8);
						login = JSON.parse(login);

						getAccessCode()
						var options = { method: 'GET',
							url: 'https://www.googleapis.com/calendar/v3/users/me/calendarList',
							headers: {
								Accept: 'application/json',
								Authorization: 'Bearer ' + login.oauth2Client.access_token
							}
						};
		
						request(options, function (error, response, body) {
							if (error) throw new Error(error);
							console.log(body);
						});
					});
				})
			}
		})
	} else {
		console.log('nope')
		console.log(day)
	}
}

function getAccessCode(refresh_token) {
	var options = {
		method: 'POST',
		url: 'https://www.googleapis.com/oauth2/v4/token',
		headers: {
			'Content-Type': 'application/x-www-form-urlencoded'
		},
		form: {
			client_id: '312564690694-duurunfnut127m50dh0j1ajlhe9oq598.apps.googleusercontent.com',
			client_secret: secret.clientsecret,
			refresh_token: refresh_token,
			grant_type: 'refresh_token'
		} 
	};

	request(options, function (error, response, body) {
		if (error) throw new Error(error);
		return body.access_token
	});
}