// Dit is de root / index van het gebeuren.
// Hier wordt de server gestart.

// run webserver
//require('./lib/signup.webserver');

//TODO: Actually do something in this script lol.


/*
 *   -= Magbot3 =-
 *  Sj3rd & 7kasper
 * Licensed under MIT
 *   -= Magbot3 =-
 */

'use strict';

// Imports
const MagisterAuth = require('./lib/magister/authcode.function');
const User = require('./lib/magbot/User');
const {google} = require('googleapis');
const secret = require('./secret');
const oAuth = [
  '404820325442-ivr8klgohd73pm2lme8bmpc241prn03c.apps.googleusercontent.com',
  secret.clientsecret,
  'http://magbot.nl/action/googleCallback.php'
];

/**
 * Main function of magbot.
 * 
 */
async function run() {
    // Get the current magister authcode before syncing users.
    let mAuth = await MagisterAuth();
    // Get all users from DB & run over them.
    let users = await User.fetchAll();
    for (let user of users) {
        try {
            // Login
            await user.login(oAuth, mAuth);
            // Sync
            await user.syncCalendars();
            // Wait some time (~0-10 seconds)
            await sleep(Math.floor(Math.random() * 10000));
        } catch(err) {
            // On user error, log
            console.dir(err);
        }
    }
    setTimeout(run, scheduleTime());
}

/**
 * Simple function to await some time.
 * @param {number} millis 
 */
function sleep(millis) {
    return new Promise(resolve => setTimeout(resolve, millis));
}

/**
 * Gets the the right amount of time to
 * wait before scheduling a new sync operation.
 * Remember a sync operation takes about
 * count(users) * 10 seconds to complete.
 * Meaning 500 users gives ~83 minutes of sync time.
 * After this, the randomised offset is applied 
 * before next sync.
 * 
 * Weekdays:
 *  0000-0700: ~every 30 min
 *  0700-1700: ~every  5 min
 *  1700-2400: ~every 30 min
 * Weekend:
 *  0000-2400: ~every 60 min
 * Then we add a bit of randomness to not
 * load the servers at regular intervals.
 * 
 * @returns (in ms) the amount of time to wait
 */
function scheduleTime() {
    let time = new Date();
    // Get random time between 0 and 10 minutes
    let rand = Math.floor(Math.random() * 10 * 60 * 1000);
    // Weekends
    if (time.getDay() === 0 || time.getDay() === 7) {
        return 55 * 60 * 1000 + rand;
    } 
    // Non-working hours
    else if (time.getHours() < 7 || time.getHours() > 17) {
        return 25 * 60 * 1000 + rand;
    }
    // Working (school) hours
    else {
        return rand;
    }
}