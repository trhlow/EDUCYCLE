import { test, expect } from '@playwright/test';

/**
 * Golden path API: đăng ký (.edu.vn) → JWT → tạo tin → thấy trong /products/mine.
 * Chạy trong CI job e2e-api (Postgres + Flyway + jar).
 */
test.describe.configure({ mode: 'serial' });

test.describe('Golden path (API)', () => {
  test('register → POST product → GET /products/mine', async ({ request }) => {
    const suffix = `${Date.now()}-${Math.random().toString(16).slice(2, 10)}`;
    const email = `e2e${suffix}@student.edu.vn`;
    const username = `e2e${suffix}`;
    const password = 'E2ETestPass1!';

    const reg = await request.post('/api/auth/register', {
      data: { username, email, password },
    });
    expect(reg.ok(), await reg.text()).toBeTruthy();
    const auth = await reg.json();
    expect(auth.token).toBeTruthy();
    expect(auth.userId).toBeTruthy();

    const headers = {
      Authorization: `Bearer ${auth.token}`,
      'Content-Type': 'application/json',
    };

    const create = await request.post('/api/products', {
      headers,
      data: {
        name: `E2E Golden Book ${suffix}`,
        description: 'CI golden path',
        price: 0,
        category: 'Sách',
      },
    });
    expect(create.ok(), await create.text()).toBeTruthy();
    const product = await create.json();
    expect(product.id).toBeTruthy();

    const mine = await request.get('/api/products/mine?page=0&size=20', { headers });
    expect(mine.ok()).toBeTruthy();
    const page = await mine.json();
    expect(Array.isArray(page.content)).toBeTruthy();
    expect(page.content.some((p) => p.id === product.id)).toBeTruthy();
  });
});
