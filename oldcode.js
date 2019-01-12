// function pushCalendar(auth, m) {
//     delEvents(auth)
//     const calendar = google.calendar({version: 'v3', auth});
//     const magister = new Magister('school', 'username', 'password')
//     magister.authenticate()
//     .then(session => {
//         session.getAppointments(daag(-1), daag(4))
//         .then(m => {
//             for(var i = 0; m.length - 1 >= i; i++){
//                 var event = {
//                     'summary': [m[i].rawData.Vakken[0]?toTitleCase(m[i].rawData.Vakken[0].Naam):m[i].rawData.Omschrijving] + ' van ' + m[i].rawData.Docenten[0].Naam,
//                     'location': isNaN(m[i].rawData.Lokatie)?m[i].rawData.Lokatie:'lokaal '+m[i].rawData.Lokatie,
//                     'description': m[i].rawData.Inhoud?m[i].rawData.Inhoud:m[i].rawData.Omschrijving,
//                     'start': {
//                         'dateTime': m[i].rawData.Start,
//                         'timeZone': 'Europe/Amsterdam',
//                     },
//                     'end': {
//                         'dateTime': m[i].rawData.Einde,
//                         'timeZone': 'Europe/Amsterdam',
//                     }
//                 };
//                 console.log(event.summary)
//                 calendar.events.insert({
//                         auth: auth,
//                         calendarId: '@group.calendar.google.com',
//                         resource: event,
//                     }, function(err, event) {
//                     if (err) {
//                         console.log('There was an error contacting the Calendar service: ' + err);
//                         return;
//                     }
//                 })
//             }
//         })
//     }).catch(error => {
//         throw new Error(error)
//     })
// }
    