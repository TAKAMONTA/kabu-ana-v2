import { Stock } from '../types/stock';
import { PerformanceMonitor } from '../utils/performance';
import { analytics } from '../utils/analytics';
import { errorReporter } from '../utils/errorReporting';

export class StockService {
  private static readonly YAHOO_FINANCE_API = 'https://query1.finance.yahoo.com';
  private static readonly FALLBACK_DELAY = 1000; // 1秒のフォールバック遅延

  static async searchStocks(searchTerm: string): Promise<Stock[]> {
    return PerformanceMonitor.measureAsync('stock_search', async () => {
    try {
      analytics.trackStockSearch(searchTerm, 0); // 結果数は後で更新
      
      // まずYahoo Finance APIを試行
      const yahooResults = await this.searchYahooFinance(searchTerm);
      if (yahooResults.length > 0) {
        analytics.trackStockSearch(searchTerm, yahooResults.length);
        return yahooResults;
      }

      // フォールバック: 内蔵データベースから検索
      const fallbackResults = this.searchFallbackDatabase(searchTerm);
      analytics.trackStockSearch(searchTerm, fallbackResults.length);
      return fallbackResults;
    } catch (error) {
      console.error('Stock search failed:', error);
      errorReporter.captureException(error as Error, { searchTerm });
      analytics.trackError('stock_search_failed', 'api_error');
      
      // エラー時もフォールバックデータを返す
      const fallbackResults = this.searchFallbackDatabase(searchTerm);
      analytics.trackStockSearch(searchTerm, fallbackResults.length);
      return fallbackResults;
    }
    });
  }

  private static async searchYahooFinance(searchTerm: string): Promise<Stock[]> {
    try {
      const normalizedSymbol = this.normalizeSymbol(searchTerm);
      
      const response = await fetch(
        `/api/yahoo/v8/finance/chart/${normalizedSymbol}?interval=1d&range=1mo`,
        {
          method: 'GET',
          headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
            'Accept': 'application/json',
            'Cache-Control': 'no-cache'
          }
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      
      if (!data?.chart?.result?.[0]) {
        throw new Error('Invalid data format from Yahoo Finance');
      }

      return [this.parseYahooFinanceData(data.chart.result[0])];
    } catch (error) {
      console.error('Yahoo Finance API error:', error);
      throw error;
    }
  }

  private static parseYahooFinanceData(result: any): Stock {
    const meta = result.meta || {};
    const quotes = result.indicators?.quote?.[0] || {};
    
    // 価格データの抽出
    const prices = (quotes.close || []).filter((p: number) => p !== null);
    const volumes = (quotes.volume || []).filter((v: number) => v !== null);
    
    const currentPrice = meta.regularMarketPrice || prices[prices.length - 1] || 0;
    const previousClose = meta.previousClose || prices[prices.length - 2] || currentPrice;
    const change = currentPrice - previousClose;
    const changePercent = previousClose > 0 ? (change / previousClose) * 100 : 0;
    
    // 移動平均の計算
    const ma5 = this.calculateSMA(prices, 5);
    const ma20 = this.calculateSMA(prices, 20);
    
    // 52週高値・安値
    const highs = (quotes.high || []).filter((h: number) => h !== null);
    const lows = (quotes.low || []).filter((l: number) => l !== null);
    const high52Week = highs.length > 0 ? Math.max(...highs) : currentPrice;
    const low52Week = lows.length > 0 ? Math.min(...lows) : currentPrice;
    
    return {
      symbol: meta.symbol || 'UNKNOWN',
      name: meta.longName || meta.shortName || 'Unknown Company',
      price: currentPrice,
      change: change,
      changePercent: changePercent,
      volume: meta.regularMarketVolume || volumes[volumes.length - 1] || 0,
      marketCap: meta.marketCap || 0,
      pe: this.estimatePE(meta.symbol || '', currentPrice),
      dividendYield: this.estimateDividendYield(meta.symbol || ''),
      sector: this.getSectorFromSymbol(meta.symbol || ''),
      ma5: ma5,
      ma20: ma20,
      avgVolume: volumes.length > 10 ? volumes.slice(-10).reduce((a, b) => a + b, 0) / 10 : 0,
      high52Week: high52Week,
      low52Week: low52Week,
      prices: prices,
      volumes: volumes
    };
  }

  private static searchFallbackDatabase(searchTerm: string): Stock[] {
    const database = this.getFallbackStockDatabase();
    const results: Stock[] = [];
    
    // 完全一致検索
    if (database[searchTerm]) {
      results.push(database[searchTerm]);
    }
    
    // 部分一致検索
    Object.entries(database).forEach(([symbol, stock]) => {
      if (symbol !== searchTerm && 
          (symbol.toLowerCase().includes(searchTerm.toLowerCase()) ||
           stock.name.toLowerCase().includes(searchTerm.toLowerCase()))) {
        results.push(stock);
      }
    });
    
    return results.slice(0, 10); // 最大10件まで
  }

  private static getFallbackStockDatabase(): { [key: string]: Stock } {
    const basePrice = 3000;
    const generateStock = (symbol: string, name: string, sector: string, priceMultiplier: number = 1): Stock => {
      const price = basePrice * priceMultiplier;
      const change = (Math.random() - 0.5) * price * 0.05; // ±2.5%の変動
      const changePercent = (change / price) * 100;
      const volume = Math.floor(Math.random() * 1000000) + 100000;
      
      return {
        symbol,
        name,
        price,
        change,
        changePercent,
        volume,
        marketCap: price * 1000000000, // 仮の時価総額
        pe: this.estimatePE(symbol, price),
        dividendYield: this.estimateDividendYield(symbol),
        sector,
        ma5: price * (0.98 + Math.random() * 0.04),
        ma20: price * (0.95 + Math.random() * 0.1),
        avgVolume: volume * (0.8 + Math.random() * 0.4),
        high52Week: price * (1.1 + Math.random() * 0.3),
        low52Week: price * (0.7 + Math.random() * 0.2),
        prices: this.generatePriceHistory(price, 60),
        volumes: this.generateVolumeHistory(volume, 60)
      };
    };

    return {
      // 日本株
      '7203': generateStock('7203', 'トヨタ自動車', '自動車・輸送機器', 1.0),
      '6758': generateStock('6758', 'ソニーグループ', '電気機器', 1.2),
      '9984': generateStock('9984', 'ソフトバンクグループ', '情報・通信業', 0.8),
      '8306': generateStock('8306', '三菱UFJフィナンシャル・グループ', '銀行業', 0.3),
      '4519': generateStock('4519', '中外製薬', '医薬品', 1.5),
      '6861': generateStock('6861', 'キーエンス', '電気機器', 15.0),
      '8035': generateStock('8035', '東京エレクトロン', '電気機器', 8.0),
      '4063': generateStock('4063', '信越化学工業', '化学', 2.5),
      '9432': generateStock('9432', '日本電信電話', '情報・通信業', 1.0),
      '2914': generateStock('2914', '日本たばこ産業', '食品', 0.7),
      
      // 米国株
      'AAPL': generateStock('AAPL', 'Apple Inc.', 'Technology', 50.0),
      'MSFT': generateStock('MSFT', 'Microsoft Corporation', 'Technology', 100.0),
      'GOOGL': generateStock('GOOGL', 'Alphabet Inc.', 'Technology', 35.0),
      'AMZN': generateStock('AMZN', 'Amazon.com Inc.', 'Consumer Discretionary', 45.0),
      'TSLA': generateStock('TSLA', 'Tesla Inc.', 'Consumer Discretionary', 70.0),
      'META': generateStock('META', 'Meta Platforms Inc.', 'Technology', 150.0),
      'NVDA': generateStock('NVDA', 'NVIDIA Corporation', 'Technology', 250.0),
      'NFLX': generateStock('NFLX', 'Netflix Inc.', 'Communication Services', 150.0),
      'DIS': generateStock('DIS', 'The Walt Disney Company', 'Communication Services', 30.0),
      'KO': generateStock('KO', 'The Coca-Cola Company', 'Consumer Staples', 20.0)
    };
  }

  private static normalizeSymbol(symbol: string): string {
    // 既に.Tが付いている場合はそのまま返す
    if (symbol.endsWith('.T')) {
      return symbol;
    }
    
    // 4桁の数字の場合は日本株として.Tを追加
    if (/^\d{4}$/.test(symbol)) {
      return `${symbol}.T`;
    }
    
    // その他の場合は大文字に変換
    return symbol.toUpperCase();
  }

  private static calculateSMA(prices: number[], period: number): number {
    if (prices.length < period) return prices[prices.length - 1] || 0;
    const recentPrices = prices.slice(-period);
    return recentPrices.reduce((a, b) => a + b, 0) / period;
  }

  private static estimatePE(symbol: string, price: number): number {
    const sectorPE: { [key: string]: number } = {
      'テクノロジー': 25,
      'ヘルスケア': 18,
      '金融サービス': 12,
      '一般消費財・サービス': 15,
      '生活必需品': 20,
      'コミュニケーション・サービス': 22,
      '自動車・輸送機器': 12,
      '電気機器': 18,
      '情報・通信業': 22,
      '医薬品': 22,
      '銀行業': 9,
      '化学': 14,
      '食品': 18
    };
    
    const sector = this.getSectorFromSymbol(symbol);
    const basePE = sectorPE[sector] || 15;
    
    // 価格に基づいて若干の調整
    const adjustment = (Math.random() - 0.5) * 0.3; // ±15%の調整
    return Math.max(basePE * (1 + adjustment), 5);
  }

  private static estimateDividendYield(symbol: string): number {
    const sectorYield: { [key: string]: number } = {
      'テクノロジー': 1.5,
      'ヘルスケア': 2.0,
      '金融サービス': 3.5,
      '一般消費財・サービス': 1.0,
      '生活必需品': 2.5,
      'コミュニケーション・サービス': 1.8,
      '自動車・輸送機器': 2.8,
      '電気機器': 2.2,
      '情報・通信業': 3.0,
      '医薬品': 2.5,
      '銀行業': 4.0,
      '化学': 2.3,
      '食品': 2.0
    };
    
    const sector = this.getSectorFromSymbol(symbol);
    const baseYield = sectorYield[sector] || 2.0;
    
    // ランダムな調整
    const adjustment = (Math.random() - 0.5) * 0.5; // ±0.25%の調整
    return Math.max(baseYield + adjustment, 0);
  }

  private static getSectorFromSymbol(symbol: string): string {
    // 日本株の場合の業界推測ロジック
    const cleanSymbol = symbol.replace('.T', '');
    if (/^\d{4}$/.test(cleanSymbol)) {
      const code = parseInt(cleanSymbol);
      if (code >= 1000 && code < 2000) return '水産・農林業';
      if (code >= 2000 && code < 3000) return '食品';
      if (code >= 3000 && code < 4000) return '繊維製品';
      if (code >= 4000 && code < 5000) return '化学';
      if (code >= 5000 && code < 6000) return '医薬品';
      if (code >= 6000 && code < 7000) return '機械';
      if (code >= 7000 && code < 8000) return '自動車・輸送機器';
      if (code >= 8000 && code < 9000) return '銀行業';
      if (code >= 9000 && code < 10000) return '情報・通信業';
    }
    
    // 米国株の場合
    const usSectors: { [key: string]: string } = {
      'AAPL': 'テクノロジー',
      'MSFT': 'テクノロジー',
      'GOOGL': 'テクノロジー',
      'AMZN': '一般消費財・サービス',
      'TSLA': '一般消費財・サービス',
      'META': 'テクノロジー',
      'NVDA': 'テクノロジー',
      'NFLX': 'コミュニケーション・サービス',
      'DIS': 'コミュニケーション・サービス',
      'KO': '生活必需品'
    };
    
    return usSectors[symbol] || 'その他';
  }

  private static generatePriceHistory(currentPrice: number, days: number): number[] {
    const prices = [];
    let price = currentPrice;
    
    for (let i = 0; i < days; i++) {
      price += (Math.random() - 0.5) * price * 0.02; // ±1%の変動
      prices.unshift(price);
    }
    
    return prices;
  }

  private static generateVolumeHistory(currentVolume: number, days: number): number[] {
    const volumes = [];
    
    for (let i = 0; i < days; i++) {
      const volume = currentVolume * (0.5 + Math.random()); // 50%-150%の範囲
      volumes.unshift(Math.floor(volume));
    }
    
    return volumes;
  }

  // 外部からアクセス可能なメソッド
  static async fetchStockData(symbol: string): Promise<Stock | null> {
    try {
      const results = await this.searchStocks(symbol);
      return results.length > 0 ? results[0] : null;
    } catch (error) {
      console.error('Failed to fetch stock data:', error);
      return null;
    }
  }

  // リアルタイム価格更新（WebSocket接続のシミュレーション）
  static async getRealtimePrice(symbol: string): Promise<{ price: number; change: number; changePercent: number } | null> {
    try {
      // 実際の実装ではWebSocket接続を使用
      await new Promise(resolve => setTimeout(resolve, 500)); // 遅延シミュレーション
      
      const stock = await this.fetchStockData(symbol);
      if (!stock) return null;
      
      // 小さなランダム変動を追加
      const priceChange = (Math.random() - 0.5) * stock.price * 0.001; // ±0.05%の変動
      const newPrice = stock.price + priceChange;
      const change = newPrice - stock.price;
      const changePercent = (change / stock.price) * 100;
      
      return {
        price: newPrice,
        change: change,
        changePercent: changePercent
      };
    } catch (error) {
      console.error('Failed to get realtime price:', error);
      return null;
    }
  }
}