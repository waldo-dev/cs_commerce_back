'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class AnalyticsEvent extends Model {
    static associate(models) {
      AnalyticsEvent.belongsTo(models.Store, {
        foreignKey: 'store_id',
        onDelete: 'CASCADE'
      });
    }
  }
  AnalyticsEvent.init({
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
    event_type: {
      type: DataTypes.STRING(80),
      allowNull: true
    },
    data: {
      type: DataTypes.JSONB,
      allowNull: true
    },
    created_at: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW
    }
  }, {
    sequelize,
    modelName: 'AnalyticsEvent',
    tableName: 'analytics_event',
    timestamps: false,
    underscored: true
  });
  return AnalyticsEvent;
};

