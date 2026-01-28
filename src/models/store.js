'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Store extends Model {
    static associate(models) {
      Store.belongsTo(models.Company, {
        foreignKey: 'company_id',
        onDelete: 'CASCADE'
      });
      Store.hasMany(models.Category, {
        foreignKey: 'store_id',
        onDelete: 'CASCADE'
      });
      Store.hasMany(models.Product, {
        foreignKey: 'store_id',
        onDelete: 'CASCADE'
      });
      Store.hasMany(models.Customer, {
        foreignKey: 'store_id',
        onDelete: 'CASCADE'
      });
      Store.hasMany(models.Order, {
        foreignKey: 'store_id',
        onDelete: 'CASCADE'
      });
      Store.hasMany(models.AnalyticsEvent, {
        foreignKey: 'store_id',
        onDelete: 'CASCADE'
      });
      Store.belongsToMany(models.User, {
        through: models.UserStore,
        foreignKey: 'store_id',
        otherKey: 'user_id',
        as: 'users'
      });
      Store.hasMany(models.UserStore, {
        foreignKey: 'store_id',
        as: 'userStores'
      });
    }
  }
  Store.init({
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    company_id: {
      type: DataTypes.INTEGER,
      references: {
        model: 'company',
        key: 'id'
      },
      onDelete: 'CASCADE'
    },
    name: {
      type: DataTypes.STRING(120),
      allowNull: false
    },
    domain: {
      type: DataTypes.STRING(120),
      allowNull: true
    },
    theme: {
      type: DataTypes.STRING(120),
      allowNull: true
    },
    created_at: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW
    }
  }, {
    sequelize,
    modelName: 'Store',
    tableName: 'store',
    timestamps: false,
    underscored: true
  });
  return Store;
};

