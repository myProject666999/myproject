const { Like, Favorite, Recipe } = require('../models');

const toggleLike = async (ctx) => {
  const userId = ctx.state.user.id;
  const { recipeId } = ctx.params;

  const recipe = await Recipe.findByPk(recipeId);
  if (!recipe) {
    ctx.status = 404;
    ctx.body = { message: '菜谱不存在' };
    return;
  }

  const existingLike = await Like.findOne({
    where: { user_id: userId, recipe_id: recipeId }
  });

  if (existingLike) {
    await existingLike.destroy();
    await recipe.decrement('likes_count');
    ctx.status = 200;
    ctx.body = { message: '取消点赞成功', data: { isLiked: false } };
  } else {
    await Like.create({ user_id: userId, recipe_id: recipeId });
    await recipe.increment('likes_count');
    ctx.status = 200;
    ctx.body = { message: '点赞成功', data: { isLiked: true } };
  }
};

const toggleFavorite = async (ctx) => {
  const userId = ctx.state.user.id;
  const { recipeId } = ctx.params;

  const recipe = await Recipe.findByPk(recipeId);
  if (!recipe) {
    ctx.status = 404;
    ctx.body = { message: '菜谱不存在' };
    return;
  }

  const existingFavorite = await Favorite.findOne({
    where: { user_id: userId, recipe_id: recipeId }
  });

  if (existingFavorite) {
    await existingFavorite.destroy();
    await recipe.decrement('favorites_count');
    ctx.status = 200;
    ctx.body = { message: '取消收藏成功', data: { isFavorited: false } };
  } else {
    await Favorite.create({ user_id: userId, recipe_id: recipeId });
    await recipe.increment('favorites_count');
    ctx.status = 200;
    ctx.body = { message: '收藏成功', data: { isFavorited: true } };
  }
};

const getMyFavorites = async (ctx) => {
  const userId = ctx.state.user.id;
  const { page = 1, pageSize = 10 } = ctx.query;

  const { count, rows } = await Favorite.findAndCountAll({
    where: { user_id: userId },
    include: [
      {
        model: Recipe,
        as: 'Recipe',
        include: [{ model: require('../models/User'), as: 'author', attributes: ['id', 'username', 'avatar'] }]
      }
    ],
    order: [['created_at', 'DESC']],
    limit: parseInt(pageSize),
    offset: (parseInt(page) - 1) * parseInt(pageSize)
  });

  ctx.status = 200;
  ctx.body = {
    message: '获取成功',
    data: {
      list: rows.map(item => item.Recipe),
      total: count,
      page: parseInt(page),
      pageSize: parseInt(pageSize)
    }
  };
};

module.exports = {
  toggleLike,
  toggleFavorite,
  getMyFavorites
};
