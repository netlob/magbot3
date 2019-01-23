const puppeteer = require('puppeteer');

module.exports = async function () {
    const browser = await puppeteer.launch({args: ['--no-sandbox', '--disable-setuid-sandbox']});

    const page = await browser.newPage();
    await page.goto('https://kajmunk.magister.net/');

    const request = await page.waitForRequest('https://accounts.magister.net/challenge/current');
    const data = JSON.parse(request.postData());

    const newAuthCode = data.authCode;

    await browser.close();

    return newAuthCode;
};