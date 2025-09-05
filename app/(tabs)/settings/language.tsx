import React from 'react';
import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { ScreenLayout } from '@/shared/ui/layouts/ScreenLayout';
import { RTLView } from '@/shared/components/RTLView';
import { RTLText } from '@/shared/components/RTLText';

export default function LanguageSettings() {
  const { t, i18n } = useTranslation();

  const languages = [
    {
      code: 'en',
      name: 'English',
      nativeName: 'English',
      flag: '🇺🇸',
    },
    {
      code: 'ar',
      name: 'Arabic',
      nativeName: 'العربية',
      flag: '🇸🇦',
    },
  ];

  const handleLanguageChange = async (languageCode: string) => {
    await i18n.changeLanguage(languageCode);
    router.back();
  };

  return (
    <ScreenLayout>
      {/* Header */}
      <View className="px-5 py-4 pt-12 border-b border-white/10">
        <RTLView className="items-center justify-between">
          <TouchableOpacity onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={24} color="#ffffff" />
          </TouchableOpacity>
          <RTLText className="text-xl font-bold text-white">{t('settings.language')}</RTLText>
          <View className="w-6" />
        </RTLView>
      </View>

      <ScrollView className="flex-1 px-5 pt-6">
        <RTLText className="text-white/70 text-base mb-6 leading-6">
          {t('settings.languageDesc')}
        </RTLText>

        {languages.map((language) => (
          <TouchableOpacity
            key={language.code}
            onPress={() => handleLanguageChange(language.code)}
            className={`p-4 rounded-xl mb-3 border ${
              i18n.language === language.code
                ? 'bg-primary-500/10 border-primary-500'
                : 'bg-white/5 border-white/10'
            }`}
          >
            <RTLView className="items-center">
              <Text className="text-2xl mr-4">{language.flag}</Text>
              
              <View className="flex-1">
                <RTLText className={`text-lg font-semibold ${
                  i18n.language === language.code ? 'text-primary-400' : 'text-white'
                }`}>
                  {language.nativeName}
                </RTLText>
                <RTLText className="text-sm text-white/70">
                  {language.name}
                </RTLText>
              </View>
              
              {i18n.language === language.code && (
                <Ionicons name="checkmark-circle" size={24} color="#4285f4" />
              )}
            </RTLView>
          </TouchableOpacity>
        ))}

        {/* RTL Information */}
        <View className="bg-white/5 rounded-xl p-4 mt-6 border border-white/10">
          <RTLView className="items-center mb-3">
            <Ionicons name="information-circle" size={20} color="#4285f4" className="mr-3" />
            <RTLText className="text-white font-medium">
              {t('settings.rtlSupport', 'RT L Support')}
            </RTLText>
          </RTLView>
          <RTLText className="text-white/70 text-sm leading-5">
            {t('settings.rtlDescription', 'Arabic language includes right-to-left text direction support for better reading experience.')}
          </RTLText>
        </View>
      </ScrollView>
    </ScreenLayout>
  );
}