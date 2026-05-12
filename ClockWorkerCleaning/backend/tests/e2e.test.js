const http = require('http');

const API_HOST = 'localhost';
const API_PORT = 3000;

function request(path, method = 'GET', data = null, headers = {}) {
  return new Promise((resolve, reject) => {
    const body = data ? JSON.stringify(data) : null;
    const options = {
      hostname: API_HOST,
      port: API_PORT,
      path: `/api${path}`,
      method,
      headers: {
        'Content-Type': 'application/json',
        ...headers,
      },
    };
    
    if (body) {
      options.headers['Content-Length'] = Buffer.byteLength(body);
    }

    const req = http.request(options, (res) => {
      let responseData = '';
      
      res.on('data', (chunk) => {
        responseData += chunk;
      });
      
      res.on('end', () => {
        try {
          const parsed = responseData ? JSON.parse(responseData) : null;
          resolve({ status: res.statusCode, data: parsed });
        } catch (e) {
          resolve({ status: res.statusCode, data: responseData });
        }
      });
    });

    req.on('error', reject);
    
    if (body) {
      req.write(body);
    }
    
    req.end();
  });
}

async function testAuth() {
  console.log('\n=== 测试认证模块 ===');
  
  try {
    const loginRes = await request('/auth/login', 'POST', {
      phone: '13800000001',
      password: '123456',
    });
    
    if (loginRes.status !== 200 || loginRes.data?.code !== 0) {
      throw new Error(`登录失败: ${JSON.stringify(loginRes.data)}`);
    }
    
    console.log('✅ 登录成功');
    console.log('   Token:', loginRes.data.data.token.substring(0, 20) + '...');
    console.log('   用户角色:', loginRes.data.data.user.role);
    
    const token = loginRes.data.data.token;
    
    const profileRes = await request('/auth/profile', 'GET', null, {
      'Authorization': `Bearer ${token}`,
    });
    
    if (profileRes.status !== 200 || profileRes.data?.code !== 0) {
      throw new Error(`获取用户信息失败`);
    }
    console.log('✅ 获取用户信息成功:', profileRes.data.data.phone);
    
    return token;
  } catch (e) {
    console.log('❌ 认证失败:', e.message);
    throw e;
  }
}

async function testPackages() {
  console.log('\n=== 测试套餐模块 ===');
  
  try {
    const res = await request('/packages');
    if (res.status !== 200 || res.data?.code !== 0) {
      throw new Error('获取套餐失败');
    }
    console.log('✅ 获取套餐列表成功, 数量:', res.data.data.list.length);
    res.data.data.list.forEach(p => {
      console.log(`   - ${p.name}: ¥${p.pricePerHour}/小时`);
    });
    return res.data.data.list;
  } catch (e) {
    console.log('❌ 获取套餐失败:', e.message);
    throw e;
  }
}

async function testWorkers() {
  console.log('\n=== 测试阿姨模块 ===');
  
  try {
    const res = await request('/workers');
    if (res.status !== 200 || res.data?.code !== 0) {
      throw new Error('获取阿姨失败');
    }
    console.log('✅ 获取阿姨列表成功, 数量:', res.data.data.list.length);
    res.data.data.list.forEach(w => {
      console.log(`   - ${w.realName}: 从业${w.experience}年, 评分${w.rating}`);
    });
    return res.data.data.list;
  } catch (e) {
    console.log('❌ 获取阿姨失败:', e.message);
    throw e;
  }
}

async function testCoupons() {
  console.log('\n=== 测试优惠券模块 ===');
  
  try {
    const res = await request('/coupons/available');
    if (res.status !== 200 || res.data?.code !== 0) {
      throw new Error('获取优惠券失败');
    }
    console.log('✅ 获取可用优惠券成功, 数量:', res.data.data.list.length);
    return res.data.data.list;
  } catch (e) {
    console.log('❌ 获取优惠券失败:', e.message);
    throw e;
  }
}

async function testWorkerLogin() {
  console.log('\n=== 测试阿姨端登录 ===');
  
  try {
    const loginRes = await request('/auth/login', 'POST', {
      phone: '13900000001',
      password: '123456',
    });
    
    if (loginRes.status !== 200 || loginRes.data?.code !== 0) {
      throw new Error(`阿姨登录失败: ${JSON.stringify(loginRes.data)}`);
    }
    
    console.log('✅ 阿姨登录成功');
    console.log('   Token:', loginRes.data.data.token.substring(0, 20) + '...');
    console.log('   用户角色:', loginRes.data.data.user.role);
    
    return loginRes.data.data.token;
  } catch (e) {
    console.log('❌ 阿姨登录失败:', e.message);
    throw e;
  }
}

async function runAllTests() {
  console.log('========================================');
  console.log('  钟点工保洁预约服务平台 - E2E 测试');
  console.log('========================================');
  
  try {
    const userToken = await testAuth();
    const packages = await testPackages();
    const workers = await testWorkers();
    const coupons = await testCoupons();
    const workerToken = await testWorkerLogin();
    
    console.log('\n========================================');
    console.log('  🎉 所有 E2E 测试通过！');
    console.log('========================================');
    
    console.log('\n测试数据摘要:');
    console.log(`  - 套餐数量: ${packages.length}`);
    console.log(`  - 阿姨数量: ${workers.length}`);
    console.log(`  - 可用优惠券: ${coupons.length}`);
    
    process.exit(0);
  } catch (e) {
    console.log('\n========================================');
    console.log('  ❌ 部分测试失败');
    console.log('========================================');
    process.exit(1);
  }
}

runAllTests();
