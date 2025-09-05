import { useMemo } from 'react';
import { Dimensions } from 'react-native';

interface UseOptimizedFlatListProps {
  itemHeight: number;
  data: any[];
  numColumns?: number;
}

export const useOptimizedFlatList = ({
  itemHeight,
  data,
  numColumns = 1,
}: UseOptimizedFlatListProps) => {
  const { height: screenHeight } = Dimensions.get('window');

  const optimizedProps = useMemo(() => {
    const visibleItems = Math.ceil(screenHeight / itemHeight);
    
    return {
      initialNumToRender: Math.min(visibleItems * numColumns, 10),
      maxToRenderPerBatch: Math.min(visibleItems * numColumns, 10),
      windowSize: 5,
      removeClippedSubviews: true,
      getItemLayout: (_: any, index: number) => ({
        length: itemHeight,
        offset: itemHeight * Math.floor(index / numColumns),
        index,
      }),
      keyExtractor: (item: any, index: number) => 
        item.id || item.key || `item-${index}`,
    };
  }, [itemHeight, screenHeight, numColumns]);

  return optimizedProps;
};