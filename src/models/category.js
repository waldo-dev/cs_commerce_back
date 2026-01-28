'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Category extends Model {
    static associate(models) {
      Category.belongsTo(models.Store, {
        foreignKey: 'store_id',
        onDelete: 'CASCADE'
      });
      Category.hasMany(models.Product, {
        foreignKey: 'category_id'
      });
    }
  }
  Category.init({
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    store_id: {
      type: DataTypes.INTEGER,
      references: {
        model: 'store',
        key: 'id'
      },
      onDelete: 'CASCADE'
    },
    name: {
      type: DataTypes.STRING(120),
      allowNull: false
    }
  }, {
    sequelize,
    modelName: 'Category',
    tableName: 'category',
    timestamps: false,
    underscored: true
  });
  return Category;
};

