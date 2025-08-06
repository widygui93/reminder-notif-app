'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Notification_Product extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  Notification_Product.init({
    notification_id: DataTypes.STRING,
    product_name: DataTypes.STRING
  }, {
    sequelize,
    modelName: 'Notification_Product',
  });
  return Notification_Product;
};