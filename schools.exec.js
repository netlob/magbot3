const fs = require('fs');

var schools = JSON.parse(fs.readFileSync('schools.json', 'utf8'));
var list = [];
var element = {};


for(var i = 0; i < schools.length; i++) {
    // element.push({ [schools[i].name]: undefined });
    // list.push(element);
    // element[schools[i].name] = undefined
    list.push(schools[i].name)
    if(i == schools.length - 1){
        fs.writeFile('list.json', JSON.stringify(list), 'utf8', () => {
            console.log('done');
        });
    }
}