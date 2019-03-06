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
    '404820325442-ivr8klgohd73pm2lme8bmpc241prn03c.apps.googleusercontent.com',
    secret.clientsecret,
    'https://magbot.nl'
];
const log = winston.loggers.get('main');

oops();

async function oops() {
    let mAuth = await MagisterAuth();
    let users = await User.spot({isdisabled: false}).fetchAll();
    log.info(`WHYPURGING ${users.length} users...`);
    // Go through all users and purge if necessary.
    for (let user of users) {
        try {
            await user.login(oAuth, mAuth);
            console.dir(await user.calendar.events.list({
                calendarId: 'primary',
                timeMin: new Date(new Date().setHours(0,0,0,0)),
                timeMax: new Date(new Date(Date.now() + user.getSecondsToCheck())
                            .setHours(23,59,59,999)),
                showDeleted: true,
                singleEvents: true,
                orderBy: 'startTime'
            }).data.items.reduce((prev, cur) => {
                prev[cur.id] = cur; return prev
            }, {}));
            break; //Only show me
        } catch (err) {
            log.err(err);
        }
    }
}