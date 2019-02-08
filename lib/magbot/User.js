/*
 *   -= Magbot3 =-
 *  Sj3rd & 7kasper
 * Licensed under MIT
 *   -= Magbot3 =-
 */

'use strict';

// Imports\
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

    // These objects are set at login and shouldn't be saved to database.
    transient: ['magister', 'google', 'calendar', 'children', 'parent', 'childindex'],

    /**
     * Formats (encrypts) all variables before
     * storing the User into the database.
     * @param {*} attributes 
     */
    format: function(attributes) {
        attributes.password = Crypto.encrypt(attributes.password);
        attributes.accesstoken = Crypto.encrypt(attributes.accesstoken);
        attributes.refreshtoken = Crypto.encrypt(attributes.refreshtoken);
        return attributes;
    },

    /**
     * Parses (decrypts) all variables when
     * getting the User out of the database.
     * @param {*} attributes 
     */
    parse: function(attributes) {
        attributes.password = Crypto.decrypt(attributes.password);
        attributes.accesstoken = Crypto.decrypt(attributes.accesstoken);
        attributes.refreshtoken = Crypto.decrypt(attributes.refreshtoken);
        return attributes;
    },

    //=====================================================\\
    //                       Functions                     \\
    //=====================================================\\

    /**
     * Logs the user in to grant access to all api functions.
     * @param {*} oAuth - Google oAuth client.
     * @param {string} mAuth - Magister accesstoken.
     */
    login: async function(oAuth, mAuth) {
        this.magister = await magister({
            school: {
                url: 'https://' + this.get('school') + '.magister.net'
            },
            username: this.get('username'),
            password: this.get('password'),
            authCode: mAuth
        });
        if (!this.isChild()) {
            // Load in children at login so we can switch later on.
            this.parent = this.magister;
            this.children = await this.magister.children();
            this.childindex = 0;
            this.magister = this.children[this.childindex];
        }
        oAuth.setCredentials({
            access_token: this.get('accesstoken'),
            refresh_token: this.get('refreshtoken')
        });
        this.google = oAuth;
        this.calendar = google.calendar({version: 'v3', oAuth});
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
        this.where(where).fetchAll().then(users => {
            users.forEach(user => {
                callback(user);
            });
        });
    }

});
