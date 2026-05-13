require('dotenv').config();
const { User, Package, Costume } = require('../models');

const seed = async () => {
  try {
    console.log('开始初始化数据...');

    const admin = await User.create({
      username: 'admin',
      password: '123456',
      name: '系统管理员',
      role: 'admin',
      status: 'active'
    });
    console.log('管理员账号创建成功:', admin.username);

    await User.create({
      username: 'photographer1',
      password: '123456',
      name: '张摄影师',
      phone: '13800138001',
      role: 'photographer',
      status: 'active'
    });
    console.log('摄影师账号创建成功');

    await User.create({
      username: 'stylist1',
      password: '123456',
      name: '李化妆师',
      phone: '13800138002',
      role: 'stylist',
      status: 'active'
    });
    console.log('化妆师账号创建成功');

    await Package.create({
      name: '婚纱摄影套餐A',
      type: 'wedding',
      price: 5999,
      description: '包含室内+室外拍摄，精修50张',
      photoCount: 50,
      originalPhotoCount: 200,
      status: 'active',
      sort: 1
    });

    await Package.create({
      name: '艺术照套餐',
      type: 'art',
      price: 2999,
      description: '室内拍摄，精修30张',
      photoCount: 30,
      originalPhotoCount: 150,
      status: 'active',
      sort: 2
    });

    await Package.create({
      name: '儿童摄影套餐',
      type: 'children',
      price: 1999,
      description: '儿童主题拍摄，精修20张',
      photoCount: 20,
      originalPhotoCount: 100,
      status: 'active',
      sort: 3
    });
    console.log('套餐数据创建成功');

    await Costume.create({
      name: '白色拖尾婚纱',
      category: 'wedding',
      gender: 'female',
      size: 'M',
      color: '白色',
      status: 'available'
    });

    await Costume.create({
      name: '男士西装',
      category: 'wedding',
      gender: 'male',
      size: 'L',
      color: '黑色',
      status: 'available'
    });

    await Costume.create({
      name: '儿童公主裙',
      category: 'children',
      gender: 'child',
      size: '120',
      color: '粉色',
      status: 'available'
    });
    console.log('服装数据创建成功');

    console.log('数据初始化完成！');
    console.log('默认账号:');
    console.log('  管理员: admin / 123456');
    process.exit(0);
  } catch (error) {
    console.error('数据初始化失败:', error);
    process.exit(1);
  }
};

seed();
