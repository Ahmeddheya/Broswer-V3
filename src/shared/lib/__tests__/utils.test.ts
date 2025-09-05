import {
  generateId,
  formatFileSize,
  formatTimeAgo,
  isValidUrl,
  extractDomain,
  resolveSearchUrl,
  generateTabTitle,
  debounce,
  throttle,
  sanitizeFilename,
  getFileExtension,
  getMimeType,
} from '../utils';

describe('Utils', () => {
  describe('generateId', () => {
    it('should generate unique IDs', () => {
      const id1 = generateId();
      const id2 = generateId();
      
      expect(id1).not.toBe(id2);
      expect(typeof id1).toBe('string');
      expect(id1.length).toBeGreaterThan(0);
    });
  });

  describe('formatFileSize', () => {
    it('should format file sizes correctly', () => {
      expect(formatFileSize(0)).toBe('0 Bytes');
      expect(formatFileSize(1024)).toBe('1 KB');
      expect(formatFileSize(1048576)).toBe('1 MB');
      expect(formatFileSize(1073741824)).toBe('1 GB');
    });
  });

  describe('formatTimeAgo', () => {
    it('should format time correctly', () => {
      const now = Date.now();
      
      expect(formatTimeAgo(now)).toBe('now');
      expect(formatTimeAgo(now - 60000)).toBe('1 minute ago');
      expect(formatTimeAgo(now - 3600000)).toBe('1 hour ago');
      expect(formatTimeAgo(now - 86400000)).toBe('1 day ago');
    });
  });

  describe('isValidUrl', () => {
    it('should validate URLs correctly', () => {
      expect(isValidUrl('https://example.com')).toBe(true);
      expect(isValidUrl('http://example.com')).toBe(true);
      expect(isValidUrl('ftp://example.com')).toBe(true);
      expect(isValidUrl('invalid-url')).toBe(false);
      expect(isValidUrl('')).toBe(false);
    });
  });

  describe('extractDomain', () => {
    it('should extract domain correctly', () => {
      expect(extractDomain('https://www.example.com/path')).toBe('example.com');
      expect(extractDomain('http://subdomain.example.com')).toBe('subdomain.example.com');
      expect(extractDomain('example.com')).toBe('example.com');
    });
  });

  describe('resolveSearchUrl', () => {
    it('should resolve URLs correctly', () => {
      expect(resolveSearchUrl('example.com')).toBe('https://example.com');
      expect(resolveSearchUrl('https://example.com')).toBe('https://example.com');
      expect(resolveSearchUrl('test query')).toContain('google.com/search');
      expect(resolveSearchUrl('test query', 'bing')).toContain('bing.com/search');
    });
  });

  describe('generateTabTitle', () => {
    it('should generate tab titles correctly', () => {
      expect(generateTabTitle('https://github.com')).toBe('Github');
      expect(generateTabTitle('https://www.google.com/search?q=test')).toBe('Google Search');
      expect(generateTabTitle('')).toBe('New Tab');
      expect(generateTabTitle('about:blank')).toBe('New Tab');
    });
  });

  describe('debounce', () => {
    jest.useFakeTimers();

    it('should debounce function calls', () => {
      const mockFn = jest.fn();
      const debouncedFn = debounce(mockFn, 100);

      debouncedFn('test1');
      debouncedFn('test2');
      debouncedFn('test3');

      expect(mockFn).not.toHaveBeenCalled();

      jest.advanceTimersByTime(100);

      expect(mockFn).toHaveBeenCalledTimes(1);
      expect(mockFn).toHaveBeenCalledWith('test3');
    });
  });

  describe('sanitizeFilename', () => {
    it('should sanitize filenames correctly', () => {
      expect(sanitizeFilename('file<name>.txt')).toBe('file_name_.txt');
      expect(sanitizeFilename('file with spaces.txt')).toBe('file_with_spaces.txt');
      expect(sanitizeFilename('normal-file.txt')).toBe('normal-file.txt');
    });
  });

  describe('getFileExtension', () => {
    it('should extract file extensions correctly', () => {
      expect(getFileExtension('file.txt')).toBe('txt');
      expect(getFileExtension('image.PNG')).toBe('png');
      expect(getFileExtension('file')).toBe('');
      expect(getFileExtension('file.tar.gz')).toBe('gz');
    });
  });

  describe('getMimeType', () => {
    it('should return correct MIME types', () => {
      expect(getMimeType('image.jpg')).toBe('image/jpeg');
      expect(getMimeType('document.pdf')).toBe('application/pdf');
      expect(getMimeType('video.mp4')).toBe('video/mp4');
      expect(getMimeType('unknown.xyz')).toBe('application/octet-stream');
    });
  });
});