// jest.config.js
module.exports = {
  testEnvironment: 'node',
  testMatch: [
    '**/tests/**/*.test.js',
    '**/test/**/*.test.js'
  ],
  setupFilesAfterEnv: ['<rootDir>/tests/setup.js'],
  testTimeout: 15000, // より長いタイムアウト
  forceExit: true,
  clearMocks: true,
  resetMocks: true,
  restoreMocks: true,
  detectOpenHandles: true,
  verbose: false, // 必要時のみtrueに
  
  // カバレッジ設定
  collectCoverageFrom: [
    'services/**/*.js',
    '!services/**/*.test.js',
    '!**/node_modules/**'
  ],
  
  // モジュール解決の最適化
  moduleDirectories: ['node_modules', '<rootDir>'],
  
  // テスト並行実行の制御
  maxWorkers: 1, // 並行実行を制限してリソース競合を防ぐ
  
  // エラー出力の制御
  bail: false, // 最初のテスト失敗で停止しない
  errorOnDeprecated: false
};
