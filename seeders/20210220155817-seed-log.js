'use strict';

const moment = require("moment")

module.exports = {
  up: async (queryInterface, Sequelize) => {
    /**
     * Add seed commands here.
     *
     * Example:
     * await queryInterface.bulkInsert('People', [{
     *   name: 'John Doe',
     *   isBetaMember: false
     * }], {});
    */

/*
   queryInterface.createTable('Logs', {
    title: DataTypes.STRING,
    content: DataTypes.TEXT,
    heart: DataTypes.BOOLEAN,
    namespace: DataTypes.STRING,
    tag: DataTypes.STRING,

  });
*/
    return queryInterface.bulkInsert('Logs', [
{
title: '!foo',
description :"!foo",
content: '!foo',
heart: true,
id_namespace: 1,
tag:'!foo',
type:'text',
createdAt: moment().format('YYYY-MM-DD HH:mm:ss'),
updatedAt: moment().format('YYYY-MM-DD HH:mm:ss')
},
{
title: 'bar',
description :"bar",
content: 'bar',
heart: false,
id_namespace: 2,
tag:'bar',
type:'text',
createdAt: moment().format('YYYY-MM-DD HH:mm:ss'),
updatedAt: moment().format('YYYY-MM-DD HH:mm:ss')
},
{
title: 'nerd',
description :"nerd",
content: 'nerd',
heart: true,
id_namespace: 3,
tag:'nerd',
type:'text',
createdAt: moment().format('YYYY-MM-DD HH:mm:ss'),
updatedAt: moment().format('YYYY-MM-DD HH:mm:ss')
}
], {});


  },

  down: async (queryInterface, Sequelize) => {
    /**
     * Add commands to revert seed here.
     *
     * Example:
     * await queryInterface.bulkDelete('People', null, {});
     */


    return queryInterface.bulkDelete('Logs', null, {});
  }
};
