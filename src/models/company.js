'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Company extends Model {
    static associate(models) {
      Company.hasMany(models.User, {
        foreignKey: 'company_id',
        onDelete: 'CASCADE'
      });
      Company.hasMany(models.Store, {
        foreignKey: 'company_id',
        onDelete: 'CASCADE'
      });
    }
  }
  Company.init({
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    name: {
      type: DataTypes.STRING(120),
      allowNull: false
    },
    email: {
      type: DataTypes.STRING(120),
      allowNull: true
    },
    plan: {
      type: DataTypes.STRING(50),
      defaultValue: 'basic'
    },
    created_at: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW
    }
  }, {
    sequelize,
    modelName: 'Company',
    tableName: 'company',
    timestamps: false,
    underscored: true
  });
  return Company;
};



