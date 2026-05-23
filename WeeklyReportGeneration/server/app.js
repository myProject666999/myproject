const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

const templateRoutes = require('./routes/templates');
const reportRoutes = require('./routes/reports');
const dataSourceRoutes = require('./routes/dataSources');
const userRoutes = require('./routes/users');

app.use('/api/templates', templateRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/data-sources', dataSourceRoutes);
app.use('/api/users', userRoutes);

app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', message: '周报生成系统服务运行正常' });
});

app.listen(PORT, () => {
    console.log(`周报生成系统服务已启动: http://localhost:${PORT}`);
});

module.exports = app;
