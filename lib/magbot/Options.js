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

    timeZone: 'Europe/Amsterdam',

    calendarTypes: {

        /**
         * The regular calendar keeps track of all
         * non-special, non-homework lessons.
         */
        regular: {
            summary: 'mbLessen',
            description: 'Alle normale lessen waar geen huiswerk voor is.',
            colorRgbFormat: true,
            foregroundColor: '#000000',
            backgroundColor: '#2F6309',
            webColor: '2F6309',
            defaultReminders: [{method: 'popup', minutes: 5}]
        },

        /**
         * The homework calendar contains all
         * non-special lessons with homework.
         */
        homework: {
            summary: 'mbHuiswerk',
            description: 'Alle lessen met huiswerk.',
            colorRgbFormat: true,
            foregroundColor: '#000000',
            backgroundColor: '#E0C240',
            webColor: '#AB8B00',
            defaultReminders: [{method: 'popup', minutes: 5}]
        },

        /**
         * The outages calendar contains all
         * lessons that have been cancelled.
         */
        outages: {
            summary: 'mbUitval',
            description: 'Alle uitgevallen lessen.',
            colorRgbFormat: true,
            foregroundColor: '#ffffff',
            backgroundColor: '#AD2D2D',
            webColor: '#711616',
            defaultReminders: []
        },

        /**
         * The special calendar contains all
         * special lessons, such as tests.
         */
        special: {
            summary: 'mbSpeciaal',
            description: 'Alle speciale lessen, zoals toetsen.',
            colorRgbFormat: true,
            foregroundColor: '#ffffff',
            backgroundColor: '#665CD9',
            webColor: '#2952A3',
            defaultReminders: [{method: 'popup', minutes: 5}, {method: 'popup', minutes: 1440}]
        },

        /**
         * Todo: assistant?
         * This calendar has everything to make magbot
         * compatible with google assistant.
         */
        assistant: {
            summary: 'Magbot Assistant'
        }
    }
}