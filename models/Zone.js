const { DataTypes } = require('sequelize');
const sequelize = require('../db/config');

const Zone = sequelize.define('Zone', {
  zone_id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  zone_name: {
    type: DataTypes.STRING(100),
    allowNull: false,
  },
  district: {
    type: DataTypes.STRING(100),
    allowNull: false,
  },
  zone_type: {
    type: DataTypes.STRING(50),
    allowNull: false,
    defaultValue: 'residential',
  },
}, {
  tableName: 'zones',
  timestamps: false,
});

module.exports = Zone;
