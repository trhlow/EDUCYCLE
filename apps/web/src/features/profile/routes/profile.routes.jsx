/* eslint-disable react-refresh/only-export-components */
import { lazy } from 'react';
import { privateRoute, publicRoute } from '../../../app/router/routeElement';

const ProfilePage = lazy(() => import('../pages/ProfilePage'));
const UserPublicProfilePage = lazy(() => import('../pages/UserPublicProfilePage'));

export const profilePublicRoutes = [
  {
    path: 'users/:id',
    element: publicRoute(<UserPublicProfilePage />),
  },
];

export const profilePrivateRoutes = [
  {
    path: 'profile',
    element: privateRoute(<ProfilePage />),
  },
];

export const profileRoutes = [...profilePublicRoutes, ...profilePrivateRoutes];
