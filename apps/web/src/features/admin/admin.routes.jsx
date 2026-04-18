/* eslint-disable react-refresh/only-export-components */
import { lazy } from 'react';
import { adminRoute } from '../../app/router/routeElement';

const AdminPage = lazy(() => import('../../pages/AdminPage'));

export const adminOnlyRoutes = [
  {
    path: 'admin',
    element: adminRoute(<AdminPage />),
  },
];

export const adminRoutes = [...adminOnlyRoutes];
