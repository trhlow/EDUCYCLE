/* eslint-disable react-refresh/only-export-components */
import { lazy } from 'react';
import { privateRoute, publicRoute } from '../../../app/router/routeElement';

const TransactionsPage = lazy(() => import('../pages/TransactionsPage'));
const TransactionDetailPage = lazy(() => import('../pages/TransactionDetailPage'));
const TransactionGuidePage = lazy(() => import('../pages/TransactionGuidePage'));

export const transactionPublicRoutes = [
  {
    path: 'transactions/guide',
    element: publicRoute(<TransactionGuidePage />),
  },
];

export const transactionPrivateRoutes = [
  {
    path: 'transactions',
    element: privateRoute(<TransactionsPage />),
  },
  {
    path: 'transactions/:id',
    element: privateRoute(<TransactionDetailPage />),
  },
];

export const transactionRoutes = [...transactionPublicRoutes, ...transactionPrivateRoutes];
