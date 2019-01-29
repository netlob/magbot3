const { default: magister, getSchools } = require('magister.js');
var moment = require('moment-business-days');
function day(extra) {
    if(!extra){extra = 0}
    extra = extra + 1
    return moment().businessAdd(extra)._d
}

magister({
	school: {
        url: 'https://' + process.argv[2] + '.magister.net'
    },
	username: process.argv[3],
	password: process.argv[4],
})
.then((m) => m.appointments(day(-1), day(13)))
.then(appointments => {
    let output = [];
    appointments.forEach((value, index) => {
        // Format output to old magister format lol.
        output[index] = {
            Status: value.status,
            InfoType: value.infoType,
            Inhoud: value.content,
            Id: value.id,
            Lokatie: value.location,
            Start: value.start,
            Einde: value.end,
            Omschrijving: value.description,
            LesuurVan: value.startBySchoolhour
        }
    });
    return output;
})
.then(output => console.log(JSON.stringify(output)));