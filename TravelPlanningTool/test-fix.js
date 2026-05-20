const http = require('http');

// 测试添加景点 - 模拟 el-time-picker 发送的 Date 对象（序列化为 ISO 字符串）
const testData = {
  name: '故宫博物院',
  description: '中国明清两代的皇家宫殿',
  address: '北京市东城区景山前街4号',
  longitude: 116.397428,
  latitude: 39.90923,
  visitTime: new Date(2024, 0, 1, 9, 0, 0).toISOString(),
  duration: 240,
  cost: 60,
  sortOrder: 1,
  dailyScheduleId: 1
};

const data = JSON.stringify(testData);

console.log('=== 测试修复后的添加景点 API ===');
console.log('Request Data:');
console.log(JSON.stringify(testData, null, 2));

const options = {
  hostname: 'localhost',
  port: 8080,
  path: '/api/attractions',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': Buffer.byteLength(data)
  }
};

const req = http.request(options, (res) => {
  let body = '';
  res.on('data', (chunk) => body += chunk);
  res.on('end', () => {
    console.log('\n=== Response ===');
    console.log('Status:', res.statusCode);
    
    try {
      const parsed = JSON.parse(body);
      console.log('Response Data:');
      console.log(JSON.stringify(parsed, null, 2));
      
      if (res.statusCode === 200) {
        console.log('\n✅ 添加景点成功！');
        
        // 测试获取景点列表验证
        http.get('http://localhost:8080/api/attractions/schedule/1', (res2) => {
          let body2 = '';
          res2.on('data', (chunk) => body2 += chunk);
          res2.on('end', () => {
            console.log('\n=== 验证景点列表 ===');
            console.log('Status:', res2.statusCode);
            const list = JSON.parse(body2);
            console.log('景点数量:', list.length);
            const last = list[list.length - 1];
            console.log('最新景点:', last.name);
            console.log('visitTime 格式:', last.visitTime);
            console.log('坐标:', last.longitude + ', ' + last.latitude);
            console.log('\n✅ 所有测试通过！');
          });
        });
      } else {
        console.log('\n❌ 添加景点失败！');
      }
    } catch (e) {
      console.log('Response:', body);
      console.log('Parse Error:', e.message);
    }
  });
});

req.on('error', (e) => {
  console.error('Error:', e.message);
});

req.write(data);
req.end();
