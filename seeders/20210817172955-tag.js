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



     return queryInterface.bulkInsert('Tags', [
   
      {
        name: 't1',
        description :"t1",
        createdAt: moment().format('YYYY-MM-DD HH:mm:ss'),
        updatedAt: moment().format('YYYY-MM-DD HH:mm:ss')
        },
        {
          name: 't2',
          description :"t2",
          createdAt: moment().format('YYYY-MM-DD HH:mm:ss'),
          updatedAt: moment().format('YYYY-MM-DD HH:mm:ss')
        },
        {
          name: 't3',
          description :"t3",
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
  }
};
