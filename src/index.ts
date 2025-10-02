import dotenv from 'dotenv';
dotenv.config();

import http from 'http';
import app from './server/app';
import { connectToDatabase } from './server/db';

const PORT = process.env.PORT || 3000;

async function bootstrap() {
  try {
    await connectToDatabase();
    const server = http.createServer(app);
    server.listen(PORT, () => {

      console.log(`Server listening on port ${PORT}`);
    });
  } catch (err) {
    console.error('Failed to start server:', err);
    process.exit(1);
  }
}

bootstrap();

process.on('unhandledRejection', (reason) => {
  console.error('Unhandled Rejection:', reason);
});
process.on('uncaughtException', (err) => {
  console.error('Uncaught Exception:', err);
});

