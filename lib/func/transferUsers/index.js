/**
 *   -= Magbot3 =-
 *  Sj3rd & 7kasper
 * Licensed under MIT
 *   -= Magbot3 =-
 */

// Imports
// let User = require('../../magbot/User');
let oldUsers = require('./oldUsers.json');

/**
 * @class oldUsers
 * @classdescr
 * Function to transform and port all magbot2
 * users to the new system and give them some info.
 */

for (let oldUser of oldUsers) {
    // let user = new User({email: oldUser.email});
    let user = new Map();
    user.set('isdisabled', false);
    user.set('school', oldUser.school);
    user.set('username', oldUser.username);
    user.set('password', oldUser.password);
    user.set('accesstoken', oldUser.googleaccesstoken.access_token);
    user.set('refreshtoken', oldUser.googlerefreshtoken);
    user.set('calendars', {
        regular: oldUser.calendarids[0],
        homework: oldUser.calendarids[1],
        outages: oldUser.calendarids[2],
        special: oldUser.calendarids[3]
    });
    console.dir(user);
}

