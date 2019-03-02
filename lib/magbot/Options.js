/*
 *   -= Magbot3 =-
 *  Sj3rd & 7kasper
 * Licensed under MIT
 *   -= Magbot3 =-
 */

'use strict';

/**
 * All (default) options for magbot.
 */
module.exports = {

    // On this point everyone using magbot (thus magister)
    // lives in the netherlands, so we just use Amsterdam
    timeZone: 'Europe/Amsterdam',

    simpleSummary: false,

    simpleShowTeacher: false,

    showSchoolHour: false,

    setupCalendars: { regular: '', homework: '', outages: '', special: ''},

    calendarTypes: {

        /**
         * The regular calendar keeps track of all
         * non-special, non-homework lessons.
         */
        regular: {
            summary: 'mbLessen',
            description: 'Alle normale lessen waar geen huiswerk voor is.',
            hidden: false,
            colorRgbFormat: true,
            foregroundColor: '#000000',
            backgroundColor: '#0096db',
            webColor: '2F6309',
            colorId: '0',
            defaultReminders: [{method: 'popup', minutes: 5}]
        },

        /**
         * The homework calendar contains all
         * non-special lessons with homework.
         */
        homework: {
            summary: 'mbHuiswerk',
            description: 'Alle lessen met huiswerk.',
            hidden: false,
            colorRgbFormat: true,
            foregroundColor: '#000000',
            backgroundColor: '#90ee90',
            webColor: '#AB8B00',
            colorId: '5',
            defaultReminders: [{method: 'popup', minutes: 5}]
        },

        /**
         * The outages calendar contains all
         * lessons that have been cancelled.
         */
        outages: {
            summary: 'mbUitval',
            description: 'Alle uitgevallen lessen.',
            hidden: false,
            colorRgbFormat: true,
            foregroundColor: '#ffffff',
            backgroundColor: '#f2476a',
            webColor: '#711616',
            colorId: '11',
            defaultReminders: []
        },

        /**
         * The special calendar contains all
         * special lessons, such as tests.
         */
        special: {
            summary: 'mbSpeciaal',
            description: 'Alle speciale lessen, zoals toetsen.',
            hidden: false,
            colorRgbFormat: true,
            foregroundColor: '#ffffff',
            backgroundColor: '#add8e6',
            webColor: '#2952A3',
            colorId: '9',
            defaultReminders: [
                {method: 'popup', minutes: 5},
                {method: 'email', minutes: 10080},
                {method: 'popup', minutes: 1440},
            ]
        },

        /**
         * This is a full calendar.
         */
        full: {
            summary: 'Magbot',
            description: 'Magbot; al je magister afspraken in een calender.',
            hidden: false,
            colorRgbFormat: true,
            foregroundColor: '#ffffff',
            backgroundColor: '#0096db',
            webColor: '#0096db',
            specialColors: true, // whether to use colorids from other calendar types.
            specialReminders: true, // whether to use the reminders from other calendar types.
            defaultReminders: [
                {method: 'popup', minutes: 5}
            ]
        }
    }
}