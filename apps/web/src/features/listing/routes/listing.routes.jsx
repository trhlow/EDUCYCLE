/* eslint-disable react-refresh/only-export-components */
import { lazy } from 'react';
import SearchRedirect from '../../../app/router/SearchRedirect';
import { privateRoute, publicRoute } from '../../../app/router/routeElement';

const HomePage = lazy(() => import('../pages/HomePage'));
const ProductListingPage = lazy(() => import('../pages/ProductListingPage'));
const ProductDetailPage = lazy(() => import('../pages/ProductDetailPage'));
const PostProductPage = lazy(() => import('../pages/PostProductPage'));

export const listingPublicRoutes = [
  {
    index: true,
    element: publicRoute(<HomePage />),
  },
  {
    path: 'products',
    element: publicRoute(<ProductListingPage />),
  },
  {
    path: 'search',
    element: <SearchRedirect />,
  },
  {
    path: 'products/:id',
    element: publicRoute(<ProductDetailPage />),
  },
];

export const listingPrivateRoutes = [
  {
    path: 'products/new',
    element: privateRoute(<PostProductPage />),
  },
  {
    path: 'products/:id/edit',
    element: privateRoute(<PostProductPage />),
  },
];

export const listingRoutes = [...listingPublicRoutes, ...listingPrivateRoutes];
