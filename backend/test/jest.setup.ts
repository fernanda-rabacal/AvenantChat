import { teardownTestDatabase } from './test-setup';

declare global {
  var __TEST_DB__: {
    container: any;
    prisma: any;
  };
}

afterAll(async () => {
  try {
    await teardownTestDatabase();
  } catch (error) {
    console.error('Error tearing down test database:', error);
  }
}); 