const { DataTypes } = require('sequelize');
const sequelize = require('../db/config');

const SensorReading = sequelize.define('SensorReading', {
  reading_id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  bin_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'bins',
      key: 'bin_id',
    },
  },
  temperature: {
    type: DataTypes.DECIMAL(5, 2),
    allowNull: false,
  },
  fill_level_pct: {
    type: DataTypes.DECIMAL(5, 2),
    allowNull: false,
  },
  recorded_at: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW,
  },
}, {
  tableName: 'sensor_readings',
  timestamps: false,
});

module.exports = SensorReading;
