const sequelize = require('../config/database');

const User = require('./User');
const Package = require('./Package');
const Costume = require('./Costume');
const Customer = require('./Customer');
const Appointment = require('./Appointment');
const Schedule = require('./Schedule');
const Photo = require('./Photo');
const WorkOrder = require('./WorkOrder');
const Delivery = require('./Delivery');

User.hasMany(Appointment, { foreignKey: 'photographerId', as: 'photographerAppointments' });
User.hasMany(Appointment, { foreignKey: 'stylistId', as: 'stylistAppointments' });
User.hasMany(Schedule, { foreignKey: 'userId', as: 'schedules' });

Customer.hasMany(Appointment, { foreignKey: 'customerId', as: 'appointments' });

Package.hasMany(Appointment, { foreignKey: 'packageId', as: 'appointments' });

Appointment.belongsTo(Customer, { foreignKey: 'customerId', as: 'customer' });
Appointment.belongsTo(Package, { foreignKey: 'packageId', as: 'package' });
Appointment.belongsTo(User, { foreignKey: 'photographerId', as: 'photographer' });
Appointment.belongsTo(User, { foreignKey: 'stylistId', as: 'stylist' });
Appointment.hasMany(Photo, { foreignKey: 'appointmentId', as: 'photos' });
Appointment.hasMany(WorkOrder, { foreignKey: 'appointmentId', as: 'workOrders' });
Appointment.hasMany(Delivery, { foreignKey: 'appointmentId', as: 'deliveries' });
Appointment.hasMany(Schedule, { foreignKey: 'appointmentId', as: 'schedules' });

Schedule.belongsTo(User, { foreignKey: 'userId', as: 'user' });
Schedule.belongsTo(Appointment, { foreignKey: 'appointmentId', as: 'appointment' });

Photo.belongsTo(Appointment, { foreignKey: 'appointmentId', as: 'appointment' });

WorkOrder.belongsTo(Appointment, { foreignKey: 'appointmentId', as: 'appointment' });
WorkOrder.belongsTo(User, { foreignKey: 'assigneeId', as: 'assignee' });

Delivery.belongsTo(Appointment, { foreignKey: 'appointmentId', as: 'appointment' });

module.exports = {
  sequelize,
  User,
  Package,
  Costume,
  Customer,
  Appointment,
  Schedule,
  Photo,
  WorkOrder,
  Delivery
};
