const http = require('http');

async function test() {
  // 1. 登录
  let token = '';
  let userId = '';
  await new Promise((resolve) => {
    const loginData = JSON.stringify({username:'testuser2',password:'123456'});
    const req = http.request({hostname:'127.0.0.1',port:3000,path:'/auth/login',method:'POST',headers:{'Content-Type':'application/json'}}, (res) => {
      let body = '';
      res.on('data', (chunk) => body += chunk);
      res.on('end', () => {
        const data = JSON.parse(body);
        token = data.access_token;
        userId = data.userId;
        console.log('登录成功, userId:', userId);
        resolve();
      });
    });
    req.write(loginData);
    req.end();
  });

  // 2. 创建文档
  let docId = '';
  await new Promise((resolve) => {
    const docData = JSON.stringify({space_id: 1, title: '测试删除文档', content: '这是测试删除的内容'});
    const req = http.request({hostname:'127.0.0.1',port:3000,path:'/documents',method:'POST',headers:{'Content-Type':'application/json','Authorization':'Bearer ' + token}}, (res) => {
      let body = '';
      res.on('data', (chunk) => body += chunk);
      res.on('end', () => {
        const data = JSON.parse(body);
        docId = data.id;
        console.log('文档创建成功, docId:', docId);
        resolve();
      });
    });
    req.write(docData);
    req.end();
  });

  // 3. 删除文档
  await new Promise((resolve) => {
    const req = http.request({hostname:'127.0.0.1',port:3000,path:'/documents/' + docId,method:'DELETE',headers:{'Authorization':'Bearer ' + token}}, (res) => {
      console.log('删除文档状态:', res.statusCode);
      resolve();
    });
    req.end();
  });

  // 4. 检查回收站
  await new Promise((resolve) => {
    const req = http.request({hostname:'127.0.0.1',port:3000,path:'/recycle-bin/space/1',method:'GET',headers:{'Authorization':'Bearer ' + token}}, (res) => {
      let body = '';
      res.on('data', (chunk) => body += chunk);
      res.on('end', () => {
        const data = JSON.parse(body);
        console.log('回收站列表数量:', data.length);
        if (data.length > 0) {
          console.log('最新回收站记录:', JSON.stringify(data[0], null, 2).substring(0, 500));
        }
        resolve();
      });
    });
    req.end();
  });

  console.log('测试完成!');
}

test().catch(e => console.log('Error:', e.message));
