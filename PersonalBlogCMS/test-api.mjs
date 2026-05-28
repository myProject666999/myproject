import http from 'http';

function makeRequest(options, data = null) {
  return new Promise((resolve, reject) => {
    const req = http.request(options, (res) => {
      let body = '';
      res.on('data', (chunk) => body += chunk);
      res.on('end', () => {
        try {
          resolve({ status: res.statusCode, data: JSON.parse(body) });
        } catch (e) {
          resolve({ status: res.statusCode, data: body });
        }
      });
    });
    req.on('error', reject);
    if (data) {
      req.write(JSON.stringify(data));
    }
    req.end();
  });
}

async function test() {
  const baseOptions = {
    hostname: 'localhost',
    port: 5182,
    headers: {
      'Content-Type': 'application/json',
    },
  };

  console.log('=== 测试文章详情接口 ===');
  try {
    const result = await makeRequest({
      ...baseOptions,
      path: '/api/articles/1',
      method: 'GET',
    });
    console.log('状态码:', result.status);
    console.log('响应:', JSON.stringify(result.data, null, 2));
  } catch (e) {
    console.error('请求失败:', e.message);
  }

  console.log('\n=== 测试热门文章统计接口 ===');
  try {
    const result = await makeRequest({
      ...baseOptions,
      path: '/api/stats/popular?limit=5',
      method: 'GET',
    });
    console.log('状态码:', result.status);
    console.log('响应:', JSON.stringify(result.data, null, 2));
  } catch (e) {
    console.error('请求失败:', e.message);
  }

  console.log('\n=== 测试登录接口 ===');
  try {
    const result = await makeRequest({
      ...baseOptions,
      path: '/api/auth/login',
      method: 'POST',
    }, { username: 'admin', password: 'admin123' });
    console.log('状态码:', result.status);
    console.log('响应:', JSON.stringify(result.data, null, 2));
  } catch (e) {
    console.error('请求失败:', e.message);
  }
}

test();
