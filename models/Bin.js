const { DataTypes } = require('sequelize');
const sequelize = require('../db/config');

const Bin = sequelize.define('Bin', {
  bin_id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  zone_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'zones',
      key: 'zone_id',
    },
  },
  status: {
    type: DataTypes.STRING(30),
    allowNull: false,
    defaultValue: 'active',
  },
  district: {
    type: DataTypes.STRING(100),
    allowNull: false,
  },
  lat: {
    type: DataTypes.DECIMAL(10, 7),
    allowNull: false,
  },
  lng: {
    type: DataTypes.DECIMAL(10, 7),
    allowNull: false,
  },
  bin_type: {
    type: DataTypes.STRING(50),
    allowNull: false,
    defaultValue: 'general',
  },
}, {
  tableName: 'bins',
  timestamps: false,
});

module.exports = Bin;
