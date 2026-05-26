import 'reflect-metadata';
import app from './app.js';
import { initDatabase } from './db-init.js';
import { config } from './config/index.js';

async function startServer() {
  try {
    await initDatabase();

    const server = app.listen(config.port, () => {
      console.log(`Server ready on port ${config.port}`);
      console.log(`API: http://localhost:${config.port}/api`);
      console.log(`Health: http://localhost:${config.port}/api/health`);
    });

    process.on('SIGTERM', () => {
      console.log('SIGTERM signal received');
      server.close(() => {
        console.log('Server closed');
        process.exit(0);
      });
    });

    process.on('SIGINT', () => {
      console.log('SIGINT signal received');
      server.close(() => {
        console.log('Server closed');
        process.exit(0);
      });
    });
  } catch (err) {
    console.error('Failed to start server:', err);
    process.exit(1);
  }
}

startServer();

export default app;
