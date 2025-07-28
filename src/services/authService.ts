import { analytics } from '../utils/analytics';
import { errorReporter } from '../utils/errorReporting';

export interface User {
  id: string;
  email: string;
  name: string;
  avatar?: string;
  createdAt: string;
  lastLoginAt: string;
  subscription?: {
    plan: 'free' | 'premium' | 'pro';
    expiresAt?: string;
  };
  preferences?: {
    defaultInvestmentStyle: 'short' | 'medium' | 'long';
    notifications: boolean;
    theme: 'light' | 'dark' | 'auto';
  };
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface SignupData {
  email: string;
  password: string;
  name: string;
}

export interface AuthResponse {
  user: User;
  token: string;
  refreshToken: string;
}

class AuthService {
  private currentUser: User | null = null;
  private token: string | null = null;
  private refreshToken: string | null = null;

  constructor() {
    this.loadFromStorage();
  }

  // ローカルストレージから認証情報を読み込み
  private loadFromStorage(): void {
    try {
      const userData = localStorage.getItem('auth_user');
      const token = localStorage.getItem('auth_token');
      const refreshToken = localStorage.getItem('auth_refresh_token');

      if (userData && token) {
        this.currentUser = JSON.parse(userData);
        this.token = token;
        this.refreshToken = refreshToken;
        
        // アナリティクスにユーザーIDを設定
        analytics.setUserId(this.currentUser.id);
        errorReporter.setUserId(this.currentUser.id);
      }
    } catch (error) {
      console.error('Failed to load auth data from storage:', error);
      this.clearStorage();
    }
  }

  // ローカルストレージに認証情報を保存
  private saveToStorage(user: User, token: string, refreshToken: string): void {
    try {
      localStorage.setItem('auth_user', JSON.stringify(user));
      localStorage.setItem('auth_token', token);
      localStorage.setItem('auth_refresh_token', refreshToken);
      
      this.currentUser = user;
      this.token = token;
      this.refreshToken = refreshToken;
      
      // アナリティクスにユーザーIDを設定
      analytics.setUserId(user.id);
      errorReporter.setUserId(user.id);
    } catch (error) {
      console.error('Failed to save auth data to storage:', error);
      throw new Error('認証情報の保存に失敗しました');
    }
  }

  // ローカルストレージをクリア
  private clearStorage(): void {
    localStorage.removeItem('auth_user');
    localStorage.removeItem('auth_token');
    localStorage.removeItem('auth_refresh_token');
    
    this.currentUser = null;
    this.token = null;
    this.refreshToken = null;
  }

  // ログイン
  async login(email: string, password: string): Promise<AuthResponse> {
    try {
      // 実際のAPIコールの代わりにシミュレーション
      await this.simulateApiCall();

      // デモ用の認証チェック
      if (email === 'demo@example.com' && password === 'password123') {
        const authResponse = this.createDemoAuthResponse(email);
        this.saveToStorage(authResponse.user, authResponse.token, authResponse.refreshToken);
        return authResponse;
      }

      // 実際の実装では、ここでAPIにリクエストを送信
      const response = await this.mockApiLogin(email, password);
      this.saveToStorage(response.user, response.token, response.refreshToken);
      
      return response;
    } catch (error) {
      errorReporter.captureException(error as Error, { email });
      throw error;
    }
  }

  // サインアップ
  async signup(data: SignupData): Promise<AuthResponse> {
    try {
      // 実際のAPIコールの代わりにシミュレーション
      await this.simulateApiCall();

      // 実際の実装では、ここでAPIにリクエストを送信
      const response = await this.mockApiSignup(data);
      this.saveToStorage(response.user, response.token, response.refreshToken);
      
      return response;
    } catch (error) {
      errorReporter.captureException(error as Error, { email: data.email });
      throw error;
    }
  }

  // Googleログイン
  async loginWithGoogle(): Promise<AuthResponse> {
    try {
      // 実際の実装では、Google OAuth APIを使用
      await this.simulateApiCall();
      
      const authResponse = this.createDemoAuthResponse('google.user@gmail.com', 'Google User');
      this.saveToStorage(authResponse.user, authResponse.token, authResponse.refreshToken);
      
      return authResponse;
    } catch (error) {
      errorReporter.captureException(error as Error);
      throw new Error('Googleログインに失敗しました');
    }
  }

  // ログアウト
  async logout(): Promise<void> {
    try {
      // 実際の実装では、サーバーにログアウトリクエストを送信
      await this.simulateApiCall();
      
      this.clearStorage();
      analytics.trackEvent('auth', 'logout');
    } catch (error) {
      errorReporter.captureException(error as Error);
      // ログアウトは失敗してもローカルデータをクリア
      this.clearStorage();
    }
  }

  // パスワードリセット
  async resetPassword(email: string): Promise<void> {
    try {
      await this.simulateApiCall();
      
      // 実際の実装では、パスワードリセットメールを送信
      console.log(`Password reset email sent to: ${email}`);
      analytics.trackEvent('auth', 'password_reset_request', email);
    } catch (error) {
      errorReporter.captureException(error as Error, { email });
      throw new Error('パスワードリセットメールの送信に失敗しました');
    }
  }

  // トークン更新
  async refreshAccessToken(): Promise<string> {
    try {
      if (!this.refreshToken) {
        throw new Error('リフレッシュトークンがありません');
      }

      await this.simulateApiCall();
      
      // 実際の実装では、リフレッシュトークンを使用して新しいアクセストークンを取得
      const newToken = this.generateMockToken();
      this.token = newToken;
      localStorage.setItem('auth_token', newToken);
      
      return newToken;
    } catch (error) {
      errorReporter.captureException(error as Error);
      // トークン更新に失敗した場合はログアウト
      this.clearStorage();
      throw new Error('認証の有効期限が切れました。再度ログインしてください。');
    }
  }

  // ユーザー情報更新
  async updateProfile(updates: Partial<Pick<User, 'name' | 'preferences'>>): Promise<User> {
    try {
      if (!this.currentUser) {
        throw new Error('ログインが必要です');
      }

      await this.simulateApiCall();
      
      // 実際の実装では、サーバーにユーザー情報更新リクエストを送信
      const updatedUser = { ...this.currentUser, ...updates };
      this.saveToStorage(updatedUser, this.token!, this.refreshToken!);
      
      analytics.trackEvent('user', 'profile_update');
      return updatedUser;
    } catch (error) {
      errorReporter.captureException(error as Error);
      throw error;
    }
  }

  // 現在のユーザーを取得
  getCurrentUser(): User | null {
    return this.currentUser;
  }

  // 認証状態を確認
  isAuthenticated(): boolean {
    return this.currentUser !== null && this.token !== null;
  }

  // 認証トークンを取得
  getToken(): string | null {
    return this.token;
  }

  // APIリクエスト用のヘッダーを取得
  getAuthHeaders(): Record<string, string> {
    if (!this.token) {
      return {};
    }
    
    return {
      'Authorization': `Bearer ${this.token}`,
      'Content-Type': 'application/json'
    };
  }

  // プレミアム機能の利用可能性をチェック
  canUsePremiumFeatures(): boolean {
    if (!this.currentUser?.subscription) {
      return false;
    }
    
    const { plan, expiresAt } = this.currentUser.subscription;
    
    if (plan === 'free') {
      return false;
    }
    
    if (expiresAt && new Date(expiresAt) < new Date()) {
      return false;
    }
    
    return true;
  }

  // モック用のヘルパーメソッド
  private async simulateApiCall(): Promise<void> {
    // APIコールをシミュレート（1-2秒の遅延）
    await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 1000));
  }

  private generateMockToken(): string {
    return `mock_token_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private createDemoAuthResponse(email: string, name?: string): AuthResponse {
    const user: User = {
      id: `user_${Date.now()}`,
      email,
      name: name || email.split('@')[0],
      createdAt: new Date().toISOString(),
      lastLoginAt: new Date().toISOString(),
      subscription: {
        plan: 'free'
      },
      preferences: {
        defaultInvestmentStyle: 'medium',
        notifications: true,
        theme: 'light'
      }
    };

    return {
      user,
      token: this.generateMockToken(),
      refreshToken: this.generateMockToken()
    };
  }

  private async mockApiLogin(email: string, password: string): Promise<AuthResponse> {
    // 簡単なバリデーション
    if (!email.includes('@')) {
      throw new Error('有効なメールアドレスを入力してください');
    }
    
    if (password.length < 6) {
      throw new Error('パスワードが正しくありません');
    }

    // デモ用のエラーシミュレーション
    if (email === 'error@example.com') {
      throw new Error('ログインに失敗しました。メールアドレスまたはパスワードが正しくありません。');
    }

    return this.createDemoAuthResponse(email);
  }

  private async mockApiSignup(data: SignupData): Promise<AuthResponse> {
    // バリデーション
    if (!data.email.includes('@')) {
      throw new Error('有効なメールアドレスを入力してください');
    }
    
    if (data.password.length < 8) {
      throw new Error('パスワードは8文字以上で入力してください');
    }
    
    if (!data.name.trim()) {
      throw new Error('お名前を入力してください');
    }

    // デモ用のエラーシミュレーション
    if (data.email === 'existing@example.com') {
      throw new Error('このメールアドレスは既に登録されています');
    }

    return this.createDemoAuthResponse(data.email, data.name);
  }
}

export const authService = new AuthService();

export { AuthService };

// デフォルトエクスポートも追加（互換性のため）
export default authService;