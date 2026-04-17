import { test, expect } from '@playwright/test';

test.describe('EduCycle API (CI + Postgres)', () => {
  test('actuator health', async ({ request }) => {
    const res = await request.get('/actuator/health');
    expect(res.ok()).toBeTruthy();
    const j = await res.json();
    expect(j.status).toMatch(/UP|DOWN/);
  });

  test('GET /api/products — public catalog', async ({ request }) => {
    const res = await request.get('/api/products?page=0&size=5&sort=newest');
    expect(res.ok()).toBeTruthy();
    const j = await res.json();
    expect(Array.isArray(j.content)).toBeTruthy();
  });

  test('GET /api/transactions — no JWT → 401', async ({ request }) => {
    const res = await request.get('/api/transactions');
    expect(res.status()).toBe(401);
  });
});
