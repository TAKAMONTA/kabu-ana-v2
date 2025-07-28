const createUserService = require('../../services/userService');

describe('userService', () => {
  let mockDb; // モックされたknexインスタンス
  let mockQueryBuilder; // knexのチェーンメソッドをモックするためのオブジェクト
  let userService; // テスト対象のuserServiceインスタンス

  beforeEach(() => {
    // knexのクエリビルダーメソッドをモック
    mockQueryBuilder = {
      where: jest.fn().mockReturnThis(),
      first: jest.fn(),
      insert: jest.fn().mockReturnThis(),
      del: jest.fn().mockResolvedValue(1),
      // 必要に応じて他のメソッドも追加
    };

    // knexのメイン関数をモック
    mockDb = jest.fn(() => mockQueryBuilder);

    // knexのスキーマメソッドをモック
    mockDb.schema = {
      createTable: jest.fn().mockResolvedValue(true),
      dropTable: jest.fn().mockResolvedValue(true),
      // 必要に応じて他のスキーマメソッドも追加
    };

    // モックされたknexのメソッドをmockDbにも追加（チェーンメソッド用）
    Object.assign(mockDb, mockQueryBuilder);

    // userServiceをモックDBで初期化
    userService = createUserService(mockDb);

    jest.clearAllMocks();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  test('should create a new user if not found', async () => {
    const mockUser = {
      id: 1,
      firebase_uid: 'test-uid',
      email: 'test@example.com',
      name: 'Test User'
    };

    // 最初の検索では見つからない
    mockQueryBuilder.first.mockResolvedValueOnce(null);
    // insertは新しいユーザーIDを返す
    mockQueryBuilder.insert.mockResolvedValueOnce([1]);
    // 2回目の検索では新しいユーザーを返す
    mockQueryBuilder.first.mockResolvedValueOnce(mockUser);

    const result = await userService.findOrCreateUser('test-uid', 'test@example.com', 'Test User');

    expect(result).toEqual(mockUser);
    expect(mockDb).toHaveBeenCalledWith('users');
    expect(mockQueryBuilder.where).toHaveBeenCalledWith({ firebase_uid: 'test-uid' });
    expect(mockQueryBuilder.first).toHaveBeenCalledTimes(2);
    expect(mockQueryBuilder.insert).toHaveBeenCalledWith({
      firebase_uid: 'test-uid',
      email: 'test@example.com',
      name: 'Test User',
      created_at: expect.any(Date),
      updated_at: expect.any(Date)
    });
  });

  test('should return existing user if found by firebase_uid', async () => {
    const mockUser = {
      id: 1,
      firebase_uid: 'test-uid',
      email: 'test@example.com',
      name: 'Test User'
    };

    mockQueryBuilder.first.mockResolvedValueOnce(mockUser);

    const result = await userService.findOrCreateUser('test-uid', 'test@example.com', 'Test User');

    expect(result).toEqual(mockUser);
    expect(mockDb).toHaveBeenCalledWith('users');
    expect(mockQueryBuilder.where).toHaveBeenCalledWith({ firebase_uid: 'test-uid' });
    expect(mockQueryBuilder.first).toHaveBeenCalledTimes(1);
    expect(mockQueryBuilder.insert).not.toHaveBeenCalled();
  });

  test('should get user by firebase_uid', async () => {
    const mockUser = {
      id: 1,
      firebase_uid: 'test-uid',
      email: 'test@example.com',
      name: 'Test User'
    };

    mockQueryBuilder.first.mockResolvedValueOnce(mockUser);

    const result = await userService.getUserByFirebaseUid('test-uid');

    expect(result).toEqual(mockUser);
    expect(mockDb).toHaveBeenCalledWith('users');
    expect(mockQueryBuilder.where).toHaveBeenCalledWith({ firebase_uid: 'test-uid' });
    expect(mockQueryBuilder.first).toHaveBeenCalledTimes(1);
  });

  test('should get user by email', async () => {
    const mockUser = {
      id: 1,
      firebase_uid: 'test-uid',
      email: 'test@example.com',
      name: 'Test User'
    };

    mockQueryBuilder.first.mockResolvedValueOnce(mockUser);

    const result = await userService.getUserByEmail('test@example.com');

    expect(result).toEqual(mockUser);
    expect(mockDb).toHaveBeenCalledWith('users');
    expect(mockQueryBuilder.where).toHaveBeenCalledWith({ email: 'test@example.com' });
    expect(mockQueryBuilder.first).toHaveBeenCalledTimes(1);
  });

  test('should return null if user not found by firebase_uid', async () => {
    mockQueryBuilder.first.mockResolvedValueOnce(null);

    const result = await userService.getUserByFirebaseUid('non-existent-uid');

    expect(result).toBeNull();
    expect(mockDb).toHaveBeenCalledWith('users');
    expect(mockQueryBuilder.where).toHaveBeenCalledWith({ firebase_uid: 'non-existent-uid' });
    expect(mockQueryBuilder.first).toHaveBeenCalledTimes(1);
  });

  test('should return null if user not found by email', async () => {
    mockQueryBuilder.first.mockResolvedValueOnce(null);

    const result = await userService.getUserByEmail('non-existent@example.com');

    expect(result).toBeNull();
    expect(mockDb).toHaveBeenCalledWith('users');
    expect(mockQueryBuilder.where).toHaveBeenCalledWith({ email: 'non-existent@example.com' });
    expect(mockQueryBuilder.first).toHaveBeenCalledTimes(1);
  });
});