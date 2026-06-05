const { DataTypes } = require('sequelize');
const sequelize = require('../db/config');

const Admin = sequelize.define('Admin', {
  admin_id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  username: {
    type: DataTypes.STRING(50),
    allowNull: false,
    unique: true,
  },
  email: {
    type: DataTypes.STRING(100),
    allowNull: false,
    unique: true,
  },
  password_hash: {
    type: DataTypes.STRING(255),
    allowNull: false,
  },
  role: {
    type: DataTypes.STRING(30),
    allowNull: false,
    defaultValue: 'admin',
  },
}, {
  tableName: 'admins',
  timestamps: false,
});

module.exports = Admin;
