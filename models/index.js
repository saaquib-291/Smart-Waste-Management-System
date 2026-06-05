const sequelize = require('../db/config');

// Import all models
const Zone = require('./Zone');
const Bin = require('./Bin');
const Complaint = require('./Complaint');
const SensorReading = require('./SensorReading');
const CollectionRoute = require('./CollectionRoute');
const RouteBin = require('./RouteBin');
const CollectionLog = require('./CollectionLog');
const Vehicle = require('./Vehicle');
const Driver = require('./Driver');
const Admin = require('./Admin');

// ──────────────────────────────────────────────
// Define Associations (matching ER diagram)
// ──────────────────────────────────────────────

// Zone 1 → N Bin
Zone.hasMany(Bin, { foreignKey: 'zone_id', as: 'bins' });
Bin.belongsTo(Zone, { foreignKey: 'zone_id', as: 'zone' });

// Bin 1 → N Complaint
Bin.hasMany(Complaint, { foreignKey: 'bin_id', as: 'complaints' });
Complaint.belongsTo(Bin, { foreignKey: 'bin_id', as: 'bin' });

// Bin 1 → N SensorReading
Bin.hasMany(SensorReading, { foreignKey: 'bin_id', as: 'readings' });
SensorReading.belongsTo(Bin, { foreignKey: 'bin_id', as: 'bin' });

// CollectionRoute M ↔ N Bin (through RouteBin junction table)
CollectionRoute.belongsToMany(Bin, {
  through: RouteBin,
  foreignKey: 'route_id',
  otherKey: 'bin_id',
  as: 'bins',
});
Bin.belongsToMany(CollectionRoute, {
  through: RouteBin,
  foreignKey: 'bin_id',
  otherKey: 'route_id',
  as: 'routes',
});

// Vehicle 1 → N CollectionLog
Vehicle.hasMany(CollectionLog, { foreignKey: 'vehicle_id', as: 'logs' });
CollectionLog.belongsTo(Vehicle, { foreignKey: 'vehicle_id', as: 'vehicle' });

// Driver 1 → N CollectionLog
Driver.hasMany(CollectionLog, { foreignKey: 'driver_id', as: 'logs' });
CollectionLog.belongsTo(Driver, { foreignKey: 'driver_id', as: 'driver' });

// CollectionRoute 1 → N CollectionLog
CollectionRoute.hasMany(CollectionLog, { foreignKey: 'route_id', as: 'logs' });
CollectionLog.belongsTo(CollectionRoute, { foreignKey: 'route_id', as: 'route' });

module.exports = {
  sequelize,
  Zone,
  Bin,
  Complaint,
  SensorReading,
  CollectionRoute,
  RouteBin,
  CollectionLog,
  Vehicle,
  Driver,
  Admin,
};
