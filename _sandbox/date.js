
const str ="2021-06-09T16:15:42.956Z"


const convertDate2Objet = (str) => { 

const date = new Date(str)

const obj = {

year : date.getFullYear(),
month : date.getMonth() +1,
day : date.getDate()


}

return obj
}

console.log(convertDate2Objet(str))