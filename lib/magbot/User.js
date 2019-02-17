/*
 *   -= Magbot3 =-
 *  Sj3rd & 7kasper
 * Licensed under MIT
 *   -= Magbot3 =-
 */

'use strict';

// Imports
import * as Sync from './Sync';
const _ = require('lodash');
const {google} = require('googleapis');
const { default: magister } = require('magister.js');
const shelf = require('../db').shelf;
const Sync = require('./Sync');
const Crypto = require('./Crypto');
const Defaults = require('./Options');

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
        options: Defaults
    },

    /**
     * Logs the user in to grant access to all api functions.
     * @param {*} oAuth - Google oAuth access properties.
     * @param {string} mAuth - Magister accesstoken.
     */
    login: async function(oAuth, mAuth) {
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
            // If no calendar definition is set, load it in with the children's id.
            // This empty definition is later used by the setupCalendar function.
            if (!this.has('calendars')) {
                this.set('calendars', this.children.reduce((prev, cur) => { 
                    prev[cur.profileInfo.id] = this.get('options').setupCalendars; 
                    return prev; 
                }, {}));
            }
        }
        // If not a parent, still load in null calendars if not present.
        if (!this.has('calendars')) this.set('calendars', this.get('options').setupCalendars);
        // Login to google.
        this.google = new google.auth.OAuth2(...oAuth);
        this.google.setCredentials({
            access_token: this.get('accesstoken'),
            refresh_token: this.get('refreshtoken')
        });
        // On token refresh, always keep the user up to date.
        this.google.on('tokens', (tokens) => {
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
        // Update user in case fields changed.
        await this.update();
        return this;
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
        if (!this.isParent) return false;
        if (this.childindex < this.children.length) {
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
     * (12096e5) is magic number of seconds in 14 days.
     * Appointments are aggregrated upon their id.
     */
    calendarAppointments: async function(calendarId) {
        return (await this.calendar.events.list({
            calendarId: calendarId,
            timeMin: new Date(),
            timeMax: new Date(Date.now() + 12096e5),
            showDeleted: true,
            singleEvents: true,
            orderBy: 'startTime'
        })).data.items.reduce((prev, cur) => {
            prev[cur.id] = cur; return prev
        }, {});
    },

    //=====================================================\\
    //                       Google                        \\
    //=====================================================\\

    /**
     * This function fixes all magbot calendars.
     * _NOTE:_ this function only has to be ran once per parent
     * or normal account to setup with google.
     * Running multiple times will only serve to update
     * reminders and should only be needed when the user
     * wants his / her account updated / reinstated.
     */
    setupCalendars: async function() {
        // Get and aggrate all current calendar ids in google.
        let calsFromGoogle = (await this.calendar.calendarList.list())
            .data.items.reduce((prev, cur) => prev.concat(cur.id), []);
        // Get calendars the user wants & check if they are present.
        let calendars = this.get('calendars');
        do { // Setup the calendars. For children this is run once.
            let magisterId = this.magister.profileInfo.id;
            let localCalendars = this.isParent() ? calendars : calendars[magisterId];
            for (let calendarType in localCalendars) {
                let calendarId = localCalendars[calendarType];
                let calendarOptions = this.get('options').calendarTypes[calendarType];
                // If the calendar is not inside google, create it.
                if (!calsFromGoogle.includes(calendarId)) {
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
                    if (this.isParent()) calendars[magisterId][calendarType] = calendarId;
                    else calendars[calendarType] = calendarId;
                    // Update calendar colors for the first time only.
                    await this.calendar.calendarList.patch({
                        calendarId: calendarId,
                        colorRgbFormat: calendarOptions.colorRgbFormat,
                        resource: {
                            foregroundColor: calendarOptions.foregroundColor,
                            backgroundColor: calendarOptions.backgroundColor
                        }
                    });
                }
                // Update the calendar notifications (always).
                await this.calendar.calendarList.patch({
                    calendarId: calendarId,
                    resource: {
                        defaultReminders: calendarOptions.defaultReminders
                    }
                });
            }
        } while(this.nextChild());
        // Update calendar (ids) in used.
        this.set('calendars', calendars);
        this.update();
        return this;
    },

    sync: async function() {
        let calendars = this.get('calendars');
        do {
            let localCalendars = this.isParent() ? calendars[magisterId] : calendars;
            let mApps = await this.magisterAppointments();
            let gApps = await this.googleAppointments();
            // Update or insert based on magister appointments.
            for (let mApp of mApps) {
                // Determined calendartype.
                let dCalType = Sync.mag2caltype(mApp);
                if (dCalType in localCalendars) {
                    gApps = await this.updateMagisterAppointment(dCalType, localCalendars, gApps, mApp);
                }
                if ('full' in localCalendars) {
                    gApps = await this.updateMagisterAppointment('full', localCalendars, gApps, mApp);
                }
            }
            // Purge all remaining magbot appointments.
            for (let gCals in gApps) {
                let gCal = gApps[gCals];
                let calendarId = localCalendars[gCals];
                for (let gAppId in gCal) {
                    let gApp = gCals[gAppId];
                    if (gApp.id.includes('magbot') && gApp.status !== 'cancelled') { //TODO CHECK
                        // DELETE
                    }
                }
            }
        } while (this.nextChild());
    },

    updateMagisterAppointment: async function(caltype, localCalendars, gApps, mApp) {
        if (caltype in localCalendars) {
            let calendarId = localCalendars[caltype];
            let app = Sync.mag2google(this.get('options'), caltype, mApp);
            let currentApp = gApps[caltype] ? gApps[caltype][app.id] : null;
            if (currentApp) {
                if (Sync.shouldChange(currentApp, app)) {
                    // patch
                }
                delete gApps[dCalType][app.id];
            } else {
                // insert
            }
        }
        return gApps;
    }

}, {

    //=====================================================\\
    //                       Static                        \\
    //=====================================================\\

    // Defines the flexible json fields used in the postgreSQL table.
    jsonColumns: ['calendars', 'options'],

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
    }

});
