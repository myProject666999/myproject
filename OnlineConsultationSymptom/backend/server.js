const express = require('express');
const cors = require('cors');
require('dotenv').config();

const symptomsRouter = require('./routes/symptoms');
const diseasesRouter = require('./routes/diseases');
const consultationRouter = require('./routes/consultation');
const articlesRouter = require('./routes/articles');
const historyRouter = require('./routes/history');

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors({
  origin: ['http://localhost:3000', 'http://127.0.0.1:3000'],
  credentials: true
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use('/api/symptoms', symptomsRouter);
app.use('/api/diseases', diseasesRouter);
app.use('/api/consultation', consultationRouter);
app.use('/api/articles', articlesRouter);
app.use('/api/history', historyRouter);

app.get('/api/health', (req, res) => {
  res.json({
    success: true,
    message: '在线问诊/症状自查系统API服务运行正常',
    timestamp: new Date().toISOString()
  });
});

app.get('/api/disclaimer', (req, res) => {
  res.json({
    success: true,
    data: {
      title: '免责声明',
      content: '本系统提供的所有诊断结果和建议仅供参考，不能替代专业医疗诊断、治疗或医生的专业意见。如有身体不适，请及时到正规医疗机构就诊。本系统不对因使用本系统信息而产生的任何后果承担责任。'
    }
  });
});

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    success: false,
    message: '服务器内部错误'
  });
});

app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: '接口不存在'
  });
});

app.listen(PORT, () => {
  console.log(`
============================================
  在线问诊/症状自查系统 后端服务
============================================
  服务地址: http://localhost:${PORT}
  API地址:  http://localhost:${PORT}/api
  健康检查: http://localhost:${PORT}/api/health
============================================
  免责声明: 本系统仅供参考，不能替代专业医疗诊断
============================================
`);
});

module.exports = app;
