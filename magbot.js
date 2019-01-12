const { default: magister, getSchools } = require('magister.js');
var moment = require('moment-business-days');

var user = [];
user.username = 'username'
user.password = 'password'
user.school = 'school'


getSchools(user.school)
	.then((schools) => schools[0])
	.then((school) => magister({
		school,
		username: user.username,
		password: user.password,
	}))
	.then((m) => {
        m.appointments(day(-1), day(4))
        .then((m => {
            console.dir(m)
        }))
	}, (err) => {
		console.error('something went wrong:', err);
    });

function day(extra) {
    if(!extra){extra = 0}
    extra = extra + 1
    return moment().businessAdd(extra)._d
}