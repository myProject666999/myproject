const { Op } = require('sequelize');
const { Recipe, RecipeIngredient, RecipeStep, User, Like, Favorite } = require('../models');

const getRecipeList = async (ctx) => {
  const {
    page = 1,
    pageSize = 10,
    category,
    flavor,
    difficulty,
    keyword,
    sortBy = 'created_at',
    sortOrder = 'DESC'
  } = ctx.query;

  const where = {};
  if (category) where.category = category;
  if (flavor) where.flavor = flavor;
  if (difficulty) where.difficulty = difficulty;
  if (keyword) {
    where[Op.or] = [
      { title: { [Op.like]: `%${keyword}%` } },
      { description: { [Op.like]: `%${keyword}%` } }
    ];
  }

  const order = [[sortBy, sortOrder.toUpperCase()]];

  const { count, rows } = await Recipe.findAndCountAll({
    where,
    include: [
      { model: User, as: 'author', attributes: ['id', 'username', 'avatar'] }
    ],
    order,
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

const getRecipeDetail = async (ctx) => {
  const { id } = ctx.params;
  const userId = ctx.state.user?.id;

  const recipe = await Recipe.findByPk(id, {
    include: [
      { model: User, as: 'author', attributes: ['id', 'username', 'avatar'] },
      { model: RecipeIngredient, as: 'ingredients' },
      { model: RecipeStep, as: 'steps', order: [['step_order', 'ASC']] }
    ]
  });

  if (!recipe) {
    ctx.status = 404;
    ctx.body = { message: '菜谱不存在' };
    return;
  }

  let isLiked = false;
  let isFavorited = false;

  if (userId) {
    const like = await Like.findOne({ where: { user_id: userId, recipe_id: id } });
    const favorite = await Favorite.findOne({ where: { user_id: userId, recipe_id: id } });
    isLiked = !!like;
    isFavorited = !!favorite;
  }

  ctx.status = 200;
  ctx.body = {
    message: '获取成功',
    data: {
      ...recipe.toJSON(),
      isLiked,
      isFavorited
    }
  };
};

const createRecipe = async (ctx) => {
  const userId = ctx.state.user.id;
  const {
    title,
    description,
    cover_image,
    category,
    flavor,
    difficulty,
    cook_time,
    servings,
    ingredients,
    steps
  } = ctx.request.body;

  if (!title || !category || !flavor || !difficulty || !cook_time || !servings) {
    ctx.status = 400;
    ctx.body = { message: '请填写完整信息' };
    return;
  }

  if (!ingredients || ingredients.length === 0) {
    ctx.status = 400;
    ctx.body = { message: '请添加至少一种食材' };
    return;
  }

  if (!steps || steps.length === 0) {
    ctx.status = 400;
    ctx.body = { message: '请添加至少一个步骤' };
    return;
  }

  const recipe = await Recipe.create({
    title,
    description,
    cover_image,
    category,
    flavor,
    difficulty,
    cook_time,
    servings,
    user_id: userId
  });

  const ingredientData = ingredients.map((ing, index) => ({
    recipe_id: recipe.id,
    name: ing.name,
    amount: ing.amount,
    unit: ing.unit || null,
    is_optional: ing.is_optional || false
  }));
  await RecipeIngredient.bulkCreate(ingredientData);

  const stepData = steps.map((step, index) => ({
    recipe_id: recipe.id,
    step_order: index + 1,
    content: step.content,
    image: step.image || null
  }));
  await RecipeStep.bulkCreate(stepData);

  ctx.status = 201;
  ctx.body = {
    message: '创建成功',
    data: { id: recipe.id }
  };
};

const updateRecipe = async (ctx) => {
  const userId = ctx.state.user.id;
  const { id } = ctx.params;
  const {
    title,
    description,
    cover_image,
    category,
    flavor,
    difficulty,
    cook_time,
    servings,
    ingredients,
    steps
  } = ctx.request.body;

  const recipe = await Recipe.findByPk(id);
  if (!recipe) {
    ctx.status = 404;
    ctx.body = { message: '菜谱不存在' };
    return;
  }

  if (recipe.user_id !== userId) {
    ctx.status = 403;
    ctx.body = { message: '无权限修改' };
    return;
  }

  if (title !== undefined) recipe.title = title;
  if (description !== undefined) recipe.description = description;
  if (cover_image !== undefined) recipe.cover_image = cover_image;
  if (category !== undefined) recipe.category = category;
  if (flavor !== undefined) recipe.flavor = flavor;
  if (difficulty !== undefined) recipe.difficulty = difficulty;
  if (cook_time !== undefined) recipe.cook_time = cook_time;
  if (servings !== undefined) recipe.servings = servings;

  await recipe.save();

  if (ingredients) {
    await RecipeIngredient.destroy({ where: { recipe_id: id } });
    const ingredientData = ingredients.map((ing) => ({
      recipe_id: id,
      name: ing.name,
      amount: ing.amount,
      unit: ing.unit || null,
      is_optional: ing.is_optional || false
    }));
    await RecipeIngredient.bulkCreate(ingredientData);
  }

  if (steps) {
    await RecipeStep.destroy({ where: { recipe_id: id } });
    const stepData = steps.map((step, index) => ({
      recipe_id: id,
      step_order: index + 1,
      content: step.content,
      image: step.image || null
    }));
    await RecipeStep.bulkCreate(stepData);
  }

  ctx.status = 200;
  ctx.body = { message: '更新成功' };
};

const deleteRecipe = async (ctx) => {
  const userId = ctx.state.user.id;
  const { id } = ctx.params;

  const recipe = await Recipe.findByPk(id);
  if (!recipe) {
    ctx.status = 404;
    ctx.body = { message: '菜谱不存在' };
    return;
  }

  if (recipe.user_id !== userId) {
    ctx.status = 403;
    ctx.body = { message: '无权限删除' };
    return;
  }

  await recipe.destroy();
  ctx.status = 200;
  ctx.body = { message: '删除成功' };
};

const getMyRecipes = async (ctx) => {
  const userId = ctx.state.user.id;
  const { page = 1, pageSize = 10 } = ctx.query;

  const { count, rows } = await Recipe.findAndCountAll({
    where: { user_id: userId },
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

module.exports = {
  getRecipeList,
  getRecipeDetail,
  createRecipe,
  updateRecipe,
  deleteRecipe,
  getMyRecipes
};
