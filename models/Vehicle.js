const { DataTypes } = require('sequelize');
const sequelize = require('../db/config');

const Vehicle = sequelize.define('Vehicle', {
  vehicle_id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  type: {
    type: DataTypes.STRING(50),
    allowNull: false,
  },
  status: {
    type: DataTypes.STRING(30),
    allowNull: false,
    defaultValue: 'available',
  },
  capacity_tonnes: {
    type: DataTypes.DECIMAL(5, 2),
    allowNull: false,
  },
  plate_number: {
    type: DataTypes.STRING(20),
    allowNull: false,
    unique: true,
  },
}, {
  tableName: 'vehicles',
  timestamps: false,
});

module.exports = Vehicle;
