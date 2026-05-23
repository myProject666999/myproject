const { Comment, User, Recipe } = require('../models');

const getComments = async (ctx) => {
  const { recipeId } = ctx.params;
  const { page = 1, pageSize = 20 } = ctx.query;

  const { count, rows } = await Comment.findAndCountAll({
    where: { recipe_id: recipeId, parent_id: null },
    include: [
      { model: User, as: 'author', attributes: ['id', 'username', 'avatar'] }
    ],
    order: [['created_at', 'DESC']],
    limit: parseInt(pageSize),
    offset: (parseInt(page) - 1) * parseInt(pageSize)
  });

  ctx.status = 200;
  ctx.body = {
    message: '获取成功',
    data: {
      list: rows,
      total: count,
      page: parseInt(page),
      pageSize: parseInt(pageSize)
    }
  };
};

const createComment = async (ctx) => {
  const userId = ctx.state.user.id;
  const { recipeId } = ctx.params;
  const { content, parent_id } = ctx.request.body;

  if (!content || content.trim() === '') {
    ctx.status = 400;
    ctx.body = { message: '评论内容不能为空' };
    return;
  }

  const recipe = await Recipe.findByPk(recipeId);
  if (!recipe) {
    ctx.status = 404;
    ctx.body = { message: '菜谱不存在' };
    return;
  }

  const comment = await Comment.create({
    user_id: userId,
    recipe_id: recipeId,
    content: content.trim(),
    parent_id: parent_id || null
  });

  await recipe.increment('comments_count');

  const newComment = await Comment.findByPk(comment.id, {
    include: [
      { model: User, as: 'author', attributes: ['id', 'username', 'avatar'] }
    ]
  });

  ctx.status = 201;
  ctx.body = {
    message: '评论成功',
    data: newComment
  };
};

const deleteComment = async (ctx) => {
  const userId = ctx.state.user.id;
  const { id } = ctx.params;

  const comment = await Comment.findByPk(id);
  if (!comment) {
    ctx.status = 404;
    ctx.body = { message: '评论不存在' };
    return;
  }

  if (comment.user_id !== userId) {
    ctx.status = 403;
    ctx.body = { message: '无权限删除' };
    return;
  }

  const recipe = await Recipe.findByPk(comment.recipe_id);
  await comment.destroy();
  if (recipe) {
    await recipe.decrement('comments_count');
  }

  ctx.status = 200;
  ctx.body = { message: '删除成功' };
};

module.exports = {
  getComments,
  createComment,
  deleteComment
};
