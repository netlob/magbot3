var secret = require('./secret')
const {google} = require('googleapis');

const oauth2Client = new google.auth.OAuth2(
    '312564690694-duurunfnut127m50dh0j1ajlhe9oq598.apps.googleusercontent.com',
    secret.clientsecret,
    'http://www.magbot.tk'
);  

module.exports = function (login) {
	oauth2Client.setCredentials(login.tokens);
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
					var all = [
						oauth2Client,
						login,
						m
					];
					// del(oauth2Client, login, m)
					return all;
				}))
			}, (err) => {
                console.error('something went wrong:', err);
                return 'error'
				});
		});
	}).on("error", (err) => {
        console.log("Error: " + err.message);
        return 'error'
    });
}