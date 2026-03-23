import { render, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { GoogleOAuthProvider } from '@react-oauth/google';
import { vi, test, expect } from 'vitest';
import AuthPage from './AuthPage';
import { AuthProvider } from '../contexts/AuthContext';
import { authApi } from '../api/endpoints';

const mockToast = {
  success: vi.fn(),
  error: vi.fn(),
  info: vi.fn(),
  warning: vi.fn(),
  addToast: vi.fn(),
  removeToast: vi.fn(),
};

vi.mock('../components/Toast', () => ({
  useToast: () => mockToast,
  ToastProvider: ({ children }) => children,
}));

vi.mock('../api/endpoints', () => ({
  authApi: {
    login: vi.fn(),
  },
  usersApi: {
    getMe: vi.fn(),
  },
}));

test('shows error on failed login', async () => {
  authApi.login.mockRejectedValueOnce({
    response: { data: { message: 'Sai mật khẩu' } },
  });

  const { container } = render(
    <GoogleOAuthProvider clientId="test-client-id.apps.googleusercontent.com">
      <MemoryRouter>
        <AuthProvider>
          <AuthPage />
        </AuthProvider>
      </MemoryRouter>
    </GoogleOAuthProvider>,
  );

  const emailInput = container.querySelector('#login-email');
  const passwordInput = container.querySelector('#login-password');
  const submitButton = container.querySelector('button[type="submit"]');

  fireEvent.change(emailInput, { target: { value: 'a@b.com' } });
  fireEvent.change(passwordInput, { target: { value: 'wrongpass' } });

  fireEvent.click(submitButton);

  await waitFor(() => {
    expect(mockToast.error).toHaveBeenCalledWith('Sai mật khẩu');
  });
});
