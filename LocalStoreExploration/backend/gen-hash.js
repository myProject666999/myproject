import bcrypt from 'bcryptjs';

const password = '123456';
bcrypt.hash(password, 10).then(hash => {
  console.log('Password: 123456');
  console.log('Hash:', hash);
  
  // 验证
  bcrypt.compare(password, hash).then(result => {
    console.log('Verify result:', result);
  });
});
