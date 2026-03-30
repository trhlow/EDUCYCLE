import { useState, useEffect, useRef, useMemo } from 'react';
import { Link, useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import { useInfiniteQuery, useQuery } from '@tanstack/react-query';
import { useWishlist } from '../contexts/WishlistContext';
import { useToast } from '../components/Toast';
import { productsApi } from '../api/endpoints';
import { HOME_CATEGORY_CHIPS } from '../components/layout/navbarCatalogConfig';
import { extractPage } from '../utils/pageApi';
import ProductGridSkeleton from '../components/ProductGridSkeleton';
import { IconHeart, IconHeartFilled, IconX } from '../components/icons/Icons';
import './HomePage.css';

/* ── Scroll-reveal ── */
function Reveal({ children, delay = 0 }) {
  const ref = useRef(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const obs = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) setVisible(true); },
      { threshold: 0.08 }
    );
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, []);
  return (
    <div ref={ref} className={`reveal ${visible ? 'reveal--on' : ''}`} style={{ transitionDelay: `${delay}ms` }}>
      {children}
    </div>
  );
}

function mapApiProductToCard(p) {
  return {
    id: String(p.id),
    name: p.name || '',
    description: p.description || '',
    price: p.price || 0,
    priceType: p.priceType || (p.price === 0 ? 'contact' : 'fixed'),
    category: p.categoryName || p.category || '',
    imageUrl: p.imageUrl || p.imageUrls?.[0] || '',
    rating: p.averageRating || 0,
    seller: p.sellerName || '',
    createdAt: p.createdAt || '',
    status: p.status || '',
  };
}

const HERO_SPOTLIGHT_COUNT = 3;

const priceLine = (p) => {
  if (p.priceType === 'contact' || p.price === 0) return 'Giá liên hệ';
  return `${Number(p.price).toLocaleString('vi-VN')}đ`;
};

export default function HomePage() {
  const productsRef = useRef(null);
  const location = useLocation();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { toggleWishlist, isInWishlist } = useWishlist();
  const toast = useToast();

  const PAGE_SIZE = 24;
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCat, setSelectedCat] = useState('all');
  const [priceRange, setPriceRange] = useState('all');
  const [sortBy, setSortBy] = useState('newest');

  useEffect(() => {
    const cat = searchParams.get('category');
    const q = searchParams.get('q');
    setSelectedCat(cat && cat.trim() !== '' ? cat.trim() : 'all');
    setSearchQuery(q != null ? q : '');
  }, [searchParams]);

  useEffect(() => {
    if (location.state?.scrollTo !== 'products') return;
    const id = requestAnimationFrame(() => {
      document.getElementById('products')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      navigate(
        { pathname: location.pathname, search: location.search, hash: location.hash },
        { replace: true, state: {} },
      );
    });
    return () => cancelAnimationFrame(id);
  }, [location.state?.scrollTo, location.pathname, location.search, location.hash, navigate]);

  const { data: heroPage, isPending: heroSpotlightLoading } = useQuery({
    queryKey: ['products', 'hero-spotlight'],
    queryFn: async () => {
      const res = await productsApi.getAll({
        page: 0,
        size: 12,
        direction: 'desc',
        sort: 'newest',
      });
      return extractPage(res);
    },
    staleTime: 60_000,
  });

  const heroSpotlights = useMemo(() => {
    const raw = heroPage?.content ?? [];
    const cards = raw.map(mapApiProductToCard);
    return cards.slice(0, HERO_SPOTLIGHT_COUNT);
  }, [heroPage]);

  const handleCategoryChipClick = (val) => {
    setSelectedCat(val);
    const next = new URLSearchParams(searchParams);
    if (val === 'all') {
      next.delete('category');
    } else {
      next.set('category', val);
    }
    setSearchParams(next, { replace: true });
  };

  const catalogQueryParams = useMemo(() => {
    const params = { size: PAGE_SIZE, direction: 'desc', sort: sortBy };
    const t = searchQuery.trim();
    if (t) params.q = t;
    if (selectedCat !== 'all') params.category = selectedCat;
    if (priceRange === 'under50k') params.priceMax = 49999.99;
    else if (priceRange === '50kto100k') {
      params.priceMin = 50000;
      params.priceMax = 99999.99;
    } else if (priceRange === 'over100k') params.priceMin = 100000;
    return params;
  }, [searchQuery, selectedCat, priceRange, sortBy]);

  const {
    data: productPages,
    fetchNextPage,
    hasNextPage,
    isPending,
    isFetchingNextPage,
  } = useInfiniteQuery({
    queryKey: ['products', 'home', PAGE_SIZE, catalogQueryParams],
    initialPageParam: 0,
    queryFn: async ({ pageParam }) => {
      const res = await productsApi.getAll({ ...catalogQueryParams, page: pageParam });
      return extractPage(res);
    },
    getNextPageParam: (lastPage) => (lastPage.last ? undefined : lastPage.page + 1),
  });

  const products = useMemo(() => {
    if (!productPages?.pages?.length) return [];
    return productPages.pages.flatMap((pg) => pg.content.map(mapApiProductToCard));
  }, [productPages]);

  const loading = isPending;
  const loadingMore = isFetchingNextPage;
  const last = !hasNextPage;
  const totalElements = productPages?.pages?.[0]?.totalElements ?? 0;

  const loadMoreProducts = () => {
    if (!hasNextPage || isFetchingNextPage) return;
    fetchNextPage().catch(() => toast.error('Không tải thêm được.'));
  };

  const scrollToProducts = () => {
    productsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const formatPrice = (p, type) => {
    if (type === 'contact' || p === 0) return <span className="hp-price-contact">Giá liên hệ</span>;
    return <>{Number(p).toLocaleString('vi-VN')}đ</>;
  };

  return (
    <div className="hp">

      <section className="hp-hero" aria-labelledby="hp-hero-title">
        <div className="hp-hero__shapes">
          <div className="hp-hero__blob hp-hero__blob--a" />
          <div className="hp-hero__blob hp-hero__blob--b" />
        </div>

        <div className="hp-hero__body">
          <div className="hp-hero__left">
            <h1 id="hp-hero-title" className="hp-hero__h1">
              Sách &amp; tài liệu
              <br />
              giữa sinh viên
            </h1>
            <p className="hp-hero__sub">
              Mua bán trực tiếp, xác nhận OTP tại chỗ. Không phí nền tảng.
            </p>
            <div className="hp-hero__cta">
              <button type="button" className="hp-btn hp-btn--solid" onClick={scrollToProducts}>
                Tìm sách
              </button>
              <Link to="/auth" className="hp-btn hp-btn--ghost">
                Bắt đầu bán
              </Link>
            </div>
            <p className="hp-hero__trust">
              OTP tại chỗ · Uy tín sau giao dịch · Danh mục đa dạng
            </p>
          </div>

          <div className="hp-hero__right">
            <div className="hp-spotlight-grid">
              {heroSpotlightLoading
                ? Array.from({ length: HERO_SPOTLIGHT_COUNT }, (_, i) => (
                    <div key={`sk-${i}`} className={`hp-spotlight hp-spotlight--skeleton hp-spotlight--pos-${i}`} aria-hidden="true" />
                  ))
                : heroSpotlights.length === 0
                  ? (
                    <div className="hp-spotlight-empty">
                      <p>Chưa có sản phẩm hiển thị.</p>
                      <Link to="/products/new" className="hp-spotlight-empty__link">
                        Đăng bán đầu tiên
                      </Link>
                    </div>
                    )
                  : (
                    heroSpotlights.map((p, i) => (
                      <Link
                        key={p.id}
                        to={`/products/${p.id}`}
                        className={`hp-spotlight hp-spotlight--pos-${i}`}
                        aria-label={`${p.name}, ${priceLine(p)}`}
                      >
                        <div className="hp-spotlight__media">
                          {p.imageUrl ? (
                            <img
                              src={p.imageUrl}
                              alt=""
                              className="hp-spotlight__img"
                              loading="lazy"
                              decoding="async"
                              width={200}
                              height={150}
                            />
                          ) : (
                            <div className="hp-spotlight__placeholder">Chưa có ảnh</div>
                          )}
                        </div>
                        <div className="hp-spotlight__meta">
                          <span className="hp-spotlight__name">{p.name}</span>
                          <span className="hp-spotlight__price">{priceLine(p)}</span>
                        </div>
                      </Link>
                    ))
                    )}
            </div>
          </div>
        </div>
      </section>

      {/* ══ PRODUCT LISTING ══════════════════════════ */}
      <section className="hp-products-section" ref={productsRef} id="products">
        <div className="hp-products-header">
          <Reveal>
            <h2 className="hp-section__h2 hp-section__h2--tight">Sản phẩm hiện có</h2>
            <p className="hp-products-count">
              {loading
                ? 'Đang tải...'
                : `${products.length} đã tải${totalElements ? ` · ${totalElements} khớp bộ lọc` : ''}`}
            </p>
            <p style={{ marginTop: 'var(--space-2)', fontSize: 'var(--text-sm)' }}>
              <Link to="/book-wanted" style={{ color: 'var(--primary-600)', fontWeight: 600, textDecoration: 'none' }}>
                Đang cần mua / tìm sách? Xem tin nhu cầu từ sinh viên →
              </Link>
            </p>
          </Reveal>

          {/* Category pills */}
          <Reveal delay={60}>
            <div className="hp-cat-pills">
              {HOME_CATEGORY_CHIPS.map((c) => (
                <button
                  key={c.val}
                  type="button"
                  className={`hp-cat-pill ${selectedCat === c.val ? 'active' : ''}`}
                  style={{ '--c': c.chipColor }}
                  onClick={() => handleCategoryChipClick(c.val)}
                >
                  {c.label}
                </button>
              ))}
            </div>
          </Reveal>

          {/* Toolbar */}
          <Reveal delay={100}>
            <div className="hp-products-toolbar">
              <div className="hp-search-box">
                <input
                  type="text"
                  placeholder="Tìm sách, tài liệu..."
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="hp-search-clear"
                    type="button"
                    aria-label="Xóa từ khóa tìm kiếm"
                    title="Xóa từ khóa"
                  >
                    <IconX size={18} />
                  </button>
                )}
              </div>
              <div className="hp-toolbar-right">
                <select value={priceRange} onChange={e => setPriceRange(e.target.value)} className="hp-select">
                  <option value="all">Tất cả giá</option>
                  <option value="under50k">Dưới 50k</option>
                  <option value="50kto100k">50k – 100k</option>
                  <option value="over100k">Trên 100k</option>
                </select>
                <select value={sortBy} onChange={e => setSortBy(e.target.value)} className="hp-select">
                  <option value="newest">Mới nhất</option>
                  <option value="price-low">Giá tăng dần</option>
                  <option value="price-high">Giá giảm dần</option>
                </select>
              </div>
            </div>
          </Reveal>
        </div>

        {/* Grid */}
        {loading ? (
          <ProductGridSkeleton count={8} />
        ) : products.length === 0 ? (
          <div className="hp-products-empty">
            <p>{totalElements === 0 ? 'Chưa có sản phẩm nào.' : 'Không tìm thấy kết quả phù hợp.'}</p>
            {totalElements === 0 ? (
              <Link to="/products/new" className="hp-btn hp-btn--solid hp-btn--spaced-top">Đăng bán ngay</Link>
            ) : (
              <button
                type="button"
                onClick={() => {
                  setSearchQuery('');
                  setSelectedCat('all');
                  setPriceRange('all');
                  setSearchParams({}, { replace: true });
                }}
                className="hp-btn hp-btn--solid hp-btn--spaced-top"
              >
                Xóa bộ lọc
              </button>
            )}
          </div>
        ) : (
          <div className="hp-product-grid">
            {products.map((product, i) => (
              <Reveal key={product.id} delay={Math.min(i % 6 * 40, 180)}>
                <Link to={`/products/${product.id}`} className="hp-product-card" style={{ textDecoration: 'none', color: 'inherit' }}>
                  <div className="hp-product-card__img">
                    {product.imageUrl
                      ? (
                        <img
                          src={product.imageUrl}
                          alt={product.name}
                          loading="lazy"
                          decoding="async"
                          width={400}
                          height={300}
                          onError={(e) => {
                            e.target.style.display = 'none';
                            e.target.nextSibling.style.display = 'flex';
                          }}
                        />
                        )
                      : null
                    }
                    <div className="hp-product-card__img-placeholder" style={{ display: product.imageUrl ? 'none' : 'flex' }}>Chưa có ảnh</div>
                    <div className="hp-product-card__cat">{product.category}</div>
                    <button
                      type="button"
                      className={`hp-product-card__wish ${isInWishlist(product.id) ? 'active' : ''}`}
                      aria-label={isInWishlist(product.id) ? 'Bỏ yêu thích' : 'Thêm vào yêu thích'}
                      title={isInWishlist(product.id) ? 'Bỏ yêu thích' : 'Thêm vào yêu thích'}
                      onClick={e => { e.preventDefault(); e.stopPropagation(); toggleWishlist(product); toast.info(isInWishlist(product.id) ? 'Đã xóa khỏi yêu thích' : 'Đã thêm vào yêu thích'); }}
                    >
                      {isInWishlist(product.id) ? <IconHeartFilled size={18} /> : <IconHeart size={18} />}
                    </button>
                  </div>
                  <div className="hp-product-card__body">
                    <h3 className="hp-product-card__name">{product.name}</h3>
                    <p className="hp-product-card__desc">{product.description}</p>
                    <div className="hp-product-card__footer">
                      <div className="hp-product-card__price">{formatPrice(product.price, product.priceType)}</div>
                      {product.rating > 0 && <div className="hp-product-card__rating">{product.rating}/5</div>}
                    </div>
                    <div className="hp-product-card__seller">bởi {product.seller}</div>
                  </div>
                </Link>
              </Reveal>
            ))}
          </div>
        )}
        {!loading && !last && products.length > 0 && (
          <div style={{ display: 'flex', justifyContent: 'center', marginTop: 'var(--space-8)' }}>
            <button
              type="button"
              className="hp-btn hp-btn--ghost hp-btn--min-wide"
              disabled={loadingMore}
              onClick={loadMoreProducts}
            >
              {loadingMore ? 'Đang tải...' : 'Tải thêm sản phẩm'}
            </button>
          </div>
        )}
      </section>

    </div>
  );
}
