import { useState, useEffect, useRef, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useInfiniteQuery, useQuery } from '@tanstack/react-query';
import { useWishlist } from '../contexts/WishlistContext';
import { useToast } from '../components/Toast';
import { productsApi, categoriesApi } from '../api/endpoints';
import { useDebounce } from '../hooks/useDebounce';
import { extractPage } from '../utils/pageApi';
import ProductGridSkeleton from '../components/ProductGridSkeleton';
import { IconChevronLeft, IconChevronRight, IconHeart, IconHeartFilled, IconX } from '../components/icons/Icons';
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

/* ── Slides for the hero banner ── */
const SLIDES = [
  {
    tag: 'Giáo trình',
    title: 'Tiết kiệm đến\n60% chi phí sách.',
    sub: 'Mua bán tài liệu giữa sinh viên. An toàn. Không phí ẩn.',
    bg: 'linear-gradient(150deg, #eef6ff 0%, #e8f5e9 100%)',
    accent: '#2196f3',
  },
  {
    tag: 'Xác nhận OTP',
    title: 'Giao dịch\nan toàn 100%.',
    sub: 'Mỗi giao dịch được bảo vệ bằng mã OTP xác nhận tại chỗ.',
    bg: 'linear-gradient(150deg, #fce4ec 0%, #e8eaf6 100%)',
    accent: '#e91e63',
  },
  {
    tag: 'Uy tín người bán',
    title: 'Đánh giá\nminh bạch.',
    sub: 'Điểm uy tín sau mỗi giao dịch giúp bạn chọn đúng người bán.',
    bg: 'linear-gradient(150deg, #fff8e1 0%, #f3e5f5 100%)',
    accent: '#ff9800',
  },
  {
    tag: 'Tái sử dụng',
    title: 'Sách cũ—\ngiá mới.',
    sub: 'Trao đổi tài liệu, giảm lãng phí, xây dựng cộng đồng xanh.',
    bg: 'linear-gradient(150deg, #e8f5e9 0%, #e3f2fd 100%)',
    accent: '#4caf50',
  },
];

const CAT_LIST = [
  { name: 'Tất cả',       color: '#607d8b', val: 'all' },
  { name: 'Giáo Trình',   color: '#2196f3', val: 'Giáo Trình' },
  { name: 'Chuyên Ngành', color: '#9c27b0', val: 'Sách Chuyên Ngành' },
  { name: 'Ôn Thi',       color: '#ff9800', val: 'Tài Liệu Ôn Thi' },
  { name: 'Dụng Cụ',      color: '#4caf50', val: 'Dụng Cụ Học Tập' },
  { name: 'Ngoại Ngữ',    color: '#00bcd4', val: 'Ngoại Ngữ' },
];

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

export default function HomePage() {
  const productsRef = useRef(null);
  const { toggleWishlist, isInWishlist } = useWishlist();
  const toast = useToast();

  /* Banner auto-slide */
  const [slide, setSlide] = useState(0);
  const [slideDir, setSlideDir] = useState(1); // 1 = forward, -1 = back
  const [animating, setAnimating] = useState(false);

  const goToSlide = (next, dir = 1) => {
    if (animating) return;
    setAnimating(true);
    setSlideDir(dir);
    setTimeout(() => {
      setSlide(next);
      setAnimating(false);
    }, 380);
  };

  useEffect(() => {
    const t = setInterval(() => {
      goToSlide((slide + 1) % SLIDES.length, 1);
    }, 4500);
    return () => clearInterval(t);
  }, [slide, animating]);

  const PAGE_SIZE = 24;
  const [searchQuery, setSearchQuery] = useState('');
  const debouncedSearch = useDebounce(searchQuery, 300);
  const [selectedCat, setSelectedCat] = useState('all');
  const [priceRange, setPriceRange] = useState('all');
  const [sortBy, setSortBy] = useState('newest');

  const { data: catData } = useQuery({
    queryKey: ['categories', 'all'],
    queryFn: async () => {
      const res = await categoriesApi.getAll();
      return Array.isArray(res.data) ? res.data : [];
    },
  });

  const categories = useMemo(() => {
    const data = catData ?? [];
    if (data.length === 0) return CAT_LIST;
    const apiCats = data.map((c) => {
      const name = c.name || c.Name || '';
      return CAT_LIST.find((x) => x.val === name) || { name, color: '#607d8b', val: name };
    });
    return [CAT_LIST[0], ...apiCats];
  }, [catData]);

  const catalogQueryParams = useMemo(() => {
    const params = { size: PAGE_SIZE, direction: 'desc', sort: sortBy };
    const t = debouncedSearch.trim();
    if (t) params.q = t;
    if (selectedCat !== 'all') params.category = selectedCat;
    if (priceRange === 'under50k') params.priceMax = 49999.99;
    else if (priceRange === '50kto100k') {
      params.priceMin = 50000;
      params.priceMax = 99999.99;
    } else if (priceRange === 'over100k') params.priceMin = 100000;
    return params;
  }, [debouncedSearch, selectedCat, priceRange, sortBy]);

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

  const current = SLIDES[slide];

  return (
    <div className="hp">

      {/* ══ HERO + BANNER LƯỚT ════════════════════════ */}
      <section className="hp-hero" style={{ background: current.bg, transition: 'background .6s ease' }}>
        <div className="hp-hero__shapes">
          <div className="hp-hero__blob hp-hero__blob--a" style={{ background: current.accent + '44' }} />
          <div className="hp-hero__blob hp-hero__blob--b" />
        </div>

        <div className="hp-hero__body">
          {/* Left: slide content */}
          <div className="hp-hero__left">
            <span className="hp-pill" style={{ borderColor: current.accent + '55', color: current.accent }}>
              {current.tag}
            </span>
            <h1
              className={`hp-hero__h1 hp-slide-text ${animating ? (slideDir > 0 ? 'exit-left' : 'exit-right') : 'enter'}`}
              key={slide + '-h1'}
            >
              {current.title.split('\n').map((line, i) => (
                <span key={i}>{line}{i < current.title.split('\n').length - 1 && <br />}</span>
              ))}
            </h1>
            <p
              className={`hp-hero__sub hp-slide-text ${animating ? 'exit-fade' : 'enter-fade'}`}
              key={slide + '-sub'}
            >
              {current.sub}
            </p>
            <div className="hp-hero__cta">
              <button className="hp-btn hp-btn--solid" style={{ background: current.accent, borderColor: current.accent }} onClick={scrollToProducts}>
                Tìm sách
              </button>
              <Link to="/auth" className="hp-btn hp-btn--ghost" style={{ color: current.accent, borderColor: current.accent + '66' }}>
                Bắt đầu bán
              </Link>
            </div>

            {/* Slide dots */}
            <div className="hp-dots">
              {SLIDES.map((_, i) => (
                <button
                  key={i}
                  className={`hp-dot ${i === slide ? 'active' : ''}`}
                  style={{ background: i === slide ? current.accent : '#ccc' }}
                  onClick={() => goToSlide(i, i > slide ? 1 : -1)}
                />
              ))}
            </div>
          </div>

          {/* Right: floating book cards (decorative) */}
          <div className="hp-hero__right" aria-hidden="true">
            <div className="hp-book hp-book--a">
              <div><div className="hp-book__name">Giải tích 1</div><div className="hp-book__price">45.000đ</div></div>
            </div>
            <div className="hp-book hp-book--b">
              <div><div className="hp-book__name">Vật lý ĐC</div><div className="hp-book__price">35.000đ</div></div>
            </div>
            <div className="hp-book hp-book--c">
              <div><div className="hp-book__name">IELTS Cam 18</div><div className="hp-book__price">60.000đ</div></div>
            </div>
            <div className="hp-badge-otp">OTP xác nhận</div>

            {/* Slide prev/next arrows */}
            <button
              className="hp-slide-arrow hp-slide-arrow--left"
              onClick={() => goToSlide((slide - 1 + SLIDES.length) % SLIDES.length, -1)}
              aria-label="Slide trước"
              title="Slide trước"
              type="button"
            >
              <IconChevronLeft size={22} />
            </button>
            <button
              className="hp-slide-arrow hp-slide-arrow--right"
              onClick={() => goToSlide((slide + 1) % SLIDES.length, 1)}
              aria-label="Slide sau"
              title="Slide sau"
              type="button"
            >
              <IconChevronRight size={22} />
            </button>
          </div>
        </div>
      </section>

      {/* ══ PRODUCT LISTING ══════════════════════════ */}
      <section className="hp-products-section" ref={productsRef} id="products">
        <div className="hp-products-header">
          <Reveal>
            <h2 className="hp-section__h2" style={{ marginBottom: 8 }}>Sản phẩm hiện có</h2>
            <p className="hp-products-count">
              {loading
                ? 'Đang tải...'
                : `${products.length} đã tải${totalElements ? ` · ${totalElements} khớp bộ lọc` : ''}`}
            </p>
          </Reveal>

          {/* Category pills */}
          <Reveal delay={60}>
            <div className="hp-cat-pills">
              {categories.map(c => (
                <button
                  key={c.val}
                  className={`hp-cat-pill ${selectedCat === c.val ? 'active' : ''}`}
                  style={{ '--c': c.color }}
                  onClick={() => setSelectedCat(c.val)}
                >
                  {c.name}
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
              <Link to="/products/new" className="hp-btn hp-btn--solid" style={{ marginTop: 16 }}>Đăng bán ngay</Link>
            ) : (
              <button onClick={() => { setSearchQuery(''); setSelectedCat('all'); setPriceRange('all'); }} className="hp-btn hp-btn--solid" style={{ marginTop: 16 }}>
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
                      ? <img src={product.imageUrl} alt={product.name} onError={e => { e.target.style.display = 'none'; e.target.nextSibling.style.display = 'flex'; }} />
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
              className="hp-btn hp-btn--ghost"
              style={{ minWidth: 200 }}
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
