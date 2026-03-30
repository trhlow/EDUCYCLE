import { formatPrice } from '../utils/format';
import { Link } from 'react-router-dom';
import { useWishlist } from '../contexts/WishlistContext';
import { useToast } from '../components/Toast';
import { IconTrash } from '../components/icons/Icons';
import './WishlistPage.css';

export default function WishlistPage() {
  const { items: wishlistedProducts, removeFromWishlist, clearWishlist } = useWishlist();
  const toast = useToast();

  const handleRemove = async (id, name) => {
    try {
      await removeFromWishlist(id);
      toast.info(`Đã xóa "${name}" khỏi danh sách yêu thích`);
    } catch {
      toast.error('Không xóa được. Thử lại.');
    }
  };

  const handleClear = async () => {
    try {
      await clearWishlist();
      toast.info('Đã xóa tất cả khỏi danh sách yêu thích');
    } catch {
      toast.error('Không xóa hết được. Thử lại.');
    }
  };

  if (wishlistedProducts.length === 0) {
    return (
      <div className="wishlist-page">
        <div className="wishlist-empty">
          <h2>Danh sách yêu thích trống</h2>
          <p>Bạn chưa lưu sách hoặc tài liệu nào.</p>
          <Link to="/products" className="wishlist-browse-btn">
            Khám phá tài liệu
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="wishlist-page">
      <div className="wishlist-header">
        <div>
          <h1>Danh Sách Yêu Thích</h1>
          <p>{wishlistedProducts.length} tài liệu đã lưu</p>
        </div>
        <button type="button" className="wishlist-clear-btn" onClick={handleClear}>
          Xóa tất cả
        </button>
      </div>

      <div className="wishlist-grid">
        {wishlistedProducts.map((product) => (
          <div key={product.id} className="wishlist-card">
            <div className="wishlist-card-img">
              <img src={product.imageUrl} alt={product.name} />
              <button
                type="button"
                className="wishlist-remove-btn"
                onClick={() => handleRemove(product.id, product.name)}
                title="Xóa khỏi yêu thích"
                aria-label="Xóa khỏi yêu thích"
              >
                <IconTrash size={18} />
              </button>
            </div>
            <div className="wishlist-card-body">
              <Link to={`/products/${product.id}`} className="wishlist-card-title">
                {product.name}
              </Link>
              <p className="wishlist-card-instructor">Người bán: {product.seller || '—'}</p>
              <div className="wishlist-card-rating">
                <span className="wishlist-stars">
                  {(product.rating != null ? Number(product.rating).toFixed(1) : '—')}/5
                </span>
                <span className="wishlist-students">({(product.reviews || 0).toLocaleString()} đánh giá)</span>
              </div>
              <div className="wishlist-card-price">
                <span className="wishlist-price-current">{formatPrice(product.price)}</span>
              </div>
              <Link to={`/products/${product.id}`} className="wishlist-add-cart-btn wishlist-request-link">
                Xem chi tiết &amp; gửi yêu cầu mua
              </Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
