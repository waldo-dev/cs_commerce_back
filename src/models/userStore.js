'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class UserStore extends Model {
    static associate(models) {
      UserStore.belongsTo(models.User, {
        foreignKey: 'user_id',
        onDelete: 'CASCADE'
      });
      UserStore.belongsTo(models.Store, {
        foreignKey: 'store_id',
        onDelete: 'CASCADE'
      });
    }
  }
  UserStore.init({
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    user_id: {
      type: DataTypes.INTEGER,
      references: {
        model: 'user',
        key: 'id'
      },
      onDelete: 'CASCADE',
      allowNull: false
    },
    store_id: {
      type: DataTypes.INTEGER,
      references: {
        model: 'store',
        key: 'id'
      },
      onDelete: 'CASCADE',
      allowNull: false
    },
    status: {
      type: DataTypes.STRING(40),
      defaultValue: 'active'
    },
    created_at: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW
    }
  }, {
    sequelize,
    modelName: 'UserStore',
    tableName: 'user_store',
    timestamps: false,
    underscored: true,
    indexes: [
      {
        unique: true,
        fields: ['user_id', 'store_id']
      }
    ]
  });
  return UserStore;
};

