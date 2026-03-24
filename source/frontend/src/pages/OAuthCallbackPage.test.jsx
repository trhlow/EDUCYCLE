import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import OAuthCallbackPage from './OAuthCallbackPage';

const handleOAuthCallback = vi.fn();

vi.mock('../contexts/AuthContext', () => ({
  useAuth: () => ({ handleOAuthCallback }),
}));

describe('OAuthCallbackPage (E2E-style flow)', () => {
  beforeEach(() => {
    handleOAuthCallback.mockClear();
  });

  it('parses token from query, calls handleOAuthCallback, navigates to /products', async () => {
    render(
      <MemoryRouter initialEntries={['/oauth-callback?token=jwt-test-abc']}>
        <Routes>
          <Route path="/oauth-callback" element={<OAuthCallbackPage />} />
          <Route path="/products" element={<div data-testid="after-oauth">redirected</div>} />
          <Route path="/auth" element={<div data-testid="auth-fallback">auth</div>} />
        </Routes>
      </MemoryRouter>,
    );

    await waitFor(() => expect(screen.getByTestId('after-oauth')).toBeInTheDocument());
    expect(handleOAuthCallback).toHaveBeenCalledTimes(1);
    expect(handleOAuthCallback).toHaveBeenCalledWith('jwt-test-abc');
  });

  it('redirects to /auth when token is missing', async () => {
    render(
      <MemoryRouter initialEntries={['/oauth-callback']}>
        <Routes>
          <Route path="/oauth-callback" element={<OAuthCallbackPage />} />
          <Route path="/products" element={<div data-testid="after-oauth">redirected</div>} />
          <Route path="/auth" element={<div data-testid="auth-fallback">auth</div>} />
        </Routes>
      </MemoryRouter>,
    );

    await waitFor(() => expect(screen.getByTestId('auth-fallback')).toBeInTheDocument());
    expect(handleOAuthCallback).not.toHaveBeenCalled();
  });
});
