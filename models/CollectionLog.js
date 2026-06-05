const { DataTypes } = require('sequelize');
const sequelize = require('../db/config');

const CollectionLog = sequelize.define('CollectionLog', {
  log_id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  route_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'collection_routes',
      key: 'route_id',
    },
  },
  vehicle_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'vehicles',
      key: 'vehicle_id',
    },
  },
  driver_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'drivers',
      key: 'driver_id',
    },
  },
  waste_collected_kg: {
    type: DataTypes.DECIMAL(8, 2),
    allowNull: false,
  },
  collection_date: {
    type: DataTypes.DATEONLY,
    allowNull: false,
  },
  notes: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
}, {
  tableName: 'collection_logs',
  timestamps: false,
});

module.exports = CollectionLog;
