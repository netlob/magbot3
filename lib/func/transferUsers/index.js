/**
 *   -= Magbot3 =-
 *  Sj3rd & 7kasper
 * Licensed under MIT
 *   -= Magbot3 =-
 */

// Imports
const MagisterAuth = require('../../magister/authcode.function');
const User = require('../../magbot/User');
const secret = require('../../../secret');
const oAuth = [
    '404820325442-ivr8klgohd73pm2lme8bmpc241prn03c.apps.googleusercontent.com',
    secret.clientsecret,
    'https://magbot.nl'
];
let oldUsers = require('./oldUsers.json');

/**
 * @class oldUsers
 * @classdescr
 * Function to transform and port all magbot2
 * users to the new system and give them some info.
 */

async function port() {
	let mAuth = await MagisterAuth();
	for (let oldUser of oldUsers) {
		let user = new User({email: oldUser.email});
		user.set('isdisabled', false);
		user.set('school', oldUser.school);
		user.set('username', oldUser.username);
		user.set('password', oldUser.password);
		user.set('accesstoken', oldUser.googleaccesstoken.access_token);
		user.set('refreshtoken', oldUser.googlerefreshtoken);
		user.set('calendars', {
			regular: oldUser.calendarids[0],
			homework: oldUser.calendarids[1],
			outages: oldUser.calendarids[2],
			special: oldUser.calendarids[3]
		});
		user.set('options', {
			// On this point everyone using magbot (thus magister)
			// lives in the netherlands, so we just use Amsterdam
			timeZone: 'Europe/Amsterdam',
			simpleSummary: false,
			simpleShowTeacher: false,
			showSchoolHour: true,
			setupCalendars: { regular: '', homework: '', outages: '', special: ''},
			calendarTypes: {
				/**
				 * The regular calendar keeps track of all
				 * non-special, non-homework lessons.
				 */
				regular: {
					summary: 'mRegular',
					description: 'Magbot: Contains all active lessons without homework.',
					hidden: false,
					colorRgbFormat: true,
					foregroundColor: '#000000',
					backgroundColor: '#7EC225',
					webColor: '2F6309',
					colorId: '0',
					defaultReminders: [{method: 'popup', minutes: 5}]
				},

				/**
				 * The homework calendar contains all
				 * non-special lessons with homework.
				 */
				homework: {
					summary: 'mHomework',
					description: 'Magbot: Contains all lessons with homework.',
					hidden: false,
					colorRgbFormat: true,
					foregroundColor: '#000000',
					backgroundColor: '#E0C240',
					webColor: '#AB8B00',
					colorId: '5',
					defaultReminders: [{method: 'popup', minutes: 5}]
				},

				/**
				 * The outages calendar contains all
				 * lessons that have been cancelled.
				 */
				outages: {
					summary: 'mOutages',
					description: 'Magbot: Contains all outages.',
					hidden: false,
					colorRgbFormat: true,
					foregroundColor: '#ffffff',
					backgroundColor: '#AD2D2D',
					webColor: '#711616',
					colorId: '11',
					defaultReminders: []
				},

				/**
				 * The special calendar contains all
				 * special lessons, such as tests.
				 */
				special: {
					summary: 'mSpecial',
					description: 'Magbot: Contains all lesson appointments like tests, oral exams, practical exercises, etc. Everything special really.',
					hidden: false,
					colorRgbFormat: true,
					foregroundColor: '#ffffff',
					backgroundColor: '#668CD9',
					webColor: '#2952A3',
					colorId: '9',
					defaultReminders: [
						{method: 'popup', minutes: 5},
						{method: 'email', minutes: 10080},
						{method: 'popup', minutes: 1440},
					]
				},

				/**
				 * This is a full calendar.
				 */
				full: {
					summary: 'Magbot',
					description: 'Magbot; al je magister afspraken in een calender.',
					hidden: false,
					colorRgbFormat: true,
					foregroundColor: '#ffffff',
					backgroundColor: '#0096db',
					webColor: '#0096db',
					specialColors: true, // whether to use colorids from other calendar types.
					specialReminders: true, // whether to use the reminders from other calendar types.
					defaultReminders: [
						{method: 'popup', minutes: 5}
					]
				}
			}
		});
		// Save user
		await user.update();
		// Try logging in and warning of migration.
		try {
			await user.login(oAuth, mAuth);
			// If possible, warn user they are being placed on non-active.
			await user.calendar.events.insert({
				calendarId: 'primary',
				sendUpdates: 'all',
				resource: {
                    summary: 'MAGBOT: Vernieuwd!',
                    description: '<b>Magbot is verniewd!</b><br/>' + 
                                 '<br/>'+
                                 'Met wat problemen in het oude systeem de laatste tijd en interesse van Sj3rd,<br/>' +
                                 'hebben we besloten om samen een nieuwe versie van magbot te maken.<br/>' +
                                 'MagBot heeft nu meer opties en functies en werkt (hopenlijk) beter!<br/>' +
                                 'Er is daarnaast nu ook ondersteuning voor ouder- en in sommige gevallen leraar-accounts.<br/>' +
                                 '<br/>' +
                                 '<i>Uw account is automatisch overgezet. Als u magbot op dezelfde manier' +
                                 'wilt blijven gebruiken dan hoeft u geen actie te ondernemen.<br/>' +
                                 'Indien uw magister account verlopen is, of u de magbot agenda\'s' +
                                 'verwijderd heeft, zal uw MagBot account spoedig opgeheven worden. ' +
                                 'U krijgt hiervan nog één melding.</i><br/>' +
                                 '<br/>' +
                                 'Wilt u gebruikmaken van de nieuwe opties of uw informatie wijzigen?<br/>' +
                                 'Kijk dan op <a href="https://magbot.nl/">magbot.nl</a><br/>' +
                                 '<br/>' +
                                 'Stuur bij vragen gerust een mailtje naar ' +
                                 '<a href="mailto:info@magbot.nl">info@magbot.nl</a><br/>',
					// Set start and end two days from now at 0900-0930.
					start: {
						dateTime: new Date(new Date(Date.now() + 1728e5)
						.setHours(9, 0,0,0))
					},
					end: {
						dateTime: new Date(new Date(Date.now() + 1728e5)
						.setHours(9,30,0,0))
					},
					location: 'internet',
					colorId: 9, // Nice blue color
					reminders: {
						useDefault: false,
						overrides: [{ method: 'email', minutes: 5 }]
					}
				}
			});
			user.log.info(`Notified user of migration!`);
		} catch (err) {
			user.log.error(`Error migrating user: `, err.toString())
		}
		await sleep(Math.floor(Math.random() * 10000));
	}
}

/**
 * Simple function to await some time.
 * @param {number} millis 
 */
function sleep(millis) {
    return new Promise(resolve => setTimeout(resolve, millis));
}

