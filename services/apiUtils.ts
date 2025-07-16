export interface RetryConfig {
  maxRetries: number;
  baseDelay: number;
  maxDelay: number;
  backoffMultiplier: number;
  retryableErrors: string[];
}

export interface CircuitBreakerConfig {
  failureThreshold: number;
  resetTimeout: number;
  monitoringPeriod: number;
}

export class ApiError extends Error {
  constructor(
    message: string,
    public statusCode?: number,
    public isRetryable: boolean = false,
    public originalError?: any
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

interface CircuitBreakerState {
  failures: number;
  lastFailureTime: number;
  state: 'CLOSED' | 'OPEN' | 'HALF_OPEN';
}

export class RobustApiClient {
  private circuitBreakers = new Map<string, CircuitBreakerState>();
  private readonly circuitBreakerConfig: CircuitBreakerConfig = {
    failureThreshold: 5,
    resetTimeout: 60000,
    monitoringPeriod: 300000
  };

  async executeWithRetry<T>(
    operation: () => Promise<T>,
    config: RetryConfig,
    operationName: string
  ): Promise<T> {
    const circuitBreaker = this.getCircuitBreaker(operationName);
    
    if (circuitBreaker.state === 'OPEN') {
      const timeSinceLastFailure = Date.now() - circuitBreaker.lastFailureTime;
      if (timeSinceLastFailure < this.circuitBreakerConfig.resetTimeout) {
        throw new ApiError(
          `Circuit breaker is OPEN for ${operationName}. Service temporarily unavailable.`,
          503,
          false
        );
      } else {
        circuitBreaker.state = 'HALF_OPEN';
      }
    }

    let lastError: any;
    
    for (let attempt = 0; attempt <= config.maxRetries; attempt++) {
      try {
        const result = await operation();
        
        if (circuitBreaker.state === 'HALF_OPEN') {
          circuitBreaker.state = 'CLOSED';
          circuitBreaker.failures = 0;
        }
        
        return result;
      } catch (error: any) {
        lastError = error;
        
        const isRetryable = this.isRetryableError(error, config.retryableErrors);
        const isLastAttempt = attempt === config.maxRetries;
        
        this.updateCircuitBreaker(operationName, error);
        
        if (!isRetryable || isLastAttempt) {
          throw this.createApiError(error, isRetryable);
        }
        
        const delay = this.calculateDelay(attempt, config);
        console.warn(`API call failed (attempt ${attempt + 1}/${config.maxRetries + 1}), retrying in ${delay}ms:`, error.message);
        
        await this.delay(delay);
      }
    }
    
    throw this.createApiError(lastError, false);
  }

  private getCircuitBreaker(operationName: string): CircuitBreakerState {
    if (!this.circuitBreakers.has(operationName)) {
      this.circuitBreakers.set(operationName, {
        failures: 0,
        lastFailureTime: 0,
        state: 'CLOSED'
      });
    }
    return this.circuitBreakers.get(operationName)!;
  }

  private updateCircuitBreaker(operationName: string, error: any): void {
    const circuitBreaker = this.getCircuitBreaker(operationName);
    circuitBreaker.failures++;
    circuitBreaker.lastFailureTime = Date.now();
    
    if (circuitBreaker.failures >= this.circuitBreakerConfig.failureThreshold) {
      circuitBreaker.state = 'OPEN';
      console.warn(`Circuit breaker OPENED for ${operationName} due to ${circuitBreaker.failures} failures`);
    }
  }

  private calculateDelay(attempt: number, config: RetryConfig): number {
    const exponentialDelay = config.baseDelay * Math.pow(config.backoffMultiplier, attempt);
    const jitter = Math.random() * 0.1 * exponentialDelay;
    return Math.min(exponentialDelay + jitter, config.maxDelay);
  }

  private async delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  private isRetryableError(error: any, retryableErrors: string[]): boolean {
    if (!error) return false;
    
    const errorMessage = error.message || '';
    const errorCode = error.code || error.status || error.statusCode;
    
    const commonRetryablePatterns = [
      'RATE_LIMIT_EXCEEDED',
      'INTERNAL_ERROR',
      'TIMEOUT',
      'NETWORK_ERROR',
      'ECONNRESET',
      'ENOTFOUND',
      'ETIMEDOUT',
      'fetch failed',
      'network error',
      '429',
      '500',
      '502',
      '503',
      '504'
    ];
    
    const allRetryableErrors = [...retryableErrors, ...commonRetryablePatterns];
    
    return allRetryableErrors.some(pattern => 
      errorMessage.toLowerCase().includes(pattern.toLowerCase()) ||
      String(errorCode).includes(pattern)
    );
  }

  private createApiError(originalError: any, isRetryable: boolean): ApiError {
    const message = originalError?.message || 'Unknown API error occurred';
    const statusCode = originalError?.status || originalError?.statusCode || originalError?.code;
    
    return new ApiError(message, statusCode, isRetryable, originalError);
  }
}

export const createRetryConfig = (overrides: Partial<RetryConfig> = {}): RetryConfig => ({
  maxRetries: 3,
  baseDelay: 1000,
  maxDelay: 10000,
  backoffMultiplier: 2,
  retryableErrors: ['RATE_LIMIT_EXCEEDED', 'INTERNAL_ERROR', 'TIMEOUT', 'NETWORK_ERROR'],
  ...overrides
});
