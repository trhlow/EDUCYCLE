import { render, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { beforeEach, vi, test, expect } from 'vitest';
import AuthPage from './AuthPage';

const { mockToast, mockAuth } = vi.hoisted(() => ({
  mockToast: {
    success: vi.fn(),
    error: vi.fn(),
    info: vi.fn(),
    warning: vi.fn(),
    addToast: vi.fn(),
    removeToast: vi.fn(),
  },
  mockAuth: {
    login: vi.fn(),
    register: vi.fn(),
    verifyOtp: vi.fn(),
    resendOtp: vi.fn(),
    isAuthenticated: false,
  },
}));

vi.mock('../../../components/Toast', () => ({
  useToast: () => mockToast,
  ToastProvider: ({ children }) => children,
}));

vi.mock('../../../context/AuthContext', () => ({
  useAuth: () => mockAuth,
  AuthProvider: ({ children }) => children,
}));

beforeEach(() => {
  vi.clearAllMocks();
});

test('shows error on failed login', async () => {
  mockAuth.login.mockRejectedValueOnce(new Error('Sai mật khẩu'));

  const { container } = render(
    <MemoryRouter>
      <AuthPage />
    </MemoryRouter>,
  );

  const emailInput = container.querySelector('#login-email');
  const passwordInput = container.querySelector('#login-password');
  const submitButton = container.querySelector('button[type="submit"]');

  fireEvent.change(emailInput, { target: { value: 'user@student.edu.vn' } });
  fireEvent.change(passwordInput, { target: { value: 'wrongpass' } });

  fireEvent.click(submitButton);

  await waitFor(() => {
    expect(mockToast.error).toHaveBeenCalledWith('Sai mật khẩu');
  });
});

test('login form accepts non-edu.vn email and calls API (admin / staff)', async () => {
  mockAuth.login.mockResolvedValueOnce({
    id: '00000000-0000-0000-0000-000000000001',
    username: 'admin',
    email: 'admin@educycle.com',
    role: 'ADMIN',
    emailVerified: true,
  });

  const { container } = render(
    <MemoryRouter>
      <AuthPage />
    </MemoryRouter>,
  );

  const emailInput = container.querySelector('#login-email');
  const passwordInput = container.querySelector('#login-password');
  const submitButton = container.querySelector('button[type="submit"]');

  fireEvent.change(emailInput, { target: { value: 'admin@educycle.com' } });
  fireEvent.change(passwordInput, { target: { value: 'admin@1' } });
  fireEvent.click(submitButton);

  await waitFor(() => {
    expect(mockAuth.login).toHaveBeenCalledWith('admin@educycle.com', 'admin@1');
  });
});

