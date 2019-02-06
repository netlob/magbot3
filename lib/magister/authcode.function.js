/*
 *   -= Magbot3 =-
 *  Sj3rd & 7kasper
 * Licensed under MIT
 *   -= Magbot3 =-
 */

'use strict';

// Imports
const puppeteer = require('puppeteer');

/**
 * @class Authcode.Exec
 * @classdesc
 * This class fakes a browser to get the current
 * magister auth url that is required when logging in.
 */
module.exports = async function() {
    const browser = await puppeteer.launch({args: ['--no-sandbox', '--disable-setuid-sandbox']});
    const page = await browser.newPage();
    await page.goto('https://kajmunk.magister.net/');
    const request = await page.waitForRequest('https://accounts.magister.net/challenge/current');
    const data = JSON.parse(request.postData());
    const newAuthCode = data.authCode;
    await browser.close();
    return newAuthCode;
};