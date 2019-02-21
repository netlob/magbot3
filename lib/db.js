/**
 *   -= Magbot3 =-
 *  Sj3rd & 7kasper
 * Licensed under MIT
 *   -= Magbot3 =-
 */

'use strict';

// Imports
const dbUser = require('../secret').dbUser;
const knex = require('knex')({
    client: 'pg',
    debug: true,
    connection: {
        host: '127.0.0.1',
        user: dbUser.username,
        password: dbUser.password,
        database: 'magbot',
        charset: 'utf8'
    }
});
const bookshelf = require('bookshelf')(knex);
// Load bookshelf plugins
bookshelf.plugin('bookshelf-json-columns');
bookshelf.plugin('bookshelf-update');
bookshelf.plugin('bookshelf-spotparse');
bookshelf.plugin('registry');
// Export
module.exports.knex = knex;
module.exports.shelf = bookshelf;