const User = require('./User');
const Worker = require('./Worker');
const WorkerCertificate = require('./WorkerCertificate');
const Package = require('./Package');
const Booking = require('./Booking');
const BookingSlot = require('./BookingSlot');
const ServicePhoto = require('./ServicePhoto');
const WorkHour = require('./WorkHour');
const Salary = require('./Salary');
const Coupon = require('./Coupon');
const UserCoupon = require('./UserCoupon');

User.hasOne(Worker, { foreignKey: 'userId', as: 'workerProfile' });
Worker.belongsTo(User, { foreignKey: 'userId', as: 'user' });

Worker.hasMany(WorkerCertificate, { foreignKey: 'workerId', as: 'certificates' });
WorkerCertificate.belongsTo(Worker, { foreignKey: 'workerId', as: 'worker' });

Booking.belongsTo(User, { foreignKey: 'userId', as: 'user' });
Booking.belongsTo(Worker, { foreignKey: 'workerId', as: 'worker' });
Booking.belongsTo(Package, { foreignKey: 'packageId', as: 'package' });

User.hasMany(Booking, { foreignKey: 'userId', as: 'bookings' });
Worker.hasMany(Booking, { foreignKey: 'workerId', as: 'bookings' });
Package.hasMany(Booking, { foreignKey: 'packageId', as: 'bookings' });

Booking.hasMany(BookingSlot, { foreignKey: 'bookingId', as: 'slots' });
BookingSlot.belongsTo(Booking, { foreignKey: 'bookingId', as: 'booking' });
Worker.hasMany(BookingSlot, { foreignKey: 'workerId', as: 'slots' });
BookingSlot.belongsTo(Worker, { foreignKey: 'workerId', as: 'worker' });

Booking.hasMany(ServicePhoto, { foreignKey: 'bookingId', as: 'servicePhotos' });
ServicePhoto.belongsTo(Booking, { foreignKey: 'bookingId', as: 'booking' });

WorkHour.belongsTo(Worker, { foreignKey: 'workerId', as: 'worker' });
WorkHour.belongsTo(Booking, { foreignKey: 'bookingId', as: 'booking' });
Worker.hasMany(WorkHour, { foreignKey: 'workerId', as: 'workHours' });
Booking.hasOne(WorkHour, { foreignKey: 'bookingId', as: 'workHour' });
WorkHour.belongsTo(Salary, { foreignKey: 'salaryId', as: 'salary' });

Salary.belongsTo(Worker, { foreignKey: 'workerId', as: 'worker' });
Worker.hasMany(Salary, { foreignKey: 'workerId', as: 'salaries' });
Salary.hasMany(WorkHour, { foreignKey: 'salaryId', as: 'workHours' });

UserCoupon.belongsTo(User, { foreignKey: 'userId', as: 'user' });
UserCoupon.belongsTo(Coupon, { foreignKey: 'couponId', as: 'coupon' });
User.hasMany(UserCoupon, { foreignKey: 'userId', as: 'coupons' });
Coupon.hasMany(UserCoupon, { foreignKey: 'couponId', as: 'userCoupons' });

module.exports = {
  User,
  Worker,
  WorkerCertificate,
  Package,
  Booking,
  BookingSlot,
  ServicePhoto,
  WorkHour,
  Salary,
  Coupon,
  UserCoupon,
};
