const User = require('./User');
const Recipe = require('./Recipe');
const RecipeIngredient = require('./RecipeIngredient');
const RecipeStep = require('./RecipeStep');
const Favorite = require('./Favorite');
const Like = require('./Like');
const Comment = require('./Comment');
const MenuPlan = require('./MenuPlan');
const ShoppingList = require('./ShoppingList');

User.hasMany(Recipe, { foreignKey: 'user_id', as: 'recipes' });
Recipe.belongsTo(User, { foreignKey: 'user_id', as: 'author' });

Recipe.hasMany(RecipeIngredient, { foreignKey: 'recipe_id', as: 'ingredients' });
RecipeIngredient.belongsTo(Recipe, { foreignKey: 'recipe_id' });

Recipe.hasMany(RecipeStep, { foreignKey: 'recipe_id', as: 'steps' });
RecipeStep.belongsTo(Recipe, { foreignKey: 'recipe_id' });

User.hasMany(Favorite, { foreignKey: 'user_id' });
Favorite.belongsTo(User, { foreignKey: 'user_id' });
Recipe.hasMany(Favorite, { foreignKey: 'recipe_id' });
Favorite.belongsTo(Recipe, { foreignKey: 'recipe_id' });

User.hasMany(Like, { foreignKey: 'user_id' });
Like.belongsTo(User, { foreignKey: 'user_id' });
Recipe.hasMany(Like, { foreignKey: 'recipe_id' });
Like.belongsTo(Recipe, { foreignKey: 'recipe_id' });

User.hasMany(Comment, { foreignKey: 'user_id', as: 'comments' });
Comment.belongsTo(User, { foreignKey: 'user_id', as: 'author' });
Recipe.hasMany(Comment, { foreignKey: 'recipe_id', as: 'comments' });
Comment.belongsTo(Recipe, { foreignKey: 'recipe_id' });

User.hasMany(MenuPlan, { foreignKey: 'user_id' });
MenuPlan.belongsTo(User, { foreignKey: 'user_id' });
MenuPlan.belongsTo(Recipe, { foreignKey: 'recipe_id', as: 'recipe' });

User.hasMany(ShoppingList, { foreignKey: 'user_id' });
ShoppingList.belongsTo(User, { foreignKey: 'user_id' });

module.exports = {
  User,
  Recipe,
  RecipeIngredient,
  RecipeStep,
  Favorite,
  Like,
  Comment,
  MenuPlan,
  ShoppingList
};
