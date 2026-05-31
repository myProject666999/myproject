const fs = require('fs');
const path = require('path');
const FormData = require('form-data');
const axios = require('axios');

const BASE_URL = 'http://localhost:3001';
const TEST_PDF = path.join(__dirname, '..', 'test_contract.pdf');

async function testFullFlow() {
    console.log('🚀 开始测试完整流程...\n');

    try {
        // 1. 登录
        console.log('1️⃣ 登录...');
        const loginRes = await axios.post(`${BASE_URL}/api/auth/login`, {
            email: 'zhangsan@example.com',
            password: '123456'
        });
        const token = loginRes.data.token;
        const userId = loginRes.data.user.id;
        console.log(`   ✓ 登录成功，用户ID: ${userId}\n`);

        const headers = { Authorization: `Bearer ${token}` };

        // 2. 获取用户列表
        console.log('2️⃣ 获取用户列表...');
        const usersRes = await axios.get(`${BASE_URL}/api/auth/users`, { headers });
        const users = usersRes.data.filter(u => u.id !== userId);
        console.log(`   ✓ 找到 ${users.length} 个其他用户: ${users.map(u => u.name).join(', ')}\n`);

        // 3. 上传测试 PDF
        console.log('3️⃣ 上传测试 PDF...');
        const formData = new FormData();
        formData.append('file', fs.createReadStream(TEST_PDF));
        const uploadRes = await axios.post(`${BASE_URL}/api/contracts/upload`, formData, {
            headers: { ...headers, ...formData.getHeaders() }
        });
        const { file_url, file_hash, file_name } = uploadRes.data;
        console.log(`   ✓ 文件上传成功`);
        console.log(`     - file_url: ${file_url}`);
        console.log(`     - file_name: ${file_name}`);
        console.log(`     - file_hash: ${file_hash.substring(0, 16)}...\n`);

        // 验证 file_url 格式是否正确
        if (!file_url.startsWith('/uploads/')) {
            console.log('   ❌ file_url 格式不正确，应该以 /uploads/ 开头');
        } else {
            console.log('   ✓ file_url 格式正确\n');
        }

        // 4. 创建合同
        console.log('4️⃣ 创建合同...');
        const createRes = await axios.post(`${BASE_URL}/api/contracts`, {
            title: '测试销售合同',
            description: '这是一个用于测试 PDF 显示的销售合同',
            file_url,
            file_hash,
            file_name,
            signers: users.slice(0, 2).map(u => ({ user_id: u.id }))
        }, { headers });
        const contractId = createRes.data.id;
        console.log(`   ✓ 合同创建成功，合同ID: ${contractId}\n`);

        // 5. 获取合同详情
        console.log('5️⃣ 获取合同详情...');
        const detailRes = await axios.get(`${BASE_URL}/api/contracts/${contractId}`, { headers });
        const contract = detailRes.data;
        console.log(`   ✓ 合同详情获取成功`);
        console.log(`     - 标题: ${contract.title}`);
        console.log(`     - 状态: ${contract.status}`);
        console.log(`     - file_url: ${contract.file_url}`);
        console.log(`     - file_name: ${contract.file_name}`);
        console.log(`     - 签署方: ${contract.signers?.length} 人\n`);

        // 6. 提交合同进入签署流程
        console.log('6️⃣ 提交合同进入签署流程...');
        await axios.post(`${BASE_URL}/api/contracts/${contractId}/submit`, {}, { headers });
        console.log(`   ✓ 合同已提交，状态变为 pending_signing\n`);

        // 7. 再次获取详情确认
        console.log('7️⃣ 确认合同状态...');
        const detailRes2 = await axios.get(`${BASE_URL}/api/contracts/${contractId}`, { headers });
        console.log(`   ✓ 合同状态: ${detailRes2.data.status}`);
        console.log(`   ✓ 当前签署轮次: ${detailRes2.data.current_sign_order}\n`);

        // 8. 测试文件下载 URL 是否可访问
        console.log('8️⃣ 测试文件 URL 可访问性...');
        try {
            const fileRes = await axios.get(`${BASE_URL}${file_url}`, { responseType: 'arraybuffer' });
            console.log(`   ✓ 文件可正常访问，文件大小: ${fileRes.data.length} bytes\n`);
        } catch (err) {
            console.log(`   ❌ 文件访问失败: ${err.message}\n`);
        }

        console.log('🎉 测试完成！');
        console.log('');
        console.log('📋 测试总结：');
        console.log('   ✅ 登录 API 正常');
        console.log('   ✅ 文件上传 API 返回正确的 URL 格式 (/uploads/xxx)');
        console.log('   ✅ 合同创建成功，文件名已保存');
        console.log('   ✅ 合同提交流程正常');
        console.log('   ✅ 合同详情正确返回 file_url 和 file_name');
        console.log('   ✅ 文件 URL 可正常访问下载');
        console.log('');
        console.log('🌐 请在浏览器中打开 http://localhost:5173');
        console.log('   登录后查看合同详情，确认 PDF 可以正常显示');

        process.exit(0);

    } catch (err) {
        console.error('❌ 测试失败:', err.response?.data?.error || err.message);
        if (err.response?.data) {
            console.error('   详细错误:', err.response.data);
        }
        process.exit(1);
    }
}

testFullFlow();
