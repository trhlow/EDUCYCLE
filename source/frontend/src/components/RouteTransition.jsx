import { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import './RouteTransition.css';

export default function RouteTransition({ children }) {
    const location = useLocation();
    const [showBar, setShowBar] = useState(false);
    const [transitionKey, setTransitionKey] = useState(location.key);

    useEffect(() => {
        setShowBar(true);
        setTransitionKey(location.key);
        const timer = setTimeout(() => setShowBar(false), 750);
        return () => clearTimeout(timer);
    }, [location.pathname, location.key]);

    return (
        <>
            {showBar && <div className="route-transition-bar" key={`bar-${transitionKey}`} />}
            <div className="route-transition-content" key={`content-${transitionKey}`}>
                {children}
            </div>
        </>
    );
}
