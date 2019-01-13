const {google} = require('googleapis');

const {google} = require('googleapis');

const oauth2Client = new google.auth.OAuth2(
);

const scopes = [
  'https://www.googleapis.com/auth/calendar'
];

const url = oauth2Client.generateAuthUrl({
  access_type: 'offline',

  scope: scopes
});
