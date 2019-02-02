/**
 *   -= Magbot3 =-
 *  Sj3rd & 7kasper
 * Licensed under MIT
 *   -= Magbot3 =-
 */

'use strict';

// Imports
const knex = require('knex')({
    client: 'pg',
    //debug: true,
    connection: {
        host: '127.0.0.1',
        user: 'postgres',
        password: 'postgres',
        database: 'magbot',
        charset: 'utf8'
    }
});
const bookshelf = require('bookshelf')(knex);
const bookshelfJsonColumns = require('bookshelf-json-columns');
const bookshelfTransient = require('bookshelf-transient');
// Load bookshelf plugins
bookshelf.plugin(bookshelfJsonColumns);
bookshelf.plugin(bookshelfTransient);
bookshelf.plugin('registry');
// Export
module.exports.knex = knex;
module.exports.shelf = bookshelf;