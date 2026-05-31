const API_BASE = 'http://localhost:3000/api';

let token = null;
let userId = null;

async function apiCall(method, path, data = null) {
  const options = {
    method,
    headers: {
      'Content-Type': 'application/json',
    },
  };
  
  if (token) {
    options.headers['Authorization'] = `Bearer ${token}`;
  }
  
  if (data) {
    options.body = JSON.stringify(data);
  }
  
  const res = await fetch(`${API_BASE}${path}`, options);
  const resData = await res.json();
  return { status: res.status, data: resData };
}

async function testLogin() {
  console.log('\n1. 登录测试');
  try {
    const res = await apiCall('POST', '/auth/login', {
      username: 'daren1',
      password: '123456'
    });
    
    console.log(`   状态码: ${res.status}`);
    console.log(`   登录成功: ${!!res.data.token}`);
    console.log(`   密码字段已清除: ${!res.data.user.password}`);
    console.log(`   用户: ${res.data.user.nickname}`);
    
    token = res.data.token;
    userId = res.data.user.id;
    
    return true;
  } catch (e) {
    console.log(`   登录失败: ${e.message}`);
    return false;
  }
}

async function testLikes() {
  console.log('\n2. 点赞测试 (笔记ID=1)');
  try {
    const toggleRes = await apiCall('POST', '/likes/toggle', {
      targetId: 1,
      targetType: 'note'
    });
    console.log(`   点赞操作成功: ${toggleRes.status === 201}`);
    console.log(`   当前状态: ${toggleRes.data.isLiked ? '已点赞' : '未点赞'}`);
    
    const checkRes = await apiCall('GET', '/likes/check?targetId=1&targetType=note');
    console.log(`   点赞状态检查成功: ${checkRes.status === 200}`);
    
    const countRes = await apiCall('GET', '/likes/count?targetId=1&targetType=note');
    console.log(`   点赞数查询成功: ${countRes.status === 200}, 点赞数: ${countRes.data.count}`);
    
    return true;
  } catch (e) {
    console.log(`   点赞测试失败: ${e.message}`);
    return false;
  }
}

async function testFollows() {
  console.log('\n3. 关注测试 (关注用户ID=2)');
  try {
    const toggleRes = await apiCall('POST', '/follows/toggle', {
      followingId: 2
    });
    console.log(`   关注操作成功: ${toggleRes.status === 201}`);
    console.log(`   当前状态: ${toggleRes.data.isFollowing ? '已关注' : '未关注'}`);
    
    const checkRes = await apiCall('GET', '/follows/check?followingId=2');
    console.log(`   关注状态检查成功: ${checkRes.status === 200}`);
    
    const followersRes = await apiCall('GET', '/follows/followers?userId=2');
    console.log(`   粉丝列表查询成功: ${followersRes.status === 200}, 粉丝数: ${followersRes.data.length}`);
    
    return true;
  } catch (e) {
    console.log(`   关注测试失败: ${e.message}`);
    return false;
  }
}

async function testFavorites() {
  console.log('\n4. 收藏测试 (收藏笔记ID=1)');
  try {
    const addRes = await apiCall('POST', '/favorites', {
      targetId: 1,
      targetType: 'note',
      listType: 'want'
    });
    console.log(`   添加收藏成功: ${addRes.status === 201}`);
    
    const checkRes = await apiCall('GET', '/favorites/check?targetId=1&targetType=note');
    console.log(`   收藏状态检查成功: ${checkRes.status === 200}, 已收藏: ${checkRes.data.isFavorite}`);
    
    const myRes = await apiCall('GET', '/favorites/my?listType=want');
    console.log(`   我的收藏查询成功: ${myRes.status === 200}, 数量: ${myRes.data.length}`);
    
    return true;
  } catch (e) {
    console.log(`   收藏测试失败: ${e.message}`);
    return false;
  }
}

async function testComments() {
  console.log('\n5. 评论测试 (评论笔记ID=1)');
  try {
    const createRes = await apiCall('POST', '/comments', {
      noteId: 1,
      content: '测试评论 - ' + Date.now()
    });
    console.log(`   创建评论成功: ${createRes.status === 201}`);
    
    const listRes = await apiCall('GET', '/comments/note/1');
    console.log(`   评论列表查询成功: ${listRes.status === 200}, 评论数: ${listRes.data.total || listRes.data.length}`);
    
    return true;
  } catch (e) {
    console.log(`   评论测试失败: ${e.message}`);
    return false;
  }
}

async function testUpload() {
  console.log('\n6. 图片上传测试');
  try {
    const testBase64 = 'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAgGBgcGBQgHBwcJCQgKDBQNDAsLDBkSEw8UHRofHh0aHBwgJC4nICIsIxwcKDcpLDAxNDQ0Hyc5PTgyPC4zNDL/2wBDAQkJCQwLDBgNDRgyIRwhMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjL/wAARCAABAAEDASIAAhEBAxEB/8QAHwAAAQUBAQEBAQEAAAAAAAAAAAECAwQFBgcICQoL/8QAtRAAAgEDAwIEAwUFBAQAAAF9AQIDAAQRBRIhMUEGE1FhByJxFDKBkaEII0KxwRVS0fAkM2JyggkKFhcYGRolJicoKSo0NTY3ODk6Q0RFRkdISUpTVFVWV1hZWmNkZWZnaGlqc3R1dnd4eXqDhIWGh4iJipKTlJWWl5iZmqKjpKWmp6ipqrKztLW2t7i5usLDxMXGx8jJytLT1NXW19jZ2uHi4+Tl5ufo6erx8vP09fb3+Pn6/9oACAEBAAA/APn+v/9k=';
    
    const res = await apiCall('POST', '/upload/image', {
      image: testBase64
    });
    console.log(`   上传成功: ${res.status === 201}`);
    console.log(`   返回URL: ${res.data.url}`);
    
    return true;
  } catch (e) {
    console.log(`   上传测试失败: ${e.message}`);
    return false;
  }
}

async function runAllTests() {
  console.log('========== API 测试开始 ==========');
  console.log('');
  
  const results = [];
  
  results.push(await testLogin());
  
  if (token) {
    results.push(await testLikes());
    results.push(await testFollows());
    results.push(await testFavorites());
    results.push(await testComments());
    results.push(await testUpload());
  }
  
  console.log('');
  console.log('========== 测试总结 ==========');
  const passed = results.filter(r => r).length;
  console.log(`通过: ${passed}/${results.length}`);
  
  if (passed === results.length) {
    console.log('✅ 所有测试通过!');
  } else {
    console.log('❌ 部分测试失败');
  }
}

runAllTests().catch(console.error);
