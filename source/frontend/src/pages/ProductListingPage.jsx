import { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useInfiniteQuery } from '@tanstack/react-query';
import { useWishlist } from '../contexts/WishlistContext';
import { useToast } from '../components/Toast';
import { productsApi, categoriesApi } from '../api/endpoints';
import { useDebounce } from '../hooks/useDebounce';
import { extractPage } from '../utils/pageApi';
import ProductGridSkeleton from '../components/ProductGridSkeleton';
import './ProductListingPage.css';

const FALLBACK_CATEGORIES = [
  'all',
  'Giáo Trình',
  'Sách Chuyên Ngành',
  'Tài Liệu Ôn Thi',
  'Dụng Cụ Học Tập',
  'Ngoại Ngữ',
];

const PAGE_SIZE = 24;

export default function ProductListingPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const debouncedSearchQuery = useDebounce(searchQuery, 300);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [priceRange, setPriceRange] = useState('all');
  const [sortBy, setSortBy] = useState('newest');
  const [viewMode, setViewMode] = useState('grid');
  const [minRating, setMinRating] = useState(0);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [categories, setCategories] = useState(FALLBACK_CATEGORIES);
  const { toggleWishlist, isInWishlist } = useWishlist();
  const toast = useToast();

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await categoriesApi.getAll();
        const data = Array.isArray(res.data) ? res.data : [];
        if (data.length > 0) {
          setCategories(['all', ...data.map((c) => c.name || c.Name || '')]);
        }
      } catch {
        // keep fallback
      }
    };
    fetchCategories();
  }, []);

  const mapP = (p) => ({
    id: String(p.id),
    name: p.name || '',
    description: p.description || '',
    price: p.price || 0,
    category: p.categoryName || p.category || '',
    imageUrl: p.imageUrl || p.imageUrls?.[0] || '',
    rating: p.averageRating || 0,
    reviews: p.reviewCount || 0,
    seller: p.sellerName || '',
    createdAt: p.createdAt || '',
    status: p.status || '',
  });

  const catalogQueryParams = useMemo(() => {
    const params = { size: PAGE_SIZE, direction: 'desc', sort: sortBy };
    const t = debouncedSearchQuery.trim();
    if (t) params.q = t;
    if (selectedCategory !== 'all') params.category = selectedCategory;
    if (priceRange === 'under50k') params.priceMax = 49999.99;
    else if (priceRange === '50kto100k') {
      params.priceMin = 50000;
      params.priceMax = 99999.99;
    } else if (priceRange === 'over100k') params.priceMin = 100000;
    return params;
  }, [debouncedSearchQuery, selectedCategory, priceRange, sortBy]);

  const {
    data: productPages,
    fetchNextPage,
    hasNextPage,
    isPending,
    isFetchingNextPage,
  } = useInfiniteQuery({
    queryKey: ['products', 'listing', PAGE_SIZE, catalogQueryParams],
    initialPageParam: 0,
    queryFn: async ({ pageParam }) => {
      const res = await productsApi.getAll({ ...catalogQueryParams, page: pageParam });
      return extractPage(res);
    },
    getNextPageParam: (lastPage) => (lastPage.last ? undefined : lastPage.page + 1),
  });

  const products = useMemo(() => {
    if (!productPages?.pages?.length) return [];
    return productPages.pages.flatMap((pg) => pg.content.map(mapP));
  }, [productPages]);

  /** Đánh giá tối thiểu: lọc trên tập đã tải (BE chưa có truy vấn aggregate theo review). */
  const filteredProducts = useMemo(() => {
    if (minRating === 0) return products;
    return products.filter((p) => p.rating >= minRating);
  }, [products, minRating]);

  const loading = isPending;
  const loadingMore = isFetchingNextPage;
  const last = !hasNextPage;
  const totalElements = productPages?.pages?.[0]?.totalElements ?? 0;

  const loadMore = () => {
    if (!hasNextPage || isFetchingNextPage) return;
    fetchNextPage().catch(() => toast.error('Không tải thêm được.'));
  };

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
                  {categories.map((cat) => (
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
                <label className="plp-filter-label">Đánh Giá Tối Thiểu (trên trang đã tải)</label>
                <div className="plp-rating-options">
                  {[4.5, 4.0, 3.5, 3.0].map((rating) => (
                    <button
                      key={rating}
                      type="button"
                      className={`plp-rating-btn ${minRating === rating ? 'active' : ''}`}
                      onClick={() => setMinRating(minRating === rating ? 0 : rating)}
                    >
                      {'★'.repeat(Math.floor(rating))} {rating}+
                    </button>
                  ))}
                </div>
              </div>

              <button type="button" className="plp-clear-filters" onClick={clearFilters}>
                Xóa Tất Cả Bộ Lọc
              </button>

              {sidebarOpen && (
                <button
                  type="button"
                  className="plp-clear-filters"
                  onClick={() => setSidebarOpen(false)}
                  style={{ marginTop: '0.5rem' }}
                >
                  Đóng Bộ Lọc
                </button>
              )}
            </div>
          </aside>

          <main className="plp-main">
            <div className="plp-toolbar">
              <button type="button" className="plp-mobile-filter-btn" onClick={() => setSidebarOpen(true)}>
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
                <select className="plp-sort-select" value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
                  <option value="newest">Mới Nhất</option>
                  <option value="rating">Đánh Giá Cao Nhất</option>
                  <option value="price-low">Giá: Thấp đến Cao</option>
                  <option value="price-high">Giá: Cao đến Thấp</option>
                </select>
                <div className="plp-view-toggle">
                  <button
                    type="button"
                    className={`plp-view-btn ${viewMode === 'grid' ? 'active' : ''}`}
                    onClick={() => setViewMode('grid')}
                    aria-label="Grid view"
                  >
                    ◫
                  </button>
                  <button
                    type="button"
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
              Hiển thị {filteredProducts.length}
              {minRating > 0 ? ' sau lọc đánh giá' : ''} · đã tải {products.length}
              {totalElements ? ` · ${totalElements} khớp bộ lọc server` : ''}
            </div>

            {loading ? (
              <ProductGridSkeleton count={8} />
            ) : products.length === 0 ? (
              <div className="plp-empty">
                <div className="plp-empty-icon">📚</div>
                <h3 className="plp-empty-title">Chưa có sản phẩm nào</h3>
                <p className="plp-empty-text">
                  Hãy là người đầu tiên đăng bán tài liệu trên EduCycle!
                </p>
                <Link to="/products/new" className="plp-reset-btn" style={{ textDecoration: 'none' }}>
                  ➕ Đăng Bán Ngay
                </Link>
              </div>
            ) : filteredProducts.length > 0 ? (
              <>
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
                          type="button"
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
                {!last && (
                  <div style={{ display: 'flex', justifyContent: 'center', marginTop: '2rem' }}>
                    <button type="button" className="plp-reset-btn" disabled={loadingMore} onClick={loadMore}>
                      {loadingMore ? '⏳ Đang tải...' : '⬇️ Tải thêm'}
                    </button>
                  </div>
                )}
              </>
            ) : (
              <div className="plp-empty">
                <div className="plp-empty-icon">📚</div>
                <h3 className="plp-empty-title">Không có mục đạt đánh giá tối thiểu</h3>
                <p className="plp-empty-text">Thử hạ mức sao hoặc tải thêm sản phẩm.</p>
                <button type="button" className="plp-reset-btn" onClick={() => setMinRating(0)}>
                  Bỏ lọc đánh giá
                </button>
              </div>
            )}
          </main>
        </div>
      </div>
    </div>
  );
}
