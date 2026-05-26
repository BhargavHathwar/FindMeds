import { describe, it, expect } from 'vitest';
import { getApiBaseUrl, DEFAULT_API_BASE } from './lib/api';

describe('API Client Configuration Tests', () => {
  it('should resolve default API base URL correctly', () => {
    expect(getApiBaseUrl()).toBe(DEFAULT_API_BASE || 'http://localhost:5001/api');
  });

  it('should support customized API base overrides in localStorage', () => {
    localStorage.setItem('findmeds_api_url', 'http://localhost:9999/api');
    expect(getApiBaseUrl()).toBe('http://localhost:9999/api');
    localStorage.removeItem('findmeds_api_url');
  });
});
