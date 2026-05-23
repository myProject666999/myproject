const { MenuPlan, Recipe, RecipeIngredient, ShoppingList } = require('../models');
const { Op } = require('sequelize');

const getWeekMenu = async (ctx) => {
  const userId = ctx.state.user.id;
  const { week_start_date } = ctx.query;

  let startDate;
  if (week_start_date) {
    startDate = new Date(week_start_date);
  } else {
    const today = new Date();
    const day = today.getDay();
    const diff = today.getDate() - day + (day === 0 ? -6 : 1);
    startDate = new Date(today.setDate(diff));
  }
  startDate.setHours(0, 0, 0, 0);

  const menuPlans = await MenuPlan.findAll({
    where: {
      user_id: userId,
      week_start_date: startDate
    },
    include: [
      {
        model: Recipe,
        as: 'recipe',
        attributes: ['id', 'title', 'cover_image', 'category']
      }
    ],
    order: [['week_day', 'ASC'], ['meal_type', 'ASC']]
  });

  const weekDays = ['星期一', '星期二', '星期三', '星期四', '星期五', '星期六', '星期日'];
  const mealTypes = ['早餐', '午餐', '晚餐', '加餐'];

  const result = {};
  weekDays.forEach(day => {
    result[day] = {};
    mealTypes.forEach(meal => {
      result[day][meal] = menuPlans.filter(
        item => item.week_day === day && item.meal_type === meal
      ).map(item => ({
        id: item.id,
        recipe: item.recipe
      }));
    });
  });

  ctx.status = 200;
  ctx.body = {
    message: '获取成功',
    data: {
      week_start_date: startDate,
      menu: result
    }
  };
};

const addToMenu = async (ctx) => {
  const userId = ctx.state.user.id;
  const { recipe_id, week_day, meal_type, week_start_date } = ctx.request.body;

  if (!recipe_id || !week_day || !meal_type) {
    ctx.status = 400;
    ctx.body = { message: '请填写完整信息' };
    return;
  }

  const recipe = await Recipe.findByPk(recipe_id);
  if (!recipe) {
    ctx.status = 404;
    ctx.body = { message: '菜谱不存在' };
    return;
  }

  let startDate;
  if (week_start_date) {
    startDate = new Date(week_start_date);
  } else {
    const today = new Date();
    const day = today.getDay();
    const diff = today.getDate() - day + (day === 0 ? -6 : 1);
    startDate = new Date(today.setDate(diff));
  }
  startDate.setHours(0, 0, 0, 0);

  const menuPlan = await MenuPlan.create({
    user_id: userId,
    recipe_id,
    week_day,
    meal_type,
    week_start_date: startDate
  });

  ctx.status = 201;
  ctx.body = {
    message: '添加成功',
    data: menuPlan
  };
};

const removeFromMenu = async (ctx) => {
  const userId = ctx.state.user.id;
  const { id } = ctx.params;

  const menuPlan = await MenuPlan.findByPk(id);
  if (!menuPlan) {
    ctx.status = 404;
    ctx.body = { message: '菜单项不存在' };
    return;
  }

  if (menuPlan.user_id !== userId) {
    ctx.status = 403;
    ctx.body = { message: '无权限删除' };
    return;
  }

  await menuPlan.destroy();
  ctx.status = 200;
  ctx.body = { message: '删除成功' };
};

const generateShoppingList = async (ctx) => {
  const userId = ctx.state.user.id;
  const { week_start_date } = ctx.query;

  let startDate;
  if (week_start_date) {
    startDate = new Date(week_start_date);
  } else {
    const today = new Date();
    const day = today.getDay();
    const diff = today.getDate() - day + (day === 0 ? -6 : 1);
    startDate = new Date(today.setDate(diff));
  }
  startDate.setHours(0, 0, 0, 0);

  const menuPlans = await MenuPlan.findAll({
    where: {
      user_id: userId,
      week_start_date: startDate
    },
    attributes: ['recipe_id']
  });

  if (menuPlans.length === 0) {
    ctx.status = 200;
    ctx.body = {
      message: '获取成功',
      data: []
    };
    return;
  }

  const recipeIds = [...new Set(menuPlans.map(item => item.recipe_id))];

  const ingredients = await RecipeIngredient.findAll({
    where: {
      recipe_id: { [Op.in]: recipeIds }
    },
    attributes: ['name', 'amount', 'unit']
  });

  const aggregated = {};
  ingredients.forEach(ing => {
    const key = `${ing.name}_${ing.unit || 'no_unit'}`;
    if (!aggregated[key]) {
      aggregated[key] = {
        name: ing.name,
        amount: parseFloat(ing.amount) || 0,
        unit: ing.unit,
        count: 1
      };
    } else {
      const amount = parseFloat(ing.amount);
      if (!isNaN(amount)) {
        aggregated[key].amount += amount;
      }
      aggregated[key].count++;
    }
  });

  const shoppingList = Object.values(aggregated).map(item => ({
    ingredient_name: item.name,
    total_amount: item.amount > 0 ? `${item.amount}${item.unit || ''}` : '适量',
    is_checked: false
  }));

  await ShoppingList.destroy({
    where: {
      user_id: userId,
      week_start_date: startDate
    }
  });

  const savedList = await ShoppingList.bulkCreate(
    shoppingList.map(item => ({
      user_id: userId,
      week_start_date: startDate,
      ...item
    }))
  );

  ctx.status = 200;
  ctx.body = {
    message: '生成成功',
    data: savedList
  };
};

const getShoppingList = async (ctx) => {
  const userId = ctx.state.user.id;
  const { week_start_date } = ctx.query;

  let startDate;
  if (week_start_date) {
    startDate = new Date(week_start_date);
  } else {
    const today = new Date();
    const day = today.getDay();
    const diff = today.getDate() - day + (day === 0 ? -6 : 1);
    startDate = new Date(today.setDate(diff));
  }
  startDate.setHours(0, 0, 0, 0);

  const shoppingList = await ShoppingList.findAll({
    where: {
      user_id: userId,
      week_start_date: startDate
    },
    order: [['ingredient_name', 'ASC']]
  });

  ctx.status = 200;
  ctx.body = {
    message: '获取成功',
    data: shoppingList
  };
};

const toggleShoppingItem = async (ctx) => {
  const userId = ctx.state.user.id;
  const { id } = ctx.params;
  const { is_checked } = ctx.request.body;

  const item = await ShoppingList.findByPk(id);
  if (!item) {
    ctx.status = 404;
    ctx.body = { message: '购物项不存在' };
    return;
  }

  if (item.user_id !== userId) {
    ctx.status = 403;
    ctx.body = { message: '无权限修改' };
    return;
  }

  item.is_checked = is_checked !== undefined ? is_checked : !item.is_checked;
  await item.save();

  ctx.status = 200;
  ctx.body = {
    message: '更新成功',
    data: item
  };
};

module.exports = {
  getWeekMenu,
  addToMenu,
  removeFromMenu,
  generateShoppingList,
  getShoppingList,
  toggleShoppingItem
};
