/* eslint-disable react-refresh/only-export-components */
import { lazy } from 'react';
import { guestRoute } from '../../app/router/routeElement';

const AuthPage = lazy(() => import('../../pages/AuthPage'));

export const authPublicRoutes = [
  {
    path: 'auth',
    element: guestRoute(<AuthPage />),
  },
];

export const authRoutes = [...authPublicRoutes];
