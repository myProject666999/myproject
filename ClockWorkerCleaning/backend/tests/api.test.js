const request = require('supertest');
const { app, setupTestDB, teardownTestDB } = require('./setup');

let userToken = '';
let workerToken = '';

beforeAll(async () => {
  await setupTestDB();
});

afterAll(async () => {
  await teardownTestDB();
});

describe('Auth API', () => {
  test('should register a new user', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({
        phone: '15900000001',
        password: '123456',
        name: '测试用户',
        role: 'user',
      });

    expect(res.statusCode).toBe(200);
    expect(res.body.code).toBe(0);
  });

  test('should login user successfully', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({
        phone: '15900000001',
        password: '123456',
      });

    expect(res.statusCode).toBe(200);
    expect(res.body.code).toBe(0);
    userToken = res.body.data.token;
    expect(userToken).toBeTruthy();
  });

  test('should register a worker', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({
        phone: '16000000001',
        password: '123456',
        name: '测试阿姨',
        role: 'worker',
      });

    expect(res.statusCode).toBe(200);
    expect(res.body.code).toBe(0);
    workerToken = res.body.data.token;
    expect(workerToken).toBeTruthy();
  });

  test('should get user profile', async () => {
    const res = await request(app)
      .get('/api/auth/profile')
      .set('Authorization', `Bearer ${userToken}`);

    expect(res.statusCode).toBe(200);
    expect(res.body.code).toBe(0);
    expect(res.body.data.phone).toBe('15900000001');
  });

  test('should reject invalid login', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({
        phone: '15900000001',
        password: 'wrongpassword',
      });

    expect(res.statusCode).toBeGreaterThanOrEqual(400);
    expect(res.body.code).not.toBe(0);
  });
});

describe('Package API', () => {
  test('should list all packages (empty initially)', async () => {
    const res = await request(app).get('/api/packages');

    expect(res.statusCode).toBe(200);
    expect(res.body.code).toBe(0);
    expect(res.body.data.list).toBeDefined();
  });
});

describe('Worker API', () => {
  test('should list all workers (empty initially)', async () => {
    const res = await request(app).get('/api/workers');

    expect(res.statusCode).toBe(200);
    expect(res.body.code).toBe(0);
    expect(res.body.data.list).toBeDefined();
  });
});

describe('Coupon API', () => {
  test('should list available coupons', async () => {
    const res = await request(app).get('/api/coupons/available');

    expect(res.statusCode).toBe(200);
    expect(res.body.code).toBe(0);
  });

  test('should require auth for my coupons', async () => {
    const res = await request(app).get('/api/coupons/my');

    expect(res.statusCode).toBe(401);
  });

  test('should get my coupons with auth', async () => {
    const res = await request(app)
      .get('/api/coupons/my')
      .set('Authorization', `Bearer ${userToken}`);

    expect(res.statusCode).toBe(200);
    expect(res.body.code).toBe(0);
  });
});

describe('Booking API', () => {
  test('should require auth for booking list', async () => {
    const res = await request(app).get('/api/bookings');

    expect(res.statusCode).toBe(401);
  });

  test('should get bookings list with auth', async () => {
    const res = await request(app)
      .get('/api/bookings')
      .set('Authorization', `Bearer ${userToken}`);

    expect(res.statusCode).toBe(200);
    expect(res.body.code).toBe(0);
  });
});

describe('Auth Middleware', () => {
  test('should reject request without token', async () => {
    const res = await request(app).get('/api/auth/profile');

    expect(res.statusCode).toBe(401);
  });

  test('should reject request with invalid token', async () => {
    const res = await request(app)
      .get('/api/auth/profile')
      .set('Authorization', 'Bearer invalid_token');

    expect(res.statusCode).toBe(401);
  });
});
