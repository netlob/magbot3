/**
 *   -= Magbot3 =-
 *  Sj3rd & 7kasper
 * Licensed under MIT
 *   -= Magbot3 =-
 */

'use strict';

// Imports
const { google } = require('googleapis');
const secret = require('./secret');

/**
 * Class that forms the oAuth url for the googleapi.
 */

// Create the oauth client
const oauth2Client = new google.auth.OAuth2(
    '312564690694-duurunfnut127m50dh0j1ajlhe9oq598.apps.googleusercontent.com',
    secret.clientsecret,
    'https://beta.magbot.nl'
);

// Set the scopes, (userinfo for proper email access)
const scopes = [
  'https://www.googleapis.com/auth/calendar',
  'https://www.googleapis.com/auth/userinfo.email',
  'https://www.googleapis.com/auth/userinfo.profile'
];

// Generate the url
const url = oauth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: scopes
});

// Log Url to use in static site
console.log(url);