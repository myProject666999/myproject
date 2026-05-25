const User = require('./User');
const Category = require('./Category');
const Document = require('./Document');
const Slide = require('./Slide');
const Like = require('./Like');
const Favorite = require('./Favorite');
const Download = require('./Download');
const Share = require('./Share');
const Comment = require('./Comment');

User.hasMany(Document, { foreignKey: 'user_id' });
Document.belongsTo(User, { foreignKey: 'user_id', as: 'user' });

Category.hasMany(Document, { foreignKey: 'category_id' });
Document.belongsTo(Category, { foreignKey: 'category_id', as: 'category' });

Document.hasMany(Slide, { foreignKey: 'document_id' });
Slide.belongsTo(Document, { foreignKey: 'document_id' });

Document.hasMany(Like, { foreignKey: 'document_id' });
Like.belongsTo(Document, { foreignKey: 'document_id' });
User.hasMany(Like, { foreignKey: 'user_id' });
Like.belongsTo(User, { foreignKey: 'user_id' });

Document.hasMany(Favorite, { foreignKey: 'document_id' });
Favorite.belongsTo(Document, { foreignKey: 'document_id' });
User.hasMany(Favorite, { foreignKey: 'user_id' });
Favorite.belongsTo(User, { foreignKey: 'user_id' });

Document.hasMany(Download, { foreignKey: 'document_id' });
Download.belongsTo(Document, { foreignKey: 'document_id' });
User.hasMany(Download, { foreignKey: 'user_id' });
Download.belongsTo(User, { foreignKey: 'user_id' });

Document.hasMany(Share, { foreignKey: 'document_id' });
Share.belongsTo(Document, { foreignKey: 'document_id' });
User.hasMany(Share, { foreignKey: 'user_id' });
Share.belongsTo(User, { foreignKey: 'user_id' });

Document.hasMany(Comment, { foreignKey: 'document_id' });
Comment.belongsTo(Document, { foreignKey: 'document_id' });
User.hasMany(Comment, { foreignKey: 'user_id' });
Comment.belongsTo(User, { foreignKey: 'user_id' });

Comment.hasMany(Comment, { foreignKey: 'parent_id', as: 'replies' });
Comment.belongsTo(Comment, { foreignKey: 'parent_id', as: 'parent' });

module.exports = {
  User,
  Category,
  Document,
  Slide,
  Like,
  Favorite,
  Download,
  Share,
  Comment
};
