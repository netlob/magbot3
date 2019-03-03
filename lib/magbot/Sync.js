
/*
 *   -= Magbot3 =-
 *  Sj3rd & 7kasper
 * Licensed under MIT
 *   -= Magbot3 =-
 */

'use strict';

// Imports
const _ = require('lodash');
const moment = require('moment-timezone');

/**
 * @class Sync
 * @classdesc
 * This class is a central part of Magbot
 * and is in charge of syncing or transforming
 * magister appointments to google appointments.
 * The three functions accessed are
 * mag2caltype - gets which calendar type belongs to the appointment.
 * mag2google - transforms the actual magister event to google format.
 * shouldChange - checks whether an appointment should be updated.
 */
module.exports = {
    mag2caltype: mag2caltype,
    mag2google: mag2google,
    shouldChange: shouldChange,
    sortReminders: sortReminders
}

/**
 * Checks wether a google appointment should change.
 * This simply dry-runs the updates on a google appointment
 * and checks whether the google appointment has changed then.
 * It is advisable to run this function before patching to google
 * to save api calls for unchanged events.
 * 
 * The defaults inside this function are necessary because
 * google doesn't always return default options when getting
 * calendar events. We add them if they are not present so
 * comparing the appointments won't break.
 * @param {*} gog - the google appointment
 * @param {Appointment} mag - the transformed magister appointment
 */
function shouldChange(gog, mag) {
    let defaults = {
        colorId: '0',
        description: null,
        location: '',
        status: 'confirmed',
        transparency: 'opaque',
        reminders: {
            useDefault: true,
            overrides: []
        }
    }
    // Add defaults for proper change checking.
    let magCheck = _.defaultsDeep(mag, gog, defaults);
    let gogCheck = _.defaultsDeep(gog, defaults);
    // Sort reminders for proper checking.
    magCheck.reminders.overrides.sort(sortReminders);
    gogCheck.reminders.overrides.sort(sortReminders);
    // Debug logs when comparing fails.
    // if (!_.isEqual(magCheck, gogCheck)) {
    //     console.log('APPP COMPARE!');
    //     console.dir(magCheck.reminders);
    //     console.dir(gogCheck.reminders);
    // }
    return !_.isEqual(magCheck, gogCheck);
}

/**
 * Sort function for reminders.
 * @param {reminder} a 
 * @param {reminder} b 
 */
function sortReminders(a, b) {
    if (a.minutes < b.minutes) return -1;
    if (a.minutes > b.minutes) return 1;
    else {
        if (a.method < b.method) return -1;
        if (a.method > b.method) return 1;
        return 0;
    }
}

/**
 * Transforms a magister to google appointment.
 * @param {options} options - the options of the user.
 * @param {string} calendarType - the calendarType where the appointment is to be inserted
 * @param {Appointment} a - the magister appointment
 * @returns google appointment (g)
 */
function mag2google(options, calendarType, a) {
    return {
        id: `magbot${a.id}`,
        summary: summary(options, a),
        description: a.content,
        location: a.location,
        start: {
            dateTime: moment(a.start).tz(options.timeZone).format()
        },
        end: {
            dateTime: moment(a.end).tz(options.timeZone).format()
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
function mag2caltype(a) {
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
function reminderOverride(options, calendarType, a) {
    // If we are inserting a test to the calendar that contains all appointments,
    // override the reminders of that appointment with the special reminders.
    if (calendarType === 'full' && options.calendarTypes[calendarType].specialReminders) {
        return {
            useDefault: false,
            overrides: options.calendarTypes[mag2caltype(a)].defaultReminders
        };
    }
    return { useDefault: true };
}

/**
 * Gets colorId override if necessary.
 * (This is currently only done on the full calendar for special appointments)
 * @param {options} options - the user's options 
 * @param {string} calendarType - the calendarType where the appoint is to be inserted
 * @param {Appointment} a - the magister appointment
 */
function colorOverride(options, calendarType, a) {
    if (options.calendarTypes[calendarType].specialColors) {
        return options.calendarTypes[mag2caltype(a)].colorId;
    }
    return '0';
}

/**
 * Gets the summary that should be 
 * the title of the google calendar appointment.
 * @param {any} options - the user's options
 * @param {Appointment} a - the magister appointment
 * @returns the title of the event as to be shown in google
 */
function summary(options, a) {
    let summary;
    // Get 'simple' formatted summary or description from magister.
    if (options.simpleSummary && a.classes[0]) {
        summary = toTitleCase(a.classes[0]);
        // Waarom leeraar laten zien? :F
        if (options.simpleShowTeacher && a.teachers[0]) {
            summary = `${summary} van ${a.teachers[0].description}`;
        }
    } else {
        summary = a.description;
    }
    // Append formatted schoolhour if there is one.
    if (a.startBySchoolhour != null && options.showSchoolHour) {
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
function isSpecial(a) {
    return a.infoType > 1;
}

/**
 * Transforms string ToTitleCase.
 * @param {string} str 
 */
function toTitleCase(str) {
	return str.replace(
		/\w\S*/g,
		function(txt) {
				return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();
		}
	);
}