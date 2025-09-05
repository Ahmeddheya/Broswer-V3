import { useEffect, useState } from 'react';
import { AppState, AppStateStatus } from 'react-native';

export const useMemoryWarning = () => {
  const [memoryWarning, setMemoryWarning] = useState(false);

  useEffect(() => {
    const handleAppStateChange = (nextAppState: AppStateStatus) => {
      if (nextAppState === 'background') {
        // Trigger memory cleanup when app goes to background
        setMemoryWarning(true);
        
        // Reset warning after cleanup
        setTimeout(() => {
          setMemoryWarning(false);
        }, 1000);
      }
    };

    const subscription = AppState.addEventListener('change', handleAppStateChange);

    return () => {
      subscription?.remove();
    };
  }, []);

  return memoryWarning;
};