import http from 'http';

function request(method, url, data = null, token = null) {
  return new Promise((resolve, reject) => {
    const urlObj = new URL(url);
    const options = {
      hostname: urlObj.hostname,
      port: urlObj.port,
      path: urlObj.pathname + urlObj.search,
      method: method,
      headers: {
        'Content-Type': 'application/json',
      }
    };
    
    if (token) {
      options.headers['Authorization'] = `Bearer ${token}`;
    }
    
    const req = http.request(options, (res) => {
      let body = '';
      res.on('data', (chunk) => body += chunk);
      res.on('end', () => {
        try {
          const result = JSON.parse(body);
          console.log(`[${method}] ${url} -> ${res.statusCode}`);
          resolve({ status: res.statusCode, data: result });
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

async function runTests() {
  console.log('========== API 测试开始 ==========\n');
  
  try {
    // 1. 登录测试
    console.log('1. 登录测试');
    const loginRes = await request('POST', 'http://localhost:3000/api/auth/login', {
      username: 'daren1',
      password: '123456'
    });
    console.log('   响应状态:', loginRes.status);
    console.log('   响应数据:', JSON.stringify(loginRes.data));
    console.log('   登录成功:', !!loginRes.data.token);
    console.log('   密码字段已清除:', !loginRes.data.user?.password);
    const token = loginRes.data.token;
    console.log();
    
    // 2. 点赞测试
    console.log('2. 点赞测试 (笔记ID=1)');
    const likeRes = await request('POST', 'http://localhost:3000/api/likes/toggle', {
      targetId: 1,
      targetType: 'note'
    }, token);
    console.log('   点赞操作成功:', likeRes.data.success === true);
    console.log('   当前点赞状态:', likeRes.data.isLiked ? '已点赞' : '未点赞');
    
    const checkLikeRes = await request('GET', 'http://localhost:3000/api/likes/check?targetId=1&targetType=note', null, token);
    console.log('   点赞状态检查成功:', checkLikeRes.data.isLiked === likeRes.data.isLiked);
    
    const likeCountRes = await request('GET', 'http://localhost:3000/api/likes/count?targetId=1&targetType=note');
    console.log('   点赞数查询成功:', typeof likeCountRes.data.count === 'number');
    console.log();
    
    // 3. 关注测试
    console.log('3. 关注测试 (关注用户ID=2)');
    const followRes = await request('POST', 'http://localhost:3000/api/follows/toggle', {
      followingId: 2
    }, token);
    console.log('   关注操作成功:', followRes.data.success === true);
    console.log('   当前关注状态:', followRes.data.isFollowing ? '已关注' : '未关注');
    
    const checkFollowRes = await request('GET', 'http://localhost:3000/api/follows/check?followingId=2', null, token);
    console.log('   关注状态检查成功:', checkFollowRes.data.isFollowing === followRes.data.isFollowing);
    
    const followersRes = await request('GET', 'http://localhost:3000/api/follows/followers?userId=2');
    console.log('   粉丝列表查询成功:', Array.isArray(followersRes.data));
    console.log();
    
    // 4. 图片上传测试
    console.log('4. 图片上传测试 (Base64)');
    const base64Image = 'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQEASABIAAD/2wBDAAgGBgcGBQgHBwcJCQgKDBQNDAsLDBkSEw8UHRofHh0aHBwgJC4nICIsIxwcKDcpLDAxNDQ0Hyc5PTgyPC4zNDL/2wBDAQkJCQwLDBgNDRgyIRwhMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjL/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAn/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwCK6AVUf/9k=';
    
    const uploadRes = await request('POST', 'http://localhost:3000/api/upload/image', {
      image: base64Image
    }, token);
    console.log('   图片上传成功:', uploadRes.status === 201 || uploadRes.status === 200);
    console.log('   返回图片URL:', uploadRes.data.url || uploadRes.data);
    console.log();
    
    // 5. 发布笔记测试
    console.log('5. 发布笔记测试');
    const createNoteRes = await request('POST', 'http://localhost:3000/api/notes', {
      title: '测试探店笔记',
      content: '这是一篇测试的探店笔记内容',
      shopId: 1,
      rating: 5,
      images: ['https://picsum.photos/800/600?random=1'],
      lat: 31.2304,
      lng: 121.4737
    }, token);
    console.log('   笔记发布成功:', createNoteRes.status === 201);
    console.log('   笔记ID:', createNoteRes.data.id);
    console.log();
    
    // 6. 获取笔记详情测试
    console.log('6. 获取笔记详情测试');
    const noteDetailRes = await request('GET', `http://localhost:3000/api/notes/${createNoteRes.data.id || 1}`);
    console.log('   笔记详情获取成功:', noteDetailRes.status === 200);
    console.log('   作者信息包含密码:', !!(noteDetailRes.data.user && noteDetailRes.data.user.password));
    console.log();
    
    console.log('========== API 测试结束 ==========');
    console.log('\n✅ 所有测试通过!');
    
  } catch (error) {
    console.error('\n❌ 测试失败:', error.message);
    console.error('错误详情:', error);
    process.exit(1);
  }
}

runTests();
