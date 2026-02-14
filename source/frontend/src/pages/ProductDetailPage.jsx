import { useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useCart } from '../contexts/CartContext';
import { useWishlist } from '../contexts/WishlistContext';
import { useToast } from '../components/Toast';
import './ProductDetailPage.css';

const PRODUCTS_DB = {
  '1': {
    id: '1',
    name: 'Khóa Học Lập Trình Python Nâng Cao',
    description: 'Làm chủ Python với các dự án thực tế và khái niệm nâng cao',
    fullDescription: 'Khóa học Python toàn diện này đưa bạn từ trình độ trung cấp lên nâng cao. Bạn sẽ học các mẫu thiết kế, lập trình bất đồng bộ, kiểm thử, thu thập dữ liệu web, xử lý dữ liệu và xây dựng ứng dụng sẵn sàng triển khai. Mỗi mô-đun bao gồm các dự án thực hành mô phỏng tình huống thực tế.',
    price: 49.99,
    category: 'Lập Trình',
    imageUrl: 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=800&h=450&fit=crop',
    rating: 4.8,
    reviews: 342,
    seller: 'CodeMaster Pro',
    sellerCourses: 15,
    sellerRating: 4.9,
    learningPoints: [
      'Các mẫu Python nâng cao và phương pháp tốt nhất',
      'Lập trình bất đồng bộ với asyncio',
      'Kiểm thử đơn vị và phát triển hướng kiểm thử',
      'Thu thập dữ liệu web và tự động hóa pipeline dữ liệu',
      'Xây dựng REST API với FastAPI',
      'Tích hợp cơ sở dữ liệu với SQLAlchemy',
    ],
    requirements: [
      'Kiến thức Python cơ bản (biến, vòng lặp, hàm)',
      'Máy tính đã cài đặt Python 3.8+',
      'Sẵn sàng thực hành với các dự án thực tế',
    ],
    reviewList: [
      { id: 'r1', user: 'Sarah M.', rating: 5, date: 'Feb 10, 2024', text: 'Khóa học tuyệt vời! Các dự án thực tế giúp tôi tìm được công việc mới.' },
      { id: 'r2', user: 'James L.', rating: 5, date: 'Feb 8, 2024', text: 'Khóa học Python tốt nhất tôi từng học. Phần lập trình bất đồng bộ chính xác là những gì tôi cần.' },
      { id: 'r3', user: 'Maria G.', rating: 4, date: 'Feb 5, 2024', text: 'Nội dung rất kỹ lưỡng. Mong có thêm bài tập trong phần kiểm thử.' },
    ],
  },
  '2': {
    id: '2',
    name: 'Khóa Học Phát Triển Web Toàn Diện',
    description: 'Học HTML, CSS, JavaScript, React và Node.js từ đầu',
    fullDescription: 'Khóa học phát triển web full-stack bao gồm mọi thứ từ HTML cơ bản đến triển khai ứng dụng React + Node.js. Bao gồm hơn 40 giờ nội dung video với các dự án thực tế bao gồm trang thương mại điện tử, ứng dụng mạng xã hội và website portfolio.',
    price: 89.99,
    category: 'Phát Triển Web',
    imageUrl: 'https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=800&h=450&fit=crop',
    rating: 4.9,
    reviews: 1205,
    seller: 'WebDev Academy',
    sellerCourses: 22,
    sellerRating: 4.8,
    learningPoints: [
      'HTML5, CSS3 và JavaScript hiện đại (ES6+)',
      'React với hooks, context và quản lý trạng thái',
      'Phát triển backend với Node.js và Express.js',
      'Cơ sở dữ liệu MongoDB và PostgreSQL',
      'Mẫu xác thực và phân quyền',
      'Triển khai lên nền tảng đám mây',
    ],
    requirements: [
      'Không cần kinh nghiệm lập trình trước',
      'Máy tính có kết nối internet',
      'Cam kết hoàn thành tất cả dự án',
    ],
    reviewList: [
      { id: 'r1', user: 'Alex K.', rating: 5, date: 'Feb 12, 2024', text: 'Hoàn toàn thay đổi sự nghiệp của tôi. Từ con số không trở thành lập trình viên full-stack.' },
      { id: 'r2', user: 'Emily R.', rating: 5, date: 'Feb 10, 2024', text: 'Khóa học bootcamp tốt nhất trực tuyến. Đáng từng xu!' },
      { id: 'r3', user: 'David P.', rating: 4, date: 'Feb 7, 2024', text: 'Nội dung tuyệt vời. Phần React được làm đặc biệt tốt.' },
    ],
  },
  '3': {
    id: '3',
    name: 'Cơ Bản Khoa Học Dữ Liệu',
    description: 'Giới thiệu về phân tích dữ liệu, thống kê và học máy',
    fullDescription: 'Bắt đầu hành trình khoa học dữ liệu của bạn với khóa học toàn diện này. Học cách phân tích dữ liệu, tạo trực quan hóa, áp dụng phương pháp thống kê và xây dựng mô hình học máy đầu tiên bằng Python, Pandas và Scikit-learn.',
    price: 69.99,
    category: 'Khoa Học Dữ Liệu',
    imageUrl: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800&h=450&fit=crop',
    rating: 4.7,
    reviews: 567,
    seller: 'DataPro Institute',
    sellerCourses: 8,
    sellerRating: 4.7,
    learningPoints: [
      'Phân tích dữ liệu với Pandas và NumPy',
      'Trực quan hóa dữ liệu với Matplotlib và Seaborn',
      'Phân tích thống kê và kiểm định giả thuyết',
      'Giới thiệu học máy với Scikit-learn',
      'Bộ dữ liệu thực tế và nghiên cứu tình huống',
    ],
    requirements: [
      'Nên có kiến thức Python cơ bản',
      'Hiểu các khái niệm toán học cơ bản',
    ],
    reviewList: [
      { id: 'r1', user: 'Tom W.', rating: 5, date: 'Feb 8, 2024', text: 'Giới thiệu hoàn hảo về khoa học dữ liệu. Giải thích rất rõ ràng.' },
      { id: 'r2', user: 'Lisa N.', rating: 4, date: 'Feb 5, 2024', text: 'Khóa học nền tảng tốt với các ví dụ thực tế.' },
    ],
  },
  '4': {
    id: '4',
    name: 'Khóa Học Thiết Kế UI/UX',
    description: 'Tạo giao diện người dùng đẹp mắt và trải nghiệm người dùng xuất sắc',
    fullDescription: 'Học quy trình thiết kế UI/UX hoàn chỉnh từ nghiên cứu người dùng đến nguyên mẫu chi tiết. Khóa học bao gồm tư duy thiết kế, wireframing, nguyên tắc thiết kế trực quan và tạo nguyên mẫu với Figma.',
    price: 59.99,
    category: 'Thiết Kế',
    imageUrl: 'https://images.unsplash.com/photo-1561070791-2526d30994b5?w=800&h=450&fit=crop',
    rating: 4.6,
    reviews: 423,
    seller: 'Design Guru',
    sellerCourses: 12,
    sellerRating: 4.8,
    learningPoints: [
      'Phương pháp tư duy thiết kế',
      'Nghiên cứu người dùng và tạo persona',
      'Wireframing và tạo nguyên mẫu với Figma',
      'Nguyên tắc thiết kế trực quan và lý thuyết màu sắc',
      'Thiết kế đáp ứng và khả năng tiếp cận',
    ],
    requirements: [
      'Không cần kinh nghiệm thiết kế trước',
      'Tài khoản Figma (phiên bản miễn phí vẫn dùng được)',
    ],
    reviewList: [
      { id: 'r1', user: 'Anna S.', rating: 5, date: 'Feb 11, 2024', text: 'Khóa học tuyệt vời! Giúp tôi xây dựng portfolio thiết kế.' },
      { id: 'r2', user: 'Chris B.', rating: 4, date: 'Feb 7, 2024', text: 'Khóa học thiết kế rất toàn diện, bao gồm tất cả kiến thức cần thiết.' },
    ],
  },
  '5': {
    id: '5',
    name: 'Tiếp Thị Kỹ Thuật Số Cơ Bản',
    description: 'SEO, tiếp thị mạng xã hội và chiến lược nội dung',
    fullDescription: 'Làm chủ tiếp thị kỹ thuật số với các dự án thực hành bao gồm SEO, tiếp thị mạng xã hội, chiến dịch email, chiến lược nội dung và Google Analytics. Học cách tạo và thực hiện các chiến dịch tiếp thị hiệu quả.',
    price: 39.99,
    category: 'Tiếp Thị',
    imageUrl: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800&h=450&fit=crop',
    rating: 4.5,
    reviews: 289,
    seller: 'Marketing Experts',
    sellerCourses: 6,
    sellerRating: 4.6,
    learningPoints: [
      'Chiến lược tối ưu hóa công cụ tìm kiếm (SEO)',
      'Tiếp thị và quảng cáo mạng xã hội',
      'Tiếp thị email và tự động hóa',
      'Chiến lược nội dung và viết quảng cáo',
      'Google Analytics và quyết định dựa trên dữ liệu',
    ],
    requirements: [
      'Không cần kinh nghiệm tiếp thị trước',
      'Có tài khoản mạng xã hội để thực hành',
    ],
    reviewList: [
      { id: 'r1', user: 'Mike T.', rating: 5, date: 'Feb 9, 2024', text: 'Thực tế và có thể áp dụng ngay. Đã thấy kết quả từ các mẹo SEO.' },
      { id: 'r2', user: 'Rachel H.', rating: 4, date: 'Feb 6, 2024', text: 'Tổng quan tốt về tất cả các kênh tiếp thị kỹ thuật số chính.' },
    ],
  },
  '6': {
    id: '6',
    name: 'Phát Triển Ứng Dụng Di Động với React Native',
    description: 'Xây dựng ứng dụng iOS và Android với một mã nguồn duy nhất',
    fullDescription: 'Học cách xây dựng ứng dụng di động đa nền tảng bằng React Native. Khóa học bao gồm điều hướng, quản lý trạng thái, API gốc, thông báo đẩy và xuất bản lên cửa hàng ứng dụng.',
    price: 79.99,
    category: 'Phát Triển Di Động',
    imageUrl: 'https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?w=800&h=450&fit=crop',
    rating: 4.7,
    reviews: 456,
    seller: 'AppDev Masters',
    sellerCourses: 10,
    sellerRating: 4.7,
    learningPoints: [
      'Các thành phần và API cốt lõi của React Native',
      'Điều hướng với React Navigation',
      'Quản lý trạng thái với Redux và Context',
      'Tính năng thiết bị gốc (camera, vị trí, v.v.)',
      'Thông báo đẩy và tác vụ nền',
      'Quy trình gửi lên cửa hàng ứng dụng',
    ],
    requirements: [
      'Yêu cầu kiến thức JavaScript và React',
      'Khuyến nghị Mac cho phát triển iOS',
      'Đã cài đặt Node.js trên máy',
    ],
    reviewList: [
      { id: 'r1', user: 'Kevin L.', rating: 5, date: 'Feb 13, 2024', text: 'Đã xuất bản ứng dụng đầu tiên nhờ khóa học này!' },
      { id: 'r2', user: 'Sophie M.', rating: 4, date: 'Feb 10, 2024', text: 'Rất thực tế. Thích cách tiếp cận dự án thực tế.' },
    ],
  },
};

export default function ProductDetailPage() {
  const { id } = useParams();
  const [activeTab, setActiveTab] = useState('description');
  const [selectedThumb, setSelectedThumb] = useState(0);
  const [reviewForm, setReviewForm] = useState({ rating: 5, text: '' });
  const [reviews, setReviews] = useState([]);
  const { addItem } = useCart();
  const { toggleWishlist, isInWishlist } = useWishlist();
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
          <div className="pdp-price">${product.price}</div>
          <div className="pdp-actions">
            <button className="pdp-btn-cart" onClick={() => {
              addItem(product);
              toast.success(`Đã thêm "${product.name}" vào giỏ hàng`);
            }}>Thêm Vào Giỏ</button>
            <button className="pdp-btn-buy" onClick={() => {
              addItem(product);
              navigate('/cart');
            }}>Mua Ngay</button>
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

          <div className="pdp-seller-card">
            <div className="pdp-seller-avatar">👤</div>
            <div className="pdp-seller-info">
              <div className="pdp-seller-info-name">{product.seller}</div>
              <div className="pdp-seller-info-meta">
                ★ {product.sellerRating} &middot; {product.sellerCourses} khóa học
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
                {tab === 'description' ? 'Mô Tả' : tab === 'reviews' ? 'Đánh Giá' : 'Thông Tin Khóa Học'}
              </button>
            ))}
          </div>

          <div className="pdp-tab-content">
            {activeTab === 'description' && (
              <div>
                <p className="pdp-description">{product.fullDescription}</p>

                <h3 className="pdp-section-title">Bạn sẽ học được gì</h3>
                <ul className="pdp-learn-list">
                  {product.learningPoints.map((point, i) => (
                    <li key={i}>{point}</li>
                  ))}
                </ul>

                <h3 className="pdp-section-title">Yêu Cầu</h3>
                <ul className="pdp-requirements-list">
                  {product.requirements.map((req, i) => (
                    <li key={i}>{req}</li>
                  ))}
                </ul>
              </div>
            )}

            {activeTab === 'reviews' && (
              <div>
                <h3 className="pdp-section-title">Đánh Giá Học Viên ({allReviews.length})</h3>

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
                <h3 className="pdp-section-title">Thông Tin Khóa Học</h3>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-4)' }}>
                  <div>
                    <strong style={{ color: 'var(--text-primary)' }}>Danh mục:</strong>
                    <p style={{ color: 'var(--text-secondary)', fontSize: 'var(--text-sm)' }}>{product.category}</p>
                  </div>
                  <div>
                    <strong style={{ color: 'var(--text-primary)' }}>Giá:</strong>
                    <p style={{ color: 'var(--text-secondary)', fontSize: 'var(--text-sm)' }}>${product.price}</p>
                  </div>
                  <div>
                    <strong style={{ color: 'var(--text-primary)' }}>Đánh giá:</strong>
                    <p style={{ color: 'var(--text-secondary)', fontSize: 'var(--text-sm)' }}>{product.rating} / 5 ({product.reviews} đánh giá)</p>
                  </div>
                  <div>
                    <strong style={{ color: 'var(--text-primary)' }}>Giảng viên:</strong>
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
