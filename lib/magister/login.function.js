var secret = require('../../secret')
const {google} = require('googleapis');
const { default: magister, getSchools } = require('magister.js');
var moment = require('moment-business-days');

const oauth2Client = new google.auth.OAuth2(
    '312564690694-duurunfnut127m50dh0j1ajlhe9oq598.apps.googleusercontent.com',
    secret.clientsecret,
    'http://www.magbot.tk'
);  

function day(extra) {
	if(!extra){extra = 0}
	extra = extra + 1
	return moment().businessAdd(extra)._d
}

module.exports = async function (login) {
	oauth2Client.setCredentials(login.tokens);
	// oauth2client.setCredentials({
	// 	refresh_token: `STORED_REFRESH_TOKEN`
	// });
	// console.dir(login.tokens)
	oauth2client.on('tokens', (tokens) => {
		if (tokens.refresh_token) {
			// store the refresh_token in my database!
			console.log(tokens.refresh_token);
		}
		console.log(tokens.access_token);
	});
	return new Promise(function(resolve, reject) {
		getSchools(login.school)
		.then((schools) => schools[0])
		.then((school) => magister({
			school,
			username: login.username,
			password: login.password,
			authCode: login.authcode
		}))
		.then((m) => {
			m.appointments(day(-1), day(4))
			.then((m => {
				var all = {
					'oauth2Client': oauth2Client,
					'login': login,
					'm': m
				};
				resolve(all);
			}))
		}, (err) => {
			console.error('something went wrong:', err);
			reject(err);
		});
	}).catch(function(error) {
		console.log(error);
		reject(err);
	})
}