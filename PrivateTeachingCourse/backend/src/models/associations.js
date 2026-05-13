const User = require('./User');
const Coach = require('./Coach');
const Course = require('./Course');
const Booking = require('./Booking');
const Checkin = require('./Checkin');
const TrainingRecord = require('./TrainingRecord');
const Exercise = require('./Exercise');
const BodyTest = require('./BodyTest');
const SuccessStory = require('./SuccessStory');
const CommunityPost = require('./CommunityPost');
const Comment = require('./Comment');
const Like = require('./Like');

function setupAssociations() {
  User.hasOne(Coach, { foreignKey: 'userId' });
  Coach.belongsTo(User, { foreignKey: 'userId' });

  Coach.hasMany(Course, { foreignKey: 'coachId' });
  Course.belongsTo(Coach, { foreignKey: 'coachId' });

  Coach.hasMany(SuccessStory, { foreignKey: 'coachId' });
  SuccessStory.belongsTo(Coach, { foreignKey: 'coachId' });

  Course.hasMany(Booking, { foreignKey: 'courseId' });
  Booking.belongsTo(Course, { foreignKey: 'courseId' });

  User.hasMany(Booking, { foreignKey: 'userId' });
  Booking.belongsTo(User, { foreignKey: 'userId' });

  Booking.hasOne(Checkin, { foreignKey: 'bookingId' });
  Checkin.belongsTo(Booking, { foreignKey: 'bookingId' });

  Course.hasMany(Checkin, { foreignKey: 'courseId' });
  Checkin.belongsTo(Course, { foreignKey: 'courseId' });

  User.hasMany(Checkin, { foreignKey: 'userId' });
  Checkin.belongsTo(User, { foreignKey: 'userId' });

  User.hasMany(TrainingRecord, { foreignKey: 'userId' });
  TrainingRecord.belongsTo(User, { foreignKey: 'userId' });

  Course.hasMany(TrainingRecord, { foreignKey: 'courseId' });
  TrainingRecord.belongsTo(Course, { foreignKey: 'courseId' });

  TrainingRecord.hasMany(Exercise, { foreignKey: 'trainingRecordId' });
  Exercise.belongsTo(TrainingRecord, { foreignKey: 'trainingRecordId' });

  User.hasMany(BodyTest, { foreignKey: 'userId' });
  BodyTest.belongsTo(User, { foreignKey: 'userId' });

  User.hasMany(CommunityPost, { foreignKey: 'userId' });
  CommunityPost.belongsTo(User, { foreignKey: 'userId' });

  CommunityPost.hasMany(Comment, { foreignKey: 'postId' });
  Comment.belongsTo(CommunityPost, { foreignKey: 'postId' });

  User.hasMany(Comment, { foreignKey: 'userId' });
  Comment.belongsTo(User, { foreignKey: 'userId' });

  CommunityPost.hasMany(Like, { foreignKey: 'postId' });
  Like.belongsTo(CommunityPost, { foreignKey: 'postId' });

  User.hasMany(Like, { foreignKey: 'userId' });
  Like.belongsTo(User, { foreignKey: 'userId' });
}

module.exports = { setupAssociations };
