import { useState } from 'react';
import { Link } from 'react-router-dom';
import './ProductListingPage.css';

const MOCK_PRODUCTS = [
  {
    id: '1',
    name: 'Khóa Học Lập Trình Python Nâng Cao',
    description: 'Làm chủ Python với các dự án thực tế và khái niệm nâng cao',
    price: 49.99,
    category: 'Lập Trình',
    imageUrl: 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=400&h=225&fit=crop',
    rating: 4.8,
    reviews: 342,
    seller: 'CodeMaster Pro',
    createdAt: '2024-02-10',
  },
  {
    id: '2',
    name: 'Khóa Học Phát Triển Web Toàn Diện',
    description: 'Học HTML, CSS, JavaScript, React và Node.js từ đầu',
    price: 89.99,
    category: 'Phát Triển Web',
    imageUrl: 'https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=400&h=225&fit=crop',
    rating: 4.9,
    reviews: 1205,
    seller: 'WebDev Academy',
    createdAt: '2024-02-12',
  },
  {
    id: '3',
    name: 'Cơ Bản Khoa Học Dữ Liệu',
    description: 'Giới thiệu về phân tích dữ liệu, thống kê và học máy',
    price: 69.99,
    category: 'Khoa Học Dữ Liệu',
    imageUrl: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=400&h=225&fit=crop',
    rating: 4.7,
    reviews: 567,
    seller: 'DataPro Institute',
    createdAt: '2024-02-08',
  },
  {
    id: '4',
    name: 'Khóa Học Thiết Kế UI/UX',
    description: 'Tạo giao diện người dùng đẹp mắt và trải nghiệm người dùng xuất sắc',
    price: 59.99,
    category: 'Thiết Kế',
    imageUrl: 'https://images.unsplash.com/photo-1561070791-2526d30994b5?w=400&h=225&fit=crop',
    rating: 4.6,
    reviews: 423,
    seller: 'Design Guru',
    createdAt: '2024-02-11',
  },
  {
    id: '5',
    name: 'Tiếp Thị Kỹ Thuật Số Cơ Bản',
    description: 'SEO, tiếp thị mạng xã hội và chiến lược nội dung',
    price: 39.99,
    category: 'Tiếp Thị',
    imageUrl: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=400&h=225&fit=crop',
    rating: 4.5,
    reviews: 289,
    seller: 'Marketing Experts',
    createdAt: '2024-02-09',
  },
  {
    id: '6',
    name: 'Phát Triển Ứng Dụng Di Động với React Native',
    description: 'Xây dựng ứng dụng iOS và Android với một mã nguồn duy nhất',
    price: 79.99,
    category: 'Phát Triển Di Động',
    imageUrl: 'https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?w=400&h=225&fit=crop',
    rating: 4.7,
    reviews: 456,
    seller: 'AppDev Masters',
    createdAt: '2024-02-13',
  },
];

const CATEGORIES = [
  'all',
  'Lập Trình',
  'Phát Triển Web',
  'Khoa Học Dữ Liệu',
  'Thiết Kế',
  'Tiếp Thị',
  'Phát Triển Di Động',
];

export default function ProductListingPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [priceRange, setPriceRange] = useState('all');
  const [sortBy, setSortBy] = useState('newest');
  const [viewMode, setViewMode] = useState('grid');
  const [minRating, setMinRating] = useState(0);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const filteredProducts = MOCK_PRODUCTS.filter((product) => {
    const matchesSearch =
      product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory =
      selectedCategory === 'all' || product.category === selectedCategory;

    let matchesPrice = true;
    if (priceRange === 'under50') matchesPrice = product.price < 50;
    else if (priceRange === '50to75') matchesPrice = product.price >= 50 && product.price < 75;
    else if (priceRange === 'over75') matchesPrice = product.price >= 75;

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
        <h1 className="plp-hero-title">Khám Phá Hành Trình Học Tập Tiếp Theo</h1>
        <p className="plp-hero-subtitle">
          Truy cập hàng nghìn khóa học từ các giảng viên chuyên gia trên toàn thế giới
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
                    { value: 'under50', label: 'Dưới $50' },
                    { value: '50to75', label: '$50 - $75' },
                    { value: 'over75', label: 'Trên $75' },
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
                  placeholder="Tìm kiếm khóa học..."
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
              Hiển thị {filteredProducts.length} trong {MOCK_PRODUCTS.length} khóa học
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
                        <div className="plp-card-price">${product.price}</div>
                        <button
                          className="plp-add-to-cart-btn"
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                          }}
                        >
                          Thêm Vào Giỏ
                        </button>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              <div className="plp-empty">
                <div className="plp-empty-icon">📚</div>
                <h3 className="plp-empty-title">Không tìm thấy khóa học</h3>
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
