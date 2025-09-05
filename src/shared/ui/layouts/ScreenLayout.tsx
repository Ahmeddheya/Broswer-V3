import React from 'react';
import { View, SafeAreaView, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { StatusBar } from 'expo-status-bar';
import { useBrowserStore } from '@/shared/store/browser';

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
        <LinearGradient colors={gradientColors} style={styles.container}>
          <Container style={styles.container}>
            {children}
          </Container>
        </LinearGradient>
      </>
    );
  }

  return (
    <>
      <StatusBar style={statusBarStyle} backgroundColor="#0a0b1e" />
      <Container style={[styles.container, { backgroundColor: '#0a0b1e' }]}>
        {children}
      </Container>
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});