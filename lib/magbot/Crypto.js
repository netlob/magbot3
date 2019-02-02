/**
 *   -= Magbot3 =-
 *  Sj3rd & 7kasper
 * Licensed under MIT
 *   -= Magbot3 =-
 */

'use strict';

// Imports
const CryptoJS = require("crypto-js");
const AES = require("crypto-js/aes");
const key = require('../../key');

/**
 * This class provides the standard methods of encryption / decryption
 * for securely storing passwords. All passwords & refreshtokens are currently 
 * encrypted using AES with a secret key provided.
 */
module.exports.encrypt = (str) => {
    if (typeof str == 'string') {
        return AES.encrypt(str, key).toString();
    }
    return str;
};
module.exports.decrypt = (str) => {
    if (typeof str == 'string') {
        return AES.decrypt(str, key).toString(CryptoJS.enc.Utf8);
    }
    return str;
};