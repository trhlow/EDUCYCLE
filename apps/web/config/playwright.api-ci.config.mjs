import { defineConfig } from '@playwright/test';

const api = process.env.API_BASE_URL || 'http://127.0.0.1:8080';

export default defineConfig({
  testDir: '../tests/e2e/api',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  reporter: 'line',
  use: {
    baseURL: api,
    extraHTTPHeaders: { Accept: 'application/json' },
  },
});
