/*
 *   -= Magbot3 =-
 *  Sj3rd & 7kasper
 * Licensed under MIT
 *   -= Magbot3 =-
 */

'use strict';

// Imports
const _ = require('lodash');
const {google} = require('googleapis');
const { default: magister } = require('magister.js');
const shelf = require('../db').shelf;
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
        // Setup null calendar ids to let them be created later on.
        calendars: { regular: '', homework: '', outages: '', special: ''},
        // Setup default options for handling magbot.
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
        }
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
     * Get the latest (up to two weaks) appointments for this user.
     * (12096e5) is magic number of seconds in 14 days.
     */
    appointments: async function() {
        return await this.magister.appointments(new Date(), new Date(Date.now() + 12096e5));
    },

    //=====================================================\\
    //                       Google                        \\
    //=====================================================\\

    /**
     * This function fixes all magbot calendars.
     * If the calendars 
     */
    setupCalendars: async function() {
        // Get and aggrate all current calendar ids in google.
        let calsFromGoogle = (await this.calendar.calendarList.list())
            .data.items.reduce((prev, cur) => prev.concat(cur.id), []);
        // Get calendars the user wants & check if they are present.
        let calendars = this.get('calendars');
        for (let calendarType in calendars) {
            let calendarId = calendars[calendarType];
            let calendarOptions = this.get('options').calendarTypes[calendarType];
            // If the calendar is not inside google, create it.
            if (!calsFromGoogle.includes(calendarId)) {
                calendarId = (await this.calendar.calendars.insert({
                    resource: {
                        summary: calendarOptions.summary,
                        description: calendarOptions.description,
                        location: this.get('school'),
                        timeZone: this.get('options').timeZone
                    }
                })).data.id;
                calendars[calendarType] = calendarId;
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
        // Update calendar (ids) in used.
        this.set('calendars', calendars);
        this.update();
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
