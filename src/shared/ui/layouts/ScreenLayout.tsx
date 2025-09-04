import React from 'react';
import { View, SafeAreaView } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { StatusBar } from 'expo-status-bar';
import { useBrowserStore } from '@/shared/store';

interface ScreenLayoutProps {
  children: React.ReactNode;
  showGradient?: boolean;
  safeArea?: boolean;
  statusBarStyle?: 'light' | 'dark' | 'auto';
}

export const ScreenLayout: React.FC<ScreenLayoutProps> = ({
  children,
  showGradient = true,
  safeArea = true,
  statusBarStyle = 'light',
}) => {
  const { settings } = useBrowserStore();
  
  const gradientColors = settings.incognitoMode 
    ? ['#2c2c2c', '#1a1a1a'] 
    : ['#0a0b1e', '#1a1b3a', '#2a2b4a'];

  const Container = safeArea ? SafeAreaView : View;

  if (showGradient) {
    return (
      <>
        <StatusBar style={statusBarStyle} backgroundColor={gradientColors[0]} />
        <LinearGradient colors={gradientColors} className="flex-1">
          <Container className="flex-1">
            {children}
          </Container>
        </LinearGradient>
      </>
    );
  }

  return (
    <>
      <StatusBar style={statusBarStyle} backgroundColor="#0a0b1e" />
      <Container className="flex-1 bg-background-primary">
        {children}
      </Container>
    </>
  );
};