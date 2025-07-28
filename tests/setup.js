// tests/setup.js
process.env.NODE_ENV = 'test';

// Jest タイムアウト対策
afterAll(async () => {
  // 全てのタイマーをクリア
  jest.clearAllTimers();
  jest.useRealTimers();
});