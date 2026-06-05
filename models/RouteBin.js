const { DataTypes } = require('sequelize');
const sequelize = require('../db/config');

const RouteBin = sequelize.define('RouteBin', {
  route_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'collection_routes',
      key: 'route_id',
    },
  },
  bin_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'bins',
      key: 'bin_id',
    },
  },
}, {
  tableName: 'route_bins',
  timestamps: false,
});

module.exports = RouteBin;
