/*
 *   -= Magbot3 =-
 *  Sj3rd & 7kasper
 * Licensed under MIT
 *   -= Magbot3 =-
 */

'use strict';

// Imports
const wLog = require('winston').loggers.get('main');
const Sync = require('./Sync');
const _ = require('lodash');
const {google} = require('googleapis');
const { default: magister } = require('magister.js');
const shelf = require('../db').shelf;
const Crypto = require('./Crypto');
const Defaults = require('./Options');

/**
 * Simple function to await some time.
 * @param {number} millis 
 */
function sleep(millis) {
    return new Promise(resolve => setTimeout(resolve, millis));
}

/**
 * @class User
 * @classdesc
 * This class describes the MagbotUser
 * database model as well as many functions
 * operating on it.
 */
module.exports = shelf.model('users', {

    //=====================================================\\
    //                       Object                        \\
    //=====================================================\\

    // Defines database table name.
    tableName: 'users',

    // Defines the defaults for a user:
    defaults: {
        options: Defaults,
        isdisabled: false,
        calendars: {}
    },

    /**
     * Logs the user in to grant access to all api functions.
     * This function must be called before performing any other 
     * function on the user.
     * @param {*} oAuth - Google oAuth access properties.
     * @param {string} mAuth - Magister accesstoken.
     */
    login: async function(oAuth, mAuth) {
        this.log = wLog.child({email: this.get('email')});
        this.log.debug(`Logging in...`);
        // Login to google.
        if (!this.google) this.google = new google.auth.OAuth2(...oAuth);
        this.google.setCredentials({
            access_token: this.get('accesstoken'),
            refresh_token: this.get('refreshtoken')
        });
        // On token refresh, always keep the user up to date.
        this.google.on('tokens', (tokens) => {
            this.log.debug(`Updating accesstoken...`, tokens);
            this.set('accesstoken', tokens.access_token);
            this.update();
        });
        // Login and store the calendar object.
        this.calendar = google.calendar({version: 'v3', auth: this.google});
        // Get real names from google (checks a login too).
        let userinfo = await google.oauth2({version: 'v2', auth: this.google}).userinfo.get();
        if (userinfo && userinfo.data) {
            this.set('firstname', userinfo.data.given_name);
            this.set('lastname', userinfo.data.family_name);
        }
        // Login to magister.
        this.magister = await magister({
            school: {
                url: `https://${this.get('school')}.magister.net`
            },
            username: this.get('username'),
            password: this.get('password'),
            authCode: mAuth
        });
        // If parent, load in children at login so we can switch later on.
        if (this.magister.profileInfo.isParent) {
            this.parent = this.magister;
            this.children = await this.magister.children();
            this.childindex = 0;
            this.magister = this.children[this.childindex];
            this.log.debug(`User is parent with ${this.children.length} children.`);
        }
        // Update user in case fields changed.
        await this.update();
        this.log.debug(`Logged in successfully.`);
        return this;
    },

    /**
     * This function fixes all magbot calendars.
     * _NOTE:_ this function only has to be ran once per parent
     * or normal account to setup with google.
     * Running multiple times will only serve to update
     * reminders and should only be needed when the user
     * wants his / her account updated / reinstated.
     * @param {boolean} [doRenew] - Whether or not to force new calendar creation.
     */
    setupCalendars: async function(doRenew = false) {
        this.log.debug(`Setting up user's calendars...`, {doRenew});
        // Get and aggrate all current calendar ids in google.
        let calsFromGoogle = (await this.calendar.calendarList.list({
            showHidden: true
        })).data.items.reduce((prev, cur) => {
            prev[cur.id] = cur.defaultReminders;
            return prev;
        }, {});
        // Get calendars the user wants & check if they are present.
        let calendars = this.get('calendars');
        do { // Setup the calendars. For children this is run once.
            let childId = this.magister.profileInfo.id;
            let localCalendars = (this.isParent() ? calendars[childId] : calendars);
            if (!localCalendars) localCalendars = {};
            let setupCalendars = this.get('options').setupCalendars;
            this.log.debug(`Updating calendars...`, {childId, localCalendars});
            for (let calendarType in setupCalendars) {
                let calendarId = localCalendars[calendarType] || '';
                let calendarOptions = this.get('options').calendarTypes[calendarType];
                // If calendar is already here and the user still wants is, patch it if necessary.
                if (calendarId in calsFromGoogle && (calendarType in setupCalendars || !doRenew)) {
                    if ((_.differenceWith(
                        calendarOptions.defaultReminders, 
                        calsFromGoogle[calendarId], 
                        _.isEqual)
                    ).length != 0) {
                        await this.calendar.calendarList.patch({
                            calendarId: calendarId,
                            resource: {
                                defaultReminders: calendarOptions.defaultReminders
                            }
                        });
                        this.log.debug(`Patched reminders of ${calendarType}.`, {calendarId});
                    }
                // If the calendar isn't here and the user forces an update, make it.
                } else if (calendarType in setupCalendars && doRenew) {
                    calendarId = (await this.calendar.calendars.insert({
                        resource: {
                            summary: this.isParent() ? 
                                // For parents append the child's firstname to all calendars created.
                                `${calendarOptions.summary} ${this.magister.profileInfo.firstName}` : 
                                // Otherwise just state the calendar.
                                calendarOptions.summary,
                            description: calendarOptions.description,
                            location: this.get('school'),
                            timeZone: this.get('options').timeZone
                        }
                    })).data.id;
                    localCalendars[calendarType] = calendarId;
                    this.log.debug(`Created calendar ${calendarType}.`, {calendarId});
                    // Update calendar colors for the first time only.
                    await this.calendar.calendarList.patch({
                        calendarId: calendarId,
                        colorRgbFormat: calendarOptions.colorRgbFormat,
                        resource: {
                            foregroundColor: calendarOptions.foregroundColor,
                            backgroundColor: calendarOptions.backgroundColor
                        }
                    });
                    this.log.debug(`Updated colors of ${calendarType}.`, {calendarId});
                // If the user deleted the calendar, remove it everywhere.
                } else {
                    // If its not in the setup and we update, kill it in google too.
                    if (calendarId in calsFromGoogle && doRenew) {
                        await this.calendar.calendars.delete({
                            calendarId: calendarId
                        });
                        this.log.debug(`Removed google calendar ${calendarType}`, {calendarId});
                    }
                    delete localCalendars[calendarType];
                    this.log.debug(`Removed magbot calendar ${calendarType}`, {calendarId});
                }
            }
            if (this.isParent()) calendars[childId] = localCalendars;
            else calendars = localCalendars;
        } while(this.nextChild());
        // Update calendar (ids) in used.
        this.set('calendars', calendars);
        await this.update();
        this.log.debug(`Updated user's calendars.`, {calendars});
        return this;
    },

    /**
     * Main function of magbot ;-)
     * This method gets all appointments in google and magister
     * and then performs a comparing, inserting and updating
     * procedure.
     * @returns this
     */
    syncCalendars: async function() {
        this.log.debug(`Sycing user's calendars...`);
        let calendars = this.get('calendars');
        do {
            let childId = this.magister.profileInfo.id;
            let localCalendars = this.isParent() ? calendars[childId] : calendars;
            // Get all appointments to compare.
            let mApps = await this.magisterAppointments();
            let gApps = await this.googleAppointments();
            this.log.debug(`Retrieved ${mApps.length} magister appointments!`, {childId});
            // Update or insert based on magister appointments.
            for (let mApp of mApps) {
                let dCalType = Sync.mag2caltype(mApp); // Determined calendartype.
                gApps = await this.updateMagisterAppointment(dCalType, localCalendars, gApps, mApp);
                gApps = await this.updateMagisterAppointment('full', localCalendars, gApps, mApp);
                await sleep(Math.floor(Math.random() * 10000)); //Sleep a bit to ease google.
            }
            // Purge all remaining magbot appointments (as they are not in magister anymore).
            for (let gCals in gApps) {
                let gCal = gApps[gCals];
                let calendarId = localCalendars[gCals];
                for (let gAppId in gCal) {
                    let gApp = gCal[gAppId];
                    if (gAppId.includes('magbot') && gApp.status !== 'cancelled') {
                        await this.calendar.events.delete({
                            calendarId: calendarId,
                            eventId: gAppId
                        });
                        this.log.debug(`Deleted ${gAppId}.`);
                    }
                }
            }
        } while (this.nextChild());
        return this;
    },

    /**
     * Updates or inserts a magister appointment based on all params specified.
     * @param {string} caltype - The calendar type to update appointment in.
     * @param {*} localCalendars - The idlist of the child's calendars.
     * @param {*} gApps - All google appointments of the child.
     * @param {*} mApp - The magister appointment to update.
     * @returns gApps, with the updated appointment removed for purging purposes.
     */
    updateMagisterAppointment: async function(caltype, localCalendars, gApps, mApp) {
        if (caltype in localCalendars) {
            let calendarId = localCalendars[caltype];
            let app = Sync.mag2google(this.get('options'), caltype, mApp);
            let currentApp = gApps[caltype][app.id];
            if (currentApp) {
                // If we should patch, patch otherwise just skip this appointment.
                if (Sync.shouldChange(currentApp, app)) {
                    await this.calendar.events.patch({
                        calendarId: calendarId,
                        eventId: app.id,
                        resource: app
                    });
                    this.log.silly(`Patched ${app.id}.`, {app});
                }
                // Remove the appointment from list, for better purging.
                delete gApps[caltype][app.id];
            } else {
                // If appointment is not present, insert it.
                await this.calendar.events.insert({
                    calendarId: calendarId,
                    resource: app
                });
                this.log.silly(`Inserted ${app.id}.`, {app});
            }
        }
        return gApps;
    },

    /**
     * Gets wether this magbot user belongs to a child or parent.
     * @returns true, when the user is not a parent.
     */
    isParent: function() {
        return this.parent !== undefined;
    },

    /**
     * Function for parent accounts to 'switch' magister
     * accounts. This is so parents can also load in
     * their children's magister appointments.
     * @returns true, if there's a next child to iterate to.
     */
    nextChild: function () {
        if (!this.isParent()) return false;
        if (this.childindex < (this.children.length - 1)) {
            this.log.debug(`Moving to the next child.`);
            this.magister = this.children[this.childindex++];
            return true;
        } else {
            this.magister = this.children[this.childindex = 0];
            return false;
        }
    },

    /**
     * Get the latest magister (up to two weeks) appointments for this user.
     * (12096e5) is magic number of seconds in 14 days.
     * _NOTE: On parent accounts this function gets appointments for the active child!_
     */
    magisterAppointments: async function() {
        return await this.magister.appointments(
            new Date(), new Date(Date.now() + 12096e5)
        );
    },

    /**
     * Get the latest google (up to two weeks) appointments for this user.
     * _NOTE: On parent accounts this function gets appointments for the active child!_
     */
    googleAppointments: async function() {
        let aps = {};
        let magisterId = this.magister.profileInfo.id;
        let calendars = this.isParent() ? this.get('calendars')[magisterId] : this.get('calendars');
        for (let calendarType in calendars) {
            let calendarId = calendars[calendarType];
            aps[calendarType] = await this.calendarAppointments(calendarId);
        }
        return aps;
    },

    /**
     * Gets the latest (up to two weeks) appointments in a calendar.
     * (12096e5) is magic number of milliseconds in 14 days.
     * We need to get beginning and end of the days, because magister
     * always gives appointments for full days too.
     * Appointments are aggregrated upon their id.
     */
    calendarAppointments: async function(calendarId) {
        return (await this.calendar.events.list({
            calendarId: calendarId,
            timeMin: new Date(new Date().setHours(0,0,0,0)),
            timeMax: new Date(new Date(Date.now() + 12096e5)
                        .setHours(23,59,59,999)),
            showDeleted: true,
            singleEvents: true,
            orderBy: 'startTime'
        })).data.items.reduce((prev, cur) => {
            prev[cur.id] = cur; return prev
        }, {});
    },

    /**
     * Helper function to check whether the user still has some
     * active calendars. Used to find if we need to purge
     * this user.
     * @returns true, if there is an active calendar.
     */
    hasCalendars: function() {
        if (this.isParent()) {
            for (let childId in this.get('calendars')) {
                if (!_.isEmpty(this.get('calendars')[childId])) return true;
            }
        } else if (!_.isEmpty(this.get('calendars'))) return true;
        return false;
    }

}, {

    //=====================================================\\
    //                       Static                        \\
    //=====================================================\\

    // Defines the formatting for other special database fields.
    arrangement: {
        password: {
            format: Crypto.encrypt,
            parse: Crypto.decrypt
        },
        refreshtoken: {
            format: Crypto.encrypt,
            parse: Crypto.decrypt
        },
        accesstoken: {
            format: Crypto.encrypt,
            parse: Crypto.decrypt
        }
    },

    /**
     * Gets a user by its Email
     * @param {string} email
     * @returns Promise giving the user or error. 
     */
    byEmail: function(email) {
        return this.where({email: email}).fetch();
    },

    /**
     * Execute callback on each user in the database.
     * @param {function} callback - the function to execute.
     * @param {any} [where] - optional where specifiers.
     */
    onEach: function(callback, where = {}) {
        this.spot(where).fetchAll().then(users => {
            users.forEach(user => {
                callback(user);
            });
        });
    },

    /**
     * Registers or updates a user based on the params provided.
     */
    registerUpdate: async function(oAuth, mAuth, params) {
        // Get email using the login tokens.
        wLog.debug(`Executing register / update...`);
        let goo = new google.auth.OAuth2(...oAuth);
        let { tokens } = await goo.getToken(params.code);
        goo.setCredentials(tokens);
        let userinfo = await google.oauth2({version: 'v2', auth: goo}).userinfo.get();
        wLog.debug(`Retrieved google data.`, userinfo.data);
        // Check if database has user.
        let user = await this.spot({ email: userinfo.data.email }).fetch();
        // If there is no user, create him with the email.
        if (!user) {
            user = new this({ email: userinfo.data.email });
            wLog.info(`Creating user...`, {email: userinfo.data.email})
        } else {
            wLog.info(`Updating user...`, {email: userinfo.data.email})
        }
        // Set / update all params we have available.
        user.set('isdisabled', false); // Reactive user always.
        user.set('school', params.school);
        user.set('username', params.username);
        user.set('password', params.password);
        user.set('accesstoken', tokens.access_token);
        if (tokens.refresh_token) user.set('refreshtoken', tokens.refresh_token);
        // Update options
        let options = user.get('options') || Defaults;
        let setupCalendars = {};
        if (params.fullcalendar) setupCalendars.full = '';
        if (params.splitcalendars) {
            setupCalendars.regular = '';
            setupCalendars.homework = '';
            setupCalendars.outages = '';
            setupCalendars.special = '';
        }
        options.setupCalendars = setupCalendars;
        options.simpleSummary = params.simplesummary || false;
        options.simpleShowTeacher = params.simpleshowteacher || false;
        options.showSchoolHour = params.showschoolhour || false;
        options.calendarTypes.outages.hidden = !params.showoutages;
        for (let calendarType in options.calendarTypes) {
            if (!_.isEmpty(options.calendarTypes[calendarType].defaultReminders)) {
                // First reminder is always the standard popup which is adjustable.
                options.calendarTypes[calendarType].defaultReminders[0].minutes = (params.remindermin || 5);
            }
        }
        let specialReminders = [options.calendarTypes.special.defaultReminders[0]];
        if (params.specialemailreminder) specialReminders.push({method: 'email', minutes: 10080});
        if (params.specialdayreminder) specialReminders.push({method: 'popup', minutes: 1440});
        options.calendarTypes.special.defaultReminders = specialReminders;
        wLog.debug(`Set options.`, {email: userinfo.data.email, options: options});
        user.set('options', options);
        // Login to check magister and insert / update the user
        await user.login(oAuth, mAuth);
        // Setup / patch the user's calendars.
        await user.setupCalendars(true);
        // Sync the calendars manually
        await user.syncCalendars();
        return user;
    }

});
