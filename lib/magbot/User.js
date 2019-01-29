/*
 *   -= Magbot3 =-
 *  Sj3rd & 7kasper
 * Licensed under MIT
 *   -= Magbot3 =-
 */

'use strict';

const db = require('../db');

/**
 * @class User
 * @classdesc
 * Represents a Magbot user.
 * This class basically handles 
 */
module.exports = db.shelf.Model.extend({
    tableName: 'users'
})