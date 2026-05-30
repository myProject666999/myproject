import bcrypt from 'bcryptjs';

// 测试 bcrypt
const testHash = '$2b$10$ixlPY3AAd4ty1l6E2IsQ9OFZi2ba9ZQE0bP7RFcGIWPnCQeQrP5/W';
const testPassword = '123456';

console.log('Testing bcrypt...');
bcrypt.compare(testPassword, testHash).then(result => {
  console.log('bcrypt compare result:', result);
}).catch(err => {
  console.error('bcrypt error:', err);
});

// 测试 class-transformer
import { instanceToPlain } from 'class-transformer';

class TestUser {
  constructor(id, username, password) {
    this.id = id;
    this.username = username;
    this.password = password;
  }
}

const user = new TestUser(1, 'test', 'password123');
console.log('\nTesting instanceToPlain...');
console.log('Original user:', user);
const plain = instanceToPlain(user);
console.log('instanceToPlain result:', plain);
const { password, ...result } = plain;
console.log('After destructuring, result:', result);
console.log('Password removed:', !result.password);
