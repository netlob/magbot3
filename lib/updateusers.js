const {google} = require('googleapis');
const fs = require('fs');
var CryptoJS = require("crypto-js");
var AES = require("crypto-js/aes");
const database = '../db/'

var loginFunc = require('./magister/login.function');
var delCalendar = require('./google/delCalendar.function');
var pushCalendar = require('./google/pushCalendar.function');
var getAuthCode = require('./magister/authcode.function');

var key = require('../key');

var secret = require('../secret');
const oauth2Client = new google.auth.OAuth2(
  '312564690694-duurunfnut127m50dh0j1ajlhe9oq598.apps.googleusercontent.com',
  secret.clientsecret,
  'https://beta.magbot.nl'
);

getUsers();

function getUsers() {
	getAuthCode()
	.then((code => {
		fs.readdirSync(database).forEach(file => {
			fs.readFile('../db/'+file, function read(err, data) {
				if (err) { throw err; };
				var login  = AES.decrypt(data.toString(), key.login).toString(CryptoJS.enc.Utf8);
				login = JSON.parse(login);
				login.authcode = code;

				console.log('Updating '+login.username)

				oauth2Client.setCredentials({
					refresh_token: login.tokens.refresh_token
				});

				loginFunc(login, oauth2Client)
				.then((all => {
					delCalendar(all, pushCalendar);
				}))
			});
		})
	}))
};