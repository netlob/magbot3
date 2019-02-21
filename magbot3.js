// Dit is de root / index van het gebeuren.
// Hier wordt de server gestart.

// yo maat nu draait de signup server niet toch?
// require('./lib/signup.webserver');


/*
 *   -= Magbot3 =-
 *  Sj3rd & 7kasper
 * Licensed under MIT
 *   -= Magbot3 =-
 */

'use strict';

// Imports
const MagisterAuth = require('./lib/magister/authcode.function');
const User = require('./lib/magbot/User');
const {google} = require('googleapis');
const secret = require('./secret');
const oAuth = new google.auth.OAuth2(
  '312564690694-duurunfnut127m50dh0j1ajlhe9oq598.apps.googleusercontent.com',
  secret.clientsecret,
  'https://beta.magbot.nl'
);


let sync = async function() {
    // Get the current magister authcode before syncing users.
    let mAuth = await MagisterAuth();

    // Get all users from DB & run over them.
    let users = await User.fetchAll();
    for(let user of users) {
        try {
            if(user.get('username') == 'hammuller') {
            // Login
            await user.login(oAuth, mAuth);
            console.dir(await user.appointments());
            }
        } catch(err) {
            console.dir(err);
        }
    }
    

    // User.onEach(user => {
    //     await user.login(oAuth, mAuth);

    // });
    


}

sync();