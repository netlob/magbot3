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
    level: 'info',
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
    let users = await User.spot({isdisabled: true}).fetchAll();
    log.info(`WHYPURGING ${users.length} users...`);
    // Go through all users and purge if necessary.
    for (let user of users) {
        try {
            await user.login(oAuth, mAuth);
            let calsFromGoogle = (await this.calendar.calendarList.list({
                showHidden: true
            })).data.items.reduce((prev, cur) => {
                prev[cur.id] = cur.defaultReminders;
                return prev;
            }, {});
            console.dir(calsFromGoogle);
            // let apps = await user.calendarAppointments('primary');
            // for (let appId in apps) {
            //     let app = apps[appId];
            //     if (app.summary.includes('MAGBOT: Actie vereist!')) {
            //         console.dir(app);
            //         break;
            //     }
            // }
            // break; //Only show me
        } catch (err) {
            log.error(err);
        }
    }
}