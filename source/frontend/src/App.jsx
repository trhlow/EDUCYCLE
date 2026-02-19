import { lazy, Suspense } from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import Layout from './components/layout/Layout';
import { ProtectedRoute, GuestRoute } from './components/ProtectedRoute';
import PageLoader from './components/PageLoader';
import RouteTransition from './components/RouteTransition';

const HomePage = lazy(() => import('./pages/HomePage'));
const AuthPage = lazy(() => import('./pages/AuthPage'));
const OAuthCallbackPage = lazy(() => import('./pages/OAuthCallbackPage'));
const ProductListingPage = lazy(() => import('./pages/ProductListingPage'));
const ProductDetailPage = lazy(() => import('./pages/ProductDetailPage'));
const CartPage = lazy(() => import('./pages/CartPage'));
const DashboardPage = lazy(() => import('./pages/DashboardPage'));
const AdminPage = lazy(() => import('./pages/AdminPage'));
const ProfilePage = lazy(() => import('./pages/ProfilePage'));
const WishlistPage = lazy(() => import('./pages/WishlistPage'));
const AboutPage = lazy(() => import('./pages/AboutPage'));
const ContactPage = lazy(() => import('./pages/ContactPage'));
const TransactionsPage = lazy(() => import('./pages/TransactionsPage'));
const TransactionDetailPage = lazy(() => import('./pages/TransactionDetailPage'));
const TransactionGuidePage = lazy(() => import('./pages/TransactionGuidePage'));
const PostProductPage = lazy(() => import('./pages/PostProductPage'));
const NotFoundPage = lazy(() => import('./pages/NotFoundPage'));

function SuspenseWrapper({ children }) {
  const location = useLocation();
  return (
    <Suspense key={location.pathname} fallback={<PageLoader />}>
      <RouteTransition>
        {children}
      </RouteTransition>
    </Suspense>
  );
}

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Layout />}>
        <Route index element={<SuspenseWrapper><HomePage /></SuspenseWrapper>} />
        <Route path="auth" element={<SuspenseWrapper><GuestRoute><AuthPage /></GuestRoute></SuspenseWrapper>} />
        <Route path="oauth-callback" element={<SuspenseWrapper><OAuthCallbackPage /></SuspenseWrapper>} />
        <Route path="products" element={<SuspenseWrapper><ProductListingPage /></SuspenseWrapper>} />
        <Route path="products/:id" element={<SuspenseWrapper><ProductDetailPage /></SuspenseWrapper>} />
        <Route path="products/new" element={<SuspenseWrapper><ProtectedRoute><PostProductPage /></ProtectedRoute></SuspenseWrapper>} />
        <Route path="cart" element={<SuspenseWrapper><CartPage /></SuspenseWrapper>} />
        <Route path="transactions" element={<SuspenseWrapper><ProtectedRoute><TransactionsPage /></ProtectedRoute></SuspenseWrapper>} />
        <Route path="transactions/guide" element={<SuspenseWrapper><TransactionGuidePage /></SuspenseWrapper>} />
        <Route path="transactions/:id" element={<SuspenseWrapper><ProtectedRoute><TransactionDetailPage /></ProtectedRoute></SuspenseWrapper>} />
        <Route path="dashboard" element={<SuspenseWrapper><ProtectedRoute adminOnly><DashboardPage /></ProtectedRoute></SuspenseWrapper>} />
        <Route path="admin" element={<SuspenseWrapper><ProtectedRoute adminOnly><AdminPage /></ProtectedRoute></SuspenseWrapper>} />
        <Route path="profile" element={<SuspenseWrapper><ProtectedRoute><ProfilePage /></ProtectedRoute></SuspenseWrapper>} />
        <Route path="wishlist" element={<SuspenseWrapper><ProtectedRoute><WishlistPage /></ProtectedRoute></SuspenseWrapper>} />
        <Route path="about" element={<SuspenseWrapper><AboutPage /></SuspenseWrapper>} />
        <Route path="contact" element={<SuspenseWrapper><ContactPage /></SuspenseWrapper>} />
        <Route path="*" element={<SuspenseWrapper><NotFoundPage /></SuspenseWrapper>} />
      </Route>
    </Routes>
  );
}
