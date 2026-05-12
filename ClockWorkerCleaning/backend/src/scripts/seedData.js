require('dotenv').config();
const bcrypt = require('bcryptjs');
const sequelize = require('../config/database');
const { User, Worker, WorkerCertificate, Package, Coupon } = require('../models/associations');

async function seed() {
  try {
    require('../models/associations');
    await sequelize.sync({ force: true });
    console.log('[Seed] Database reset and synced.');

    const hashedPwd = bcrypt.hashSync('123456', 10);

    const adminUser = await User.create({
      phone: '13800000000',
      password: hashedPwd,
      nickName: '管理员',
      role: 'admin',
    });
    console.log('[Seed] Admin created:', adminUser.phone);

    const user1 = await User.create({
      phone: '13800000001',
      password: hashedPwd,
      nickName: '张女士',
      role: 'user',
    });
    const user2 = await User.create({
      phone: '13800000002',
      password: hashedPwd,
      nickName: '李先生',
      role: 'user',
    });
    console.log('[Seed] Users created:', user1.phone, user2.phone);

    const workerUser1 = await User.create({
      phone: '13900000001',
      password: hashedPwd,
      nickName: '王阿姨',
      role: 'worker',
    });
    const workerUser2 = await User.create({
      phone: '13900000002',
      password: hashedPwd,
      nickName: '李阿姨',
      role: 'worker',
    });
    const workerUser3 = await User.create({
      phone: '13900000003',
      password: hashedPwd,
      nickName: '赵阿姨',
      role: 'worker',
    });

    const today = new Date().toISOString().slice(0, 10);
    const nextYear = new Date();
    nextYear.setFullYear(nextYear.getFullYear() + 1);
    const expireDate = nextYear.toISOString().slice(0, 10);

    const worker1 = await Worker.create({
      userId: workerUser1.id,
      realName: '王桂兰',
      idCard: '110101198001011234',
      age: 45,
      gender: '女',
      phone: workerUser1.phone,
      skillTags: '日常保洁,深度保洁,做饭',
      experience: 8,
      rating: 4.9,
      orderCount: 156,
      hourlyRate: 55.00,
    });

    const worker2 = await Worker.create({
      userId: workerUser2.id,
      realName: '李秀英',
      idCard: '110101198502021234',
      age: 40,
      gender: '女',
      phone: workerUser2.phone,
      skillTags: '日常保洁,开荒保洁,收纳整理',
      experience: 5,
      rating: 4.8,
      orderCount: 98,
      hourlyRate: 50.00,
    });

    const worker3 = await Worker.create({
      userId: workerUser3.id,
      realName: '赵美华',
      idCard: '110101197803031234',
      age: 47,
      gender: '女',
      phone: workerUser3.phone,
      skillTags: '深度保洁,开荒保洁,擦玻璃',
      experience: 12,
      rating: 5.0,
      orderCount: 220,
      hourlyRate: 60.00,
    });

    console.log('[Seed] Workers created:', worker1.realName, worker2.realName, worker3.realName);

    await WorkerCertificate.bulkCreate([
      {
        workerId: worker1.id,
        certNo: 'JK20240001',
        certType: '健康证',
        issueDate: '2024-01-15',
        expireDate: '2025-01-14',
        status: 1,
      },
      {
        workerId: worker2.id,
        certNo: 'JK20240002',
        certType: '健康证',
        issueDate: today,
        expireDate,
        status: 1,
      },
      {
        workerId: worker3.id,
        certNo: 'JK20240003',
        certType: '健康证',
        issueDate: today,
        expireDate,
        status: 1,
      },
    ]);
    console.log('[Seed] Certificates created.');

    const packages = await Package.bulkCreate([
      {
        name: '日常保洁',
        type: 'daily',
        pricePerHour: 60.00,
        minHours: 2,
        maxHours: 8,
        description: '适合日常家庭维护，包含地面清洁、桌面整理、厨房卫生间基础清洁等',
        includes: JSON.stringify([
          '地面清扫与拖洗',
          '桌面/台面清洁整理',
          '厨房表面清洁',
          '卫生间基础清洁',
          '垃圾更换',
        ]),
        sort: 1,
        status: 1,
      },
      {
        name: '深度保洁',
        type: 'deep',
        pricePerHour: 80.00,
        minHours: 3,
        maxHours: 12,
        description: '全方位深度清洁，适合换季大扫除或久未清洁的房屋',
        includes: JSON.stringify([
          '日常保洁全部项目',
          '厨房深度清洁（油烟机表面）',
          '卫生间深度消毒',
          '玻璃内外清洁',
          '家具底部/顶部除尘',
          '踢脚线清洁',
        ]),
        sort: 2,
        status: 1,
      },
      {
        name: '开荒保洁',
        type: '开荒',
        pricePerHour: 100.00,
        minHours: 4,
        maxHours: 24,
        description: '新房/装修后首次保洁，去除建筑残留和装修痕迹',
        includes: JSON.stringify([
          '全屋玻璃清洁',
          '墙面/地面水泥、涂料清理',
          '门窗框、踢脚线细致清洁',
          '厨房卫生间除胶去污',
          '全屋除尘吸尘',
          '垃圾清运',
        ]),
        sort: 3,
        status: 1,
      },
    ]);
    console.log('[Seed] Packages created:', packages.length);

    const coupons = await Coupon.bulkCreate([
      {
        code: 'NEW50',
        name: '新人专享券',
        type: 'fixed',
        discountValue: 50.00,
        minAmount: 100.00,
        validStart: today,
        validEnd: '2026-12-31',
        stock: 1000,
        claimed: 0,
        perUserLimit: 1,
        description: '新用户首单立减50元，满100元可用',
        status: 1,
      },
      {
        code: 'DAILY20',
        name: '日常保洁券',
        type: 'fixed',
        discountValue: 20.00,
        minAmount: 0.00,
        validStart: today,
        validEnd: '2026-06-30',
        stock: 5000,
        claimed: 0,
        perUserLimit: 3,
        description: '无门槛立减20元',
        status: 1,
      },
      {
        code: 'VIP15',
        name: '85折优惠券',
        type: 'percent',
        discountValue: 15.00,
        minAmount: 200.00,
        validStart: today,
        validEnd: '2026-08-31',
        stock: 0,
        claimed: 0,
        perUserLimit: 1,
        description: '满200元享85折，无限发放',
        status: 1,
      },
    ]);
    console.log('[Seed] Coupons created:', coupons.length);

    console.log('\n✅ Seed completed!');
    console.log('\nTest accounts:');
    console.log('  Admin:   13800000000 / 123456');
    console.log('  User:    13800000001 / 123456');
    console.log('  Worker:  13900000001 / 123456');

    process.exit(0);
  } catch (err) {
    console.error('[Seed Error]', err);
    process.exit(1);
  }
}

seed();
