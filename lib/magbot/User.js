/*
 *   -= Magbot3 =-
 *  Sj3rd & 7kasper
 * Licensed under MIT
 *   -= Magbot3 =-
 */

'use strict';

// Imports
const db = require('../db');
const { default: magister } = require('magister.js');

// SQL
const getAllUsers = 'SELECT * FROM Users;';
const getUserByEmail = 'SELECT * FROM Users WHERE Email = ?;';

/**
 * @class User
 * @classdesc
 * Represents a magbot user,
 * the most fundamental part
 * of this program.
 */
class User {

    //=====================================================\\
    //                      Constructs                     \\
    //=====================================================\\

    /**
     * Creates a new user.
     */
    constructor(user) {
        user && Object.assign(this, user);
        // Deserialize if necessary
        if (typeof this.options == 'string') this.options = JSON.parse(this.options);
        if (typeof this.calendarids == 'string') this.calendarids = JSON.parse(this.calendarids);
    }

    /**
     * Gets a promise with the User 
     * belonging to the specified email
     * from the database.
     * @param {string} email 
     * @returns the user
     */
    static fromDatabase(email) {
        return new Promise((resolve, reject) => {
            db.get(getUserByEmail, [email], (err, row) => {
                if (err) reject(err);
                resolve(new User(row));
            });
        });
    }

    /**
     * Streams a function on each user.
     * this makes sure we don't have to load
     * all users and can just traverse the DB.
     * @param {Function} func
     */
    static onEach(func) {
        db.each(getAllUsers, [], (err, row) => {
            if (err) throw err;
            func(new User(row));
        });
    }
    

    //=====================================================\\
    //                       Getters                       \\
    //=====================================================\\

    /**
     * Gets the magister login info of this User.
     * @param {string} authCode 
     */
    getMagisterInfo(authCode) {
        return {
            school: this.school,
            username: this.username,
            password: this.password,
            authCode: authCode
        };
    }

    /**
     * Gets the magister API access point for this user.
     * @param {string} authCode 
     */
    getMagister(authCode) {
        return magister(this.getMagisterInfo(authCode));
    }

    //=====================================================\\
    //                      Functions                      \\
    //=====================================================\\

    //TODO write impl.

}
module.exports = User;