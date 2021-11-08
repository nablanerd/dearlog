'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Log extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here

      console.log(models);
      Log.belongsTo(models.Namespace, { foreignKey: 'id_namespace', as: 'namespace'});
     // models.Namespace.hasMany(Log, { foreignKey: 'id_namespace' });

     Log.belongsToMany(models.Tag, { /* foreignKey: 'TagId', */ through: models.LogTags , as: 'tags'});


    }



  };
  Log.init({
    title: DataTypes.STRING,
    description: DataTypes.STRING,
    content: DataTypes.TEXT,
    heart: DataTypes.BOOLEAN,
    id_namespace: DataTypes.INTEGER,
    tag: DataTypes.STRING,
    type: DataTypes.STRING
  }, {
    sequelize,
    modelName: 'Log',
  });
  return Log;
};