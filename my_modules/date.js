

function convertDate2Objet  (str) { 

const date = new Date(str)

const obj = {

year : date.getFullYear(),
month : date.getMonth() +1,
day : date.getDate(),
hour: date.getHours(),
minute : date.getMinutes(),
second : date.getSeconds(),
millisecond : date.getMilliseconds()


}

return obj
}


module.exports = convertDate2Objet