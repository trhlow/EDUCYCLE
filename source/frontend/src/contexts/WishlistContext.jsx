import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useAuth } from './AuthContext';
import { readStoredArray } from '../utils/safeStorage';

const WishlistContext = createContext(null);

function getStorageKey(userId) {
  return userId ? `wishlist_${userId}` : null;
}

export function WishlistProvider({ children }) {
  const { user, isAuthenticated } = useAuth();
  const [items, setItems] = useState(() => readStoredArray('wishlist'));

  // Load wishlist when user changes (login/logout)
  useEffect(() => {
    if (isAuthenticated && user?.id) {
      const key = getStorageKey(user.id);
      if (key) {
        try {
          const saved = localStorage.getItem(key);
          // eslint-disable-next-line react-hooks/set-state-in-effect -- hydrate from per-user storage
          setItems(saved ? JSON.parse(saved) : []);
        } catch {
          setItems([]);
        }
      }
    } else {
      // Not logged in → clear in-memory wishlist
      setItems([]);
    }
  }, [user?.id, isAuthenticated]);

  // Persist wishlist to per-user key
  useEffect(() => {
    if (isAuthenticated && user?.id) {
      const key = getStorageKey(user.id);
      if (key) {
        localStorage.setItem(key, JSON.stringify(items));
      }
    }
  }, [items, user?.id, isAuthenticated]);

  const toggleWishlist = useCallback((product) => {
    if (!isAuthenticated) return; // Must be logged in
    setItems((prev) => {
      const exists = prev.find((item) => item.id === product.id);
      if (exists) {
        return prev.filter((item) => item.id !== product.id);
      }
      return [...prev, {
        id: product.id,
        name: product.name,
        price: product.price,
        imageUrl: product.imageUrl,
        category: product.category,
        seller: product.seller,
        rating: product.rating,
        reviews: product.reviews,
      }];
    });
  }, [isAuthenticated]);

  const isInWishlist = useCallback(
    (productId) => items.some((item) => item.id === productId),
    [items]
  );

  const removeFromWishlist = useCallback((productId) => {
    setItems((prev) => prev.filter((item) => item.id !== productId));
  }, []);

  const clearWishlist = useCallback(() => setItems([]), []);

  return (
    <WishlistContext.Provider value={{ items, toggleWishlist, isInWishlist, removeFromWishlist, clearWishlist }}>
      {children}
    </WishlistContext.Provider>
  );
}

// eslint-disable-next-line react-refresh/only-export-components
export function useWishlist() {
  const context = useContext(WishlistContext);
  if (!context) {
    throw new Error('useWishlist phải được dùng bên trong WishlistProvider');
  }
  return context;
}
