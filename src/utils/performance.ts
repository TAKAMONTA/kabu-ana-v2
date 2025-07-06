// パフォーマンス監視ユーティリティ
export class PerformanceMonitor {
  private static measurements: Map<string, number> = new Map();

  static startMeasurement(name: string): void {
    this.measurements.set(name, performance.now());
  }

  static endMeasurement(name: string): number {
    const startTime = this.measurements.get(name);
    if (!startTime) {
      console.warn(`Measurement "${name}" was not started`);
      return 0;
    }

    const duration = performance.now() - startTime;
    this.measurements.delete(name);
    
    // 開発環境でのみログ出力
    if (process.env.NODE_ENV === 'development') {
      console.log(`⏱️ ${name}: ${duration.toFixed(2)}ms`);
    }

    return duration;
  }

  static measureAsync<T>(name: string, fn: () => Promise<T>): Promise<T> {
    this.startMeasurement(name);
    return fn().finally(() => {
      this.endMeasurement(name);
    });
  }

  static measureSync<T>(name: string, fn: () => T): T {
    this.startMeasurement(name);
    try {
      return fn();
    } finally {
      this.endMeasurement(name);
    }
  }
}

// レスポンシブ画像読み込み
export const loadImageOptimized = (src: string, options?: {
  width?: number;
  height?: number;
  quality?: number;
}): Promise<HTMLImageElement> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    
    img.onload = () => resolve(img);
    img.onerror = reject;
    
    // 画像最適化パラメータを追加（実際のCDNサービスに応じて調整）
    let optimizedSrc = src;
    if (options) {
      const params = new URLSearchParams();
      if (options.width) params.append('w', options.width.toString());
      if (options.height) params.append('h', options.height.toString());
      if (options.quality) params.append('q', options.quality.toString());
      
      if (params.toString()) {
        optimizedSrc += (src.includes('?') ? '&' : '?') + params.toString();
      }
    }
    
    img.src = optimizedSrc;
  });
};

// メモリ使用量監視
export const getMemoryUsage = (): {
  used: number;
  total: number;
  percentage: number;
} | null => {
  if ('memory' in performance) {
    const memory = (performance as any).memory;
    return {
      used: memory.usedJSHeapSize,
      total: memory.totalJSHeapSize,
      percentage: (memory.usedJSHeapSize / memory.totalJSHeapSize) * 100
    };
  }
  return null;
};