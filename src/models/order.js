'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Order extends Model {
    static associate(models) {
      Order.belongsTo(models.Store, {
        foreignKey: 'store_id',
        onDelete: 'CASCADE'
      });
      Order.belongsTo(models.Customer, {
        foreignKey: 'customer_id'
      });
      Order.hasMany(models.OrderItem, {
        foreignKey: 'order_id',
        onDelete: 'CASCADE'
      });
      Order.hasMany(models.Payment, {
        foreignKey: 'order_id',
        onDelete: 'CASCADE'
      });
      Order.hasMany(models.Shipment, {
        foreignKey: 'order_id',
        onDelete: 'CASCADE'
      });
    }
  }
  Order.init({
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
    customer_id: {
      type: DataTypes.INTEGER,
      references: {
        model: 'customer',
        key: 'id'
      },
      allowNull: true
    },
    total: {
      type: DataTypes.DECIMAL(12, 2),
      allowNull: true
    },
    status: {
      type: DataTypes.STRING(40),
      defaultValue: 'pending'
    },
    payment_status: {
      type: DataTypes.STRING(40),
      defaultValue: 'unpaid'
    },
    created_at: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW
    }
  }, {
    sequelize,
    modelName: 'Order',
    tableName: 'order',
    timestamps: false,
    underscored: true
  });
  return Order;
};

