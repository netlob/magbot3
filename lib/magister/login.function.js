const { default: magister, getSchools } = require('magister.js');
var moment = require('moment-business-days');

function day(extra) {
	if(!extra){extra = 0}
	extra = extra + 1
	return moment().businessAdd(extra)._d
}

module.exports = async function (login, oauth2Client) {
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
			resolve(err);
		});
	}).catch(function(error) {
		console.log(error);
		resolve(err);
	})
}