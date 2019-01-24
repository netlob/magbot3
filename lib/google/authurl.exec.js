const { google } = require('googleapis');

var secret = require('./secret');

const oauth2Client = new google.auth.OAuth2(
    '312564690694-duurunfnut127m50dh0j1ajlhe9oq598.apps.googleusercontent.com',
    secret.clientsecret,
    'http://localhost:8080'
);

const scopes = [
  'https://www.googleapis.com/auth/calendar'
];

const url = oauth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: scopes
});
console.log(url)