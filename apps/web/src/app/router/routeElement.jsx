/* eslint-disable react-refresh/only-export-components */
import { Suspense } from 'react';
import { useLocation } from 'react-router-dom';
import PageLoader from './PageLoader';
import RouteTransition from './RouteTransition';
import { GuestRoute, ProtectedRoute } from './RouteGuards';

function SuspenseRoute({ children }) {
  const location = useLocation();
  return (
    <Suspense key={location.pathname} fallback={<PageLoader />}>
      <RouteTransition>{children}</RouteTransition>
    </Suspense>
  );
}

export function publicRoute(element) {
  return <SuspenseRoute>{element}</SuspenseRoute>;
}

export function guestRoute(element) {
  return publicRoute(<GuestRoute>{element}</GuestRoute>);
}

export function privateRoute(element) {
  return publicRoute(<ProtectedRoute>{element}</ProtectedRoute>);
}

export function adminRoute(element) {
  return publicRoute(<ProtectedRoute adminOnly>{element}</ProtectedRoute>);
}
