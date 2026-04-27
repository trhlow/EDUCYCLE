import { test, expect } from '@playwright/test';

const now = '2026-04-19T02:00:00.000Z';

const e2eUser = {
  id: 'u-e2e',
  userId: 'u-e2e',
  username: 'e2e-user',
  email: 'e2e@student.edu.vn',
  role: 'USER',
  emailVerified: true,
  phoneVerified: true,
  tradingAllowed: true,
  transactionRulesAcceptedAt: now,
};

const sellerUser = {
  ...e2eUser,
  username: 'seller-e2e',
};

const buyerUser = {
  id: 'u-buyer',
  userId: 'u-buyer',
  username: 'buyer-e2e',
  email: 'buyer@student.edu.vn',
  role: 'USER',
  emailVerified: true,
  phoneVerified: true,
  tradingAllowed: true,
  transactionRulesAcceptedAt: now,
};

const baseProduct = {
  id: 'p-e2e',
  name: 'Giáo trình Playwright căn bản',
  description: 'Giáo trình test tự động cho flow marketplace của EduCycle.',
  price: 45000,
  priceType: 'fixed',
  category: 'Sách',
  categoryName: 'Sách',
  condition: 'Tốt (80-90%)',
  imageUrl: 'https://images.unsplash.com/photo-1512820790803-83ca734da794?w=640',
  imageUrls: ['https://images.unsplash.com/photo-1512820790803-83ca734da794?w=640'],
  sellerId: sellerUser.id,
  sellerName: sellerUser.username,
  status: 'APPROVED',
  createdAt: now,
  averageRating: 5,
  reviewCount: 1,
};

const transactionProduct = {
  ...baseProduct,
  id: 'p-tx',
  name: 'Sách giao dịch E2E',
};

const makeTransaction = (status = 'PENDING') => ({
  id: 'tx-e2e',
  status,
  createdAt: now,
  updatedAt: now,
  buyerConfirmed: status === 'COMPLETED',
  sellerConfirmed: status === 'COMPLETED',
  buyer: buyerUser,
  seller: sellerUser,
  product: transactionProduct,
  amount: transactionProduct.price,
});

const json = (route, data, status = 200) =>
  route.fulfill({
    status,
    contentType: 'application/json',
    body: JSON.stringify(data),
  });

async function seedSession(page, user = e2eUser) {
  await page.addInitScript((nextUser) => {
    window.localStorage.setItem('token', 'mock-e2e-token');
    window.localStorage.setItem('user', JSON.stringify(nextUser));
  }, user);
}

async function mockApi(page, options = {}) {
  const state = {
    user: options.user ?? e2eUser,
    products: [...(options.products ?? [baseProduct])],
    transaction: options.transaction ?? makeTransaction(),
    reviews: [],
  };

  await page.route('**/api/**', async (route) => {
    const request = route.request();
    const url = new URL(request.url());
    if (!url.pathname.startsWith('/api/')) {
      return route.fallback();
    }
    const path = url.pathname.replace(/^\/api/, '');
    const method = request.method();

    if (path === '/public/health') return json(route, { status: 'UP', service: 'educycle-e2e', timestamp: now });
    if (path === '/notifications') return json(route, []);
    if (path === '/notifications/unread-count') return json(route, { count: 0 });
    if (path === '/users/me' && method === 'GET') return json(route, state.user);
    if (path === '/users/me/accept-transaction-rules') return json(route, {});

    if (path === '/auth/login' && method === 'POST') {
      return json(route, {
        token: 'mock-e2e-token',
        refreshToken: 'mock-e2e-refresh',
        userId: state.user.id,
        username: state.user.username,
        email: state.user.email,
        role: state.user.role,
        emailVerified: true,
        phoneVerified: true,
        tradingAllowed: true,
      });
    }

    if (path === '/categories') {
      return json(route, [
        { id: 'cat-books', name: 'Sách', description: 'Sách và giáo trình' },
        { id: 'cat-tools', name: 'Dụng cụ học tập', description: 'Đồ dùng học tập' },
      ]);
    }

    if (path === '/products' && method === 'GET') {
      return json(route, {
        content: state.products,
        totalElements: state.products.length,
        totalPages: 1,
        number: 0,
        size: 24,
        last: true,
      });
    }

    if (path === '/products' && method === 'POST') {
      const body = request.postDataJSON();
      const created = {
        ...baseProduct,
        ...body,
        id: 'p-created',
        sellerId: state.user.id,
        sellerName: state.user.username,
        status: 'APPROVED',
        createdAt: now,
      };
      state.products.unshift(created);
      return json(route, created, 201);
    }

    const productMatch = path.match(/^\/products\/([^/]+)$/);
    if (productMatch && method === 'GET') {
      const product = state.products.find((item) => String(item.id) === productMatch[1]);
      return product ? json(route, product) : json(route, { message: 'Not found' }, 404);
    }

    if (path === '/transactions/mine') {
      return json(route, [state.transaction]);
    }

    const txMatch = path.match(/^\/transactions\/([^/]+)$/);
    if (txMatch && method === 'GET') {
      const detailTransaction =
        state.transaction.status === 'ACCEPTED'
          ? {
              ...state.transaction,
              status: 'COMPLETED',
              buyerConfirmed: true,
              sellerConfirmed: true,
              updatedAt: now,
            }
          : state.transaction;
      return json(route, detailTransaction);
    }

    if (path === `/transactions/${state.transaction.id}/status` && method === 'PATCH') {
      const body = request.postDataJSON();
      state.transaction = {
        ...state.transaction,
        status: body.status,
        updatedAt: now,
      };
      return json(route, state.transaction);
    }

    if (path === `/transactions/${state.transaction.id}/messages`) return json(route, []);

    if (path === `/reviews/transaction/${state.transaction.id}`) return json(route, state.reviews);
    if (path === `/reviews/user/${sellerUser.id}`) return json(route, []);
    if (path === '/reviews' && method === 'POST') {
      const created = {
        id: `r-${state.reviews.length + 1}`,
        ...request.postDataJSON(),
        reviewerId: state.user.id,
        reviewerName: state.user.username,
        createdAt: now,
      };
      state.reviews.push(created);
      return json(route, created, 201);
    }

    return json(route, { message: `Unhandled ${method} ${path}` }, 404);
  });
}

test.describe('EduCycle critical frontend flows', () => {
  test('login', async ({ page }) => {
    await mockApi(page, { user: e2eUser });

    await page.goto('/auth');
    await page.getByLabel('Email').fill(e2eUser.email);
    await page.getByLabel('Mật khẩu').fill('E2ETestPass1!');
    await page.locator('form.auth-form').getByRole('button', { name: 'Đăng Nhập', exact: true }).click();

    await expect(page).toHaveURL(/\/$/);
    await expect(page.getByRole('button', { name: /e2e-user/i })).toBeVisible();
  });

  test('create/list/detail product', async ({ page }) => {
    await seedSession(page, e2eUser);
    await mockApi(page, { user: e2eUser, products: [baseProduct] });

    await page.goto('/products/new');
    await page.getByLabel(/Tên sản phẩm/).fill('Sách E2E mới tạo');
    await page.locator('select#category').selectOption('Sách');
    await page.locator('select#condition').selectOption('Tốt (80-90%)');
    await page.getByPlaceholder('VD: 45000').fill('75000');
    await page.getByLabel(/Mô tả chi tiết/).fill('Mô tả sản phẩm đủ dài cho kiểm thử tạo tin EduCycle.');
    await page.getByRole('button', { name: 'Đăng bán ngay' }).click();

    await expect(page).toHaveURL(/\/products\/p-created$/);
    await expect(page.getByRole('heading', { name: 'Sách E2E mới tạo' })).toBeVisible();

    await page.goto('/products');
    await expect(page.getByText('Sách E2E mới tạo')).toBeVisible();
  });

  test('transaction status + review', async ({ page }) => {
    await seedSession(page, sellerUser);
    await mockApi(page, {
      user: sellerUser,
      transaction: makeTransaction('PENDING'),
      products: [transactionProduct],
    });

    await page.goto('/transactions');
    await expect(page.getByText('Sách giao dịch E2E')).toBeVisible();
    await page.getByRole('button', { name: 'Chấp nhận' }).click();
    await expect(page.getByText('Đã chấp nhận yêu cầu.')).toBeVisible();

    await page.goto('/transactions/tx-e2e');
    await page.getByRole('button', { name: /Danh gia/i }).click();
    await page.getByPlaceholder('Chia sẻ trải nghiệm giao dịch...').fill('Giao dịch nhanh, đúng hẹn, sách đúng mô tả.');
    await page.getByRole('button', { name: 'Gửi đánh giá' }).click();

    await expect(page.getByText('Đã gửi đánh giá.')).toBeVisible();
    await expect(page.getByText('Cảm ơn bạn đã đánh giá.')).toBeVisible();
  });
});
