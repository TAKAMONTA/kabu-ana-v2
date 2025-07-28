// アナリティクス・ユーザー行動追跡
interface AnalyticsEvent {
  event: string;
  category: string;
  action: string;
  label?: string;
  value?: number;
  timestamp: string;
  sessionId: string;
  userId?: string;
  page: string;
  userAgent: string;
}

class Analytics {
  private sessionId: string;
  private userId?: string;
  private events: AnalyticsEvent[] = [];

  constructor() {
    this.sessionId = this.generateSessionId();
    this.setupPageTracking();
  }

  private generateSessionId(): string {
    return `analytics_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private setupPageTracking(): void {
    // ページビューを自動追跡
    this.trackPageView();
    
    // ルート変更を監視
    window.addEventListener('popstate', () => {
      this.trackPageView();
    });
  }

  setUserId(userId: string): void {
    this.userId = userId;
  }

  trackEvent(category: string, action: string, label?: string, value?: number): void {
    const event: AnalyticsEvent = {
      event: 'custom_event',
      category,
      action,
      label,
      value,
      timestamp: new Date().toISOString(),
      sessionId: this.sessionId,
      userId: this.userId,
      page: window.location.pathname,
      userAgent: navigator.userAgent
    };

    this.events.push(event);
    this.sendEvent(event);
  }

  trackPageView(): void {
    this.trackEvent('page', 'view', window.location.pathname);
  }

  // 株式検索イベント
  trackStockSearch(searchTerm: string, resultsCount: number): void {
    this.trackEvent('stock', 'search', searchTerm, resultsCount);
  }

  // 株式分析イベント
  trackStockAnalysis(symbol: string, investmentStyle: string): void {
    this.trackEvent('stock', 'analyze', `${symbol}_${investmentStyle}`);
  }

  // チャート画像分析イベント
  trackChartImageAnalysis(fileName: string): void {
    this.trackEvent('chart', 'image_analysis', fileName);
  }

  // エラーイベント
  trackError(errorMessage: string, errorType: string): void {
    this.trackEvent('error', errorType, errorMessage);
  }

  // パフォーマンスイベント
  trackPerformance(metric: string, value: number): void {
    this.trackEvent('performance', metric, undefined, value);
  }

  // ユーザーエンゲージメント
  trackEngagement(action: string, element: string): void {
    this.trackEvent('engagement', action, element);
  }

  private sendEvent(event: AnalyticsEvent): void {
    // 開発環境ではコンソールに出力
    if (process.env.NODE_ENV === 'development') {
      console.log('📊 Analytics Event:', event);
    }

    // 本番環境では外部サービスに送信
    if (process.env.NODE_ENV === 'production') {
      this.sendToAnalyticsService(event);
    }
  }

  private async sendToAnalyticsService(event: AnalyticsEvent): Promise<void> {
    try {
      // 実際のアナリティクスサービス（Google Analytics、Mixpanel等）に送信
      // ここでは localStorage に保存（デモ用）
      const events = JSON.parse(localStorage.getItem('analytics_events') || '[]');
      events.push(event);
      
      // 最新の1000件のみ保持
      if (events.length > 1000) {
        events.splice(0, events.length - 1000);
      }
      
      localStorage.setItem('analytics_events', JSON.stringify(events));
    } catch (error) {
      console.error('Failed to send analytics event:', error);
    }
  }

  // セッション統計を取得
  getSessionStats(): {
    sessionId: string;
    eventsCount: number;
    duration: number;
    pages: string[];
  } {
    const sessionEvents = this.events.filter(e => e.sessionId === this.sessionId);
    const pages = [...new Set(sessionEvents.map(e => e.page))];
    const firstEvent = sessionEvents[0];
    const lastEvent = sessionEvents[sessionEvents.length - 1];
    
    const duration = firstEvent && lastEvent 
      ? new Date(lastEvent.timestamp).getTime() - new Date(firstEvent.timestamp).getTime()
      : 0;

    return {
      sessionId: this.sessionId,
      eventsCount: sessionEvents.length,
      duration,
      pages
    };
  }
}

export const analytics = new Analytics();