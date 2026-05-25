const express = require('express');
const cors = require('cors');
const { initDatabase } = require('./db/init');
const formsRouter = require('./routes/forms');
const submissionsRouter = require('./routes/submissions');
const exportRouter = require('./routes/export');
const settingsRouter = require('./routes/settings');

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

app.use('/api/forms', formsRouter);
app.use('/api/submissions', submissionsRouter);
app.use('/api/export', exportRouter);
app.use('/api/settings', settingsRouter);

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

async function start() {
  try {
    await initDatabase();
    app.listen(PORT, () => {
      console.log(`Server running on http://localhost:${PORT}`);
    });
  } catch (err) {
    console.error('Failed to initialize database:', err);
    process.exit(1);
  }
}

start();

module.exports = app;
