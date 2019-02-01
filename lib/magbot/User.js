// Model - Definition of magbot user.
const shelf = require('../db').shelf;
module.exports = shelf.model('users', {
    tableName: 'users',

    getMagister: function() {
        return {
            school: this.get('school'), 
            username: this.get('username'), 
            password: this.get('password')
        }
    }

}, {
    jsonColumns: ['data']
});
