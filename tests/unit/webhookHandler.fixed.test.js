// テスト前にNODE_ENVを設定
process.env.NODE_ENV = 'test';

// モジュールをインポート
const { processPayPalWebhook, setUserService, setDb } = require('../../services/webhookHandler');

// コンソール出力をモック
console.log = jest.fn();
console.error = jest.fn();

describe('webhookHandler', () => {
  // テスト開始時にログを出力
  beforeAll(() => {
    console.log('webhookHandler テストを開始します');
  });

  // テスト終了時にログを出力
  afterAll(() => {
    console.log('webhookHandler テストを終了します');
  });
  // テストタイムアウトを30秒に設定
  jest.setTimeout(30000);
  
  let mockUserService;
  let mockDb;
  let mockTrx;

  beforeEach(() => {
    // Knex互換のトランザクションモックを作成
    mockTrx = jest.fn().mockImplementation(() => ({
      // テーブル操作メソッド
      select: jest.fn().mockReturnThis(),
      where: jest.fn().mockReturnThis(),
      first: jest.fn(),
      insert: jest.fn().mockReturnThis(),
      update: jest.fn().mockReturnThis(),
      // チェーンメソッド
      returning: jest.fn().mockResolvedValue([1]),
      // トランザクション制御
      commit: jest.fn().mockResolvedValue(),
      rollback: jest.fn().mockResolvedValue()
    }));
    
    // テーブル名でアクセスできるようにする
    mockTrx.payments = mockTrx();
    mockTrx.payment_failures = mockTrx();
    mockTrx.users = mockTrx();

    // データベースのモック
    mockDb = {
      transaction: jest.fn().mockImplementation(callback => {
        return callback(mockTrx);
      })
    };

    // userServiceのモック
    mockUserService = {
      getUserByEmail: jest.fn(),
      getUserByFirebaseUid: jest.fn(),
      findOrCreateUser: jest.fn()
    };

    // モックを設定
    setUserService(mockUserService);
    if (typeof setDb === 'function') {
      setDb(mockDb);
    }
  });

  afterEach(() => {
    jest.clearAllMocks();
    jest.restoreAllMocks();
    
    // テスト間で状態が残らないようにリセット
    if (typeof setUserService === 'function') {
      setUserService(null);
    }
    if (typeof setDb === 'function') {
      setDb(null);
    }
  });

  describe('PAYMENT.SALE.COMPLETED', () => {
    // 各テストケースの前後にログを出力
    beforeEach(() => {
      console.log('PAYMENT.SALE.COMPLETED テストを開始します');
    });

    afterEach(() => {
      console.log('PAYMENT.SALE.COMPLETED テストを終了します');
    });
    test('should process completed payment and save to database', async () => {
      console.log('テストケース: 完了した支払いを処理してデータベースに保存する');
      const mockEvent = {
        event_type: 'PAYMENT.SALE.COMPLETED',
        resource: {
          id: 'PAY-123',
          billing_agreement_id: 'SUB-456',
          amount: {
            total: '480.00',
            currency: 'JPY'
          },
          create_time: '2025-01-01T00:00:00Z'
        }
      };

      // データベース挿入の成功をモック
      mockTrx().insert.mockResolvedValue([1]);
      mockTrx().returning.mockResolvedValue([1]);

      // テスト実行
      await processPayPalWebhook(mockEvent);
      
      // トランザクションが開始されたことを確認
      expect(mockDb.transaction).toHaveBeenCalled();
      
      // データベースに正しい値が挿入されたか確認
      expect(mockTrx.insert).toHaveBeenCalledWith({
        payment_id: 'PAY-123',
        subscription_id: 'SUB-456',
        amount: '480.00',
        currency: 'JPY',
        status: 'completed',
        raw_data: expect.any(String),
        created_at: expect.any(Date)
      });
    });

    test('should handle database errors', async () => {
      const mockEvent = {
        event_type: 'PAYMENT.SALE.COMPLETED',
        resource: {
          id: 'PAY-ERR',
          billing_agreement_id: 'SUB-ERR',
          amount: {
            total: '480.00',
            currency: 'JPY'
          }
        }
      };

      // データベースエラーをシミュレート
      const mockError = new Error('Database error');
      mockTrx().insert.mockRejectedValueOnce(mockError);

      // エラーがスローされることを確認
      await expect(processPayPalWebhook(mockEvent)).rejects.toThrow('Database error');
    });
  });

  // 他のテストケースは省略...
  
  describe('PAYMENT.SALE.DENIED', () => {
    test('should handle payment failure and save to payment_failures table', async () => {
      const mockEvent = {
        event_type: 'PAYMENT.SALE.DENIED',
        resource: {
          id: 'PAY-789',
          reason_code: 'TRANSACTION_REFUSED',
          billing_agreement_id: 'SUB-456'
        }
      };

      mockTrx.insert.mockResolvedValue([1]);

      await processPayPalWebhook(mockEvent);
      
      expect(mockDb.transaction).toHaveBeenCalled();
      expect(mockTrx.insert).toHaveBeenCalledWith({
        payment_id: 'PAY-789',
        subscription_id: 'SUB-456',
        reason: 'TRANSACTION_REFUSED',
        status: 'denied',
        raw_data: expect.any(String),
        created_at: expect.any(Date)
      });
    });
  });
});
