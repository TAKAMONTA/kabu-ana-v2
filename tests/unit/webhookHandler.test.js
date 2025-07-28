const { 
  processPayPalWebhook, 
  setUserService, 
  setDb,
  _testExports: {
    handlePaymentCompleted,
    handlePaymentDenied,
    handleSubscriptionActivated
  }
} = require('../../services/webhookHandler');

describe('webhookHandler', () => {
  // テストタイムアウトを30秒に設定
  jest.setTimeout(30000);
  let mockUserService;
  let mockDb;
  let consoleSpy;

  beforeEach(() => {
    // モックのセットアップ
    mockUserService = {
      getUserByEmail: jest.fn(),
      getUserByFirebaseUid: jest.fn(),
      findOrCreateUser: jest.fn()
    };

    // DBモックのセットアップ
    mockDb = {
      insert: jest.fn().mockReturnThis(),
      where: jest.fn().mockReturnThis(),
      update: jest.fn().mockResolvedValue([1]),
      transaction: jest.fn(callback => {
        const trx = {
          insert: jest.fn().mockReturnThis(),
          where: jest.fn().mockReturnThis(),
          update: jest.fn().mockResolvedValue([1])
        };
        return callback(trx);
      })
    };

    // モックを設定
    // データベースモックを設定
    if (typeof setDb === 'function') {
      setDb(mockDb);
    }
    setUserService(mockUserService);
    
    // コンソールスパイ
    consoleSpy = jest.spyOn(console, 'log').mockImplementation(() => {});
    jest.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    jest.clearAllMocks();
    // モックをリセット
    jest.restoreAllMocks();
  });

  describe('processPayPalWebhook', () => {
    describe('PAYMENT.SALE.COMPLETED', () => {
      const mockEvent = {
        event_type: 'PAYMENT.SALE.COMPLETED',
        resource: {
          id: 'PAY-123',
          billing_agreement_id: 'SUB-456',
          amount: {
            total: '10.00',
            currency: 'USD'
          },
          create_time: new Date().toISOString()
        }
      };

      it('should process completed payment', async () => {
        // モックのトランザクションを設定
        const mockTrx = {
          insert: jest.fn().mockReturnThis(),
          where: jest.fn().mockReturnThis(),
          update: jest.fn().mockResolvedValue([1])
        };
        
        // トランザクションのモックを設定
        mockDb.transaction.mockImplementationOnce(callback => callback(mockTrx));
       // データベース挿入の成功をモック
      mockTrx.insert.mockResolvedValue([1]);

      // テスト実行
      await processPayPalWebhook(mockEvent);
      
      // トランザクションが開始されたことを確認
      expect(mockDb.transaction).toHaveBeenCalled();
      
      // データベースに正しい値が挿入されたか確認
      expect(mockTrx.insert).toHaveBeenCalledWith({
        payment_id: 'PAY-123',
        subscription_id: 'SUB-456',
        amount: '10.00',
        currency: 'USD',
        status: 'completed',
        raw_data: expect.any(String),
        created_at: expect.any(Date)
      });
          created_at: expect.any(Date)
        });
      });
    });

    describe('PAYMENT.SALE.DENIED', () => {
      const mockEvent = {
        event_type: 'PAYMENT.SALE.DENIED',
        resource: {
          id: 'PAY-789',
          reason_code: 'INSUFFICIENT_FUNDS',
          amount: {
            total: '480.00',
            currency: 'JPY'
          },
          create_time: new Date().toISOString()
        }
      };

      it('should handle payment denial', async () => {
        // モックのトランザクションを設定
        const mockTrx = {
          insert: jest.fn().mockReturnThis(),
          where: jest.fn().mockReturnThis(),
          update: jest.fn().mockResolvedValue([1])
        };
        
        // テスト対象の関数を呼び出し
        await handlePaymentDenied(mockEvent.resource, mockTrx);
        
        // エラーログが記録されたことを確認
        expect(console.error).toHaveBeenCalled();
        // データベースへの挿入が正しく呼び出されたことを確認
        expect(mockTrx.insert).toHaveBeenCalledWith({
          payment_id: 'PAY-789',
          reason_code: 'INSUFFICIENT_FUNDS',
          raw_data: expect.any(String),
          created_at: expect.any(Date)
        });
      });
    });

    describe('BILLING.SUBSCRIPTION.ACTIVATED', () => {
      const mockUser = {
        id: 1,
        email: 'test@example.com',
        name: 'Test User'
      };

      const mockEvent = {
        event_type: 'BILLING.SUBSCRIPTION.ACTIVATED',
        resource: {
          id: 'SUB-123',
          subscriber: {
            email_address: 'test@example.com',
            name: {
              given_name: 'Test',
              surname: 'User'
            }
          },
          plan_id: 'P-BASIC-MONTHLY',
          create_time: new Date().toISOString()
        }
      };

      it('should find and update user subscription', async () => {
        mockUserService.getUserByEmail.mockResolvedValue(mockUser);
        
        // モックのトランザクションを設定
        const mockTrx = {
          insert: jest.fn().mockReturnThis(),
          where: jest.fn().mockReturnThis(),
          update: jest.fn().mockResolvedValue([1])
        };
        
        // テスト対象の関数を呼び出し
        await handleSubscriptionActivated(mockEvent.resource, mockTrx);
        
        expect(mockUserService.getUserByEmail).toHaveBeenCalledWith('test@example.com');
        expect(mockTrx.update).toHaveBeenCalledWith({
          subscription_status: 'active',
          subscription_id: 'SUB-123',
          updated_at: expect.any(Date)
        });
      });

      it('should handle user not found', async () => {
        mockUserService.getUserByEmail.mockResolvedValue(null);
        
        await processPayPalWebhook(mockEvent);
        
        expect(consoleSpy).toHaveBeenCalledWith(
          'User not found for email: test@example.com'
        );
      });
    });

    describe('Error Handling', () => {
      it('should handle unknown event types', async () => {
        const mockEvent = {
          event_type: 'UNKNOWN.EVENT',
          resource: {}
        };

        await expect(processPayPalWebhook(mockEvent)).resolves.not.toThrow();
        expect(consoleSpy).toHaveBeenCalledWith('Unhandled PayPal Webhook Event: UNKNOWN.EVENT');
      });

      it('should handle errors in event processing', async () => {
        const mockEvent = {
          event_type: 'PAYMENT.SALE.COMPLETED',
          resource: {
            id: 'PAY-ERROR',
            billing_agreement_id: 'SUB-ERROR',
            amount: {
              total: '100.00',
              currency: 'JPY'
            },
            create_time: new Date().toISOString()
          }
        };

        // トランザクション内でエラーを発生させる
        const mockError = new Error('Database error');
        mockDb.transaction.mockImplementationOnce(async (callback) => {
          // トランザクション内でコールバックを呼び出してエラーを発生させる
          try {
            await callback({
              insert: jest.fn().mockRejectedValue(mockError)
            });
          } catch (error) {
            // エラーを再スローして、トランザクション全体が失敗するようにする
            throw error;
          }
        });

        // エラーがスローされることを期待する
        await expect(processPayPalWebhook(mockEvent)).rejects.toThrow('Database error');
        
        // エラーログが記録されたことを確認
        expect(console.error).toHaveBeenCalledWith(
          'Error processing PayPal webhook:', 
          expect.any(Error)
        );
      });
    });
  });

  describe('handlePaymentCompleted', () => {
    it('should process payment completion', async () => {
      const event = {
        resource: {
          id: 'PAY-123',
          billing_agreement_id: 'SUB-456',
          amount: { total: '480.00', currency: 'JPY' },
          create_time: new Date().toISOString()
        }
      };

      // モックのトランザクションを設定
      const mockTrx = {
        insert: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        update: jest.fn().mockResolvedValue([1])
      };
      
      // テスト対象の関数を呼び出し
      await handlePaymentCompleted(event.resource, mockTrx);
      
      // データベースへの挿入が正しく呼び出されたことを確認
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
  });
});
