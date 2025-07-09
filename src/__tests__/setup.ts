import { beforeAll, afterAll, afterEach } from 'vitest';

beforeAll(async () => {
  // Setze Test-Umgebungsvariablen
  process.env.NODE_ENV = 'test';
  process.env.JWT_SECRET = 'test-jwt-secret-32-characters-long';
  process.env.COOKIE_SECRET = 'test-cookie-secret-32-characters-long';
  process.env.DATABASE_URL = 'file:./test.db'; // SQLite für Tests
  process.env.PORT = '3002';
  process.env.FRONTEND_URL = 'http://localhost:3000';
  process.env.SMTP_HOST = 'localhost';
  process.env.SMTP_PORT = '587';
  process.env.SMTP_USER = 'test';
  process.env.SMTP_PASS = 'test';
  process.env.SMTP_FROM = 'test@example.com';
});

afterAll(async () => {
  // Cleanup nach allen Tests
});

afterEach(async () => {
  // Cleanup nach jedem Test
});
