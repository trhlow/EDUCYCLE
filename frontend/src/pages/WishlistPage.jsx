import { formatPrice } from '../utils/format';
import { Link } from 'react-router-dom';
import { useWishlist } from '../context/WishlistContext';
import { useToast } from '../components/Toast';
import { IconTrash } from '../components/icons/Icons';
import { EmptyState, PageHeader, SurfaceCard } from '../components/ui';
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
      toast.info('Đã xóa tất cả mục yêu thích');
    } catch {
      toast.error('Không xóa hết được. Thử lại.');
    }
  };

  return (
    <div className="wishlist-page edu-page">
      <div className="edu-container">
        <PageHeader
          eyebrow="Sưu tập cá nhân"
          title="Danh sách yêu thích"
          subtitle="Lưu nhanh giáo trình, tài liệu ôn thi và đồ dùng học tập để xem lại khi cần."
          actions={
            wishlistedProducts.length > 0 ? (
              <button type="button" className="wishlist-clear-btn" onClick={handleClear}>
                Xóa tất cả
              </button>
            ) : null
          }
        />

        {wishlistedProducts.length === 0 ? (
          <EmptyState
            title="Danh sách yêu thích đang trống"
            description="Bạn chưa lưu tài liệu nào. Hãy khám phá marketplace để chọn mục phù hợp cho kỳ học này."
            actions={
              <Link to="/products" className="wishlist-browse-btn">
                Khám phá tài liệu
              </Link>
            }
          />
        ) : (
          <div className="wishlist-grid">
            {wishlistedProducts.map((product) => (
              <SurfaceCard key={product.id} className="wishlist-card" interactive padded={false}>
                <div className="wishlist-card-img">
                  <img src={product.imageUrl} alt={product.name} loading="lazy" decoding="async" />
                  <button
                    type="button"
                    className="wishlist-remove-btn"
                    onClick={() => handleRemove(product.id, product.name)}
                    title="Xóa khỏi yêu thích"
                    aria-label="Xóa khỏi yêu thích"
                  >
                    <IconTrash size={16} />
                  </button>
                </div>

                <div className="wishlist-card-body">
                  <Link to={`/products/${product.id}`} className="wishlist-card-title">
                    {product.name}
                  </Link>
                  <p className="wishlist-card-seller">Người bán: {product.seller || 'Không rõ'}</p>
                  <div className="wishlist-card-meta">
                    <span className="wishlist-stars">
                      {(product.rating != null ? Number(product.rating).toFixed(1) : '—')}/5
                    </span>
                    <span className="wishlist-reviews">
                      ({(product.reviews || 0).toLocaleString()} đánh giá)
                    </span>
                  </div>
                  <div className="wishlist-card-price">{formatPrice(product.price)}</div>
                  <Link to={`/products/${product.id}`} className="wishlist-open-btn">
                    Xem chi tiết và gửi yêu cầu
                  </Link>
                </div>
              </SurfaceCard>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
