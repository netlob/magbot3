/*
 *   -= Magbot3 =-
 *  Sj3rd & 7kasper
 * Licensed under MIT
 *   -= Magbot3 =-
 */

'use strict';

// Imports
const winston = require('winston');
require('winston-daily-rotate-file');
winston.loggers.add('main', {
    // level: 'alert',
    // level: 'info',
    level: 'silly',
    format: winston.format.simple(),
    transports: [
        new winston.transports.Console({
            // level: 'silly'
        }),
        new winston.transports.DailyRotateFile({
            dirname: 'logs',
            filename: 'magbot-%DATE%.log',
            zippedArchive: true
        })
    ]
});
const http = require('http');
const MagisterAuth = require('./lib/magister/authcode.function');
const User = require('./lib/magbot/User');
const secret = require('./secret');
const oAuth = [
//   '404820325442-ivr8klgohd73pm2lme8bmpc241prn03c.apps.googleusercontent.com', (main)
    '312564690694-duurunfnut127m50dh0j1ajlhe9oq598.apps.googleusercontent.com', // (test)
    secret.clientsecret,
// 'http://magbot.nl/action/googleCallback.php' (main)
    'https://beta.magbot.nl' // (test)
];
const log = winston.loggers.get('main');

/**
 * @class magbot3
 * @classdesc
 * This file is an executable and runs the magbot program.
 * First the webserver is started, afterwards both
 * sync and purge functions are scheduled for the first time.
 * This program is started with pm2 to keep it alive forever.
 */

const next = Math.floor(Math.random() * 100000);
log.info(`Starting first sync in ${next} and first purge in ${next * 2} millis...`);
setTimeout(sync, next);
setTimeout(purge, next * 20);

http.createServer((req, res) => {
    // Set CORS headers
    res.setHeader('Access-Control-Allow-Credentials', 'true');
    res.setHeader('Access-Control-Allow-Origin', "https://beta.magbot.nl");
    res.setHeader('Access-Control-Request-Method', 'OPTIONS, POST');
    res.setHeader('Access-Control-Allow-Methods', 'OPTIONS, POST');
    res.setHeader('Access-Control-Allow-Headers', 'code, school, username, password, ' +
        'fullcalendar, splitcalendars, simplesummary, simpleshowteacher, showoutages, ' +
        'remindermin, specialemailreminder, specialdayreminder, showschoolhour, specialcolors');
    // Handle normal request
    if ('code' in req.headers) {
        MagisterAuth()
            // .then(mAuth => console.dir(req.headers))
            .then(mAuth => User.registerUpdate(oAuth, mAuth, req.headers))
            .then(user => !user.isNew())
            .then(updated => res.end('success: user' + updated ? 'updated' : 'created'))
            .catch(err => { log.error(err.toString()); res.writeHead(500); res.end('error: ' + err.toString()); });
    // If not requesting properly show 'nice' welcome :)
    } else {
        res.end('MAGBOT API');
    }
}).listen(7070);

/**
 * Main function of magbot.
 * This function calls itself to stay alive.
 */
async function sync() {
    log.debug(`Going for sync...`);
    try {
        // Get the current magister authcode before syncing users.
        let mAuth = await MagisterAuth();
        // Get all users from DB & run over them.
        let users = await User.spot({isdisabled: false}).fetchAll();
        log.info(`Syncing ${users.length} users...`);
        for (let user of users) {
            try {
                // Log the user in.
                await user.login(oAuth, mAuth);
                // Fixy calendars (non - force).
                await user.setupCalendars();
                // Sync the actual appointments.
                await user.syncCalendars();
                // Wait some time (~0-10 seconds).
                await sleep(Math.floor(Math.random() * 10000));
            } catch(err) {
                try {
                    user.log.warn(`Error syncing user! `, err);
                } catch(errr) {
                    log.error(`LOGGING ERROR! `, errr, err);
                }
            }
        }
    } catch (err) {
        log.error(`MAJOR SYNC ERROR!`, err);
    }
    const next = scheduleTime();
    log.info(`Going for next sync in ${next} millis...`);
    setTimeout(sync, next);
}

/**
 * Purge function. Soft-deletes all users that have
 * no calendars left or can't log in anymore.
 * Note that soft-deleted users are still alowed
 * to update and reclaim their accounts.
 */
async function purge() {
    try {
        // Get the current magister authcode before purging users.
        let mAuth = await MagisterAuth();
        // First check with a user we know to work to see we don't
        // purge users for google and magister being unreachable or so.
        let checkUser = await User.spot({email: 'kasper.77077@gmail.com'}).fetch();
        await checkUser.login(oAuth, mAuth); // check if checkuser can login.
        // Get all users from DB & run over them.
        let users = await User.spot({isdisabled: false}).fetchAll();
        log.info(`Purging ${users.length} users...`);
        // Go through all users and purge if necessary.
        for (let user of users) {
            try {
                // Try logging in.
                await user.login(oAuth, mAuth);
                // Sleep a bit (0-10 sec) after logging in, to ease magister.
                await sleep(Math.floor(Math.random() * 10000));
                // If all tokens etc are valid and we log in,
                // then we actually get here. Check if there
                // are calendars left and if so, skip the purge.
                if (user.hasCalendars()) continue;
                user.log.warn(`Purging user for not having calendars left!`, {email: user.get('email')});
            } catch(err) {
                user.log.warn(`Purging user for `, err);
            }
            try {
                // If possible, warn user they are being placed on non-active.
                await user.calendar.events.insert({
                    calendarId: 'primary',
                    sendUpdates: 'all',
                    resource: {
                        summary: 'MAGBOT: Actie vereist! Lees mij!',
                        description: '<i>Volgens mij klopt er iets niet meer :(</i><br/>' + 
                                     '<br/>'+
                                     'Uw magister informatie is veranderd of u heeft ' +
                                     'bewust alle magbot agendas verwijderd.<br/>' +
                                     '<b>Bij deze wordt uw account op non-actief gezet '+
                                     'en zal niet automatisch meer werken!</b><br/>' +
                                     '<i>Heractiveer uw account op ' +
                                     '<a href="https://magbot.nl/">magbot.nl</a></i><br/>' +
                                     '<br/>' +
                                     'Als u uw account niet meer wil hebben, onderneem dan ' + 
                                     'geen actie.<br/>' +
                                     '<br/>' +
                                     'Stuur bij vragen gerust een mailtje naar ' +
                                     '<a href="mailto:info@magbot.nl">info@magbot.nl</a><br/>',
                        // Set start and end two days from now at 0900-0930.
                        start: {
                            dateTime: new Date(new Date(Date.now() + 1728e5)
                            .setHours( 9,0,0,0))
                        },
                        end: {
                            dateTime: new Date(new Date(Date.now() + 1728e5)
                            .setHours(17,0,0,0))
                        },
                        location: 'internet',
                        colorId: 11, // Nice red color
                        reminders: {
                            useDefault: false,
                            overrides: [
                                { method: 'email', minutes: 1440 },
                                { method: 'popup', minutes: 1440 },
                                { method: 'popup', minutes: 5 }
                            ]
                        }
                    }
                });
                user.log.info(`Notified user of purge!`);
            } catch (err) {
                user.log.error(`Error warning to-be purged user! `, err)
            }
            try {
                user.log.info(`Disabling!`)
                user.set('isdisabled', true);
                await user.update();
            } catch (err) {
                log.error(`MAJOR PURGE ERROR `, err);
            }
        }
    } catch (err) { log.error('Purging error! ', err); }
    const next = scheduleTime() * 20;
    log.info(`Going for next purge in ${next} millis...`);
    setTimeout(purge, next);
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
 *  0000-0700: ~every 60 min
 *  0700-1700: ~every 30 min
 *  1700-2400: ~every 60 min
 * Weekend:
 *  0000-2400: ~every 120 min
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
        return 115 * 60 * 1000 + rand;
    } 
    // Non-working hours
    else if (time.getHours() < 7 || time.getHours() > 17) {
        return 55 * 60 * 1000 + rand;
    }
    // Working (school) hours
    else {
        return 25 * 60 * 1000 + rand;
    }
}