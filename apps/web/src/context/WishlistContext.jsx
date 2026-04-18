import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useAuth } from './AuthContext';
import { wishlistApi } from '../lib/api';

const WishlistContext = createContext(null);

/** Chuẩn hoá card từ BE (UUID → id string) */
function mapServerCard(c) {
  return {
    id: String(c.id),
    name: c.name ?? '',
    price: c.price != null ? Number(c.price) : 0,
    imageUrl: c.imageUrl ?? '',
    category: c.category ?? '',
    seller: c.seller ?? '',
    rating: typeof c.rating === 'number' ? c.rating : 0,
    reviews: typeof c.reviews === 'number' ? c.reviews : 0,
  };
}

export function WishlistProvider({ children }) {
  const { user, isAuthenticated } = useAuth();
  const [items, setItems] = useState([]);

  const refreshFromServer = useCallback(async () => {
    if (!isAuthenticated || !user?.id) return;
    try {
      const res = await wishlistApi.getAll();
      const list = Array.isArray(res.data) ? res.data : [];
      setItems(list.map(mapServerCard));
    } catch {
      setItems([]);
    }
  }, [isAuthenticated, user?.id]);

  useEffect(() => {
    if (isAuthenticated && user?.id) {
      refreshFromServer();
    } else {
      setItems([]);
    }
  }, [user?.id, isAuthenticated, refreshFromServer]);

  const toggleWishlist = useCallback(
    async (product) => {
      if (!isAuthenticated || !user?.id) return;
      const pid = String(product.id);
      const exists = items.some((item) => String(item.id) === pid);
      if (exists) {
        try {
          await wishlistApi.remove(pid);
          setItems((prev) => prev.filter((item) => String(item.id) !== pid));
        } catch {
          await refreshFromServer();
        }
        return;
      }
      try {
        await wishlistApi.add(pid);
        setItems((prev) => [
          ...prev,
          {
            id: pid,
            name: product.name ?? '',
            price: product.price != null ? Number(product.price) : 0,
            imageUrl: product.imageUrl ?? '',
            category: product.category ?? '',
            seller: product.seller ?? '',
            rating: typeof product.rating === 'number' ? product.rating : 0,
            reviews: typeof product.reviews === 'number' ? product.reviews : 0,
          },
        ]);
      } catch {
        await refreshFromServer();
      }
    },
    [isAuthenticated, user?.id, items, refreshFromServer],
  );

  const isInWishlist = useCallback(
    (productId) => items.some((item) => String(item.id) === String(productId)),
    [items],
  );

  const removeFromWishlist = useCallback(
    async (productId) => {
      const pid = String(productId);
      try {
        await wishlistApi.remove(pid);
        setItems((prev) => prev.filter((item) => String(item.id) !== pid));
      } catch (e) {
        await refreshFromServer();
        throw e;
      }
    },
    [refreshFromServer],
  );

  const clearWishlist = useCallback(async () => {
    if (items.length === 0) return;
    const copy = [...items];
    try {
      await Promise.all(copy.map((i) => wishlistApi.remove(String(i.id))));
      setItems([]);
    } catch (e) {
      await refreshFromServer();
      throw e;
    }
  }, [items, refreshFromServer]);

  return (
    <WishlistContext.Provider
      value={{ items, toggleWishlist, isInWishlist, removeFromWishlist, clearWishlist, refreshWishlist: refreshFromServer }}
    >
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
