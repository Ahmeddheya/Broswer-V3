import { useMemo } from 'react';

interface UseVirtualizedListProps<T> {
  data: T[];
  itemHeight: number;
  containerHeight: number;
  overscan?: number;
}

export const useVirtualizedList = <T>({
  data,
  itemHeight,
  containerHeight,
  overscan = 5,
}: UseVirtualizedListProps<T>) => {
  const visibleItems = useMemo(() => {
    const visibleCount = Math.ceil(containerHeight / itemHeight);
    const startIndex = Math.max(0, 0 - overscan);
    const endIndex = Math.min(data.length - 1, visibleCount + overscan);
    
    return {
      startIndex,
      endIndex,
      visibleData: data.slice(startIndex, endIndex + 1),
      totalHeight: data.length * itemHeight,
    };
  }, [data, itemHeight, containerHeight, overscan]);

  return visibleItems;
};