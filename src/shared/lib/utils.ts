export function generateId(): string {
  return `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

export function formatTimeAgo(timestamp: number): string {
  const now = Date.now();
  const diff = now - timestamp;
  
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);
  
  if (minutes < 1) return 'now';
  if (minutes < 60) return `${minutes} minute${minutes > 1 ? 's' : ''} ago`;
  if (hours < 24) return `${hours} hour${hours > 1 ? 's' : ''} ago`;
  return `${days} day${days > 1 ? 's' : ''} ago`;
}

export function isValidUrl(string: string): boolean {
  try {
    new URL(string);
    return true;
  } catch {
    return false;
  }
}

export function extractDomain(url: string): string {
  try {
    const urlObj = new URL(url.startsWith('http') ? url : `https://${url}`);
    return urlObj.hostname.replace('www.', '');
  } catch {
    return url;
  }
}

export function resolveSearchUrl(input: string, searchEngine: string = 'google'): string {
  const trimmed = input.trim();
  if (!trimmed) return 'https://www.google.com';
  
  // Check if it looks like a URL
  const urlPattern = /^(https?:\/\/)?([a-z0-9-]+\.)+[a-z]{2,}([:\/\?#].*)?$/i;
  
  if (urlPattern.test(trimmed)) {
    return trimmed.startsWith('http') ? trimmed : `https://${trimmed}`;
  }
  
  // It's a search query
  const searchUrls = {
    google: `https://www.google.com/search?q=${encodeURIComponent(trimmed)}`,
    bing: `https://www.bing.com/search?q=${encodeURIComponent(trimmed)}`,
    duckduckgo: `https://duckduckgo.com/?q=${encodeURIComponent(trimmed)}`,
    yahoo: `https://search.yahoo.com/search?p=${encodeURIComponent(trimmed)}`,
  };
  
  return searchUrls[searchEngine as keyof typeof searchUrls] || searchUrls.google;
}

export function generateTabTitle(url: string): string {
  if (!url || url === 'about:blank') return 'New Tab';
  if (url.includes('google.com/search')) return 'Google Search';
  
  const domain = extractDomain(url);
  const siteName = domain.split('.')[0];
  return siteName.charAt(0).toUpperCase() + siteName.slice(1);
}

export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout;
  
  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
}

export function sanitizeFilename(filename: string): string {
  return filename
    .replace(/[<>:"/\\|?*]/g, '_')
    .replace(/\s+/g, '_')
    .substring(0, 255);
}