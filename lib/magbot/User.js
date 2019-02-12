/*
 *   -= Magbot3 =-
 *  Sj3rd & 7kasper
 * Licensed under MIT
 *   -= Magbot3 =-
 */

'use strict';

// Imports
const {google} = require('googleapis');
const { default: magister } = require('magister.js');
const shelf = require('../db').shelf;
const Crypto = require('./Crypto');

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

    /**
     * Logs the user in to grant access to all api functions.
     * @param {*} oAuth - Google oAuth client.
     * @param {string} mAuth - Magister accesstoken.
     */
    login: async function(oAuth, mAuth) {
        // this.magister = await magister({
        //     school: {
        //         url: 'https://' + this.get('school') + '.magister.net'
        //     },
        //     username: this.get('username'),
        //     password: this.get('password'),
        //     authCode: mAuth
        // });
        // TODO uncomment this when isChild method is fixed in magister.js
        // if (!this.magister.profileInfo.isChild) {
        //     // Load in children at login so we can switch later on.
        //     this.parent = this.magister;
        //     this.children = await this.magister.children();
        //     this.childindex = 0;
        //     this.magister = this.children[this.childindex];
        // }
        this.google = new google.auth.OAuth2(...oAuth);
        this.google.setCredentials({
            access_token: this.get('accesstoken'),
            refresh_token: this.get('refreshtoken')
        });
        // Refresh google token (only) if necessary
        // let refreshed = await oAuth.getAccessTokenAsync();
        // console.dir(refreshed);
        // this.set('accesstoken', refreshed.token);

        // On token refresh, always keep the user up to date.
        this.google.on('tokens', (tokens) => {
            this.set('accesstoken', tokens.access_token);
            this.update();
        });
        // Login and store the calendar object.
        this.calendar = google.calendar({version: 'v3', auth: this.google});
        // Save the user to db in case accesscode changed.
        // this.update();
        // console.dir(this)
        return this;
    },

    /**
     * Gets wether this magister account belongs to a child or parent.
     * @returns true, when the user is not a parent.
     */
    isChild: function() {
        return this.parent != undefined;
    },

    /**
     * Function for parent accounts to 'switch' magister
     * accounts. This is so parents can also load in
     * their children's magister appointments.
     * @returns true, if there's a next child to iterate to.
     */
    nextChild: function () {
        if (this.isChild) return false;
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
     */
    appointments: function() {
        return this.magister.appointments(new Date(), new Date(Date.now() + 12096e5));
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
            // format: token => Crypto.encrypt(JSON.stringify(token)),
            // parse: token => JSON.parse(Crypto.decrypt(token))
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
