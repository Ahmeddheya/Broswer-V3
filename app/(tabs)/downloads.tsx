import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  FlatList,
  Alert,
  ActivityIndicator,
  Linking,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import { useBrowserStore } from '@/store/browserStore';

interface DownloadItem {
  id: string;
  name: string;
  url: string;
  localPath?: string;
  size: number;
  type: string;
  progress: number;
  status: 'pending' | 'downloading' | 'completed' | 'failed' | 'paused';
  dateStarted: number;
  dateCompleted?: number;
  error?: string;
}

const DownloadsScreen = React.memo(() => {
  const [downloads, setDownloads] = useState<DownloadItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { initializeDownloads } = useBrowserStore();

  useEffect(() => {
    loadDownloads();
  }, []);

  const loadDownloads = async () => {
    setIsLoading(true);
    try {
      await initializeDownloads();
      // Load downloads from storage or create sample data
      const sampleDownloads: DownloadItem[] = [
        {
          id: '1',
          name: 'sample-document.pdf',
          url: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
          size: 13264,
          type: 'application/pdf',
          progress: 100,
          status: 'completed',
          dateStarted: Date.now() - 86400000, // 1 day ago
          dateCompleted: Date.now() - 86400000 + 5000,
        },
        {
          id: '2',
          name: 'sample-image.jpg',
          url: 'https://picsum.photos/800/600',
          size: 245760,
          type: 'image/jpeg',
          progress: 100,
          status: 'completed',
          dateStarted: Date.now() - 172800000, // 2 days ago
          dateCompleted: Date.now() - 172800000 + 3000,
        },
      ];
      setDownloads(sampleDownloads);
    } catch (error) {
      console.error('Failed to load downloads:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const downloadFile = useCallback(async (url: string, filename: string) => {
    try {
      // Use the actual download manager
      const downloadId = await DownloadManager.startDownload(
        url,
        filename,
        {},
        (progress) => {
          setDownloads(prev => prev.map(d => {
            if (d.id === downloadId) {
              return {
                ...d,
                progress: Math.round(progress.progress),
                size: progress.totalBytesExpectedToWrite,
                status: progress.progress >= 100 ? 'completed' : 'downloading',
                dateCompleted: progress.progress >= 100 ? Date.now() : undefined,
              };
            }
            return d;
          }));
        }
      );
      
      const downloadId = Date.now().toString();
      const newDownload: DownloadItem = {
        id: downloadId,
        name: filename,
        url: url,
        size: 0,
        type: 'application/octet-stream',
        progress: 0,
        status: 'downloading',
        dateStarted: Date.now(),
      };

      setDownloads(prev => [...prev, newDownload]);

      Alert.alert('Download Started', `${filename} download has been initiated.`);

    } catch (error) {
      console.error('Download failed:', error);
      Alert.alert('Download Failed', error.message || 'Failed to download the file. Please try again.');
    }
  }, []);

  const addTestDownload = () => {
    Alert.alert(
      'Test Download',
      'Choose a test file to download:',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'PDF Document', 
          onPress: () => downloadFile(
            'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
            'test-document.pdf'
          )
        },
        { 
          text: 'Sample Image', 
          onPress: () => downloadFile(
            'https://picsum.photos/800/600.jpg',
            'sample-image.jpg'
          )
        }
      ]
    );
  };

  const handleClearDownloads = () => {
    Alert.alert(
      'Clear Downloads',
      'Are you sure you want to clear all downloads?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Clear', 
          style: 'destructive',
          onPress: () => {
            setDownloads([]);
            Alert.alert('Downloads Cleared', 'All downloads have been cleared.');
          }
        },
      ]
    );
  };

  const handleItemPress = (item: DownloadItem) => {
    if (item.progress === 100) {
      Alert.alert('Open File', `Opening ${item.filename}`);
    } else {
      Alert.alert('Download in Progress', `${item.filename} is still downloading (${item.progress}%)`);
    }
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const formatDate = (timestamp: number): string => {
    const date = new Date(timestamp);
    return date.toLocaleDateString();
  };

  const openFile = async (item: DownloadItem) => {
    if (item.status === 'completed' && item.localPath) {
      try {
        await Sharing.shareAsync(item.localPath);
      } catch (error) {
        Alert.alert('Error', 'Could not open file');
      }
    } else if (item.status === 'failed') {
      Alert.alert('Download Failed', item.error || 'Unknown error occurred');
    } else {
      Alert.alert('Download in Progress', `${item.name} is still downloading (${item.progress}%)`);
    }
  };

  const deleteDownload = (item: DownloadItem) => {
    Alert.alert(
      'Delete Download',
      `Are you sure you want to delete ${item.name}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            setDownloads(downloads.filter(download => download.id !== item.id));
          }
        }
      ]
    );
  };

  const getFileIconByType = (type: string) => {
    if (type.includes('pdf')) return 'document-text-outline';
    if (type.includes('image')) return 'image-outline';
    if (type.includes('video')) return 'videocam-outline';
    if (type.includes('audio')) return 'musical-notes-outline';
    if (type.includes('zip') || type.includes('rar')) return 'archive-outline';
    return 'document-outline';
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return '#4CAF50';
      case 'downloading': return '#2196F3';
      case 'failed': return '#f44336';
      case 'paused': return '#ff9800';
      default: return '#9e9e9e';
    }
  };

  const renderDownloadItem = ({ item }: { item: DownloadItem }) => (
    <TouchableOpacity 
      style={styles.downloadItem}
      onPress={() => openFile(item)}
    >
      <View style={styles.downloadIcon}>
        <Ionicons 
          name={getFileIconByType(item.type)} 
          size={20} 
          color={getStatusColor(item.status)} 
        />
      </View>
      <View style={styles.downloadContent}>
        <Text style={styles.downloadTitle} numberOfLines={1}>{item.name}</Text>
        <View style={styles.downloadDetails}>
          <Text style={styles.downloadSize}>{formatFileSize(item.size)}</Text>
          <Text style={styles.downloadDate}>
            {item.dateCompleted ? formatDate(item.dateCompleted) : formatDate(item.dateStarted)}
          </Text>
        </View>
        {item.status === 'downloading' && (
          <View style={styles.progressBarContainer}>
            <View style={[styles.progressBar, { width: `${item.progress}%` }]} />
            <Text style={styles.progressText}>{item.progress}%</Text>
          </View>
        )}
        {item.status === 'failed' && (
          <Text style={[styles.downloadSize, { color: '#f44336' }]}>Download Failed</Text>
        )}
      </View>
      <TouchableOpacity 
        style={styles.deleteButton}
        onPress={() => deleteDownload(item)}
      >
        <Ionicons name="trash-outline" size={20} color="#ff6b6b" />
      </TouchableOpacity>
    </TouchableOpacity>
  );

  // Helper function to determine icon based on file extension
  const getFileIcon = (filename: string) => {
    const extension = filename.split('.').pop()?.toLowerCase();
    
    switch (extension) {
      case 'pdf':
        return 'document-text-outline';
      case 'doc':
      case 'docx':
        return 'document-outline';
      case 'xls':
      case 'xlsx':
        return 'grid-outline';
      case 'ppt':
      case 'pptx':
        return 'easel-outline';
      case 'jpg':
      case 'jpeg':
      case 'png':
      case 'gif':
        return 'image-outline';
      case 'mp3':
      case 'wav':
      case 'ogg':
        return 'musical-note-outline';
      case 'mp4':
      case 'mov':
      case 'avi':
        return 'videocam-outline';
      case 'zip':
      case 'rar':
      case '7z':
        return 'archive-outline';
      default:
        return 'document-outline';
    }
  };

  return (
    <LinearGradient colors={['#0a0b1e', '#1a1b3a']} style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={24} color="#ffffff" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Downloads</Text>
          <View style={{ flexDirection: 'row', gap: 10 }}>
            <TouchableOpacity onPress={addTestDownload} style={styles.addButton}>
              <Ionicons name="add-outline" size={24} color="#4CAF50" />
            </TouchableOpacity>
            <TouchableOpacity onPress={handleClearDownloads} style={styles.clearButton}>
              <Ionicons name="trash-outline" size={24} color="#ff6b6b" />
            </TouchableOpacity>
          </View>
        </View>

        {/* Downloads List */}
        {isLoading ? (
          <View style={styles.emptyState}>
            <ActivityIndicator size="large" color="#4285f4" />
            <Text style={styles.emptyStateText}>Loading downloads...</Text>
          </View>
        ) : downloads.length > 0 ? (
          <FlatList
            data={downloads}
            renderItem={renderDownloadItem}
            keyExtractor={item => item.id}
            contentContainerStyle={styles.downloadsList}
            showsVerticalScrollIndicator={false}
          />
        ) : (
          <View style={styles.emptyState}>
            <Ionicons name="download-outline" size={64} color="#666" />
            <Text style={styles.emptyStateText}>No downloads</Text>
            <Text style={styles.emptyStateSubtext}>Your downloaded files will appear here</Text>
          </View>
        )}
      </SafeAreaView>
    </LinearGradient>
  );
});

export default DownloadsScreen;

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
  addButton: {
    padding: 8,
    borderRadius: 20,
    backgroundColor: 'rgba(76, 175, 80, 0.1)',
  },
  clearButton: {
    padding: 8,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 107, 107, 0.1)',
  },
  downloadsList: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 20,
  },
  downloadItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  downloadIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(66, 133, 244, 0.15)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  downloadContent: {
    flex: 1,
  },
  downloadTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: '#ffffff',
    marginBottom: 4,
  },
  downloadDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  downloadSize: {
    fontSize: 12,
    color: '#aaaaaa',
  },
  downloadDate: {
    fontSize: 12,
    color: '#888',
  },
  progressBarContainer: {
    height: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 2,
    marginTop: 4,
    overflow: 'hidden',
    position: 'relative',
  },
  progressBar: {
    height: '100%',
    backgroundColor: '#4CAF50',
    borderRadius: 2,
  },
  progressText: {
    position: 'absolute',
    right: 0,
    top: 6,
    fontSize: 10,
    color: '#aaaaaa',
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
});