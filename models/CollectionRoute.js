const { DataTypes } = require('sequelize');
const sequelize = require('../db/config');

const CollectionRoute = sequelize.define('CollectionRoute', {
  route_id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  route_name: {
    type: DataTypes.STRING(100),
    allowNull: false,
  },
  schedule_days: {
    type: DataTypes.STRING(100),
    allowNull: false,
  },
  start_time: {
    type: DataTypes.TIME,
    allowNull: false,
  },
}, {
  tableName: 'collection_routes',
  timestamps: false,
});

module.exports = CollectionRoute;
