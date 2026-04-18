import { useState, useEffect, useRef, useMemo } from 'react';
import { Link, useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import { useInfiniteQuery, useQuery } from '@tanstack/react-query';
import { useWishlist } from '../context/WishlistContext';
import { useToast } from '../components/Toast';
import { productsApi } from '../lib/api';
import { HOME_CATEGORY_CHIPS } from '../components/layouts/navbarCatalogConfig';
import { extractPage } from '../lib/page-api';
import { useUnsplashCurated } from '../hooks/useUnsplashCurated';
import { isEducationalListing } from '../lib/academic-marketplace';
import ProductGridSkeleton from '../components/ProductGridSkeleton';
import {
  IconHeart,
  IconHeartFilled,
  IconX,
  IconBookOpen,
  IconArrowsLeftRight,
  IconShieldCheck,
  IconUsers,
  IconUpload,
  IconSearch,
  IconHandshake,
  IconArrowRight,
  IconSealCheck,
  IconGraduationCap,
  IconTag,
  IconGift,
} from '../components/icons/Icons';
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
const ENABLE_UNSPLASH_HERO = String(import.meta.env.VITE_ENABLE_UNSPLASH_HERO ?? 'true').toLowerCase() !== 'false';

const priceLine = (p) => {
  if (p.priceType === 'contact' || p.price === 0) return 'Giá liên hệ';
  return `${Number(p.price).toLocaleString('vi-VN')}đ`;
};

/* ── Animated counter ── */
function AnimatedCounter({ target, suffix = '', duration = 1800 }) {
  const [count, setCount] = useState(0);
  const ref = useRef(null);
  const started = useRef(false);

  useEffect(() => {
    const obs = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting && !started.current) {
          started.current = true;
          const steps = 60;
          const increment = target / steps;
          let current = 0;
          const interval = setInterval(() => {
            current += increment;
            if (current >= target) {
              setCount(target);
              clearInterval(interval);
            } else {
              setCount(Math.floor(current));
            }
          }, duration / steps);
        }
      },
      { threshold: 0.3 }
    );
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, [target, duration]);

  return <span ref={ref}>{count.toLocaleString('vi-VN')}{suffix}</span>;
}

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
      const res = await productsApi.getAll({ page: 0, size: 12, direction: 'desc', sort: 'newest' });
      return extractPage(res);
    },
    staleTime: 60_000,
  });

  const heroSpotlights = useMemo(() => {
    const raw = heroPage?.content ?? [];
    return raw.map(mapApiProductToCard).slice(0, HERO_SPOTLIGHT_COUNT);
  }, [heroPage]);

  const { data: heroMediaData } = useUnsplashCurated({
    topic: 'study',
    orientation: 'landscape',
    count: 4,
    enabled: ENABLE_UNSPLASH_HERO,
  });

  const heroVisual = heroMediaData?.items?.[0] ?? null;
  const heroEmptyVisual = heroMediaData?.items?.[1] ?? heroVisual;

  const handleCategoryChipClick = (val) => {
    setSelectedCat(val);
    const next = new URLSearchParams(searchParams);
    if (val === 'all') next.delete('category');
    else next.set('category', val);
    setSearchParams(next, { replace: true });
  };

  const catalogQueryParams = useMemo(() => {
    const params = { size: PAGE_SIZE, direction: 'desc', sort: sortBy };
    const t = searchQuery.trim();
    if (t) params.q = t;
    if (selectedCat !== 'all') params.category = selectedCat;
    if (priceRange === 'under50k') params.priceMax = 49999.99;
    else if (priceRange === '50kto100k') { params.priceMin = 50000; params.priceMax = 99999.99; }
    else if (priceRange === 'over100k') params.priceMin = 100000;
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
    return productPages.pages
      .flatMap((pg) => pg.content.map(mapApiProductToCard))
      .filter(isEducationalListing);
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

  const buildUnsplashSrcSet = (img) => {
    if (!img?.urls) return undefined;
    return [
      img.urls.thumb ? `${img.urls.thumb} 320w` : null,
      img.urls.small ? `${img.urls.small} 640w` : null,
      img.urls.regular ? `${img.urls.regular} 1080w` : null,
    ].filter(Boolean).join(', ');
  };

  return (
    <div className="hp">

      {/* ══ HERO ════════════════════════════════════════ */}
      <section className="hp-hero" aria-labelledby="hp-hero-title">
        {ENABLE_UNSPLASH_HERO && heroVisual && (
          <div className="hp-hero__photo-wrap" aria-hidden="true">
            <img
              className="hp-hero__photo"
              src={heroVisual.urls?.regular || heroVisual.urls?.small || heroVisual.urls?.thumb}
              srcSet={buildUnsplashSrcSet(heroVisual)}
              sizes="(max-width: 64rem) 100vw, 55vw"
              alt=""
              loading="eager"
              decoding="async"
              fetchPriority="high"
            />
            <div className="hp-hero__photo-overlay" />
          </div>
        )}
        <div className="hp-hero__shapes">
          <div className="hp-hero__blob hp-hero__blob--a" />
          <div className="hp-hero__blob hp-hero__blob--b" />
        </div>

        <div className="hp-hero__body">
          <div className="hp-hero__left">
            <div className="hp-hero__badge">
              <IconSealCheck size={14} />
              Nền tảng trao đổi tài liệu sinh viên
            </div>
            <h1 id="hp-hero-title" className="hp-hero__h1">
              Sách &amp; tài liệu
              <br />
              <span className="hp-hero__h1-accent">giữa sinh viên</span>
            </h1>
            <p className="hp-hero__sub">
              Mua bán trực tiếp, xác nhận OTP tại chỗ. Không phí nền tảng.
            </p>
            <div className="hp-hero__cta">
              <button type="button" className="hp-btn hp-btn--solid" onClick={scrollToProducts}>
                Tìm sách ngay
                <IconArrowRight size={16} />
              </button>
              <Link to="/auth" className="hp-btn hp-btn--ghost">
                Bắt đầu bán
              </Link>
            </div>
            <div className="hp-hero__trust-chips">
              <span className="hp-trust-chip"><IconShieldCheck size={13} /> OTP tại chỗ</span>
              <span className="hp-trust-chip"><IconUsers size={13} /> Sinh viên xác thực</span>
              <span className="hp-trust-chip"><IconTag size={13} /> Không phí nền tảng</span>
            </div>
            {ENABLE_UNSPLASH_HERO && heroVisual?.author?.name && (
              <p className="hp-hero__credit">
                Ảnh:{' '}
                <a
                  href={heroVisual.author.profileUrl || heroVisual.links?.html || 'https://unsplash.com'}
                  target="_blank"
                  rel="noreferrer"
                >
                  {heroVisual.author.name}
                </a>
                {' '}trên{' '}
                <a href="https://unsplash.com" target="_blank" rel="noreferrer">Unsplash</a>
              </p>
            )}
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
                      {heroEmptyVisual?.urls?.small && (
                        <img
                          src={heroEmptyVisual.urls.small}
                          srcSet={buildUnsplashSrcSet(heroEmptyVisual)}
                          sizes="(max-width: 64rem) 100vw, 22rem"
                          alt=""
                          className="hp-spotlight-empty__img"
                          loading="lazy"
                          decoding="async"
                        />
                      )}
                      <p>Chưa có sản phẩm hiển thị.</p>
                      <Link to="/products/new" className="hp-spotlight-empty__link">
                        Đăng bán đầu tiên
                      </Link>
                    </div>
                    )
                  : heroSpotlights.map((p, i) => (
                      <Link
                        key={p.id}
                        to={`/products/${p.id}`}
                        className={`hp-spotlight hp-spotlight--pos-${i}`}
                        aria-label={`${p.name}, ${priceLine(p)}`}
                      >
                        <div className="hp-spotlight__media">
                          {p.imageUrl ? (
                            <img src={p.imageUrl} alt="" className="hp-spotlight__img" loading="lazy" decoding="async" width={200} height={150} />
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
              }
            </div>
          </div>
        </div>
      </section>

      {/* ══ STATS BAR ════════════════════════════════════ */}
      <section className="hp-stats" aria-label="Thống kê nền tảng">
        <div className="hp-stats__inner">
          <div className="hp-stat-item">
            <span className="hp-stat-num">
              <AnimatedCounter target={totalElements > 0 ? totalElements : 1200} suffix="+" />
            </span>
            <span className="hp-stat-label">Tài liệu đăng bán</span>
          </div>
          <div className="hp-stat-divider" aria-hidden="true" />
          <div className="hp-stat-item">
            <span className="hp-stat-num"><AnimatedCounter target={850} suffix="+" /></span>
            <span className="hp-stat-label">Sinh viên tham gia</span>
          </div>
          <div className="hp-stat-divider" aria-hidden="true" />
          <div className="hp-stat-item">
            <span className="hp-stat-num"><AnimatedCounter target={430} suffix="+" /></span>
            <span className="hp-stat-label">Giao dịch thành công</span>
          </div>
          <div className="hp-stat-divider" aria-hidden="true" />
          <div className="hp-stat-item">
            <span className="hp-stat-num"><AnimatedCounter target={0} suffix="đ" /></span>
            <span className="hp-stat-label">Phí nền tảng</span>
          </div>
        </div>
      </section>

      {/* ══ HOW IT WORKS ═════════════════════════════════ */}
      <section className="hp-how" aria-labelledby="hp-how-title">
        <div className="hp-how__inner">
          <Reveal>
            <div className="hp-section-header">
              <span className="hp-section-badge">Đơn giản & nhanh chóng</span>
              <h2 id="hp-how-title" className="hp-section-h2">Cách hoạt động</h2>
              <p className="hp-section-sub">Ba bước để bắt đầu trao đổi tài liệu với sinh viên khác</p>
            </div>
          </Reveal>

          <div className="hp-how__steps">
            <Reveal delay={0}>
              <div className="hp-how-step">
                <div className="hp-how-step__icon-wrap hp-how-step__icon-wrap--blue">
                  <IconUpload size={28} />
                </div>
                <div className="hp-how-step__num">01</div>
                <h3 className="hp-how-step__title">Đăng tài liệu</h3>
                <p className="hp-how-step__desc">
                  Chụp ảnh và đăng sách, giáo trình, tài liệu bạn không còn dùng. Miễn phí hoàn toàn.
                </p>
              </div>
            </Reveal>

            <div className="hp-how__connector" aria-hidden="true">
              <div className="hp-how__connector-line" />
              <IconArrowRight size={18} />
            </div>

            <Reveal delay={120}>
              <div className="hp-how-step">
                <div className="hp-how-step__icon-wrap hp-how-step__icon-wrap--green">
                  <IconSearch size={28} />
                </div>
                <div className="hp-how-step__num">02</div>
                <h3 className="hp-how-step__title">Tìm & liên hệ</h3>
                <p className="hp-how-step__desc">
                  Tìm tài liệu cần thiết, lọc theo danh mục và giá, rồi nhắn tin trực tiếp với người bán.
                </p>
              </div>
            </Reveal>

            <div className="hp-how__connector" aria-hidden="true">
              <div className="hp-how__connector-line" />
              <IconArrowRight size={18} />
            </div>

            <Reveal delay={240}>
              <div className="hp-how-step">
                <div className="hp-how-step__icon-wrap hp-how-step__icon-wrap--orange">
                  <IconHandshake size={28} />
                </div>
                <div className="hp-how-step__num">03</div>
                <h3 className="hp-how-step__title">Giao dịch OTP</h3>
                <p className="hp-how-step__desc">
                  Gặp mặt trao đổi, xác nhận OTP tại chỗ để đảm bảo giao dịch an toàn cho cả hai bên.
                </p>
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      {/* ══ WHY EDUCYCLE ══════════════════════════════════ */}
      <section className="hp-why" aria-labelledby="hp-why-title">
        <div className="hp-why__inner">
          <Reveal>
            <div className="hp-section-header">
              <span className="hp-section-badge">Lợi ích</span>
              <h2 id="hp-why-title" className="hp-section-h2">Tại sao chọn EduCycle?</h2>
            </div>
          </Reveal>

          <div className="hp-why__grid">
            {[
              {
                icon: <IconBookOpen size={24} />,
                color: 'blue',
                title: 'Tài liệu đa dạng',
                desc: 'Sách giáo trình, đề cương, tài liệu tham khảo đủ mọi ngành học từ sinh viên các trường.',
              },
              {
                icon: <IconArrowsLeftRight size={24} />,
                color: 'green',
                title: 'Bán, mua & tặng',
                desc: 'Linh hoạt: bán lại, trao đổi ngang giá, hoặc tặng miễn phí cho sinh viên khó khăn.',
              },
              {
                icon: <IconShieldCheck size={24} />,
                color: 'blue',
                title: 'Giao dịch an toàn',
                desc: 'Xác minh OTP tại điểm giao dịch. Không lo bị lừa, không mất tiền oan.',
              },
              {
                icon: <IconGraduationCap size={24} />,
                color: 'orange',
                title: 'Dành cho sinh viên',
                desc: 'Được xây dựng bởi sinh viên, dành cho sinh viên. Hiểu rõ nhu cầu và thực tế học tập.',
              },
              {
                icon: <IconTag size={24} />,
                color: 'green',
                title: 'Tiết kiệm chi phí',
                desc: 'Mua tài liệu cũ giá hợp lý, giảm gánh nặng học phí. Cả người mua lẫn người bán đều lợi.',
              },
              {
                icon: <IconGift size={24} />,
                color: 'orange',
                title: 'Không phí nền tảng',
                desc: 'Đăng và giao dịch hoàn toàn miễn phí. Tiền về tay bạn, không qua trung gian.',
              },
            ].map((item, i) => (
              <Reveal key={item.title} delay={i * 60}>
                <article className={`hp-why-card hp-why-card--${item.color}`}>
                  <div className={`hp-why-card__icon hp-why-card__icon--${item.color}`}>
                    {item.icon}
                  </div>
                  <h3 className="hp-why-card__title">{item.title}</h3>
                  <p className="hp-why-card__desc">{item.desc}</p>
                </article>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ══ PRODUCT LISTING ══════════════════════════════ */}
      <section className="hp-products-section" ref={productsRef} id="products">
        <div className="hp-products-header">
          <Reveal>
            <h2 className="hp-section__h2 hp-section__h2--tight">Sản phẩm hiện có</h2>
            <p className="hp-products-count">
              {loading
                ? 'Đang tải...'
                : `${products.length} đã tải${totalElements ? ` · ${totalElements} khớp bộ lọc` : ''}`}
            </p>
            <p className="hp-products-note">
              Cần thêm thông tin giao dịch? Xem hướng dẫn trước khi gửi yêu cầu mua.
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
                  <button onClick={() => setSearchQuery('')} className="hp-search-clear" type="button" aria-label="Xóa từ khóa tìm kiếm" title="Xóa từ khóa">
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
                <Link to={`/products/${product.id}`} className="hp-product-card hp-product-card-link">
                  <div className="hp-product-card__img">
                    {product.imageUrl ? (
                      <img
                        className="hp-product-card__img-media"
                        src={product.imageUrl}
                        alt={product.name}
                        loading="lazy"
                        decoding="async"
                        width={400}
                        height={300}
                        onError={(event) => {
                          event.currentTarget.classList.add('hp-product-card__img-media--hidden');
                        }}
                      />
                    ) : null}
                    <div
                      className={`hp-product-card__img-placeholder ${
                        product.imageUrl ? 'hp-product-card__img-placeholder--with-media' : ''
                      }`}
                    >
                      Chưa có ảnh
                    </div>
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
                      {product.rating > 0 && <div className="hp-product-card__rating">⭐ {product.rating}/5</div>}
                    </div>
                    <div className="hp-product-card__seller">bởi {product.seller}</div>
                  </div>
                </Link>
              </Reveal>
            ))}
          </div>
        )}

        {!loading && !last && products.length > 0 && (
          <div className="hp-load-more-wrap">
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

      {/* ══ BOTTOM CTA ════════════════════════════════════ */}
      <section className="hp-cta-section" aria-labelledby="hp-cta-title">
        <div className="hp-cta__inner">
          <Reveal>
            <div className="hp-cta__blob" aria-hidden="true" />
            <h2 id="hp-cta-title" className="hp-cta__title">Sẵn sàng bắt đầu?</h2>
            <p className="hp-cta__sub">
              Đăng tài liệu để kiếm thêm thu nhập, hoặc tìm sách giá tốt từ sinh viên khác.
            </p>
            <div className="hp-cta__actions">
              <Link to="/auth" className="hp-btn hp-btn--solid hp-btn--lg">
                Tạo tài khoản miễn phí
              </Link>
              <button type="button" className="hp-btn hp-btn--ghost hp-btn--lg" onClick={scrollToProducts}>
                Xem tài liệu
              </button>
            </div>
          </Reveal>
        </div>
      </section>

    </div>
  );
}

