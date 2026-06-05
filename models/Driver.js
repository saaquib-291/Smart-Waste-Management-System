const { DataTypes } = require('sequelize');
const sequelize = require('../db/config');

const Driver = sequelize.define('Driver', {
  driver_id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  full_name: {
    type: DataTypes.STRING(100),
    allowNull: false,
  },
  contact: {
    type: DataTypes.STRING(20),
    allowNull: false,
  },
  license_no: {
    type: DataTypes.STRING(30),
    allowNull: false,
    unique: true,
  },
}, {
  tableName: 'drivers',
  timestamps: false,
});

module.exports = Driver;
