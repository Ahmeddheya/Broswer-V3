import { useEffect, useRef } from 'react';

interface PerformanceMetrics {
  renderTime: number;
  memoryUsage?: number;
  componentName: string;
}

export const usePerformanceMonitor = (componentName: string) => {
  const startTime = useRef<number>(Date.now());
  const renderCount = useRef<number>(0);

  useEffect(() => {
    renderCount.current += 1;
    const renderTime = Date.now() - startTime.current;

    // Log performance metrics in development
    if (__DEV__) {
      console.log(`[Performance] ${componentName}:`, {
        renderTime,
        renderCount: renderCount.current,
        timestamp: new Date().toISOString(),
      });

      // Warn about slow renders
      if (renderTime > 100) {
        console.warn(`[Performance Warning] ${componentName} took ${renderTime}ms to render`);
      }

      // Warn about excessive re-renders
      if (renderCount.current > 10) {
        console.warn(`[Performance Warning] ${componentName} has re-rendered ${renderCount.current} times`);
      }
    }
  });

  const measureAsync = async <T>(
    operation: () => Promise<T>,
    operationName: string
  ): Promise<T> => {
    const start = Date.now();
    
    try {
      const result = await operation();
      const duration = Date.now() - start;
      
      if (__DEV__) {
        console.log(`[Performance] ${componentName}.${operationName}: ${duration}ms`);
      }
      
      return result;
    } catch (error) {
      const duration = Date.now() - start;
      
      if (__DEV__) {
        console.error(`[Performance] ${componentName}.${operationName} failed after ${duration}ms:`, error);
      }
      
      throw error;
    }
  };

  return { measureAsync };
};