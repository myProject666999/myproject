const bcrypt = require('bcryptjs');
const User = require('../models/User');
const Coach = require('../models/Coach');
const Course = require('../models/Course');
const SuccessStory = require('../models/SuccessStory');

async function seedDatabase() {
  console.log('Seeding database...');
  
  const hashedPassword = await bcrypt.hash('123456', 10);

  const [adminUser, created1] = await User.findOrCreate({
    where: { phone: '13800000000' },
    defaults: {
      phone: '13800000000',
      password: hashedPassword,
      name: '管理员',
      role: 'admin',
      gender: 'male'
    }
  });

  const [coachUser1, created2] = await User.findOrCreate({
    where: { phone: '13800000001' },
    defaults: {
      phone: '13800000001',
      password: hashedPassword,
      name: '张教练',
      role: 'coach',
      gender: 'male'
    }
  });

  const [coachUser2, created3] = await User.findOrCreate({
    where: { phone: '13800000002' },
    defaults: {
      phone: '13800000002',
      password: hashedPassword,
      name: '李教练',
      role: 'coach',
      gender: 'female'
    }
  });

  const [studentUser1, created4] = await User.findOrCreate({
    where: { phone: '13800000003' },
    defaults: {
      phone: '13800000003',
      password: hashedPassword,
      name: '王学员',
      role: 'student',
      gender: 'male'
    }
  });

  const [coach1, createdCoach1] = await Coach.findOrCreate({
    where: { userId: coachUser1.id },
    defaults: {
      userId: coachUser1.id,
      title: '高级私教',
      specialty: '力量训练、增肌塑形、体能提升',
      experience: 8,
      introduction: '8年健身教练经验，国家一级健身教练认证。擅长力量训练、增肌塑形，帮助上百名学员达成健身目标。',
      achievements: '国家一级健身教练、ACE认证、TRX认证教练',
      rating: 4.9,
      studentCount: 156
    }
  });

  const [coach2, createdCoach2] = await Coach.findOrCreate({
    where: { userId: coachUser2.id },
    defaults: {
      userId: coachUser2.id,
      title: '减脂塑形专家',
      specialty: '减脂塑形、产后恢复、瑜伽普拉提',
      experience: 6,
      introduction: '6年专业健身教练经验，专注女性健身领域。擅长科学减脂、产后恢复训练，帮助学员健康瘦身。',
      achievements: 'ACE私人教练认证、瑜伽导师认证',
      rating: 4.8,
      studentCount: 128
    }
  });

  const today = new Date();
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);
  const dayAfter = new Date(today);
  dayAfter.setDate(dayAfter.getDate() + 2);

  const formatDate = (date) => date.toISOString().split('T')[0];

  await Course.findOrCreate({
    where: { coachId: coach1.id, date: formatDate(tomorrow), startTime: '09:00:00' },
    defaults: {
      coachId: coach1.id,
      name: '基础力量训练',
      description: '适合初学者的力量训练课程，学习正确的动作姿势和训练方法。',
      category: '力量训练',
      date: formatDate(tomorrow),
      startTime: '09:00:00',
      endTime: '10:00:00',
      capacity: 8,
      bookedCount: 3,
      price: 199,
      location: 'A区力量训练区'
    }
  });

  await Course.findOrCreate({
    where: { coachId: coach1.id, date: formatDate(tomorrow), startTime: '14:00:00' },
    defaults: {
      coachId: coach1.id,
      name: '高强度间歇训练',
      description: '高强度间歇训练，快速燃脂，提升心肺功能。',
      category: 'HIIT',
      date: formatDate(tomorrow),
      startTime: '14:00:00',
      endTime: '15:00:00',
      capacity: 10,
      bookedCount: 6,
      price: 229,
      location: 'B区有氧训练区'
    }
  });

  await Course.findOrCreate({
    where: { coachId: coach2.id, date: formatDate(dayAfter), startTime: '10:00:00' },
    defaults: {
      coachId: coach2.id,
      name: '瑜伽塑形课',
      description: '通过瑜伽体式和呼吸练习，塑造优美体态，提升柔韧性。',
      category: '瑜伽',
      date: formatDate(dayAfter),
      startTime: '10:00:00',
      endTime: '11:00:00',
      capacity: 12,
      bookedCount: 8,
      price: 179,
      location: 'C区瑜伽室'
    }
  });

  await Course.findOrCreate({
    where: { coachId: coach2.id, date: formatDate(dayAfter), startTime: '16:00:00' },
    defaults: {
      coachId: coach2.id,
      name: '核心力量训练',
      description: '专注核心肌群训练，增强腰腹力量，改善体态。',
      category: '核心训练',
      date: formatDate(dayAfter),
      startTime: '16:00:00',
      endTime: '17:00:00',
      capacity: 8,
      bookedCount: 4,
      price: 189,
      location: 'A区核心训练区'
    }
  });

  await SuccessStory.findOrCreate({
    where: { coachId: coach1.id, title: '3个月增肌12kg' },
    defaults: {
      coachId: coach1.id,
      title: '3个月增肌12kg',
      content: '学员小王，25岁，通过科学的力量训练计划和饮食指导，3个月内成功增肌12kg，体脂率从22%降到15%。从瘦弱体质到健美身材，建立了自信心。',
      duration: '3个月',
      results: '增肌12kg，体脂率下降7%'
    }
  });

  await SuccessStory.findOrCreate({
    where: { coachId: coach1.id, title: '从健身小白到力量达人' },
    defaults: {
      coachId: coach1.id,
      title: '从健身小白到力量达人',
      content: '学员小李，30岁，零基础开始健身。通过6个月的系统训练，深蹲从空杆到120kg，卧推从20kg到80kg，硬拉从40kg到140kg。不仅身体素质大幅提升，更养成了健康的生活习惯。',
      duration: '6个月',
      results: '深蹲120kg，卧推80kg，硬拉140kg'
    }
  });

  await SuccessStory.findOrCreate({
    where: { coachId: coach2.id, title: '产后恢复成功减重18斤' },
    defaults: {
      coachId: coach2.id,
      title: '产后恢复成功减重18斤',
      content: '学员小张，产后6个月开始恢复训练。通过科学的产后恢复计划，3个月内成功减重18斤，盆底肌功能恢复正常，重新找回自信。',
      duration: '3个月',
      results: '减重18斤，盆底肌功能恢复'
    }
  });

  console.log('Database seeded successfully!');
  console.log('');
  console.log('Demo accounts:');
  console.log('  Admin:    13800000000 / 123456');
  console.log('  Coach:    13800000001 / 123456 (张教练)');
  console.log('  Coach:    13800000002 / 123456 (李教练)');
  console.log('  Student:  13800000003 / 123456 (王学员)');
}

module.exports = { seedDatabase };
