import { useEffect, useMemo, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { useInfiniteQuery } from '@tanstack/react-query';
import { useWishlist } from '../context/WishlistContext';
import { useToast } from '../components/Toast';
import { productsApi, categoriesApi } from '../lib/api';
import { NAV_CATALOG, getCategoryDisplayLabel } from '../components/layouts/navbarCatalogConfig';
import { useDebounce } from '../hooks/useDebounce';
import { extractPage } from '../lib/page-api';
import { isEducationalListing } from '../lib/academic-marketplace';
import ProductGridSkeleton from '../components/ProductGridSkeleton';
import { IconHeart, IconHeartFilled, IconX } from '../components/icons/Icons';
import { EmptyState, PageHeader } from '../components/ui';
import './ProductListingPage.css';

const FALLBACK_CATEGORIES = ['all', ...NAV_CATALOG.map((item) => item.category)];
const PAGE_SIZE = 24;

const mapProduct = (item) => ({
  id: String(item.id),
  name: item.name || '',
  description: item.description || '',
  price: item.price || 0,
  priceType: item.priceType || (Number(item.price) === 0 ? 'contact' : 'fixed'),
  category: item.categoryName || item.category || '',
  imageUrl: item.imageUrl || item.imageUrls?.[0] || '',
  rating: item.averageRating || 0,
  reviews: item.reviewCount || 0,
  seller: item.sellerName || '',
  createdAt: item.createdAt || '',
  status: item.status || '',
});

const formatPrice = (price, priceType) => {
  if (priceType === 'contact' || Number(price) === 0) return 'Liên hệ';
  return `${Number(price).toLocaleString('vi-VN')}đ`;
};

const sanitizeCategory = (value, fallback = 'all') => {
  const next = (value || '').trim();
  return next.length > 0 ? next : fallback;
};

export default function ProductListingPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialQuery = searchParams.get('q') ?? '';
  const initialCategory = sanitizeCategory(searchParams.get('category'), 'all');

  const [searchQuery, setSearchQuery] = useState(initialQuery);
  const debouncedSearchQuery = useDebounce(searchQuery, 300);
  const [selectedCategory, setSelectedCategory] = useState(initialCategory);
  const [priceRange, setPriceRange] = useState('all');
  const [sortBy, setSortBy] = useState('newest');
  const [viewMode, setViewMode] = useState('grid');
  const [minRating, setMinRating] = useState(0);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [categories, setCategories] = useState(FALLBACK_CATEGORIES);

  const { toggleWishlist, isInWishlist } = useWishlist();
  const toast = useToast();

  useEffect(() => {
    const currentCategory = sanitizeCategory(searchParams.get('category'), 'all');
    const currentQuery = searchParams.get('q') ?? '';

    setSelectedCategory((previous) => (previous === currentCategory ? previous : currentCategory));
    setSearchQuery((previous) => (previous === currentQuery ? previous : currentQuery));
  }, [searchParams]);

  useEffect(() => {
    const params = new URLSearchParams();
    const trimmed = debouncedSearchQuery.trim();
    if (selectedCategory !== 'all') params.set('category', selectedCategory);
    if (trimmed) params.set('q', trimmed);
    setSearchParams(params, { replace: true });
  }, [selectedCategory, debouncedSearchQuery, setSearchParams]);

  useEffect(() => {
    let mounted = true;

    const fetchCategories = async () => {
      try {
        const response = await categoriesApi.getAll();
        const rows = Array.isArray(response.data) ? response.data : [];
        const serverCategories = rows
          .map((row) => sanitizeCategory(row.name || row.Name || '', ''))
          .filter(Boolean);

        if (!mounted || serverCategories.length === 0) return;
        setCategories(['all', ...serverCategories]);
      } catch {
        // Keep fallback categories for resilient UX.
      }
    };

    fetchCategories();
    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    if (!sidebarOpen) return undefined;

    const previousOverflow = document.body.style.overflow;
    const closeOnEscape = (event) => {
      if (event.key === 'Escape') setSidebarOpen(false);
    };

    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', closeOnEscape);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener('keydown', closeOnEscape);
    };
  }, [sidebarOpen]);

  const catalogQueryParams = useMemo(() => {
    const params = { size: PAGE_SIZE, direction: 'desc', sort: sortBy };
    const trimmed = debouncedSearchQuery.trim();

    if (trimmed) params.q = trimmed;
    if (selectedCategory !== 'all') params.category = selectedCategory;

    if (priceRange === 'under50k') {
      params.priceMax = 49999.99;
    } else if (priceRange === '50kto100k') {
      params.priceMin = 50000;
      params.priceMax = 99999.99;
    } else if (priceRange === 'over100k') {
      params.priceMin = 100000;
    }

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
      const response = await productsApi.getAll({ ...catalogQueryParams, page: pageParam });
      return extractPage(response);
    },
    getNextPageParam: (lastPage) => (lastPage.last ? undefined : lastPage.page + 1),
  });

  const products = useMemo(() => {
    if (!productPages?.pages?.length) return [];
    return productPages.pages
      .flatMap((page) => page.content.map(mapProduct))
      .filter(isEducationalListing);
  }, [productPages]);

  const filteredProducts = useMemo(() => {
    if (minRating === 0) return products;
    return products.filter((product) => product.rating >= minRating);
  }, [products, minRating]);

  const loading = isPending;
  const loadingMore = isFetchingNextPage;
  const reachedEnd = !hasNextPage;
  const totalElements = productPages?.pages?.[0]?.totalElements ?? 0;

  const clearFilters = () => {
    setSearchQuery('');
    setSelectedCategory('all');
    setPriceRange('all');
    setSortBy('newest');
    setMinRating(0);
  };

  const loadMore = () => {
    if (!hasNextPage || isFetchingNextPage) return;
    fetchNextPage().catch(() => toast.error('Không tải thêm được, vui lòng thử lại.'));
  };

  const activeFilterTokens = [
    selectedCategory !== 'all'
      ? { key: 'category', label: `Danh mục: ${getCategoryDisplayLabel(selectedCategory) || selectedCategory}` }
      : null,
    priceRange !== 'all'
      ? {
          key: 'price',
          label:
            priceRange === 'under50k'
              ? 'Giá: dưới 50k'
              : priceRange === '50kto100k'
                ? 'Giá: 50k - 100k'
                : 'Giá: trên 100k',
        }
      : null,
    minRating > 0 ? { key: 'rating', label: `Đánh giá từ ${minRating}+` } : null,
    debouncedSearchQuery.trim() ? { key: 'query', label: `Từ khóa: ${debouncedSearchQuery.trim()}` } : null,
  ].filter(Boolean);

  return (
    <div className="plp-page edu-page">
      {sidebarOpen && (
        <button
          type="button"
          className="plp-sidebar-backdrop"
          aria-label="Đóng bộ lọc"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <div className="plp-container edu-container">
        <PageHeader
          eyebrow="Marketplace học thuật"
          title="Tìm sách và tài liệu học tập"
          subtitle="Lọc theo danh mục, mức giá và đánh giá để tìm đúng giáo trình, tài liệu ôn thi hoặc dụng cụ học tập bạn cần."
        />

        <div className={`plp-content-grid ${sidebarOpen ? 'plp-content-grid--drawer-open' : ''}`}>
          <aside className={`plp-sidebar ${sidebarOpen ? 'open' : ''}`} aria-label="Bộ lọc tìm kiếm">
            <div className="plp-filter-section">
              <div className="plp-filter-head">
                <h3 className="plp-filter-title">Bộ lọc</h3>
                <button type="button" className="plp-close-filters" onClick={() => setSidebarOpen(false)}>
                  Đóng
                </button>
              </div>

              <div className="plp-filter-group">
                <label className="plp-filter-label" htmlFor="plp-category-select">Danh mục</label>
                <select
                  id="plp-category-select"
                  className="plp-select"
                  value={selectedCategory}
                  onChange={(event) => setSelectedCategory(event.target.value)}
                >
                  {categories.map((category) => (
                    <option key={category} value={category}>
                      {category === 'all' ? 'Tất cả danh mục' : getCategoryDisplayLabel(category) || category}
                    </option>
                  ))}
                </select>
              </div>

              <div className="plp-filter-group">
                <span className="plp-filter-label">Khoảng giá</span>
                <div className="plp-radio-group">
                  {[
                    { value: 'all', label: 'Tất cả mức giá' },
                    { value: 'under50k', label: 'Dưới 50.000đ' },
                    { value: '50kto100k', label: '50.000đ - 100.000đ' },
                    { value: 'over100k', label: 'Trên 100.000đ' },
                  ].map((option) => (
                    <label key={option.value} className="plp-radio-label">
                      <input
                        type="radio"
                        name="priceRange"
                        value={option.value}
                        checked={priceRange === option.value}
                        onChange={(event) => setPriceRange(event.target.value)}
                      />
                      {option.label}
                    </label>
                  ))}
                </div>
              </div>

              <div className="plp-filter-group">
                <span className="plp-filter-label">Đánh giá tối thiểu</span>
                <div className="plp-rating-options">
                  {[4.5, 4.0, 3.5, 3.0].map((rating) => (
                    <button
                      key={rating}
                      type="button"
                      className={`plp-rating-btn ${minRating === rating ? 'active' : ''}`}
                      onClick={() => setMinRating(minRating === rating ? 0 : rating)}
                    >
                      {rating}+ sao
                    </button>
                  ))}
                </div>
              </div>

              <button type="button" className="plp-clear-filters" onClick={clearFilters}>
                Xóa tất cả bộ lọc
              </button>
            </div>
          </aside>

          <main className="plp-main">
            <div className="plp-toolbar">
              <button type="button" className="plp-mobile-filter-btn" onClick={() => setSidebarOpen(true)}>
                Bộ lọc
              </button>

              <div className="plp-search-container">
                <input
                  type="search"
                  className="plp-search-input"
                  placeholder="Tìm giáo trình, tài liệu, dụng cụ học tập..."
                  value={searchQuery}
                  onChange={(event) => setSearchQuery(event.target.value)}
                />
              </div>

              <div className="plp-toolbar-actions">
                <select className="plp-sort-select" value={sortBy} onChange={(event) => setSortBy(event.target.value)}>
                  <option value="newest">Mới nhất</option>
                  <option value="price-low">Giá: thấp đến cao</option>
                  <option value="price-high">Giá: cao đến thấp</option>
                </select>

                <div className="plp-view-toggle" role="tablist" aria-label="Chế độ hiển thị">
                  <button
                    type="button"
                    className={`plp-view-btn ${viewMode === 'grid' ? 'active' : ''}`}
                    onClick={() => setViewMode('grid')}
                    aria-label="Hiển thị dạng lưới"
                  >
                    Lưới
                  </button>
                  <button
                    type="button"
                    className={`plp-view-btn ${viewMode === 'list' ? 'active' : ''}`}
                    onClick={() => setViewMode('list')}
                    aria-label="Hiển thị dạng danh sách"
                  >
                    Danh sách
                  </button>
                </div>
              </div>
            </div>

            {activeFilterTokens.length > 0 && (
              <div className="plp-active-filters" aria-label="Bộ lọc đang áp dụng">
                {activeFilterTokens.map((token) => (
                  <button
                    key={token.key}
                    type="button"
                    className="plp-active-filter-chip"
                    onClick={() => {
                      if (token.key === 'category') setSelectedCategory('all');
                      if (token.key === 'price') setPriceRange('all');
                      if (token.key === 'rating') setMinRating(0);
                      if (token.key === 'query') setSearchQuery('');
                    }}
                  >
                    {token.label}
                    <IconX size={14} />
                  </button>
                ))}
              </div>
            )}

            <div className="plp-results-count">
              Hiển thị {filteredProducts.length}
              {minRating > 0 ? ' sau lọc đánh giá' : ''} · đã tải {products.length}
              {totalElements ? ` · ${totalElements} mục từ server` : ''}
            </div>

            {loading ? (
              <ProductGridSkeleton count={8} />
            ) : products.length === 0 ? (
              <EmptyState
                title="Chưa có sản phẩm nào"
                description="Hãy là người đầu tiên đăng bán giáo trình, sách tham khảo hoặc tài liệu ôn thi trên EduCycle."
                actions={
                  <Link to="/products/new" className="plp-reset-btn plp-reset-link">
                    Đăng bán ngay
                  </Link>
                }
              />
            ) : filteredProducts.length > 0 ? (
              <>
                <div className={viewMode === 'grid' ? 'plp-product-grid' : 'plp-product-list'}>
                  {filteredProducts.map((product) => (
                    <Link
                      to={`/products/${product.id}`}
                      key={product.id}
                      className={`${viewMode === 'grid' ? 'plp-card' : 'plp-card-list'} plp-card-link`}
                    >
                      <div className="plp-card-image">
                        {product.imageUrl ? (
                          <img
                            src={product.imageUrl}
                            alt={product.name}
                            loading="lazy"
                            decoding="async"
                            onError={(event) => {
                              event.currentTarget.style.display = 'none';
                              event.currentTarget.parentElement
                                ?.querySelector('.plp-card-image-fallback')
                                ?.classList.add('show');
                            }}
                          />
                        ) : null}
                        <div className={`plp-card-image-fallback ${product.imageUrl ? '' : 'show'}`}>Chưa có ảnh</div>
                        <div className="plp-card-badge">{product.category || 'Tài liệu học tập'}</div>
                        <button
                          type="button"
                          className={`plp-wishlist-btn ${isInWishlist(product.id) ? 'active' : ''}`}
                          onClick={(event) => {
                            event.preventDefault();
                            event.stopPropagation();
                            toggleWishlist(product);
                            toast.info(
                              isInWishlist(product.id)
                                ? 'Đã xóa khỏi danh sách yêu thích.'
                                : 'Đã thêm vào danh sách yêu thích.',
                            );
                          }}
                          title={isInWishlist(product.id) ? 'Bỏ yêu thích' : 'Thêm vào yêu thích'}
                          aria-label={isInWishlist(product.id) ? 'Bỏ yêu thích' : 'Thêm vào yêu thích'}
                        >
                          {isInWishlist(product.id) ? <IconHeartFilled size={18} /> : <IconHeart size={18} />}
                        </button>
                      </div>

                      <div className="plp-card-content">
                        <h3 className="plp-card-title">{product.name}</h3>
                        <p className="plp-card-description">{product.description || 'Chưa có mô tả chi tiết.'}</p>

                        <div className="plp-card-meta">
                          <div className="plp-card-rating">
                            <span className="plp-rating-stars">{product.rating ? `${product.rating} sao` : 'Chưa có đánh giá'}</span>
                            {product.reviews > 0 && <span className="plp-rating-count">({product.reviews})</span>}
                          </div>
                          <div className="plp-card-seller">bởi {product.seller || 'Thành viên EduCycle'}</div>
                        </div>

                        <div className="plp-card-footer">
                          <div className="plp-card-price">{formatPrice(product.price, product.priceType)}</div>
                          <span className="plp-view-detail-btn">Xem chi tiết</span>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>

                {!reachedEnd && (
                  <div className="plp-load-more-wrap">
                    <button type="button" className="plp-reset-btn" disabled={loadingMore} onClick={loadMore}>
                      {loadingMore ? 'Đang tải...' : 'Tải thêm'}
                    </button>
                  </div>
                )}
              </>
            ) : (
              <EmptyState
                title="Không có mục đạt đánh giá tối thiểu"
                description="Thử hạ mức sao hoặc tải thêm sản phẩm để xem thêm kết quả."
                actions={
                  <button type="button" className="plp-reset-btn" onClick={() => setMinRating(0)}>
                    Bỏ lọc đánh giá
                  </button>
                }
              />
            )}
          </main>
        </div>
      </div>
    </div>
  );
}

