import React, { useRef, useImperativeHandle, forwardRef } from 'react';
import { View, Alert } from 'react-native';
import { WebView, WebViewNavigation, WebViewMessageEvent } from 'react-native-webview';
import { useBrowserStore } from '@/shared/store/browser';
import { usePerformanceMonitor } from '@/shared/hooks/usePerformanceMonitor';

interface WebViewContainerProps {
  url: string;
  onNavigationStateChange?: (navState: WebViewNavigation) => void;
  onLoadStart?: () => void;
  onLoadEnd?: () => void;
  onError?: (error: any) => void;
  userAgent?: string;
  incognitoMode?: boolean;
  desktopMode?: boolean;
  nightMode?: boolean;
}

export interface WebViewContainerRef {
  goBack: () => void;
  goForward: () => void;
  reload: () => void;
  stopLoading: () => void;
  findInPage: (searchText: string) => void;
  clearFindInPage: () => void;
}

export const WebViewContainer = forwardRef<WebViewContainerRef, WebViewContainerProps>(
  ({
    url,
    onNavigationStateChange,
    onLoadStart,
    onLoadEnd,
    onError,
    userAgent,
    incognitoMode = false,
    desktopMode = false,
    nightMode = false,
  }, ref) => {
    const webViewRef = useRef<WebView>(null);
    const { addToHistory, settings } = useBrowserStore();
    const { measureAsync } = usePerformanceMonitor('WebViewContainer');

    useImperativeHandle(ref, () => ({
      goBack: () => webViewRef.current?.goBack(),
      goForward: () => webViewRef.current?.goForward(),
      reload: () => webViewRef.current?.reload(),
      stopLoading: () => webViewRef.current?.stopLoading(),
      findInPage: (searchText: string) => {
        const script = `
          if (window.find) {
            window.find('${searchText}', false, false, true, false, true, false);
          }
          true;
        `;
        webViewRef.current?.injectJavaScript(script);
      },
      clearFindInPage: () => {
        const script = `
          if (window.getSelection) {
            window.getSelection().removeAllRanges();
          }
          true;
        `;
        webViewRef.current?.injectJavaScript(script);
      },
    }));

    const handleNavigationStateChange = (navState: WebViewNavigation) => {
      onNavigationStateChange?.(navState);
      
      // Add to history when page loads successfully
      if (!navState.loading && navState.url && navState.title && !incognitoMode) {
        measureAsync(async () => {
          addToHistory({
          title: navState.title,
          url: navState.url,
          favicon: undefined,
        });
        }, 'addToHistory');
      }
    };

    const handleMessage = (event: WebViewMessageEvent) => {
      try {
        const data = JSON.parse(event.nativeEvent.data);
        
        if (data.type === 'download') {
          // Handle download requests
          Alert.alert(
            'Download',
            `Do you want to download ${data.filename}?`,
            [
              { text: 'Cancel', style: 'cancel' },
              { text: 'Download', onPress: () => {
                // TODO: Implement download functionality
                console.log('Download:', data);
              }},
            ]
          );
        }
      } catch (error) {
        console.warn('Failed to parse WebView message:', error);
      }
    };

    const injectedJavaScript = `
      // Performance optimization
      (function() {
        // Disable unnecessary features for better performance
        if (window.performance && window.performance.mark) {
          window.performance.mark('aura-browser-start');
        }
        
        // Optimize images loading
        const images = document.querySelectorAll('img');
        images.forEach(img => {
          img.loading = 'lazy';
        });
      })();
      
      // Night mode CSS injection
      ${nightMode ? `
        (function() {
          const style = document.createElement('style');
          style.textContent = \`
            * {
              background-color: #1a1a1a !important;
              color: #e0e0e0 !important;
            }
            img, video {
              opacity: 0.8 !important;
            }
          \`;
          document.head.appendChild(style);
        })();
      ` : ''}
      
      // Ad blocking (basic)
      ${settings.adBlockEnabled ? `
        (function() {
          // Performance-optimized ad blocking
          const adSelectors = [
            '[class*="ad"]',
            '[id*="ad"]',
            '.advertisement',
            '.banner',
            '.popup',
            '[class*="google-ad"]',
            '[id*="google_ads"]'
          ];
          
          // Use requestIdleCallback for better performance
          if (window.requestIdleCallback) {
            window.requestIdleCallback(() => {
              adSelectors.forEach(selector => {
                const elements = document.querySelectorAll(selector);
                elements.forEach(el => {
                  el.style.display = 'none';
                  el.remove(); // Remove from DOM to save memory
                });
              });
            });
          }
        })();
      ` : ''}
      
      // Download detection
      document.addEventListener('click', function(e) {
        const link = e.target.closest('a');
        if (link && link.download) {
          window.ReactNativeWebView.postMessage(JSON.stringify({
            type: 'download',
            url: link.href,
            filename: link.download || 'download'
          }));
        }
      });
      
      true;
    `;

    const defaultUserAgent = desktopMode 
      ? 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
      : undefined;

    return (
      <View className="flex-1">
        <WebView
          ref={webViewRef}
          source={{ uri: url }}
          className="flex-1"
          onNavigationStateChange={handleNavigationStateChange}
          onLoadStart={onLoadStart}
          onLoadEnd={onLoadEnd}
          onError={onError}
          onMessage={handleMessage}
          injectedJavaScript={injectedJavaScript}
          userAgent={userAgent || defaultUserAgent}
          javaScriptEnabled={true}
          domStorageEnabled={!incognitoMode}
          thirdPartyCookiesEnabled={!incognitoMode}
          startInLoadingState={true}
          allowsBackForwardNavigationGestures={true}
          allowsInlineMediaPlayback={true}
          mediaPlaybackRequiresUserAction={false}
          allowsFullscreenVideo={true}
          mixedContentMode="compatibility"
          allowsProtectedMedia={true}
          allowFileAccess={true}
          allowFileAccessFromFileURLs={true}
          allowUniversalAccessFromFileURLs={true}
          cacheEnabled={!incognitoMode}
          incognito={incognitoMode}
          // Performance optimizations
          androidLayerType="hardware"
          androidHardwareAccelerationDisabled={false}
          cacheMode="LOAD_DEFAULT"
          minimumFontSize={12}
          textZoom={100}
        />
      </View>
    );
  }
);

WebViewContainer.displayName = 'WebViewContainer';