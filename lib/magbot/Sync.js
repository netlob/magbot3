
/*
 *   -= Magbot3 =-
 *  Sj3rd & 7kasper
 * Licensed under MIT
 *   -= Magbot3 =-
 */

'use strict';

const _ = require('lodash');

/**
 * This class is the long sync function of magbot.
 * This function is the main part of the program.
 */
// module.exports = async function(user) {
//     let calendars = user.get('calendars');
//     let options = user.get('options');

//     do {

//     } while

//     appointments = user.appointments();
//     for (let a in appointments) {



//         let calendarType = mag2caltype(a);
//         if (calendarType in calendars) {

//         }
//         if ('full' in calendars) {
//             calendarType = 'full';

//         }
//     }

//     // IF appointments differ
//     if (a.isCancelled && calendars.outages) {
//         // ADdd.
//     }

    
// }


/**
 * Checks wether a google appointment should change.
 * This simply dry-runs the updates on a google appointment
 * and checks whether the google appointment has changed then.
 * It is advisable to run this function before patching to google
 * to save api calls for unchanged events.
 * @param {*} gog - the google appointment
 * @param {Appointment} mag - the transformed magister appointment
 */
export function shouldChange(gog, mag) {
    return _.isEqual(_.defaultsDeep(mag, gog), gog);
}

/**
 * Transforms a magister to google appointment.
 * @param {options} options - the options of the user.
 * @param {string} calendarType - the calendarType where the appointment is to be inserted
 * @param {Appointment} a - the magister appointment
 * @returns google appointment (g)
 */
export function mag2google(options, calendarType, a) {
    return {
        id: `magbot${a.id}`,
        summary: summary(options, a),
        description: a.content,
        location: a.location,
        start: {
            dateTime: a.start
        },
        end: {
            dateTime: a.end
        },
        transparency: a.isCancelled ? 'transparent' : 'opaque',
        reminders: reminderOverride(options, calendarType, a),
        colorId: colorOverride(options, calendarType, a),
        status: a.isCancelled && options.calendarTypes.outages.hidden ?
            'cancelled' : 'confirmed'
    };
}

/**
 * Gets the special magbot calendartype based on the
 * magister appointment.
 * @param {Appointment} a - the magister appointment
 */
export function mag2caltype(a) {
    if (a.isCancelled) return 'outages';
    else if (isSpecial(a)) return 'special';
    else if (a.content != null) return 'homework';
    else return 'regular';
}

/**
 * Get reminder overrides for calendar,
 * based on what the user has specified
 * in his options.
 * @param {options} options - the user's options
 * @param {string} calendarType - the calendarType where the appoint is to be inserted
 * @param {Appointment} a - the magister appointment
 * @returns an object with reminder overrides or null
 */
export function reminderOverride(options, calendarType, a) {
    // If we are inserting a test to the calendar that contains all appointments,
    // override the reminders of that appointment with the special reminders.
    if (calendarType === 'full' && options.calendarTypes[calendarType].speicalReminders) {
        return {
            useDefault: false,
            overrides: options.calendarTypes[mag2caltype(a)].defaultReminders
        };
    }
    return null;
}

/**
 * Gets colorId override if necessary.
 * (This is currently only done on the full calendar for special appointments)
 * @param {options} options - the user's options 
 * @param {string} calendarType - the calendarType where the appoint is to be inserted
 * @param {Appointment} a - the magister appointment
 */
export function colorOverride(options, calendarType, a) {
    if (options.calendarTypes[calendarType].specialColors) {
        return options.calendarTypes[mag2caltype(a)].colorId;
    }
    return null;
}

/**
 * Gets the summary that should be 
 * the title of the google calendar appointment.
 * @param {any} options - the user's options
 * @param {Appointment} a - the magister appointment
 * @returns the title of the event as to be shown in google
 */
export function summary(options, a) {
    let summary;
    // Get 'simple' formatted summary or description from magister.
    if (options.simpleSummary && a.classes[0]) {
        summary = toTitleCase(a.classes[0]);
        if (a.teachers[0]) {
            summary = `${summary} van ${a.teachers[0]}`;
        }
    } else {
        summary = a.description;
    }
    // Append formatted schoolhour if there is one.
    if (a.startBySchoolhour != null) {
        if (a.startBySchoolhour === a.endBySchoolhour) {
            summary = `${a.startBySchoolhour} - ${summary}`;
        } else {
            summary = `${a.startBySchoolhour}/${a.endBySchoolhour} - ${summary}`;
        }
    }
    // Append crossed X for cancelled events (for watches)
    if (a.isCancelled) {
        summary = `X - ${summary}`;
    }
    return summary;
}

/**
 * Checks whether a magister appointment is special (a test or so)
 * @param {Appointment} a - the magister appointment.
 * @returns true, if the appointment is special.
 */
export function isSpecial(a) {
    return a.infoType > 1;
}

/**
 * Transforms string ToTitleCase.
 * @param {string} str 
 */
export function toTitleCase(str) {
	return str.replace(
		/\w\S*/g,
		function(txt) {
				return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();
		}
	);
}