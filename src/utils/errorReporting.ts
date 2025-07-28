// エラーレポーティングユーティリティ
interface ErrorReport {
  message: string;
  stack?: string;
  url: string;
  userAgent: string;
  timestamp: string;
  userId?: string;
  sessionId: string;
  buildVersion: string;
}

class ErrorReporter {
  private sessionId: string;
  private userId?: string;

  constructor() {
    this.sessionId = this.generateSessionId();
    this.setupGlobalErrorHandlers();
  }

  private generateSessionId(): string {
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private setupGlobalErrorHandlers(): void {
    // JavaScript エラーをキャッチ
    window.addEventListener('error', (event) => {
      this.reportError({
        message: event.message,
        stack: event.error?.stack,
        url: event.filename || window.location.href,
        userAgent: navigator.userAgent,
        timestamp: new Date().toISOString(),
        sessionId: this.sessionId,
        buildVersion: this.getBuildVersion()
      });
    });

    // Promise rejection をキャッチ
    window.addEventListener('unhandledrejection', (event) => {
      this.reportError({
        message: `Unhandled Promise Rejection: ${event.reason}`,
        stack: event.reason?.stack,
        url: window.location.href,
        userAgent: navigator.userAgent,
        timestamp: new Date().toISOString(),
        sessionId: this.sessionId,
        buildVersion: this.getBuildVersion()
      });
    });
  }

  private getBuildVersion(): string {
    return (window as any).__APP_VERSION__ || '1.0.0';
  }

  setUserId(userId: string): void {
    this.userId = userId;
  }

  reportError(error: Partial<ErrorReport>): void {
    const report: ErrorReport = {
      message: error.message || 'Unknown error',
      stack: error.stack,
      url: error.url || window.location.href,
      userAgent: error.userAgent || navigator.userAgent,
      timestamp: error.timestamp || new Date().toISOString(),
      userId: this.userId,
      sessionId: this.sessionId,
      buildVersion: this.getBuildVersion()
    };

    // 開発環境ではコンソールに出力
    if (process.env.NODE_ENV === 'development') {
      console.error('🚨 Error Report:', report);
    }

    // 本番環境では外部サービスに送信
    if (process.env.NODE_ENV === 'production') {
      this.sendToErrorService(report);
    }
  }

  private async sendToErrorService(report: ErrorReport): Promise<void> {
    try {
      // 実際のエラーレポーティングサービス（Sentry、LogRocket等）に送信
      // ここでは localStorage に保存（デモ用）
      const errors = JSON.parse(localStorage.getItem('error_reports') || '[]');
      errors.push(report);
      
      // 最新の50件のみ保持
      if (errors.length > 50) {
        errors.splice(0, errors.length - 50);
      }
      
      localStorage.setItem('error_reports', JSON.stringify(errors));
    } catch (error) {
      console.error('Failed to send error report:', error);
    }
  }

  // 手動でエラーを報告
  captureException(error: Error, context?: Record<string, any>): void {
    this.reportError({
      message: error.message,
      stack: error.stack,
      url: window.location.href,
      userAgent: navigator.userAgent,
      timestamp: new Date().toISOString(),
      sessionId: this.sessionId,
      buildVersion: this.getBuildVersion()
    });
  }

  // パフォーマンス問題を報告
  reportPerformanceIssue(metric: string, value: number, threshold: number): void {
    if (value > threshold) {
      this.reportError({
        message: `Performance issue: ${metric} (${value}ms) exceeded threshold (${threshold}ms)`,
        url: window.location.href,
        userAgent: navigator.userAgent,
        timestamp: new Date().toISOString(),
        sessionId: this.sessionId,
        buildVersion: this.getBuildVersion()
      });
    }
  }
}

export const errorReporter = new ErrorReporter();