import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useWishlist } from '../contexts/WishlistContext';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../components/Toast';
import { transactionsApi, productsApi, reviewsApi } from '../api/endpoints';
import { maskUsername } from '../utils/maskUsername';
import './ProductDetailPage.css';

export default function ProductDetailPage() {
  const { id } = useParams();
  const toast = useToast();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('description');
  const [selectedThumb, setSelectedThumb] = useState(0);
  const [reviews, setReviews] = useState([]);
  const [sendingRequest, setSendingRequest] = useState(false);
  const { toggleWishlist, isInWishlist } = useWishlist();
  const { user, isAuthenticated } = useAuth();
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
          priceType: p.priceType || (p.price === 0 ? 'contact' : 'fixed'),
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

  // Issue #5: Fetch reviews by SELLER (not product) — rating là uy tín người bán
  useEffect(() => {
    const fetchReviews = async () => {
      if (!product?.sellerId) return;
      try {
        const res = await reviewsApi.getByUser(product.sellerId);
        const data = Array.isArray(res.data) ? res.data : [];
        setReviews(data.map(r => ({
          id: r.id,
          user: maskUsername(r.reviewerName || r.username || 'Ẩn danh'),
          rating: r.rating,
          text: r.content,
          date: new Date(r.createdAt).toLocaleDateString('vi-VN'),
        })));
      } catch {
        setReviews([]);
      }
    };
    fetchReviews();
  }, [product?.sellerId]);

  if (loading) return (
    <div className="pdp-container" style={{ textAlign:'center', padding:'6rem 2rem' }}>
      <h2>⏳ Đang tải...</h2>
      <p style={{ color:'var(--text-secondary)', margin:'1rem 0' }}>Vui lòng chờ trong giây lát.</p>
    </div>
  );

  if (!product) return (
    <div className="pdp-container" style={{ textAlign:'center', padding:'6rem 2rem' }}>
      <h2>Không tìm thấy sản phẩm</h2>
      <p style={{ color:'var(--text-secondary)', margin:'1rem 0' }}>Sản phẩm không tồn tại hoặc đã bị xóa.</p>
      <Link to="/products" className="plp-reset-btn" style={{ display:'inline-block', textDecoration:'none' }}>Duyệt Sản Phẩm</Link>
    </div>
  );

  const thumbImages = product.imageUrls?.length > 0
    ? product.imageUrls
    : product.imageUrl ? [product.imageUrl] : [];

  const productStatus = product.status?.toUpperCase();
  const isSold      = productStatus === 'SOLD';
  // Issue #3: RESERVED — khi BE đặt sản phẩm là "đang có người đặt mua"
  const isReserved  = productStatus === 'RESERVED';
  const isPending   = productStatus === 'PENDING';

  // Issue #4: Hiển thị "Giá liên hệ" khi price=0 hoặc priceType='contact'
  const isContactPrice = product.priceType === 'contact' || product.price === 0;
  const priceDisplay = isContactPrice
    ? <span style={{ color:'var(--accent-500)', fontWeight:600 }}>💬 Giá liên hệ</span>
    : <span>{Number(product.price).toLocaleString('vi-VN')}đ</span>;

  // Issue #5: Seller rating summary
  const avgRating = reviews.length > 0
    ? (reviews.reduce((s, r) => s + r.rating, 0) / reviews.length).toFixed(1)
    : null;

  return (
    <div className="pdp-container">
      <div className="pdp-breadcrumb">
        <Link to="/">Trang Chủ</Link><span>/</span>
        <Link to="/products">Sản Phẩm</Link><span>/</span>
        <span>{product.name}</span>
      </div>

      <div className="pdp-layout">
        {/* Gallery */}
        <div className="pdp-gallery">
          <div className="pdp-main-image">
            {thumbImages.length > 0 ? (
              <img src={thumbImages[selectedThumb]} alt={product.name} />
            ) : (
              <div style={{ display:'flex', alignItems:'center', justifyContent:'center', height:'100%', background:'var(--bg-secondary)', color:'var(--text-muted)', fontSize:'3rem' }}>📷</div>
            )}
          </div>
          {thumbImages.length > 1 && (
            <div className="pdp-thumbnails">
              {thumbImages.map((thumb, i) => (
                <button key={i} className={`pdp-thumb ${selectedThumb===i?'active':''}`} onClick={() => setSelectedThumb(i)}>
                  <img src={thumb} alt={`${product.name} ${i+1}`} />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Purchase Panel */}
        <div className="pdp-purchase-panel">
          <h1 className="pdp-title">{product.name}</h1>
          <div className="pdp-seller-row">
            bởi{' '}
            {product.sellerId ? (
              <Link to={`/users/${product.sellerId}`} className="pdp-seller-name" title="Xem hồ sơ người bán">
                {maskUsername(product.seller)}
              </Link>
            ) : (
              <span className="pdp-seller-name">{maskUsername(product.seller)}</span>
            )}
          </div>

          {/* Issue #5: Rating = uy tín người bán, không phải sản phẩm */}
          <div className="pdp-rating-row">
            {avgRating ? (
              <>
                <span className="pdp-stars">★ {avgRating}</span>
                <span className="pdp-rating-text">({reviews.length} đánh giá người bán)</span>
              </>
            ) : (
              <span className="pdp-rating-text" style={{ color:'var(--text-tertiary)' }}>Chưa có đánh giá người bán</span>
            )}
          </div>

          <span className="pdp-category-badge">{product.category}</span>

          {/* Issue #3: Status badge */}
          {isReserved && (
            <div style={{ display:'inline-flex', alignItems:'center', gap:'var(--space-2)', background:'var(--warning-light)', color:'#e65100', borderRadius:'var(--radius-md)', padding:'var(--space-2) var(--space-3)', fontSize:'var(--text-sm)', fontWeight:500, marginBottom:'var(--space-3)' }}>
              ⏳ Đang có người đặt mua
            </div>
          )}
          {isPending && (
            <div style={{ display:'inline-flex', alignItems:'center', gap:'var(--space-2)', background:'var(--info-light)', color:'#1565c0', borderRadius:'var(--radius-md)', padding:'var(--space-2) var(--space-3)', fontSize:'var(--text-sm)', fontWeight:500, marginBottom:'var(--space-3)' }}>
              🔍 Đang chờ kiểm duyệt
            </div>
          )}

          {/* Issue #4: price display */}
          <div className="pdp-price">{priceDisplay}</div>
          {isContactPrice && (
            <p style={{ fontSize:'var(--text-xs)', color:'var(--text-secondary)', marginTop:'-var(--space-2)', marginBottom:'var(--space-3)' }}>
              Giá sẽ được thương lượng khi gặp mặt
            </p>
          )}

          {/* Actions */}
          <div className="pdp-actions">
            {isSold ? (
              <div className="pdp-sold-notice">✅ Sản phẩm đã được bán</div>
            ) : isReserved ? (
              // Issue #3: show reserved status clearly, still allow wishlist
              <div style={{ background:'var(--warning-light)', border:'1px solid #fbbf24', borderRadius:'var(--radius-md)', padding:'var(--space-3) var(--space-4)', fontSize:'var(--text-sm)', color:'#92400e' }}>
                ⏳ Sản phẩm này đang trong quá trình giao dịch với người khác.
                Bạn có thể yêu thích để theo dõi nếu giao dịch không thành.
              </div>
            ) : isPending ? (
              <div style={{ background:'var(--info-light)', border:'1px solid #bfdbfe', borderRadius:'var(--radius-md)', padding:'var(--space-3) var(--space-4)', fontSize:'var(--text-sm)', color:'#1e40af' }}>
                🔍 Sản phẩm đang chờ admin kiểm duyệt. Vui lòng quay lại sau.
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
                      amount: isContactPrice ? 0 : product.price,
                    });
                    toast.success('Đã gửi yêu cầu mua! Chờ người bán xác nhận.');
                    navigate(`/transactions/${res.data.id || res.data.Id}`);
                  } catch (err) {
                    const msg = err.response?.data?.message || err.response?.data?.title || err.response?.data;
                    // Issue #3: nếu lỗi conflict (sản phẩm đang được đặt), thông báo rõ
                    if (typeof msg === 'string' && (msg.toLowerCase().includes('đang') || msg.toLowerCase().includes('reserved') || err.response?.status === 409)) {
                      toast.error('Sản phẩm này đang trong giao dịch với người khác. Vui lòng thử lại sau.');
                    } else {
                      toast.error(typeof msg === 'string' ? msg : 'Không thể gửi yêu cầu. Vui lòng thử lại.');
                    }
                  } finally {
                    setSendingRequest(false);
                  }
                }}
              >
                {sendingRequest ? '⏳ Đang gửi...' : '📩 Gửi Yêu Cầu Mua'}
              </button>
            ) : !isAuthenticated ? (
              <button className="pdp-btn-buy" onClick={() => { toast.warning('Vui lòng đăng nhập để gửi yêu cầu mua'); navigate('/auth'); }}>
                Đăng nhập để mua
              </button>
            ) : (
              <div className="pdp-own-product-notice">📌 Đây là sản phẩm của bạn</div>
            )}

            <button
              className={`pdp-btn-wishlist ${isInWishlist(product.id) ? 'active' : ''}`}
              onClick={() => { toggleWishlist(product); toast.info(isInWishlist(product.id) ? 'Đã xóa khỏi yêu thích' : 'Đã thêm vào yêu thích'); }}
            >
              {isInWishlist(product.id) ? '❤️' : '🤍'}
            </button>
          </div>

          <div className="pdp-transaction-hint">
            <Link to="/transactions/guide">📖 Xem hướng dẫn giao dịch</Link>
          </div>

          {/* Seller Card — Issue #5: shows seller reputation */}
          <div className="pdp-seller-card">
            <div className="pdp-seller-avatar">👤</div>
            <div className="pdp-seller-info">
              <div className="pdp-seller-info-name">{maskUsername(product.seller)}</div>
              <div className="pdp-seller-info-meta">Người bán trên EduCycle</div>
              {avgRating ? (
                <div className="pdp-seller-rating">
                  <span className="pdp-seller-rating-stars">
                    {'★'.repeat(Math.round(Number(avgRating)))}{'☆'.repeat(5 - Math.round(Number(avgRating)))}
                  </span>
                  <span className="pdp-seller-rating-score">{avgRating}</span>
                  <span className="pdp-seller-rating-count">({reviews.length} đánh giá)</span>
                </div>
              ) : (
                <div className="pdp-seller-rating">
                  <span className="pdp-seller-rating-count">Chưa có đánh giá</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Detail Tabs */}
        <div className="pdp-details">
          <div className="pdp-tabs">
            {/* Issue #5: rename "reviews" tab → "Uy Tín Người Bán" */}
            {[
              { key:'description', label:'Mô Tả' },
              { key:'reviews',     label:`⭐ Uy Tín Người Bán${reviews.length > 0 ? ` (${reviews.length})` : ''}` },
              { key:'info',        label:'Thông Tin' },
            ].map(tab => (
              <button key={tab.key} className={`pdp-tab ${activeTab===tab.key?'active':''}`} onClick={() => setActiveTab(tab.key)}>
                {tab.label}
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

            {/* Issue #5: Tab này là đánh giá NGƯỜI BÁN, không phải sản phẩm */}
            {activeTab === 'reviews' && (
              <div>
                <h3 className="pdp-section-title">Uy Tín Người Bán</h3>
                <p style={{ color:'var(--text-secondary)', fontSize:'var(--text-sm)', marginBottom:'var(--space-4)' }}>
                  Đánh giá từ những người đã hoàn tất giao dịch với <strong>{maskUsername(product.seller)}</strong>.
                  Đây là điểm uy tín cá nhân của người bán, không phải của sản phẩm.
                </p>
                {reviews.length === 0 ? (
                  <div style={{ textAlign:'center', padding:'var(--space-8)', color:'var(--text-tertiary)' }}>
                    <div style={{ fontSize:'2rem', marginBottom:'var(--space-2)' }}>⭐</div>
                    <p>Người bán này chưa có đánh giá nào.</p>
                    <p style={{ fontSize:'var(--text-xs)', marginTop:'var(--space-2)' }}>Hoàn tất giao dịch đầu tiên để có điểm uy tín.</p>
                  </div>
                ) : (
                  <>
                    {/* Summary */}
                    <div style={{ display:'flex', alignItems:'center', gap:'var(--space-4)', padding:'var(--space-4)', background:'var(--bg-secondary)', borderRadius:'var(--radius-lg)', marginBottom:'var(--space-4)' }}>
                      <div style={{ textAlign:'center' }}>
                        <div style={{ fontSize:'var(--text-3xl)', fontWeight:700, color:'var(--accent-500)', lineHeight:1 }}>{avgRating}</div>
                        <div style={{ fontSize:'var(--text-xs)', color:'var(--text-secondary)', marginTop:'var(--space-1)' }}>/ 5 sao</div>
                      </div>
                      <div>
                        <div style={{ color:'#f59e0b', fontSize:'var(--text-lg)', letterSpacing:2 }}>
                          {'★'.repeat(Math.round(Number(avgRating)))}{'☆'.repeat(5 - Math.round(Number(avgRating)))}
                        </div>
                        <div style={{ fontSize:'var(--text-sm)', color:'var(--text-secondary)', marginTop:4 }}>{reviews.length} đánh giá</div>
                      </div>
                    </div>
                    {reviews.map(review => (
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
                  </>
                )}
              </div>
            )}

            {activeTab === 'info' && (
              <div>
                <h3 className="pdp-section-title">Thông Tin Sản Phẩm</h3>
                <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'var(--space-4)' }}>
                  {[
                    ['Danh mục',   product.category],
                    ['Giá',        isContactPrice ? 'Giá liên hệ' : `${Number(product.price).toLocaleString('vi-VN')}đ`],
                    ['Tình trạng', product.condition || 'Không rõ'],
                    ['Người bán',  maskUsername(product.seller)],
                  ].map(([label, value]) => (
                    <div key={label}>
                      <strong style={{ color:'var(--text-primary)' }}>{label}:</strong>
                      <p style={{ color:'var(--text-secondary)', fontSize:'var(--text-sm)', marginTop:4 }}>{value}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
