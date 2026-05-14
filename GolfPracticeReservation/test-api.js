const axios = require('axios');

const API_BASE = 'http://localhost:3000/api';

async function testCoachAPI() {
  console.log('=== 测试教练 API ===');

  try {
    // 1. 获取列表
    console.log('1. 获取教练列表...');
    const getRes = await axios.get(`${API_BASE}/coaches`);
    console.log('GET /coaches 结果:', JSON.stringify(getRes.data, null, 2));

    // 2. 新增教练
    console.log('\n2. 新增教练...');
    const postData = {
      coach_name: '测试教练新',
      phone: '13999999999',
      title: '测试职称',
      specialty: '测试专长',
      price_per_hour: 300,
      status: 1,
      description: '测试描述'
    };
    console.log('POST 数据:', JSON.stringify(postData, null, 2));
    const postRes = await axios.post(`${API_BASE}/coaches`, postData);
    console.log('POST /coaches 结果:', JSON.stringify(postRes.data, null, 2));

    // 3. 再次获取列表
    console.log('\n3. 再次获取教练列表...');
    const getRes2 = await axios.get(`${API_BASE}/coaches`);
    console.log('GET /coaches 结果:', JSON.stringify(getRes2.data, null, 2));

    console.log('\n=== 测试完成 ===');
  } catch (error) {
    console.error('API 调用失败:');
    if (error.response) {
      console.error('响应状态:', error.response.status);
      console.error('响应数据:', JSON.stringify(error.response.data, null, 2));
    } else {
      console.error('错误消息:', error.message);
    }
  }
}

testCoachAPI();
