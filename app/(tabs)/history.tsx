import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  ScrollView,
  FlatList,
  Alert,
  TextInput,
  ActivityIndicator,
  Animated,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useBrowserStore } from '../../store/browserStore';
import { HistoryItem } from '../../utils/storage';

// Skeleton Loader for History
const HistorySkeletonLoader = () => {
  const animatedValue = new Animated.Value(0);
  
  React.useEffect(() => {
    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(animatedValue, {
          toValue: 1,
          duration: 1200,
          useNativeDriver: false,
        }),
        Animated.timing(animatedValue, {
          toValue: 0,
          duration: 1200,
          useNativeDriver: false,
        }),
      ])
    );
    animation.start();
    return () => animation.stop();
  }, []);

  const opacity = animatedValue.interpolate({
    inputRange: [0, 1],
    outputRange: [0.3, 0.8],
  });

  return (
    <View style={styles.historyList}>
      {[...Array(6)].map((_, index) => (
        <Animated.View key={index} style={[styles.skeletonHistoryItem, { opacity }]}>
          <View style={styles.skeletonHistoryIcon} />
          <View style={styles.skeletonHistoryContent}>
            <View style={styles.skeletonHistoryTitle} />
            <View style={styles.skeletonHistoryUrl} />
            <View style={styles.skeletonHistoryDate} />
          </View>
        </Animated.View>
      ))}
    </View>
  );
};

// Toast for History
const showHistoryToast = (message: string, type: 'success' | 'error' = 'success') => {
  Alert.alert(
    type === 'success' ? '✅ تم' : '❌ خطأ',
    message,
    [{ text: 'موافق', style: 'default' }],
    { cancelable: true }
  );
};

export default function HistoryScreen() {
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredHistory, setFilteredHistory] = useState<HistoryItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSearching, setIsSearching] = useState(false);
  
  const { history, loadHistory, clearHistory, searchHistory, removeHistoryItem } = useBrowserStore();

  // Load history on component mount
  useEffect(() => {
    const initializeHistory = async () => {
      setIsLoading(true);
      try {
        await loadHistory();
      } catch (error) {
        console.error('Failed to load history:', error);
        Alert.alert('Error', 'Failed to load browsing history');
      } finally {
        setIsLoading(false);
      }
    };
    
    initializeHistory();
  }, [loadHistory]);
  
  // Update filtered history when history changes
  useEffect(() => {
    if (!searchQuery.trim()) {
      setFilteredHistory(history);
    }
  }, [history, searchQuery]);
  
  // Handle search with debouncing
  useEffect(() => {
    const searchTimeout = setTimeout(async () => {
      if (searchQuery.trim()) {
        setIsSearching(true);
        try {
          const results = await searchHistory(searchQuery);
          setFilteredHistory(results);
        } catch (error) {
          console.error('Search failed:', error);
        } finally {
          setIsSearching(false);
        }
      } else {
        setFilteredHistory(history);
      }
    }, 300);
    
    return () => clearTimeout(searchTimeout);
  }, [searchQuery, searchHistory, history]);

  const handleClearHistory = () => {
    Alert.alert(
      'Clear Browsing History',
      'Are you sure you want to clear all browsing history?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Clear', 
          style: 'destructive',
          onPress: async () => {
            try {
              await clearHistory();
              setFilteredHistory([]);
              Alert.alert('Success', 'Your browsing history has been cleared.');
            } catch (error) {
              Alert.alert('Error', 'Failed to clear history');
            }
          }
        },
      ]
    );
  };

  const handleItemPress = (url: string) => {
    // Navigate back to browser with the selected URL
    router.replace(`/?url=${encodeURIComponent(url)}`);
  };
  
  const formatTimestamp = (timestamp: number): string => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);
    
    if (diffMins < 1) {
      return 'Just now';
    } else if (diffMins < 60) {
      return `${diffMins} ${diffMins === 1 ? 'minute' : 'minutes'} ago`;
    } else if (diffHours < 24) {
      return `${diffHours} ${diffHours === 1 ? 'hour' : 'hours'} ago`;
    } else if (diffDays < 7) {
      return `${diffDays} ${diffDays === 1 ? 'day' : 'days'} ago`;
    } else {
      return date.toLocaleDateString();
    }
  };
  
  const handleDeleteItem = async (item: HistoryItem) => {
    Alert.alert(
      'Delete History Item',
      `Remove "${item.title}" from history?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await removeHistoryItem(item.id);
              setFilteredHistory(prev => prev.filter(h => h.id !== item.id));
              showHistoryToast('تم حذف العنصر من التاريخ');
            } catch (error) {
              showHistoryToast('فشل في حذف العنصر', 'error');
              await loadHistory(); // Reload on error
            }
          }
        }
      ]
    );
  };

  const renderHistoryItem = ({ item }: { item: HistoryItem }) => (
    <TouchableOpacity 
      style={styles.historyItem}
      onPress={() => handleItemPress(item.url)}
    >
      <View style={styles.historyIcon}>
        <Ionicons name="globe-outline" size={20} color="#4285f4" />
      </View>
      <View style={styles.historyContent}>
        <Text style={styles.historyTitle} numberOfLines={1}>{item.title}</Text>
        <Text style={styles.historyUrl} numberOfLines={1}>{item.url}</Text>
        <View style={styles.historyMeta}>
          <Text style={styles.historyDate}>{formatTimestamp(item.timestamp)}</Text>
          {item.visitCount > 1 && (
            <Text style={styles.visitCount}>• {item.visitCount} visits</Text>
          )}
        </View>
      </View>
      <TouchableOpacity 
        style={styles.deleteButton}
        onPress={() => handleDeleteItem(item)}
      >
        <Ionicons name="close" size={16} color="#888" />
      </TouchableOpacity>
    </TouchableOpacity>
  );

  return (
    <LinearGradient colors={['#0a0b1e', '#1a1b3a']} style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={24} color="#ffffff" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>History</Text>
          <TouchableOpacity onPress={handleClearHistory}>
            <Ionicons name="trash-outline" size={24} color="#ffffff" />
          </TouchableOpacity>
        </View>

        {/* Search Bar */}
        <View style={styles.searchContainer}>
          <Ionicons name="search-outline" size={20} color="#888" style={styles.searchIcon} />
          <TextInput
            style={styles.searchInputField}
            placeholder="Search history..."
            placeholderTextColor="#888"
            value={searchQuery}
            onChangeText={setSearchQuery}
            autoCapitalize="none"
            autoCorrect={false}
          />
          {(isSearching || searchQuery.length > 0) && (
            <TouchableOpacity 
              style={styles.clearSearchButton}
              onPress={() => setSearchQuery('')}
            >
              {isSearching ? (
                <ActivityIndicator size="small" color="#888" />
              ) : (
                <Ionicons name="close-circle" size={20} color="#888" />
              )}
            </TouchableOpacity>
          )}
        </View>

        {/* History List */}
        {isLoading ? (
        <HistorySkeletonLoader />
      ) : filteredHistory.length === 0 ? (
        <View style={styles.emptyState}>
          <Ionicons name="time-outline" size={64} color="#888" />
          <Text style={styles.emptyStateText}>No history yet</Text>
          <Text style={styles.emptyStateSubtext}>Your browsing history will appear here</Text>
        </View>
      ) : (
        <FlatList
          data={filteredHistory}
          renderItem={renderHistoryItem}
          keyExtractor={item => item.id}
          contentContainerStyle={styles.historyList}
          showsVerticalScrollIndicator={false}
        />
      )}
    </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    paddingTop: 50,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
    backgroundColor: 'rgba(10, 11, 30, 0.95)',
    elevation: 4,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    marginHorizontal: 20,
    marginVertical: 12,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInputField: {
    flex: 1,
    height: 24,
    color: '#ffffff',
    fontSize: 14,
  },
  clearSearchButton: {
    padding: 4,
    marginLeft: 8,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 40,
  },
  loadingText: {
    color: '#888',
    fontSize: 16,
    marginTop: 12,
  },
  historyList: {
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 20,
  },
  historyItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  historyIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(66, 133, 244, 0.15)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  historyContent: {
    flex: 1,
  },
  historyTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: '#ffffff',
    marginBottom: 2,
  },
  historyUrl: {
    fontSize: 12,
    color: '#aaaaaa',
    marginBottom: 2,
  },
  historyMeta: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  historyDate: {
    fontSize: 10,
    color: '#888',
  },
  visitCount: {
    fontSize: 10,
    color: '#4285f4',
    marginLeft: 4,
  },
  deleteButton: {
    padding: 8,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  emptyStateText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#ffffff',
    marginTop: 16,
    marginBottom: 8,
  },
  emptyStateSubtext: {
    fontSize: 14,
    color: '#888',
    textAlign: 'center',
  },
  // Skeleton Loading Styles
  skeletonHistoryItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  skeletonHistoryIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    marginRight: 12,
  },
  skeletonHistoryContent: {
    flex: 1,
  },
  skeletonHistoryTitle: {
    height: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 4,
    marginBottom: 6,
    width: '75%',
  },
  skeletonHistoryUrl: {
    height: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderRadius: 4,
    marginBottom: 4,
    width: '90%',
  },
  skeletonHistoryDate: {
    height: 10,
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
    borderRadius: 4,
    width: '30%',
  },
});