'use strict';
const { Model } = require('sequelize');
const bcrypt = require('bcrypt');

module.exports = (sequelize, DataTypes) => {
  class User extends Model {
    static associate(models) {
      User.belongsTo(models.Company, {
        foreignKey: 'company_id',
        onDelete: 'CASCADE'
      });
      User.belongsToMany(models.Store, {
        through: models.UserStore,
        foreignKey: 'user_id',
        otherKey: 'store_id',
        as: 'stores'
      });
      User.hasMany(models.UserStore, {
        foreignKey: 'user_id',
        as: 'userStores'
      });
    }

    async comparePassword(password) {
      return await bcrypt.compare(password, this.password);
    }

    static async hashPassword(password) {
      const saltRounds = 10;
      return await bcrypt.hash(password, saltRounds);
    }
  }
  User.init({
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
      allowNull: true
    },
    email: {
      type: DataTypes.STRING(120),
      allowNull: false,
      unique: true
    },
    password: {
      type: DataTypes.TEXT,
      allowNull: false
    },
    role: {
      type: DataTypes.STRING(40),
      defaultValue: 'cliente'
    },
    created_at: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW
    }
  }, {
    sequelize,
    modelName: 'User',
    tableName: 'user',
    timestamps: false,
    underscored: true,
    hooks: {
      beforeCreate: async (user) => {
        if (user.password) {
          user.password = await User.hashPassword(user.password);
        }
      },
      beforeUpdate: async (user) => {
        if (user.changed('password')) {
          user.password = await User.hashPassword(user.password);
        }
      }
    }
  });
  return User;
};

