const {google} = require('googleapis');

const {google} = require('googleapis');

const oauth2Client = new google.auth.OAuth2(
    '312564690694-duurunfnut127m50dh0j1ajlhe9oq598.apps.googleusercontent.com',
    'WJKnYCDWZHRNPdjH0PagYhx5',
    'https://magbot.nl'
);

const scopes = [
  'https://www.googleapis.com/auth/calendar'
];

const url = oauth2Client.generateAuthUrl({
  access_type: 'offline',

  scope: scopes
});