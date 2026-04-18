import { lazy } from 'react';
import { Route, Routes } from 'react-router-dom';
import AppLayout from '../layout';
import { publicRoute } from './routeElement';
import { appRoutes } from './routes';

const NotFoundPage = lazy(() => import('../not-found'));

export default function AppRouter() {
  return (
    <Routes>
      <Route path="/" element={<AppLayout />}>
        {appRoutes.map((route) => (
          <Route
            key={route.index ? 'index' : route.path}
            index={route.index}
            path={route.path}
            element={route.element}
          />
        ))}
        <Route path="*" element={publicRoute(<NotFoundPage />)} />
      </Route>
    </Routes>
  );
}
