const {google} = require('googleapis');
const fs = require('fs');
var CryptoJS = require("crypto-js");
var AES = require("crypto-js/aes");
const database = './db/'

var loginFunc = require('./magister/login.function');
var delCalendar = require('./google/delCalendar.function');
var pushCalendar = require('./google/pushCalendar.function');
var getAuthCode = require('./magister/api/authcode.exec');

var key = require('../key');

var secret = require('../secret');
const oauth2Client = new google.auth.OAuth2(
  '312564690694-duurunfnut127m50dh0j1ajlhe9oq598.apps.googleusercontent.com',
  secret.clientsecret,
  'http://www.magbot.tk'
); //oauth wordt niet gebruikt?

getUsers();

function getUsers() {
	// oauth2client.setCredentials({
	// 	refresh_token: `STORED_REFRESH_TOKEN`
	// });
	// console.dir(login.tokens)
	// oauth2Client.on('tokens', (tokens) => {
	// 	if (tokens.refresh_token) {
	// 		// store the refresh_token in my database!
	// 		console.log('refresh: '+tokens.refresh_token);
	// 	}
	// 	console.log('access: '+tokens.access_token);
	// });
	getAuthCode()
	.then((code => {
		fs.readdirSync(database).forEach(file => {
			fs.readFile('db/'+file, function read(err, data) {
				if (err) { throw err; };
				var login  = AES.decrypt(data.toString(), key.login).toString(CryptoJS.enc.Utf8);
				login = JSON.parse(login);
				console.dir(login.tokens)
				login.authcode = code;
				loginFunc(login)
				.then((all => {
					delCalendar(all, pushCalendar);
				}))
			});
		})
	}))
};