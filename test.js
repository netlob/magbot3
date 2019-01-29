// Create user

// const sqlite3 = require('sqlite3');
// let db = new sqlite3.Database('./magbot.db');
// db.run(`CREATE TABLE users(
//     id INTEGER, 
//     name VARCHAR(255) NOT NULL
// );`);

let User = require('./lib/magbot/User');
console.dir(new User({id: 1, name: 'Kasper'}).save());