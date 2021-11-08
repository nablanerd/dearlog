'use strict';
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('Logs', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      title: {
        type: Sequelize.STRING
      },
       description: {
        type: Sequelize.STRING
      },
      content: {
        type: Sequelize.TEXT
      },
      heart: {
        type: Sequelize.BOOLEAN
      },
      id_namespace: {
        type: Sequelize.INTEGER
      },
      tag: {
        type: Sequelize.STRING
      },
       type: {
        type: Sequelize.STRING
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE
      }
    });

  
  },
  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('Logs');
  }
};