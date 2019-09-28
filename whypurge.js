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
    let users = await User.spot({isdisabled: false}).fetchAll();
    log.info(`WHYPURGING ${users.length} users...`);
    // Go through all users and purge if necessary.
    for (let user of users) {
        try {
           await user.login(oAuth, mAuth);
           user.log.info('User could login?'); 
		   /*
           let calsFromGoogle = (await user.calendar.calendarList.list({
                showHidden: true
            })).data.items.reduce((prev, cur) => {
                prev[cur.summary] = cur.id;
                return prev;
            }, {});
            console.dir(calsFromGoogle);
			if (!('mRegular' in calsFromGoogle) || !('mHomework' in calsFromGoogle) || !('mSpecial' in calsFromGoogle) || !('mOutages' in calsFromGoogle) ) break; // Show the user.
			user.set('calendars', {
				regular: calsFromGoogle.mRegular,
				homework: calsFromGoogle.mHomework,
				outages: calsFromGoogle.mOutages,
				special: calsFromGoogle.mSpecial
			});
			user.set('isdisabled', false);
			await user.update();*/
			
			let apps = await user.calendarAppointments('primary', false);
			for (let appId in apps) {
		         let app = apps[appId];
			     if (app.summary.includes('MAGBOT: Actie vereist!')) {
					try {
						await user.calendar.events.delete({
							calendarId: 'primary',
							eventId: appId
						});
						user.log.info('removed thingy');
					} catch(err) {user.log.error('Error removing update!', {err: err.toString()})}
			     }
			}
			
			user.log.info('FFS Fixed this mofo');
            // break; //Only show me
        } catch (err) {
            user.log.error(`user was deleted for: `, {err: err.toString()});
			//user.destroy();
        }
    }
    log.info('done');
}
