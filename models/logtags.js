'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class LogTags extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here

      models.Log.belongsToMany(models.Tag, {   through: models.LogTags , as: 'tags'});
          models.Tag.belongsToMany(models.Log, {  through: models.LogTags, as: 'logs' });

     
    }
  };



  LogTags.init({
    LogId: DataTypes.INTEGER,
    TagId: DataTypes.INTEGER
  }, {
    sequelize,
    modelName: 'LogTags',
  });

  
  return LogTags;
};