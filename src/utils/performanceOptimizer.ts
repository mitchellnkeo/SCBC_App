import { logger } from './logger';

/**
 * Performance optimization utilities for the SCBC app
 * Consolidates performance improvements and monitoring
 */

/**
 * Replace console methods with production-ready logger
 * Call this early in app initialization
 */
export const initializeLogging = (): void => {
  if (!__DEV__) {
    // In production, replace console methods with logger
    const originalConsole = {
      log: console.log,
      error: console.error,
      warn: console.warn,
      info: console.info,
    };

    console.log = (...args: any[]) => {
      logger.info('Console Log', { message: args.join(' ') });
    };

    console.error = (...args: any[]) => {
      logger.error('Console Error', { message: args.join(' ') });
    };

    console.warn = (...args: any[]) => {
      logger.warn('Console Warning', { message: args.join(' ') });
    };

    console.info = (...args: any[]) => {
      logger.info('Console Info', { message: args.join(' ') });
    };

    // Store original console for debugging if needed
    (global as any).__originalConsole = originalConsole;
  }
};

/**
 * Debounce utility for search and input optimization
 */
export const debounce = <T extends (...args: any[]) => void>(
  func: T,
  delay: number
): ((...args: Parameters<T>) => void) => {
  let timeoutId: NodeJS.Timeout;
  
  return (...args: Parameters<T>) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => func(...args), delay);
  };
};

/**
 * Throttle utility for scroll and gesture optimization
 */
export const throttle = <T extends (...args: any[]) => void>(
  func: T,
  delay: number
): ((...args: Parameters<T>) => void) => {
  let isThrottled = false;
  
  return (...args: Parameters<T>) => {
    if (!isThrottled) {
      func(...args);
      isThrottled = true;
      setTimeout(() => {
        isThrottled = false;
      }, delay);
    }
  };
};

/**
 * Memoization helper for expensive computations
 */
export const memoize = <T extends (...args: any[]) => any>(
  func: T,
  getKey?: (...args: Parameters<T>) => string
): T => {
  const cache = new Map();
  
  return ((...args: Parameters<T>) => {
    const key = getKey ? getKey(...args) : JSON.stringify(args);
    
    if (cache.has(key)) {
      return cache.get(key);
    }
    
    const result = func(...args);
    cache.set(key, result);
    
    return result;
  }) as T;
};

/**
 * Batch Firebase operations for better performance
 */
export class FirebaseBatcher {
  private operations: Array<() => Promise<any>> = [];
  private isProcessing = false;
  private readonly batchSize: number;
  private readonly delay: number;

  constructor(batchSize: number = 10, delay: number = 100) {
    this.batchSize = batchSize;
    this.delay = delay;
  }

  add(operation: () => Promise<any>): Promise<any> {
    return new Promise((resolve, reject) => {
      this.operations.push(async () => {
        try {
          const result = await operation();
          resolve(result);
        } catch (error) {
          reject(error);
        }
      });

      this.processBatch();
    });
  }

  private async processBatch(): Promise<void> {
    if (this.isProcessing || this.operations.length === 0) {
      return;
    }

    this.isProcessing = true;

    while (this.operations.length > 0) {
      const batch = this.operations.splice(0, this.batchSize);
      
      try {
        await Promise.all(batch.map(op => op()));
      } catch (error) {
        logger.error('Batch operation failed', { error });
      }

      // Small delay to prevent overwhelming Firebase
      if (this.operations.length > 0) {
        await new Promise(resolve => setTimeout(resolve, this.delay));
      }
    }

    this.isProcessing = false;
  }
}

/**
 * Image optimization utilities
 */
export const imageOptimizer = {
  /**
   * Calculate optimal image dimensions while maintaining aspect ratio
   */
  calculateOptimalSize(
    originalWidth: number,
    originalHeight: number,
    maxWidth: number,
    maxHeight: number
  ): { width: number; height: number } {
    const aspectRatio = originalWidth / originalHeight;
    
    let width = originalWidth;
    let height = originalHeight;
    
    if (width > maxWidth) {
      width = maxWidth;
      height = width / aspectRatio;
    }
    
    if (height > maxHeight) {
      height = maxHeight;
      width = height * aspectRatio;
    }
    
    return { width: Math.round(width), height: Math.round(height) };
  },

  /**
   * Check if image needs compression
   */
  needsCompression(fileSizeBytes: number, maxSizeMB: number): boolean {
    const maxBytes = maxSizeMB * 1024 * 1024;
    return fileSizeBytes > maxBytes;
  },
};

/**
 * Performance monitoring utilities
 */
export const performanceMonitor = {
  /**
   * Time a function execution
   */
  timeFunction: async <T>(
    name: string,
    func: () => Promise<T> | T
  ): Promise<T> => {
    const start = Date.now();
    
    try {
      const result = await func();
      const duration = Date.now() - start;
      
             if (duration > 1000) { // Log slow operations
         logger.warn(`Slow operation: ${name}`, { 
           duration: `${duration}ms`,
           name 
         });
       }
      
      return result;
    } catch (error) {
      const duration = Date.now() - start;
      logger.error(`Failed operation: ${name}`, { 
        error,
        duration: `${duration}ms`,
        name 
      });
      throw error;
    }
  },

  /**
   * Memory usage tracking
   */
  logMemoryUsage: (context: string): void => {
    if (__DEV__ && (performance as any).memory) {
      const memory = (performance as any).memory;
      logger.debug(`Memory usage - ${context}`, {
        usedJSHeapSize: `${Math.round(memory.usedJSHeapSize / 1024 / 1024)}MB`,
        totalJSHeapSize: `${Math.round(memory.totalJSHeapSize / 1024 / 1024)}MB`,
        jsHeapSizeLimit: `${Math.round(memory.jsHeapSizeLimit / 1024 / 1024)}MB`,
      });
    }
  },
};

// Global Firebase batcher instance
export const firebaseBatcher = new FirebaseBatcher();

/**
 * Initialize all performance optimizations
 */
export const initializePerformanceOptimizations = (): void => {
  initializeLogging();
  
  if (__DEV__) {
    logger.info('Performance optimizations initialized', {
      environment: 'development',
      optimizations: [
        'console logging replacement',
        'firebase batching',
        'image optimization',
        'performance monitoring'
      ]
    });
  }
}; 