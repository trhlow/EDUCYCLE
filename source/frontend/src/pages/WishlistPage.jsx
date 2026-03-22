import { formatPrice } from '../utils/format';
import { Link } from 'react-router-dom';
import { useWishlist } from '../contexts/WishlistContext';
import { useCart } from '../contexts/CartContext';
import { useToast } from '../components/Toast';
import './WishlistPage.css';

export default function WishlistPage() {
  const { items: wishlistedProducts, removeFromWishlist, clearWishlist } = useWishlist();
  const { addItem } = useCart();
  const toast = useToast();
  const handleAddToCart = (product) => {
    addItem({
      id: product.id,
      name: product.name,
      price: product.price,
      imageUrl: product.imageUrl,
      category: product.category,
      seller: product.seller,
      quantity: 1,
    });
    toast.success(`Đã thêm "${product.name}" vào giỏ hàng`);
  };

  const handleRemove = (id, name) => {
    removeFromWishlist(id);
    toast.info(`Đã xóa "${name}" khỏi danh sách yêu thích`);
  };

  const handleClear = () => {
    clearWishlist();
    toast.info('Đã xóa tất cả khỏi danh sách yêu thích');
  };

  

  if (wishlistedProducts.length === 0) {
    return (
      <div className="wishlist-page">
        <div className="wishlist-empty">
          <span className="wishlist-empty-icon">💝</span>
          <h2>Danh sách yêu thích trống</h2>
          <p>Bạn chưa thêm khóa học nào vào danh sách yêu thích.</p>
          <Link to="/products" className="wishlist-browse-btn">Khám Phá Khóa Học</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="wishlist-page">
      <div className="wishlist-header">
        <div>
          <h1>Danh Sách Yêu Thích</h1>
          <p>{wishlistedProducts.length} khóa học</p>
        </div>
        <button className="wishlist-clear-btn" onClick={handleClear}>
          Xóa tất cả
        </button>
      </div>

      <div className="wishlist-grid">
        {wishlistedProducts.map(product => (
          <div key={product.id} className="wishlist-card">
            <div className="wishlist-card-img">
              <img src={product.imageUrl} alt={product.name} />
              <button
                className="wishlist-remove-btn"
                onClick={() => handleRemove(product.id, product.name)}
                title="Xóa khỏi yêu thích"
              >
                ✕
              </button>
            </div>
            <div className="wishlist-card-body">
              <Link to={`/products/${product.id}`} className="wishlist-card-title">
                {product.name}
              </Link>
              <p className="wishlist-card-instructor">{product.seller}</p>
              <div className="wishlist-card-rating">
                <span className="wishlist-stars">{'★'.repeat(Math.floor(product.rating || 0))}{'☆'.repeat(5 - Math.floor(product.rating || 0))}</span>
                <span>{product.rating || 'N/A'}</span>
                <span className="wishlist-students">({(product.reviews || 0).toLocaleString()})</span>
              </div>
              <div className="wishlist-card-price">
                <span className="wishlist-price-current">{formatPrice(product.price)}</span>
              </div>
              <button className="wishlist-add-cart-btn" onClick={() => handleAddToCart(product)}>
                Thêm Vào Giỏ Hàng
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
