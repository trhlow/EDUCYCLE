import { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import PageLoader from '../components/PageLoader';

export default function OAuthCallbackPage() {
    const [params] = useSearchParams();
    const navigate = useNavigate();
    const { handleOAuthCallback } = useAuth();

    useEffect(() => {
        const token = params.get('token');
        if (token) {
            handleOAuthCallback(token);
            navigate('/products', { replace: true });
        } else {
            navigate('/auth', { replace: true });
        }
    }, []);

    return <PageLoader />;
}
