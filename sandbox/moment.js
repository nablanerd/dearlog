//console.log(require('moment')().format('YYYY-MM-DD HH:mm:ss'));

const moment = require('moment')

const string ="2021-02-20 18:11:59.530 +00:00"

console.log(moment(new Date(string)).format('DD MMMM HH:mm'))