const { DataTypes } = require('sequelize');
const sequelize = require('../db/config');

const Complaint = sequelize.define('Complaint', {
  complaint_id: {
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
  status: {
    type: DataTypes.STRING(30),
    allowNull: false,
    defaultValue: 'pending',
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: false,
  },
  category: {
    type: DataTypes.STRING(50),
    allowNull: false,
  },
  filled_at: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW,
  },
}, {
  tableName: 'complaints',
  timestamps: false,
});

module.exports = Complaint;
