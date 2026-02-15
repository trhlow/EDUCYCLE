import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useWishlist } from '../contexts/WishlistContext';
import { useToast } from '../components/Toast';
import './ProductListingPage.css';

const MOCK_PRODUCTS = [
  {
    id: '1',
    name: 'Giáo Trình Giải Tích 1 – Nguyễn Đình Trí',
    description: 'Sách giáo trình Toán cao cấp dành cho sinh viên năm nhất các ngành kỹ thuật',
    price: 45000,
    category: 'Giáo Trình',
    imageUrl: 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=400&h=225&fit=crop',
    rating: 4.8,
    reviews: 12,
    seller: 'Minh Tuấn',
    createdAt: '2026-01-15',
  },
  {
    id: '2',
    name: 'Lập Trình C++ Từ Cơ Bản Đến Nâng Cao',
    description: 'Sách học lập trình C++ kèm bài tập thực hành, phù hợp SV ngành CNTT',
    price: 85000,
    category: 'Sách Chuyên Ngành',
    imageUrl: 'https://images.unsplash.com/photo-1532012197267-da84d127e765?w=400&h=225&fit=crop',
    rating: 4.9,
    reviews: 8,
    seller: 'Thu Hà',
    createdAt: '2026-01-20',
  },
  {
    id: '3',
    name: 'Giáo Trình Vật Lý Đại Cương – Lương Duyên Bình',
    description: 'Tập 1 & 2 còn mới 90%, có ghi chú tóm tắt bên lề rất hữu ích',
    price: 60000,
    category: 'Giáo Trình',
    imageUrl: 'https://images.unsplash.com/photo-1497633762265-9d179a990aa6?w=400&h=225&fit=crop',
    rating: 4.7,
    reviews: 15,
    seller: 'Hoàng Nam',
    createdAt: '2026-01-18',
  },
  {
    id: '4',
    name: 'Nguyên Lý Kế Toán – Phan Đức Dũng',
    description: 'Giáo trình kế toán cơ bản, phù hợp SV ngành Kinh tế, Quản trị kinh doanh',
    price: 55000,
    category: 'Sách Chuyên Ngành',
    imageUrl: 'https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=400&h=225&fit=crop',
    rating: 4.6,
    reviews: 6,
    seller: 'Lan Anh',
    createdAt: '2026-01-22',
  },
  {
    id: '5',
    name: 'Bộ Dụng Cụ Vẽ Kỹ Thuật + Compa Staedtler',
    description: 'Bộ compa, thước kẻ, eke chuyên dụng cho SV ngành Kiến trúc, Xây dựng',
    price: 120000,
    category: 'Dụng Cụ Học Tập',
    imageUrl: 'https://images.unsplash.com/photo-1513364776144-60967b0f800f?w=400&h=225&fit=crop',
    rating: 4.5,
    reviews: 4,
    seller: 'Đức Thịnh',
    createdAt: '2026-02-01',
  },
  {
    id: '6',
    name: 'Tiếng Anh Chuyên Ngành Công Nghệ Thông Tin',
    description: 'Giáo trình tiếng Anh IT kèm từ vựng chuyên ngành và bài đọc hiểu',
    price: 70000,
    category: 'Ngoại Ngữ',
    imageUrl: 'https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?w=400&h=225&fit=crop',
    rating: 4.7,
    reviews: 10,
    seller: 'Phương Linh',
    createdAt: '2026-02-05',
  },
];

const CATEGORIES = [
  'all',
  'Giáo Trình',
  'Sách Chuyên Ngành',
  'Tài Liệu Ôn Thi',
  'Dụng Cụ Học Tập',
  'Ngoại Ngữ',
];

export default function ProductListingPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [priceRange, setPriceRange] = useState('all');
  const [sortBy, setSortBy] = useState('newest');
  const [viewMode, setViewMode] = useState('grid');
  const [minRating, setMinRating] = useState(0);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { toggleWishlist, isInWishlist } = useWishlist();
  const toast = useToast();

  const filteredProducts = MOCK_PRODUCTS.filter((product) => {
    const matchesSearch =
      product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory =
      selectedCategory === 'all' || product.category === selectedCategory;

    let matchesPrice = true;
    if (priceRange === 'under50k') matchesPrice = product.price < 50000;
    else if (priceRange === '50kto100k') matchesPrice = product.price >= 50000 && product.price < 100000;
    else if (priceRange === 'over100k') matchesPrice = product.price >= 100000;

    const matchesRating = product.rating >= minRating;

    return matchesSearch && matchesCategory && matchesPrice && matchesRating;
  }).sort((a, b) => {
    if (sortBy === 'price-low') return a.price - b.price;
    if (sortBy === 'price-high') return b.price - a.price;
    if (sortBy === 'rating') return b.rating - a.rating;
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
  });

  const clearFilters = () => {
    setSearchQuery('');
    setSelectedCategory('all');
    setPriceRange('all');
    setSortBy('newest');
    setMinRating(0);
  };

  return (
    <div>
      <section className="plp-hero">
        <h1 className="plp-hero-title">Tìm Sách &amp; Tài Liệu Học Tập</h1>
        <p className="plp-hero-subtitle">
          Trao đổi sách giáo trình, tài liệu và dụng cụ học tập giữa sinh viên
        </p>
      </section>

      <div className="plp-container">
        <div className="plp-content-grid">
          {/* Sidebar Filters */}
          <aside className={`plp-sidebar ${sidebarOpen ? 'open' : ''}`}>
            <div className="plp-filter-section">
              <h3 className="plp-filter-title">Bộ Lọc</h3>

              <div className="plp-filter-group">
                <label className="plp-filter-label">Danh Mục</label>
                <select
                  className="plp-select"
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                >
                  {CATEGORIES.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat === 'all' ? 'Tất Cả Danh Mục' : cat}
                    </option>
                  ))}
                </select>
              </div>

              <div className="plp-filter-group">
                <label className="plp-filter-label">Khoảng Giá</label>
                <div className="plp-radio-group">
                  {[
                    { value: 'all', label: 'Tất Cả Mức Giá' },
                    { value: 'under50k', label: 'Dưới 50.000đ' },
                    { value: '50kto100k', label: '50.000đ - 100.000đ' },
                    { value: 'over100k', label: 'Trên 100.000đ' },
                  ].map((opt) => (
                    <label key={opt.value} className="plp-radio-label">
                      <input
                        type="radio"
                        name="priceRange"
                        value={opt.value}
                        checked={priceRange === opt.value}
                        onChange={(e) => setPriceRange(e.target.value)}
                      />
                      {opt.label}
                    </label>
                  ))}
                </div>
              </div>

              <div className="plp-filter-group">
                <label className="plp-filter-label">Đánh Giá Tối Thiểu</label>
                <div className="plp-rating-options">
                  {[4.5, 4.0, 3.5, 3.0].map((rating) => (
                    <button
                      key={rating}
                      className={`plp-rating-btn ${minRating === rating ? 'active' : ''}`}
                      onClick={() => setMinRating(minRating === rating ? 0 : rating)}
                    >
                      {'★'.repeat(Math.floor(rating))} {rating}+
                    </button>
                  ))}
                </div>
              </div>

              <button className="plp-clear-filters" onClick={clearFilters}>
                Xóa Tất Cả Bộ Lọc
              </button>

              {sidebarOpen && (
                <button
                  className="plp-clear-filters"
                  onClick={() => setSidebarOpen(false)}
                  style={{ marginTop: '0.5rem' }}
                >
                  Đóng Bộ Lọc
                </button>
              )}
            </div>
          </aside>

          {/* Product Listing */}
          <main className="plp-main">
            <div className="plp-toolbar">
              <button
                className="plp-mobile-filter-btn"
                onClick={() => setSidebarOpen(true)}
              >
                🔧 Bộ Lọc
              </button>
              <div className="plp-search-container">
                <span className="plp-search-icon">🔍</span>
                <input
                  type="text"
                  className="plp-search-input"
                  placeholder="Tìm sách, tài liệu..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <div className="plp-toolbar-actions">
                <select
                  className="plp-sort-select"
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                >
                  <option value="newest">Mới Nhất</option>
                  <option value="rating">Đánh Giá Cao Nhất</option>
                  <option value="price-low">Giá: Thấp đến Cao</option>
                  <option value="price-high">Giá: Cao đến Thấp</option>
                </select>
                <div className="plp-view-toggle">
                  <button
                    className={`plp-view-btn ${viewMode === 'grid' ? 'active' : ''}`}
                    onClick={() => setViewMode('grid')}
                    aria-label="Grid view"
                  >
                    ◫
                  </button>
                  <button
                    className={`plp-view-btn ${viewMode === 'list' ? 'active' : ''}`}
                    onClick={() => setViewMode('list')}
                    aria-label="List view"
                  >
                    ☰
                  </button>
                </div>
              </div>
            </div>

            <div className="plp-results-count">
              Hiển thị {filteredProducts.length} trong {MOCK_PRODUCTS.length} sản phẩm
            </div>

            {filteredProducts.length > 0 ? (
              <div className={viewMode === 'grid' ? 'plp-product-grid' : 'plp-product-list'}>
                {filteredProducts.map((product) => (
                  <Link
                    to={`/products/${product.id}`}
                    key={product.id}
                    className={viewMode === 'grid' ? 'plp-card' : 'plp-card-list'}
                    style={{ textDecoration: 'none', color: 'inherit' }}
                  >
                    <div className="plp-card-image">
                      <img src={product.imageUrl} alt={product.name} />
                      <div className="plp-card-badge">{product.category}</div>
                      <button
                        className={`plp-wishlist-btn ${isInWishlist(product.id) ? 'active' : ''}`}
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          toggleWishlist(product);
                          toast.info(isInWishlist(product.id) ? 'Đã xóa khỏi yêu thích' : 'Đã thêm vào yêu thích');
                        }}
                        title={isInWishlist(product.id) ? 'Xóa khỏi yêu thích' : 'Thêm vào yêu thích'}
                      >
                        {isInWishlist(product.id) ? '❤️' : '🤍'}
                      </button>
                    </div>
                    <div className="plp-card-content">
                      <h3 className="plp-card-title">{product.name}</h3>
                      <p className="plp-card-description">{product.description}</p>
                      <div className="plp-card-meta">
                        <div className="plp-card-rating">
                          <span className="plp-rating-stars">★ {product.rating}</span>
                          <span className="plp-rating-count">({product.reviews})</span>
                        </div>
                        <div className="plp-card-seller">bởi {product.seller}</div>
                      </div>
                      <div className="plp-card-footer">
                        <div className="plp-card-price">{Number(product.price).toLocaleString('vi-VN')}đ</div>
                        <span className="plp-view-detail-btn">Xem chi tiết →</span>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              <div className="plp-empty">
                <div className="plp-empty-icon">📚</div>
                <h3 className="plp-empty-title">Không tìm thấy sản phẩm</h3>
                <p className="plp-empty-text">
                  Thử điều chỉnh bộ lọc hoặc từ khóa tìm kiếm
                </p>
                <button className="plp-reset-btn" onClick={clearFilters}>
                  Đặt Lại Bộ Lọc
                </button>
              </div>
            )}
          </main>
        </div>
      </div>
    </div>
  );
}
