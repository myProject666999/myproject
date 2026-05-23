const sequelize = require('./src/config/database');
const { User, Recipe, RecipeIngredient, RecipeStep } = require('./src/models');
const bcrypt = require('bcryptjs');

async function seedData() {
  try {
    await sequelize.authenticate();
    console.log('数据库连接成功');

    const hashedPassword = await bcrypt.hash('123456', 10);

    const user = await User.findOrCreate({
      where: { username: 'demo_user' },
      defaults: {
        username: 'demo_user',
        email: 'demo@example.com',
        password: hashedPassword,
        bio: '这是一个演示账号'
      }
    });

    const userId = user[0].id;

    const recipesData = [
      {
        title: '西红柿炒鸡蛋',
        description: '经典家常菜，简单美味，下饭必备',
        category: '家常菜',
        flavor: '咸鲜',
        difficulty: '简单',
        cook_time: 15,
        servings: 2,
        ingredients: [
          { name: '西红柿', amount: '2', unit: '个' },
          { name: '鸡蛋', amount: '3', unit: '个' },
          { name: '葱花', amount: '适量', is_optional: true },
          { name: '盐', amount: '适量' },
          { name: '糖', amount: '少许', is_optional: true }
        ],
        steps: [
          { content: '西红柿洗净切块，鸡蛋打散加少许盐' },
          { content: '热锅凉油，倒入蛋液炒至凝固盛出' },
          { content: '锅中加油，放入西红柿翻炒出汁' },
          { content: '加入炒好的鸡蛋，加盐和糖调味，翻炒均匀出锅' }
        ]
      },
      {
        title: '麻婆豆腐',
        description: '四川传统名菜，麻辣鲜香',
        category: '川菜',
        flavor: '麻辣',
        difficulty: '中等',
        cook_time: 30,
        servings: 3,
        ingredients: [
          { name: '豆腐', amount: '1', unit: '块' },
          { name: '牛肉末', amount: '100', unit: '克' },
          { name: '豆瓣酱', amount: '2', unit: '勺' },
          { name: '花椒粉', amount: '1', unit: '勺' },
          { name: '葱姜蒜', amount: '适量', is_optional: true }
        ],
        steps: [
          { content: '豆腐切成小块，用淡盐水浸泡10分钟' },
          { content: '锅中热油，放入牛肉末炒至变色' },
          { content: '加入豆瓣酱炒出红油' },
          { content: '加入适量水烧开，放入豆腐轻轻推动' },
          { content: '小火煮5分钟，勾芡撒花椒粉和葱花出锅' }
        ]
      },
      {
        title: '清蒸鲈鱼',
        description: '清淡健康，保留鱼肉原汁原味',
        category: '粤菜',
        flavor: '清淡',
        difficulty: '中等',
        cook_time: 25,
        servings: 2,
        ingredients: [
          { name: '鲈鱼', amount: '1', unit: '条' },
          { name: '葱姜', amount: '适量' },
          { name: '蒸鱼豉油', amount: '3', unit: '勺' },
          { name: '料酒', amount: '1', unit: '勺', is_optional: true }
        ],
        steps: [
          { content: '鲈鱼处理干净，两面划几刀' },
          { content: '鱼身抹上料酒，放上葱姜' },
          { content: '水开后蒸8分钟，关火虚蒸2分钟' },
          { content: '取出倒掉汤汁，淋上蒸鱼豉油，泼上热油即可' }
        ]
      },
      {
        title: '红烧肉',
        description: '肥而不腻，入口即化的经典红烧肉',
        category: '家常菜',
        flavor: '咸鲜',
        difficulty: '中等',
        cook_time: 60,
        servings: 4,
        ingredients: [
          { name: '五花肉', amount: '500', unit: '克' },
          { name: '冰糖', amount: '30', unit: '克' },
          { name: '生抽', amount: '2', unit: '勺' },
          { name: '老抽', amount: '1', unit: '勺' },
          { name: '料酒', amount: '2', unit: '勺' }
        ],
        steps: [
          { content: '五花肉切块，冷水下锅焯水去血沫' },
          { content: '锅中放少许油，加入冰糖炒糖色' },
          { content: '糖色变红后放入肉块翻炒上色' },
          { content: '加入生抽、老抽、料酒和热水' },
          { content: '小火炖煮40分钟，大火收汁即可' }
        ]
      },
      {
        title: '紫菜蛋花汤',
        description: '简单快手的营养汤品',
        category: '汤羹',
        flavor: '清淡',
        difficulty: '简单',
        cook_time: 10,
        servings: 2,
        ingredients: [
          { name: '紫菜', amount: '1', unit: '张' },
          { name: '鸡蛋', amount: '2', unit: '个' },
          { name: '葱花', amount: '适量' },
          { name: '盐', amount: '适量' },
          { name: '香油', amount: '少许', is_optional: true }
        ],
        steps: [
          { content: '锅中加水烧开，放入紫菜' },
          { content: '蛋液慢慢淋入锅中，形成蛋花' },
          { content: '加盐和香油调味，撒上葱花出锅' }
        ]
      },
      {
        title: '蛋炒饭',
        description: '粒粒分明，蛋香浓郁',
        category: '主食',
        flavor: '咸鲜',
        difficulty: '简单',
        cook_time: 15,
        servings: 1,
        ingredients: [
          { name: '米饭', amount: '1', unit: '碗' },
          { name: '鸡蛋', amount: '2', unit: '个' },
          { name: '葱花', amount: '适量' },
          { name: '盐', amount: '适量' }
        ],
        steps: [
          { content: '鸡蛋打散，米饭打散备用' },
          { content: '锅中多放些油，倒入蛋液快速翻炒' },
          { content: '蛋液半凝固时倒入米饭' },
          { content: '大火翻炒均匀，加盐调味出锅' }
        ]
      }
    ];

    for (const recipeData of recipesData) {
      const existing = await Recipe.findOne({ where: { title: recipeData.title, user_id: userId } });
      if (existing) {
        console.log(`菜谱 "${recipeData.title}" 已存在，跳过`);
        continue;
      }

      const recipe = await Recipe.create({
        title: recipeData.title,
        description: recipeData.description,
        category: recipeData.category,
        flavor: recipeData.flavor,
        difficulty: recipeData.difficulty,
        cook_time: recipeData.cook_time,
        servings: recipeData.servings,
        user_id: userId
      });

      const ingredients = recipeData.ingredients.map((ing, index) => ({
        recipe_id: recipe.id,
        name: ing.name,
        amount: ing.amount,
        unit: ing.unit || null,
        is_optional: ing.is_optional || false
      }));
      await RecipeIngredient.bulkCreate(ingredients);

      const steps = recipeData.steps.map((step, index) => ({
        recipe_id: recipe.id,
        step_order: index + 1,
        content: step.content,
        image: null
      }));
      await RecipeStep.bulkCreate(steps);

      console.log(`菜谱 "${recipeData.title}" 创建成功`);
    }

    console.log('数据初始化完成！');
    console.log('演示账号: demo_user');
    console.log('密码: 123456');

    await sequelize.close();
  } catch (error) {
    console.error('初始化数据失败:', error);
    await sequelize.close();
  }
}

seedData();
