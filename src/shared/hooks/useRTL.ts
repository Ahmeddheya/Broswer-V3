import { useEffect } from 'react';
import { I18nManager } from 'react-native';
import { useTranslation } from 'react-i18next';

export const useRTL = () => {
  const { i18n } = useTranslation();
  
  const isRTL = i18n.language === 'ar';
  
  useEffect(() => {
    // Force RTL layout for Arabic
    if (isRTL !== I18nManager.isRTL) {
      I18nManager.allowRTL(isRTL);
      I18nManager.forceRTL(isRTL);
      
      // Note: In a real app, you might need to restart the app
      // for RTL changes to take effect properly
      console.log('RTL layout changed to:', isRTL);
    }
  }, [isRTL]);
  
  return {
    isRTL,
    textAlign: isRTL ? 'right' : 'left',
    flexDirection: isRTL ? 'row-reverse' : 'row',
  };
};