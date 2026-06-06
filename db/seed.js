/**
 * Seed script — populates the database with realistic demo data.
 * Run with: node db/seed.js
 */

const bcrypt = require('bcrypt');
const {
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
} = require('../models');

// Helpers
const rand = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;
const randFloat = (min, max, dec = 2) =>
  parseFloat((Math.random() * (max - min) + min).toFixed(dec));
const pick = (arr) => arr[rand(0, arr.length - 1)];
const daysAgo = (n) => {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return d;
};

async function seed() {
  console.log('🌱 Starting database seed...');

  // Sync all models (force recreate tables)
  await sequelize.sync({ force: true });
  console.log('✅ Tables created');

  // ── 1. Admin ──────────────────────────────
  const passwordHash = await bcrypt.hash('admin123', 10);
  await Admin.create({
    username: 'admin',
    email: 'admin@smartwaste.com',
    password_hash: passwordHash,
    role: 'admin',
  });
  console.log('✅ Admin created (admin / admin123)');

  // ── 2. Zones ──────────────────────────────
  const zonesData = [
    { zone_name: 'North Zone', district: 'Yelahanka', zone_type: 'residential' },
    { zone_name: 'South Zone', district: 'Jayanagar', zone_type: 'commercial' },
    { zone_name: 'East Zone', district: 'Whitefield', zone_type: 'residential' },
    { zone_name: 'West Zone', district: 'Rajajinagar', zone_type: 'industrial' },
    { zone_name: 'Central Zone', district: 'Koramangala', zone_type: 'commercial' },
  ];
  const zones = await Zone.bulkCreate(zonesData);
  console.log(`✅ ${zones.length} zones created`);

  // ── 3. Bins ───────────────────────────────
  const binTypes = ['general', 'recyclable', 'organic', 'hazardous'];
  const binStatuses = ['active', 'active', 'active', 'maintenance', 'inactive'];
  // Base coordinates around Bangalore, India
  const baseLat = 12.9716;
  const baseLng = 77.5946;

  const binsData = [];
  for (let i = 0; i < 60; i++) {
    binsData.push({
      zone_id: zones[i % zones.length].zone_id,
      status: pick(binStatuses),
      district: zones[i % zones.length].district,
      lat: randFloat(baseLat - 0.05, baseLat + 0.05, 7),
      lng: randFloat(baseLng - 0.05, baseLng + 0.05, 7),
      bin_type: pick(binTypes),
    });
  }
  const bins = await Bin.bulkCreate(binsData);
  console.log(`✅ ${bins.length} bins created`);

  // ── 4. Sensor Readings ────────────────────
  const readingsData = [];
  for (const bin of bins) {
    // Generate 5-8 readings per bin over last 7 days
    const numReadings = rand(5, 8);
    for (let j = 0; j < numReadings; j++) {
      readingsData.push({
        bin_id: bin.bin_id,
        temperature: randFloat(25, 45),
        fill_level_pct: randFloat(5, 98),
        recorded_at: daysAgo(rand(0, 7)),
      });
    }
  }
  await SensorReading.bulkCreate(readingsData);
  console.log(`✅ ${readingsData.length} sensor readings created`);

  // ── 5. Drivers ────────────────────────────
  const driversData = [
    { full_name: 'Rajesh Gowda', contact: '9876543210', license_no: 'KA-03-DL-2020-001234' },
    { full_name: 'Srinivas Murthy', contact: '9876543211', license_no: 'KA-05-DL-2019-005678' },
    { full_name: 'Manjunath K.', contact: '9876543212', license_no: 'KA-01-DL-2021-009012' },
    { full_name: 'Anil Kumar', contact: '9876543213', license_no: 'KA-03-DL-2018-003456' },
    { full_name: 'Vikram Naidu', contact: '9876543214', license_no: 'KA-04-DL-2022-007890' },
    { full_name: 'Deepak Rao', contact: '9876543215', license_no: 'KA-02-DL-2020-002345' },
  ];
  const drivers = await Driver.bulkCreate(driversData);
  console.log(`✅ ${drivers.length} drivers created`);

  // ── 6. Vehicles ───────────────────────────
  const vehiclesData = [
    { type: 'Compactor Truck', status: 'available', capacity_tonnes: 8.0, plate_number: 'KA-03-AB-1234' },
    { type: 'Compactor Truck', status: 'available', capacity_tonnes: 8.0, plate_number: 'KA-05-CD-5678' },
    { type: 'Mini Truck', status: 'available', capacity_tonnes: 3.5, plate_number: 'KA-01-EF-9012' },
    { type: 'Mini Truck', status: 'on_route', capacity_tonnes: 3.5, plate_number: 'KA-03-GH-3456' },
    { type: 'Tipper Truck', status: 'available', capacity_tonnes: 12.0, plate_number: 'KA-04-IJ-7890' },
    { type: 'Tipper Truck', status: 'maintenance', capacity_tonnes: 12.0, plate_number: 'KA-05-KL-2345' },
    { type: 'Auto Rickshaw', status: 'available', capacity_tonnes: 0.5, plate_number: 'KA-02-MN-6789' },
    { type: 'Auto Rickshaw', status: 'available', capacity_tonnes: 0.5, plate_number: 'KA-03-OP-0123' },
  ];
  const vehicles = await Vehicle.bulkCreate(vehiclesData);
  console.log(`✅ ${vehicles.length} vehicles created`);

  // ── 7. Collection Routes ──────────────────
  const routesData = [
    { route_name: 'Route A - Yelahanka Morning', schedule_days: 'Mon,Wed,Fri', start_time: '06:00' },
    { route_name: 'Route B - Koramangala Hub', schedule_days: 'Mon,Tue,Wed,Thu,Fri', start_time: '07:00' },
    { route_name: 'Route C - Jayanagar South', schedule_days: 'Tue,Thu,Sat', start_time: '06:30' },
    { route_name: 'Route D - Whitefield Tech Park', schedule_days: 'Mon,Wed,Fri', start_time: '08:00' },
    { route_name: 'Route E - Rajajinagar Industrial', schedule_days: 'Mon,Tue,Wed,Thu,Fri,Sat', start_time: '05:30' },
    { route_name: 'Route F - Koramangala Evening', schedule_days: 'Mon,Wed,Fri', start_time: '16:00' },
    { route_name: 'Route G - Jayanagar Residential', schedule_days: 'Tue,Thu,Sat', start_time: '07:30' },
    { route_name: 'Route H - Mixed Zone Sunday', schedule_days: 'Sun', start_time: '09:00' },
    { route_name: 'Route I - Hazardous Pickup', schedule_days: 'Fri', start_time: '10:00' },
    { route_name: 'Route J - Organic Collection', schedule_days: 'Mon,Wed,Fri', start_time: '06:00' },
  ];
  const routes = await CollectionRoute.bulkCreate(routesData);
  console.log(`✅ ${routes.length} collection routes created`);

  // ── 8. Route ↔ Bin assignments (M:N) ──────
  const routeBinsData = [];
  for (const route of routes) {
    // Assign 4-8 random bins per route
    const numBins = rand(4, 8);
    const usedBins = new Set();
    for (let j = 0; j < numBins; j++) {
      let bin = pick(bins);
      while (usedBins.has(bin.bin_id)) {
        bin = pick(bins);
      }
      usedBins.add(bin.bin_id);
      routeBinsData.push({
        route_id: route.route_id,
        bin_id: bin.bin_id,
      });
    }
  }
  await RouteBin.bulkCreate(routeBinsData);
  console.log(`✅ ${routeBinsData.length} route-bin assignments created`);

  // ── 9. Collection Logs ────────────────────
  const logNotes = [
    'Normal collection completed',
    'Heavy load today',
    'Bin was overflowing on arrival',
    'Smooth route, no issues',
    'Road blocked, took alternate path',
    'Bin damaged, reported to maintenance',
    null,
    null,
  ];
  const logsData = [];
  for (let i = 0; i < 120; i++) {
    logsData.push({
      route_id: pick(routes).route_id,
      vehicle_id: pick(vehicles).vehicle_id,
      driver_id: pick(drivers).driver_id,
      waste_collected_kg: randFloat(50, 2000),
      collection_date: daysAgo(rand(0, 30)).toISOString().split('T')[0],
      notes: pick(logNotes),
    });
  }
  await CollectionLog.bulkCreate(logsData);
  console.log(`✅ ${logsData.length} collection logs created`);

  // ── 10. Complaints ────────────────────────
  const categories = ['overflow', 'missed_collection', 'damaged_bin', 'bad_odour', 'illegal_dumping'];
  const complaintStatuses = ['pending', 'pending', 'in_progress', 'resolved', 'resolved'];
  const descriptions = [
    'The bin has been overflowing for 2 days.',
    'Waste collection was missed on the scheduled day.',
    'The bin lid is broken and waste is scattered.',
    'Terrible smell coming from the bin area.',
    'Someone dumped construction waste near the bin.',
    'Stray animals are spreading garbage from the bin.',
    'Bin is too small for the area, needs upgrade.',
    'Waste collector did not empty the bin completely.',
    'Hazardous waste mixed with general waste.',
    'Water logging near the bin after rain.',
  ];
  const complaintsData = [];
  for (let i = 0; i < 35; i++) {
    complaintsData.push({
      bin_id: pick(bins).bin_id,
      status: pick(complaintStatuses),
      description: pick(descriptions),
      category: pick(categories),
      filled_at: daysAgo(rand(0, 20)),
    });
  }
  await Complaint.bulkCreate(complaintsData);
  console.log(`✅ ${complaintsData.length} complaints created`);

  console.log('\n🎉 Database seeded successfully!');
  process.exit(0);
}

seed().catch((err) => {
  console.error('❌ Seed failed:', err);
  process.exit(1);
});
