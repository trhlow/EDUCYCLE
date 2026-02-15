import { useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useCart } from '../contexts/CartContext';
import { useWishlist } from '../contexts/WishlistContext';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../components/Toast';
import { transactionsApi } from '../api/endpoints';
import './ProductDetailPage.css';

const PRODUCTS_DB = {
  '1': {
    id: '1',
    name: 'Giáo Trình Giải Tích 1 – Nguyễn Đình Trí',
    description: 'Sách giáo trình Toán cao cấp dành cho sinh viên năm nhất các ngành kỹ thuật',
    fullDescription: 'Giáo trình Giải tích 1 của tác giả Nguyễn Đình Trí là tài liệu bắt buộc cho sinh viên các ngành Kỹ thuật, CNTT, Điện tử. Sách bao gồm các chủ đề: giới hạn, đạo hàm, tích phân, chuỗi số. Bản này còn mới 95%, có đánh dấu và ghi chú tóm tắt công thức quan trọng bên lề rất tiện cho ôn thi.',
    price: 45000,
    category: 'Giáo Trình',
    imageUrl: 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=800&h=450&fit=crop',
    rating: 4.8,
    reviews: 12,
    seller: 'Minh Tuấn',
    sellerProducts: 5,
    sellerRating: 4.9,
    learningPoints: [
      'Giới hạn và liên tục của hàm số',
      'Đạo hàm và vi phân',
      'Tích phân xác định và bất định',
      'Chuỗi số và chuỗi hàm',
      'Phương trình vi phân cơ bản',
    ],
    requirements: [
      'Kiến thức Toán THPT (hàm số, đạo hàm cơ bản)',
      'Phù hợp SV năm 1 ngành Kỹ thuật, CNTT',
    ],
    reviewList: [
      { id: 'r1', user: 'Hải Đăng', rating: 5, date: '10/01/2026', text: 'Sách còn rất mới, ghi chú bên lề rất hữu ích cho ôn thi giữa kỳ.' },
      { id: 'r2', user: 'Mai Phương', rating: 5, date: '08/01/2026', text: 'Giao dịch nhanh gọn, sách đúng mô tả. Cảm ơn bạn!' },
      { id: 'r3', user: 'Trung Kiên', rating: 4, date: '05/01/2026', text: 'Sách tốt, chỉ hơi ố vàng ở bìa nhưng nội dung bên trong còn nguyên.' },
    ],
  },
  '2': {
    id: '2',
    name: 'Lập Trình C++ Từ Cơ Bản Đến Nâng Cao',
    description: 'Sách học lập trình C++ kèm bài tập thực hành, phù hợp SV ngành CNTT',
    fullDescription: 'Cuốn sách lập trình C++ toàn diện này phù hợp cho sinh viên CNTT từ năm 1 đến năm 3. Nội dung đi từ cú pháp cơ bản, mảng, con trỏ, OOP đến template và STL. Có hơn 200 bài tập kèm hướng dẫn giải. Sách đã qua sử dụng 1 học kỳ nhưng còn rất tốt.',
    price: 85000,
    category: 'Sách Chuyên Ngành',
    imageUrl: 'https://images.unsplash.com/photo-1532012197267-da84d127e765?w=800&h=450&fit=crop',
    rating: 4.9,
    reviews: 8,
    seller: 'Thu Hà',
    sellerProducts: 3,
    sellerRating: 4.8,
    learningPoints: [
      'Cú pháp C++ cơ bản: biến, vòng lặp, hàm',
      'Mảng, con trỏ và cấp phát động',
      'Lập trình hướng đối tượng (OOP)',
      'Template và thư viện STL',
      'Cấu trúc dữ liệu cơ bản',
    ],
    requirements: [
      'Không yêu cầu kiến thức lập trình trước',
      'Phù hợp SV CNTT từ năm 1',
    ],
    reviewList: [
      { id: 'r1', user: 'Quốc Anh', rating: 5, date: '20/01/2026', text: 'Sách rất chi tiết, bài tập phong phú. Giúp mình pass môn NMLT.' },
      { id: 'r2', user: 'Thùy Linh', rating: 5, date: '18/01/2026', text: 'Bạn bán rất nhiệt tình, sách còn mới 90%. Recommend!' },
    ],
  },
  '3': {
    id: '3',
    name: 'Giáo Trình Vật Lý Đại Cương – Lương Duyên Bình',
    description: 'Tập 1 & 2 còn mới 90%, có ghi chú tóm tắt bên lề rất hữu ích',
    fullDescription: 'Bộ 2 tập Vật lý Đại cương của GS. Lương Duyên Bình, giáo trình chính thức cho SV đại học ngành kỹ thuật. Tập 1 gồm Cơ học và Nhiệt học, Tập 2 gồm Điện từ và Quang học. Sách có ghi chú tóm tắt công thức và bài tập mẫu do chủ trước viết thêm, rất tiện ôn thi.',
    price: 60000,
    category: 'Giáo Trình',
    imageUrl: 'https://images.unsplash.com/photo-1497633762265-9d179a990aa6?w=800&h=450&fit=crop',
    rating: 4.7,
    reviews: 15,
    seller: 'Hoàng Nam',
    sellerProducts: 8,
    sellerRating: 4.7,
    learningPoints: [
      'Cơ học: động học, động lực học, công và năng lượng',
      'Nhiệt học: nhiệt động lực học, thuyết động học phân tử',
      'Điện từ: điện trường, từ trường, cảm ứng điện từ',
      'Quang học: giao thoa, nhiễu xạ, phân cực ánh sáng',
    ],
    requirements: [
      'Kiến thức Vật lý và Toán THPT',
      'Phù hợp SV năm 1-2 ngành Kỹ thuật',
    ],
    reviewList: [
      { id: 'r1', user: 'Việt Hùng', rating: 5, date: '18/01/2026', text: 'Ghi chú tóm tắt của chủ trước quá xuất sắc, tiết kiệm rất nhiều thời gian ôn.' },
      { id: 'r2', user: 'Ngọc Trâm', rating: 4, date: '15/01/2026', text: 'Sách ổn, bìa hơi cũ nhưng nội dung bên trong còn tốt.' },
    ],
  },
  '4': {
    id: '4',
    name: 'Nguyên Lý Kế Toán – Phan Đức Dũng',
    description: 'Giáo trình kế toán cơ bản, phù hợp SV ngành Kinh tế, QTKD',
    fullDescription: 'Giáo trình Nguyên lý Kế toán là tài liệu nền tảng cho sinh viên Kinh tế, Quản trị kinh doanh, Tài chính - Ngân hàng. Nội dung bao gồm: khái niệm kế toán, phương pháp ghi sổ, bảng cân đối kế toán, báo cáo tài chính. Sách còn mới, chưa viết ghi chú.',
    price: 55000,
    category: 'Sách Chuyên Ngành',
    imageUrl: 'https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=800&h=450&fit=crop',
    rating: 4.6,
    reviews: 6,
    seller: 'Lan Anh',
    sellerProducts: 2,
    sellerRating: 4.6,
    learningPoints: [
      'Khái niệm cơ bản về kế toán',
      'Phương pháp ghi sổ kép',
      'Bảng cân đối kế toán',
      'Báo cáo kết quả kinh doanh',
      'Chu trình kế toán doanh nghiệp',
    ],
    requirements: [
      'Không yêu cầu kiến thức trước',
      'Phù hợp SV ngành Kinh tế, QTKD, TC-NH',
    ],
    reviewList: [
      { id: 'r1', user: 'Thanh Huyền', rating: 5, date: '22/01/2026', text: 'Sách mới tinh, đúng mô tả. Giao dịch rất thuận lợi.' },
      { id: 'r2', user: 'Đức Minh', rating: 4, date: '19/01/2026', text: 'Sách tốt, nội dung dễ hiểu cho người mới bắt đầu.' },
    ],
  },
  '5': {
    id: '5',
    name: 'Bộ Dụng Cụ Vẽ Kỹ Thuật + Compa Staedtler',
    description: 'Bộ compa, thước kẻ, eke chuyên dụng cho SV ngành Kiến trúc, Xây dựng',
    fullDescription: 'Bộ dụng cụ vẽ kỹ thuật Staedtler chính hãng Đức, bao gồm: 1 compa kim loại, 2 eke 30-60 và 45-45, 1 thước T 30cm, bút kim kỹ thuật 0.3mm và 0.5mm. Đã sử dụng 1 học kỳ môn Hình họa - Vẽ kỹ thuật, compa còn rất tốt, bút kim còn mực.',
    price: 120000,
    category: 'Dụng Cụ Học Tập',
    imageUrl: 'https://images.unsplash.com/photo-1513364776144-60967b0f800f?w=800&h=450&fit=crop',
    rating: 4.5,
    reviews: 4,
    seller: 'Đức Thịnh',
    sellerProducts: 4,
    sellerRating: 4.5,
    learningPoints: [
      'Compa kim loại Staedtler chính hãng',
      'Eke 30-60 và 45-45 trong suốt',
      'Thước T 30cm chuyên dụng',
      'Bút kim kỹ thuật 0.3mm và 0.5mm',
      'Hộp đựng bảo vệ dụng cụ',
    ],
    requirements: [
      'Phù hợp SV ngành Kiến trúc, Xây dựng, Cơ khí',
      'Dùng cho môn Hình họa, Vẽ kỹ thuật',
    ],
    reviewList: [
      { id: 'r1', user: 'Bảo Ngọc', rating: 5, date: '01/02/2026', text: 'Dụng cụ còn rất tốt, compa vẽ chính xác. Giá rẻ hơn mua mới rất nhiều!' },
      { id: 'r2', user: 'Anh Khoa', rating: 4, date: '28/01/2026', text: 'Bút kim hơi khô mực nhưng tổng thể vẫn OK với giá này.' },
    ],
  },
  '6': {
    id: '6',
    name: 'Tiếng Anh Chuyên Ngành Công Nghệ Thông Tin',
    description: 'Giáo trình tiếng Anh IT kèm từ vựng chuyên ngành và bài đọc hiểu',
    fullDescription: 'Giáo trình Tiếng Anh chuyên ngành CNTT dành cho sinh viên IT từ năm 2. Nội dung gồm 15 bài học với từ vựng chuyên ngành (networking, database, software engineering, AI), bài đọc hiểu, writing và listening kèm audio. Sách còn nguyên bo CD audio.',
    price: 70000,
    category: 'Ngoại Ngữ',
    imageUrl: 'https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?w=800&h=450&fit=crop',
    rating: 4.7,
    reviews: 10,
    seller: 'Phương Linh',
    sellerProducts: 6,
    sellerRating: 4.7,
    learningPoints: [
      'Từ vựng chuyên ngành Networking và Database',
      'Thuật ngữ Software Engineering',
      'Bài đọc hiểu về AI và Machine Learning',
      'Kỹ năng viết tài liệu kỹ thuật bằng tiếng Anh',
      'Kèm audio nghe hiểu (CD nguyên bộ)',
    ],
    requirements: [
      'Trình độ tiếng Anh tối thiểu B1',
      'Phù hợp SV CNTT từ năm 2',
    ],
    reviewList: [
      { id: 'r1', user: 'Thanh Tùng', rating: 5, date: '05/02/2026', text: 'Sách rất cần cho ai muốn đọc tài liệu IT bằng tiếng Anh. CD nghe rõ.' },
      { id: 'r2', user: 'Kim Ngân', rating: 4, date: '02/02/2026', text: 'Nội dung tốt, chỉ tiếc không có phần bài tập thêm.' },
    ],
  },
};

export default function ProductDetailPage() {
  const { id } = useParams();
  const [activeTab, setActiveTab] = useState('description');
  const [selectedThumb, setSelectedThumb] = useState(0);
  const [reviewForm, setReviewForm] = useState({ rating: 5, text: '' });
  const [reviews, setReviews] = useState([]);
  const [sendingRequest, setSendingRequest] = useState(false);
  const { addItem } = useCart();
  const { toggleWishlist, isInWishlist } = useWishlist();
  const { user, isAuthenticated } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();

  const product = id ? PRODUCTS_DB[id] : null;
  const allReviews = [...(product?.reviewList || []), ...reviews];

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

  const thumbImages = [
    product.imageUrl,
    product.imageUrl.replace('w=800', 'w=400'),
    product.imageUrl.replace('w=800', 'w=600'),
    product.imageUrl.replace('w=800', 'w=500'),
  ];

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
            <img src={thumbImages[selectedThumb]} alt={product.name} />
          </div>
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
        </div>

        {/* Purchase Panel */}
        <div className="pdp-purchase-panel">
          <h1 className="pdp-title">{product.name}</h1>
          <div className="pdp-seller-row">
            bởi <span className="pdp-seller-name">{product.seller}</span>
          </div>
          <div className="pdp-rating-row">
            <span className="pdp-stars">★ {product.rating}</span>
            <span className="pdp-rating-text">({product.reviews} đánh giá)</span>
          </div>
          <span className="pdp-category-badge">{product.category}</span>
          <div className="pdp-price">{Number(product.price).toLocaleString('vi-VN')}đ</div>

          {/* Transaction Request Button */}
          <div className="pdp-actions">
            {isAuthenticated && product.sellerId !== user?.id ? (
              <button 
                className="pdp-btn-buy pdp-btn-request"
                disabled={sendingRequest}
                onClick={async () => {
                  setSendingRequest(true);
                  try {
                    const res = await transactionsApi.create({ productId: product.id });
                    toast.success('Đã gửi yêu cầu mua! Chờ người bán xác nhận.');
                    navigate(`/transactions/${res.data.id || res.data.Id}`);
                  } catch (err) {
                    const msg = err.response?.data?.message || err.response?.data?.Message;
                    if (msg) {
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
              <div className="pdp-seller-info-name">{product.seller}</div>
              <div className="pdp-seller-info-meta">
                ★ {product.sellerRating} &middot; {product.sellerProducts} sản phẩm
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
                <p className="pdp-description">{product.fullDescription}</p>

                <h3 className="pdp-section-title">Nội Dung Chi Tiết</h3>
                <ul className="pdp-learn-list">
                  {product.learningPoints.map((point, i) => (
                    <li key={i}>{point}</li>
                  ))}
                </ul>

                <h3 className="pdp-section-title">Lưu Ý</h3>
                <ul className="pdp-requirements-list">
                  {product.requirements.map((req, i) => (
                    <li key={i}>{req}</li>
                  ))}
                </ul>
              </div>
            )}

            {activeTab === 'reviews' && (
              <div>
                <h3 className="pdp-section-title">Đánh Giá Người Bán ({allReviews.length})</h3>

                {/* Review submission form */}
                <div className="pdp-review-form">
                  <h4 className="pdp-review-form-title">Viết đánh giá</h4>
                  <div className="pdp-review-rating-select">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        className={`pdp-review-star-btn ${reviewForm.rating >= star ? 'active' : ''}`}
                        onClick={() => setReviewForm({ ...reviewForm, rating: star })}
                      >
                        ★
                      </button>
                    ))}
                    <span className="pdp-review-rating-text">{reviewForm.rating}/5</span>
                  </div>
                  <textarea
                    className="pdp-review-textarea"
                    rows={3}
                    placeholder="Chia sẻ trải nghiệm của bạn..."
                    value={reviewForm.text}
                    onChange={(e) => setReviewForm({ ...reviewForm, text: e.target.value })}
                  />
                  <button
                    className="pdp-review-submit-btn"
                    onClick={() => {
                      if (!reviewForm.text.trim()) {
                        toast.error('Vui lòng nhập nội dung đánh giá');
                        return;
                      }
                      setReviews((prev) => [
                        ...prev,
                        {
                          id: 'new-' + Date.now(),
                          user: 'Bạn',
                          rating: reviewForm.rating,
                          date: new Date().toLocaleDateString('vi-VN'),
                          text: reviewForm.text,
                        },
                      ]);
                      setReviewForm({ rating: 5, text: '' });
                      toast.success('Đánh giá đã được gửi!');
                    }}
                  >
                    Gửi Đánh Giá
                  </button>
                </div>

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
                    <strong style={{ color: 'var(--text-primary)' }}>Đánh giá:</strong>
                    <p style={{ color: 'var(--text-secondary)', fontSize: 'var(--text-sm)' }}>{product.rating} / 5 ({product.reviews} đánh giá)</p>
                  </div>
                  <div>
                    <strong style={{ color: 'var(--text-primary)' }}>Người bán:</strong>
                    <p style={{ color: 'var(--text-secondary)', fontSize: 'var(--text-sm)' }}>{product.seller}</p>
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
