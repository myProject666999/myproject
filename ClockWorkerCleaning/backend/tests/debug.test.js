require('dotenv').config();

const bcrypt = require('bcryptjs');
const sequelize = require('../src/config/database');
const { User, Worker, Package, Coupon } = require('../src/models/associations');
const { generateToken } = require('../src/utils/jwt');

async function debug() {
  console.log('=== 数据库调试 ===');
  
  try {
    await sequelize.authenticate();
    console.log('✅ 数据库连接成功');
    
    const users = await User.findAll();
    console.log('\n用户列表:');
    users.forEach(u => {
      console.log(`  - ${u.phone} (${u.role})`);
    });
    
    const user = await User.findOne({ where: { phone: '13800000001' } });
    if (user) {
      console.log('\n✅ 找到测试用户 13800000001');
      console.log('   用户ID:', user.id);
      console.log('   角色:', user.role);
      console.log('   状态:', user.status);
      
      const passwordMatch = bcrypt.compareSync('123456', user.password);
      console.log('   密码验证:', passwordMatch ? '✅ 通过' : '❌ 失败');
      
      if (passwordMatch) {
        const token = generateToken({
          id: user.id,
          phone: user.phone,
          role: user.role,
        });
        console.log('   Token生成:', token ? '✅ 成功' : '❌ 失败');
        console.log('   Token预览:', token.substring(0, 30) + '...');
      }
    } else {
      console.log('\n❌ 未找到测试用户 13800000001');
    }
    
    const packages = await Package.findAll();
    console.log('\n套餐列表:');
    packages.forEach(p => {
      console.log(`  - ${p.name} ¥${p.pricePerHour}/h`);
    });
    
    const workers = await Worker.findAll();
    console.log('\n阿姨列表:');
    workers.forEach(w => {
      console.log(`  - ${w.realName}`);
    });
    
    const coupons = await Coupon.findAll();
    console.log('\n优惠券列表:');
    coupons.forEach(c => {
      console.log(`  - ${c.name} (${c.type})`);
    });
    
    console.log('\n=== 所有检查通过 ===');
    process.exit(0);
  } catch (e) {
    console.error('\n❌ 错误:', e.message);
    console.error(e.stack);
    process.exit(1);
  }
}

debug();
