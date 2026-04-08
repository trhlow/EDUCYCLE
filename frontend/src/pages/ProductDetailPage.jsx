import { useState, useEffect } from 'react';
import { getApiErrorMessage } from '../utils/apiError';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useWishlist } from '../contexts/WishlistContext';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../components/Toast';
import { transactionsApi, productsApi, reviewsApi } from '../api/endpoints';
import { maskUsername } from '../utils/maskUsername';
import { IconHeart, IconHeartFilled, IconTrash } from '../components/icons/Icons';
import { StatusBadge } from '../components/ui';
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
  const [deleting, setDeleting] = useState(false);
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
          rejectReason: p.rejectReason || '',
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
      <h2>Đang tải…</h2>
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
  const isRejected  = productStatus === 'REJECTED';
  const isOwner     = isAuthenticated && String(product.sellerId) === String(user?.id);

  const handleDeleteProduct = async () => {
    if (!window.confirm('Xóa vĩnh viễn tin đăng này? Không thể hoàn tác.')) return;
    setDeleting(true);
    try {
      await productsApi.delete(product.id);
      toast.success('Đã xóa tin đăng.');
      navigate('/dashboard');
    } catch (err) {
      toast.error(getApiErrorMessage(err, 'Không xóa được tin. Có thể sản phẩm đã có giao dịch.'));
    } finally {
      setDeleting(false);
    }
  };

  // Issue #4: Hiển thị "Giá liên hệ" khi price=0 hoặc priceType='contact'
  const isContactPrice = product.priceType === 'contact' || product.price === 0;
  const priceDisplay = isContactPrice
    ? <span style={{ color:'var(--accent-500)', fontWeight:600 }}>Giá liên hệ</span>
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
              <div style={{ display:'flex', alignItems:'center', justifyContent:'center', height:'100%', background:'var(--bg-secondary)', color:'var(--text-muted)', fontSize:'var(--text-sm)' }}>Chưa có ảnh</div>
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
                <span className="pdp-stars">{avgRating}/5</span>
                <span className="pdp-rating-text">({reviews.length} đánh giá người bán)</span>
              </>
            ) : (
              <span className="pdp-rating-text" style={{ color:'var(--text-tertiary)' }}>Chưa có đánh giá người bán</span>
            )}
          </div>

          <span className="pdp-category-badge">{product.category}</span>

          {/* Issue #3: Status badge */}
          {isReserved && <StatusBadge label="Đang có người đặt mua" tone="warning" className="pdp-inline-status" />}
          {isPending && <StatusBadge label="Đang chờ kiểm duyệt" tone="info" className="pdp-inline-status" />}
          {isRejected && (
            <div style={{ background:'var(--error-light)', border:'1px solid #fecaca', borderRadius:'var(--radius-md)', padding:'var(--space-3) var(--space-4)', fontSize:'var(--text-sm)', color:'#991b1b', marginBottom:'var(--space-3)' }}>
              <strong>Tin bị từ chối</strong>
              {product.rejectReason ? (
                <p style={{ margin:'var(--space-2) 0 0', whiteSpace:'pre-wrap' }}>Lý do: {product.rejectReason}</p>
              ) : (
                <p style={{ margin:'var(--space-2) 0 0' }}>Vui lòng chỉnh sửa và gửi lại để admin xem xét.</p>
              )}
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
            {isOwner && !isSold && !isReserved && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)', width: '100%', marginBottom: 'var(--space-2)' }}>
                <button
                  type="button"
                  className="pdp-btn-buy"
                  onClick={() => navigate(`/products/${product.id}/edit`)}
                >
                  Sửa tin đăng
                </button>
                <button
                  type="button"
                  className="pdp-btn-delete"
                  disabled={deleting}
                  aria-label="Xóa tin đăng"
                  onClick={handleDeleteProduct}
                >
                  <IconTrash size={18} />
                  {deleting ? 'Đang xóa…' : 'Xóa tin đăng'}
                </button>
              </div>
            )}
            {isSold ? (
              <div className="pdp-sold-notice">Sản phẩm đã được bán</div>
            ) : isReserved ? (
              // Issue #3: show reserved status clearly, still allow wishlist
              <div style={{ background:'var(--warning-light)', border:'1px solid #fbbf24', borderRadius:'var(--radius-md)', padding:'var(--space-3) var(--space-4)', fontSize:'var(--text-sm)', color:'#92400e' }}>
                Sản phẩm này đang trong quá trình giao dịch với người khác.
                Bạn có thể yêu thích để theo dõi nếu giao dịch không thành.
              </div>
            ) : isPending ? (
              <div style={{ background:'var(--info-light)', border:'1px solid #bfdbfe', borderRadius:'var(--radius-md)', padding:'var(--space-3) var(--space-4)', fontSize:'var(--text-sm)', color:'#1e40af' }}>
                Sản phẩm đang chờ admin kiểm duyệt. Vui lòng quay lại sau.
              </div>
            ) : isRejected && !isOwner ? (
              <div style={{ background:'var(--bg-secondary)', borderRadius:'var(--radius-md)', padding:'var(--space-3) var(--space-4)', fontSize:'var(--text-sm)', color:'var(--text-secondary)' }}>
                Tin này không hiển thị công khai do chưa được duyệt hoặc đã bị từ chối.
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
                    const status = err.response?.status;
                    const detail = getApiErrorMessage(err, 'Không thể gửi yêu cầu. Vui lòng thử lại.');
                    const conflict =
                      status === 409
                      || (typeof detail === 'string'
                        && /\b(đang|reserved|giao\s*dịch|transaction)\b/i.test(detail));
                    if (conflict) {
                      toast.error('Sản phẩm này đang trong giao dịch với người khác. Vui lòng thử lại sau.');
                    } else {
                      toast.error(detail && String(detail).trim() ? detail : 'Không thể gửi yêu cầu. Vui lòng thử lại.');
                    }
                  } finally {
                    setSendingRequest(false);
                  }
                }}
              >
                {sendingRequest ? 'Đang gửi…' : 'Gửi yêu cầu mua'}
              </button>
            ) : !isAuthenticated ? (
              <button className="pdp-btn-buy" onClick={() => { toast.warning('Vui lòng đăng nhập để gửi yêu cầu mua'); navigate('/auth'); }}>
                Đăng nhập để mua
              </button>
            ) : (
              <div className="pdp-own-product-notice">Đây là sản phẩm của bạn</div>
            )}

            <button
              type="button"
              className={`pdp-btn-wishlist ${isInWishlist(product.id) ? 'active' : ''}`}
              aria-label={isInWishlist(product.id) ? 'Bỏ yêu thích' : 'Thêm vào yêu thích'}
              title={isInWishlist(product.id) ? 'Bỏ yêu thích' : 'Thêm vào yêu thích'}
              onClick={() => { toggleWishlist(product); toast.info(isInWishlist(product.id) ? 'Đã xóa khỏi yêu thích' : 'Đã thêm vào yêu thích'); }}
            >
              {isInWishlist(product.id) ? <IconHeartFilled size={20} /> : <IconHeart size={20} />}
            </button>
          </div>

          <div className="pdp-transaction-hint">
            <Link to="/transactions/guide">Xem hướng dẫn giao dịch</Link>
          </div>

          {/* Seller Card — Issue #5: shows seller reputation */}
          <div className="pdp-seller-card">
            <div className="pdp-seller-avatar">{product.seller?.trim()?.charAt(0)?.toUpperCase() || '?'}</div>
            <div className="pdp-seller-info">
              <div className="pdp-seller-info-name">{maskUsername(product.seller)}</div>
              <div className="pdp-seller-info-meta">Người bán trên EduCycle</div>
              {avgRating ? (
                <div className="pdp-seller-rating">
                  <span className="pdp-seller-rating-stars">{avgRating}/5</span>
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
              { key:'reviews',     label:`Uy tín người bán${reviews.length > 0 ? ` (${reviews.length})` : ''}` },
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
                        <div style={{ color:'#f59e0b', fontSize:'var(--text-lg)' }}>
                          {avgRating}/5 sao
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
                          {review.rating}/5
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
