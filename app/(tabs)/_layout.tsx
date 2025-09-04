import { Tabs } from 'expo-router';
import { View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export default function TabLayout() {
  return (
    <View className="flex-1 bg-background-primary">
      <Tabs
        screenOptions={{
          headerShown: false,
          tabBarStyle: {
            display: 'none', // Keep hidden as requested
          },
          tabBarActiveTintColor: '#4CAF50',
          tabBarInactiveTintColor: 'rgba(255, 255, 255, 0.6)',
          tabBarLabelStyle: {
            fontSize: 12,
            fontWeight: '600',
          },
          tabBarIconStyle: {
            marginBottom: 2,
          },
        }}>
        <Tabs.Screen
          name="index"
          options={{
            title: 'Browser',
            tabBarIcon: ({ color, size }) => (
              <Ionicons name="globe-outline" size={size} color={color} />
            ),
          }}
        />
        <Tabs.Screen
          name="tabs"
          options={{
            title: 'Tabs',
            tabBarIcon: ({ color, size }) => (
              <Ionicons name="copy-outline" size={size} color={color} />
            ),
          }}
        />
        <Tabs.Screen
          name="bookmarks"
          options={{
            title: 'Bookmarks',
            tabBarIcon: ({ color, size }) => (
              <Ionicons name="bookmark-outline" size={size} color={color} />
            ),
          }}
        />
        <Tabs.Screen
          name="history"
          options={{
            title: 'History',
            tabBarIcon: ({ color, size }) => (
              <Ionicons name="time-outline" size={size} color={color} />
            ),
          }}
        />
        <Tabs.Screen
          name="settings"
          options={{
            title: 'Settings',
            tabBarIcon: ({ color, size }) => (
              <Ionicons name="settings-outline" size={size} color={color} />
            ),
          }}
        />
      </Tabs>
    </View>
  );
}