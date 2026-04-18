import { Navigate, useLocation } from 'react-router-dom';

export default function SearchRedirect() {
  const location = useLocation();
  return <Navigate to={{ pathname: '/products', search: location.search }} replace />;
}
