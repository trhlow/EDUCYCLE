import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { vi, test, expect } from 'vitest';
import AuthPage from './AuthPage';
import { AuthProvider } from '../contexts/AuthContext';
import { authApi } from '../api/endpoints';
import toast from 'react-hot-toast';

vi.mock('../api/endpoints', () => ({
  authApi: {
    login: vi.fn(),
  }
}));

vi.mock('react-hot-toast', () => ({
  default: {
    success: vi.fn(),
    error: vi.fn(),
    info: vi.fn(),
  },
  Toaster: () => null,
}));

test('shows error on failed login', async () => {
  authApi.login.mockRejectedValueOnce({
    response: { data: { message: 'Sai mật khẩu' } },
  });

  const { container } = render(
    <MemoryRouter>
      <AuthProvider>
        <AuthPage />
      </AuthProvider>
    </MemoryRouter>
  );

  const emailInput = container.querySelector('#login-email');
  const passwordInput = container.querySelector('#login-password');
  const submitButton = container.querySelector('button[type="submit"]');

  fireEvent.change(emailInput, { target: { value: 'a@b.com' } });
  fireEvent.change(passwordInput, { target: { value: 'wrongpass' } });
  
  fireEvent.click(submitButton);

  await waitFor(() => {
    expect(toast.error).toHaveBeenCalledWith('Sai mật khẩu');
  });
});

