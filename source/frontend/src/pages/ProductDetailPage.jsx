import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useCart } from '../contexts/CartContext';
import { useWishlist } from '../contexts/WishlistContext';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../components/Toast';
import { transactionsApi, productsApi, reviewsApi } from '../api/endpoints';
import { maskUsername } from '../utils/maskUsername';
import './ProductDetailPage.css';

export default function ProductDetailPage() {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('description');
  const [selectedThumb, setSelectedThumb] = useState(0);
  const [reviews, setReviews] = useState([]);
  const [reviewsLoading, setReviewsLoading] = useState(false);
  const [sendingRequest, setSendingRequest] = useState(false);
  const { addItem } = useCart();
  const { toggleWishlist, isInWishlist } = useWishlist();
  const { user, isAuthenticated } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchProduct = async () => {
      if (!id) return;
      setLoading(true);
      try {
        const res = await productsApi.getById(id);
        const p = res.data;
        setProduct({
          id: String(p.id || p.Id),
          name: p.name || '',
          description: p.description || '',
          price: p.price || 0,
          category: p.categoryName || p.category || '',
          imageUrl: p.imageUrl || p.imageUrls?.[0] || '',
          imageUrls: p.imageUrls || [],
          rating: p.averageRating || 0,
          reviews: p.reviewCount || 0,
          seller: p.sellerName || '',
          sellerId: p.sellerId || p.userId || '',
          condition: p.condition || '',
          contactNote: p.contactNote || '',
          status: p.status || '',
          createdAt: p.createdAt || '',
        });
      } catch {
        setProduct(null);
      } finally {
        setLoading(false);
      }
    };
    fetchProduct();
  }, [id]);

  // Fetch reviews for the seller (user-to-user reviews)
  useEffect(() => {
    const fetchSellerReviews = async () => {
      if (!product?.sellerId) return;
      setReviewsLoading(true);
      try {
        const res = await reviewsApi.getByUser(product.sellerId);
        const data = Array.isArray(res.data) ? res.data : [];
        setReviews(data.map((r) => ({
          id: r.id,
          user: maskUsername(r.reviewerName || r.username || 'Ẩn danh'),
          rating: r.rating,
          text: r.content,
          date: new Date(r.createdAt).toLocaleDateString('vi-VN'),
        })));
      } catch {
        setReviews([]);
      } finally {
        setReviewsLoading(false);
      }
    };
    fetchSellerReviews();
  }, [product?.sellerId]);

  const allReviews = reviews;

  if (loading) {
    return (
      <div className="pdp-container" style={{ textAlign: 'center', padding: '6rem 2rem' }}>
        <h2>⏳ Đang tải...</h2>
        <p style={{ color: 'var(--text-secondary)', margin: '1rem 0' }}>
          Vui lòng chờ trong giây lát.
        </p>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="pdp-container" style={{ textAlign: 'center', padding: '6rem 2rem' }}>
        <h2>Không tìm thấy sản phẩm</h2>
        <p style={{ color: 'var(--text-secondary)', margin: '1rem 0' }}>
          Sản phẩm bạn tìm kiếm không tồn tại hoặc đã bị xóa.
        </p>
        <Link to="/products" className="plp-reset-btn" style={{ display: 'inline-block', textDecoration: 'none' }}>
          Duyệt Sản Phẩm
        </Link>
      </div>
    );
  }

  const thumbImages = product.imageUrls && product.imageUrls.length > 0
    ? product.imageUrls
    : product.imageUrl
      ? [product.imageUrl]
      : [];

  return (
    <div className="pdp-container">
      <div className="pdp-breadcrumb">
        <Link to="/">Trang Chủ</Link>
        <span>/</span>
        <Link to="/products">Sản Phẩm</Link>
        <span>/</span>
        <span>{product.name}</span>
      </div>

      <div className="pdp-layout">
        {/* Image Gallery */}
        <div className="pdp-gallery">
          <div className="pdp-main-image">
            {thumbImages.length > 0 ? (
              <img src={thumbImages[selectedThumb]} alt={product.name} />
            ) : (
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', background: 'var(--bg-secondary)', color: 'var(--text-muted)', fontSize: '3rem' }}>📷</div>
            )}
          </div>
          {thumbImages.length > 1 && (
            <div className="pdp-thumbnails">
              {thumbImages.map((thumb, index) => (
                <button
                  key={index}
                  className={`pdp-thumb ${selectedThumb === index ? 'active' : ''}`}
                  onClick={() => setSelectedThumb(index)}
                >
                  <img src={thumb} alt={`${product.name} thumbnail ${index + 1}`} />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Purchase Panel */}
        <div className="pdp-purchase-panel">
          <h1 className="pdp-title">{product.name}</h1>
          <div className="pdp-seller-row">
            bởi <span className="pdp-seller-name">{maskUsername(product.seller)}</span>
          </div>
          <div className="pdp-rating-row">
            <span className="pdp-stars">★ {product.rating}</span>
            <span className="pdp-rating-text">({product.reviews} đánh giá)</span>
          </div>
          <span className="pdp-category-badge">{product.category}</span>
          <div className="pdp-price">{Number(product.price).toLocaleString('vi-VN')}đ</div>

          {/* Transaction Request Button */}
          <div className="pdp-actions">
            {/* Sold status */}
            {(product.status === 'Sold' || product.status === 'Completed') ? (
              <div className="pdp-sold-notice">
                ✅ Sản phẩm đã được bán
              </div>
            ) : isAuthenticated && product.sellerId !== user?.id ? (
              <button
                className="pdp-btn-buy pdp-btn-request"
                disabled={sendingRequest}
                onClick={async () => {
                  setSendingRequest(true);
                  try {
                    const res = await transactionsApi.create({
                      productId: product.id,
                      sellerId: product.sellerId,
                      amount: product.price,
                    });
                    toast.success('Đã gửi yêu cầu mua! Chờ người bán xác nhận.');
                    navigate(`/transactions/${res.data.id || res.data.Id}`);
                  } catch (err) {
                    const msg = err.response?.data?.message || err.response?.data?.title || err.response?.data;
                    if (msg && typeof msg === 'string') {
                      toast.error(msg);
                    } else {
                      toast.error('Không thể gửi yêu cầu. Vui lòng thử lại.');
                    }
                  } finally {
                    setSendingRequest(false);
                  }
                }}
              >
                {sendingRequest ? '⏳ Đang gửi...' : '📩 Gửi Yêu Cầu Mua'}
              </button>
            ) : !isAuthenticated ? (
              <button
                className="pdp-btn-buy"
                onClick={() => {
                  toast.info('Vui lòng đăng nhập để gửi yêu cầu mua');
                  navigate('/auth');
                }}
              >
                Đăng nhập để mua
              </button>
            ) : (
              <div className="pdp-own-product-notice">
                📌 Đây là sản phẩm của bạn
              </div>
            )}
            <button
              className={`pdp-btn-wishlist ${isInWishlist(product.id) ? 'active' : ''}`}
              onClick={() => {
                toggleWishlist(product);
                toast.info(isInWishlist(product.id) ? 'Đã xóa khỏi yêu thích' : 'Đã thêm vào yêu thích');
              }}
              title={isInWishlist(product.id) ? 'Xóa khỏi yêu thích' : 'Thêm vào yêu thích'}
            >
              {isInWishlist(product.id) ? '❤️' : '🤍'}
            </button>
          </div>

          <div className="pdp-transaction-hint">
            <Link to="/transactions/guide">📖 Xem hướng dẫn giao dịch</Link>
          </div>

          <div className="pdp-seller-card">
            <div className="pdp-seller-avatar">👤</div>
            <div className="pdp-seller-info">
              <div className="pdp-seller-info-name">{maskUsername(product.seller)}</div>
              <div className="pdp-seller-info-meta">
                Người bán trên EduCycle
              </div>
            </div>
          </div>
        </div>

        {/* Detail Tabs */}
        <div className="pdp-details">
          <div className="pdp-tabs">
            {['description', 'reviews', 'info'].map((tab) => (
              <button
                key={tab}
                className={`pdp-tab ${activeTab === tab ? 'active' : ''}`}
                onClick={() => setActiveTab(tab)}
              >
                {tab === 'description' ? 'Mô Tả' : tab === 'reviews' ? 'Đánh Giá' : 'Thông Tin Sản Phẩm'}
              </button>
            ))}
          </div>

          <div className="pdp-tab-content">
            {activeTab === 'description' && (
              <div>
                <p className="pdp-description">{product.description}</p>

                {product.condition && (
                  <>
                    <h3 className="pdp-section-title">Tình Trạng</h3>
                    <p>{product.condition}</p>
                  </>
                )}

                {product.contactNote && (
                  <>
                    <h3 className="pdp-section-title">Ghi Chú Giao Dịch</h3>
                    <p>{product.contactNote}</p>
                  </>
                )}
              </div>
            )}

            {activeTab === 'reviews' && (
              <div>
                <h3 className="pdp-section-title">Đánh Giá Người Bán ({allReviews.length})</h3>
                <p style={{ color: 'var(--text-secondary)', fontSize: 'var(--text-sm)', marginBottom: 'var(--space-4)' }}>
                  Đánh giá từ những người đã giao dịch với người bán này. Bạn chỉ có thể đánh giá sau khi hoàn thành giao dịch.
                </p>

                {allReviews.length === 0 && (
                  <div style={{ textAlign: 'center', padding: 'var(--space-8)', color: 'var(--text-tertiary)' }}>
                    <div style={{ fontSize: '2rem', marginBottom: 'var(--space-2)' }}>⭐</div>
                    <p>Chưa có đánh giá nào về người bán này.</p>
                  </div>
                )}

                {allReviews.map((review) => (
                  <div key={review.id} className="pdp-review-card">
                    <div className="pdp-review-header">
                      <span className="pdp-review-user">{review.user}</span>
                      <span className="pdp-review-date">{review.date}</span>
                    </div>
                    <div className="pdp-review-stars">
                      {'★'.repeat(review.rating)}{'☆'.repeat(5 - review.rating)}
                    </div>
                    <p className="pdp-review-text">{review.text}</p>
                  </div>
                ))}
              </div>
            )}

            {activeTab === 'info' && (
              <div>
                <h3 className="pdp-section-title">Thông Tin Sản Phẩm</h3>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-4)' }}>
                  <div>
                    <strong style={{ color: 'var(--text-primary)' }}>Danh mục:</strong>
                    <p style={{ color: 'var(--text-secondary)', fontSize: 'var(--text-sm)' }}>{product.category}</p>
                  </div>
                  <div>
                    <strong style={{ color: 'var(--text-primary)' }}>Giá:</strong>
                    <p style={{ color: 'var(--text-secondary)', fontSize: 'var(--text-sm)' }}>{Number(product.price).toLocaleString('vi-VN')}đ</p>
                  </div>
                  <div>
                    <strong style={{ color: 'var(--text-primary)' }}>Tình trạng:</strong>
                    <p style={{ color: 'var(--text-secondary)', fontSize: 'var(--text-sm)' }}>{product.condition || 'Không rõ'}</p>
                  </div>
                  <div>
                    <strong style={{ color: 'var(--text-primary)' }}>Đánh giá:</strong>
                    <p style={{ color: 'var(--text-secondary)', fontSize: 'var(--text-sm)' }}>{product.rating} / 5 ({product.reviews} đánh giá)</p>
                  </div>
                  <div>
                    <strong style={{ color: 'var(--text-primary)' }}>Người bán:</strong>
                    <p style={{ color: 'var(--text-secondary)', fontSize: 'var(--text-sm)' }}>{maskUsername(product.seller)}</p>
                  </div>
                  <div>
                    <strong style={{ color: 'var(--text-primary)' }}>Trạng thái:</strong>
                    <p style={{ color: 'var(--text-secondary)', fontSize: 'var(--text-sm)' }}>{product.status}</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
