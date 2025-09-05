import { useState, useEffect } from 'react';
import * as FileSystem from 'expo-file-system';
import { Platform } from 'react-native';

interface ImageCacheOptions {
  maxAge?: number; // in milliseconds
  maxSize?: number; // in bytes
}

export const useImageCache = (uri: string, options: ImageCacheOptions = {}) => {
  const [cachedUri, setCachedUri] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { maxAge = 7 * 24 * 60 * 60 * 1000, maxSize = 10 * 1024 * 1024 } = options;

  useEffect(() => {
    if (!uri || Platform.OS === 'web') {
      setCachedUri(uri);
      return;
    }

    const cacheImage = async () => {
      try {
        setIsLoading(true);
        setError(null);

        // Create cache directory if it doesn't exist
        const cacheDir = `${FileSystem.cacheDirectory}images/`;
        const dirInfo = await FileSystem.getInfoAsync(cacheDir);
        
        if (!dirInfo.exists) {
          await FileSystem.makeDirectoryAsync(cacheDir, { intermediates: true });
        }

        // Generate cache filename
        const filename = uri.split('/').pop() || 'image';
        const extension = filename.split('.').pop() || 'jpg';
        const cacheFilename = `${Date.now()}_${Math.random().toString(36).substr(2, 9)}.${extension}`;
        const cacheUri = `${cacheDir}${cacheFilename}`;

        // Check if image is already cached
        const cachedInfo = await FileSystem.getInfoAsync(cacheUri);
        
        if (cachedInfo.exists) {
          // Check if cache is still valid
          const now = Date.now();
          const cacheAge = now - (cachedInfo.modificationTime || 0) * 1000;
          
          if (cacheAge < maxAge) {
            setCachedUri(cacheUri);
            setIsLoading(false);
            return;
          }
        }

        // Download and cache image
        const downloadResult = await FileSystem.downloadAsync(uri, cacheUri);
        
        if (downloadResult.status === 200) {
          // Check file size
          const fileInfo = await FileSystem.getInfoAsync(downloadResult.uri);
          
          if (fileInfo.exists && (fileInfo.size || 0) <= maxSize) {
            setCachedUri(downloadResult.uri);
          } else {
            // File too large, use original URI
            setCachedUri(uri);
            
            // Delete oversized cached file
            if (fileInfo.exists) {
              await FileSystem.deleteAsync(downloadResult.uri);
            }
          }
        } else {
          setCachedUri(uri);
        }
      } catch (err) {
        console.warn('Image cache error:', err);
        setError(err instanceof Error ? err.message : 'Cache error');
        setCachedUri(uri);
      } finally {
        setIsLoading(false);
      }
    };

    cacheImage();
  }, [uri, maxAge, maxSize]);

  return { cachedUri, isLoading, error };
};