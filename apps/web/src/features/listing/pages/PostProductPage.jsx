import { formatPrice } from '../../../lib/format';
import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../../../context/AuthContext';
import { useToast } from '../../../components/Toast';
import { productsApi, categoriesApi, uploadProductImage } from '../api';
import { NAV_CATALOG, getCategoryDisplayLabel } from '../../../components/layouts/navbarCatalogConfig';
import { LoadingState } from '../../../components/ui';
import './PostProductPage.css';

const FALLBACK_CATEGORIES = [
  { value: '', label: '-- Chọn danh mục --', id: '' },
  ...NAV_CATALOG.map((n) => ({ value: n.category, label: n.label, id: '' })),
];
const CONDITIONS = [
  { value: '', label: '-- Tình trạng --' },
  { value: 'Mới 100%',      label: 'Mới 100% (chưa sử dụng)' },
  { value: 'Như mới (95%)', label: 'Như mới (95%)' },
  { value: 'Tốt (80-90%)',  label: 'Tốt (80-90%)' },
  { value: 'Khá (60-80%)',  label: 'Khá (60-80%)' },
  { value: 'Cũ (dưới 60%)',label: 'Cũ (dưới 60%)' },
];

export default function PostProductPage() {
  const navigate = useNavigate();
  const { id: editProductId } = useParams();
  const isEditMode = Boolean(editProductId);
  const { user } = useAuth();
  const toast = useToast();

  // Requirement: email must be verified to post a product (replaces phone verification)
  const isEmailVerified = user?.emailVerified ?? false;
  const [showEmailModal, setShowEmailModal] = useState(false);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [uploadingImages, setUploadingImages] = useState(false);
  const [loadingEdit, setLoadingEdit] = useState(isEditMode);
  /** URLs gửi lên BE: link ngoài hoặc `/api/files/...` sau upload */
  const [imageUrls, setImageUrls] = useState([]);
  const [errors, setErrors] = useState({});
  const fileInputRef = useRef(null);
  const [categories, setCategories] = useState(FALLBACK_CATEGORIES);
  const [priceType, setPriceType] = useState('fixed');

  const [form, setForm] = useState({
    name: '', category: '', categoryId: '', condition: '',
    price: '', description: '', contactNote: '', imageUrl: '',
  });

  useEffect(() => {
    categoriesApi.getAll()
      .then(res => {
        const data = Array.isArray(res.data) ? res.data : [];
        if (data.length > 0) {
          const rawName = (c) => c.name || c.Name || '';
          setCategories([
            { value: '', label: '-- Chọn danh mục --', id: '' },
            ...data.map((c) => {
              const name = rawName(c);
              return {
                value: name,
                label: getCategoryDisplayLabel(name) || name,
                id: c.id || c.Id || '',
              };
            }),
          ]);
        }
      }).catch(() => {});
  }, []);

  useEffect(() => {
    if (!isEditMode || !editProductId) return;
    let cancelled = false;
    (async () => {
      setLoadingEdit(true);
      try {
        const res = await productsApi.getById(editProductId);
        if (cancelled) return;
        const p = res.data;
        const seller = p.sellerId || p.userId;
        if (String(seller) !== String(user?.id)) {
          toast.error('Bạn không thể sửa sản phẩm này.');
          navigate(`/products/${editProductId}`);
          return;
        }
        const urls = (Array.isArray(p.imageUrls) && p.imageUrls.length > 0)
          ? p.imageUrls
          : (p.imageUrl ? [p.imageUrl] : []);
        setImageUrls(urls);
        const catName = p.categoryName || p.category || '';
        setForm({
          name: p.name || '',
          category: catName,
          categoryId: p.categoryId != null ? String(p.categoryId) : '',
          condition: p.condition || '',
          price: p.price != null && Number(p.price) > 0 ? String(p.price) : '',
          description: p.description || '',
          contactNote: p.contactNote || '',
          imageUrl: '',
        });
        const pt = !p.price || Number(p.price) === 0 ? 'contact' : 'fixed';
        setPriceType(pt);
      } catch {
        if (!cancelled) {
          toast.error('Không tải được sản phẩm để sửa.');
          navigate('/products');
        }
      } finally {
        if (!cancelled) setLoadingEdit(false);
      }
    })();
    return () => { cancelled = true; };
  // eslint-disable-next-line react-hooks/exhaustive-deps -- load once when edit id known; categories prefilled separately
  }, [isEditMode, editProductId, user?.id]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === 'category') {
      const cat = categories.find(c => c.value === value);
      setForm(prev => ({ ...prev, category: value, categoryId: cat?.id || '' }));
    } else {
      setForm(prev => ({ ...prev, [name]: value }));
    }
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }));
  };

  const handleImageUrlAdd = () => {
    const url = form.imageUrl.trim();
    if (!url) return;
    if (imageUrls.length >= 5) { toast.error('Tối đa 5 ảnh'); return; }
    setImageUrls(prev => [...prev, url]);
    setForm(prev => ({ ...prev, imageUrl: '' }));
  };

  const handleFileUpload = async (e) => {
    const files = Array.from(e.target.files);
    if (!files.length) return;
    const remaining = 5 - imageUrls.length;
    if (remaining <= 0) { toast.error('Tối đa 5 ảnh'); return; }
    const toUpload = files.slice(0, remaining);
    for (const file of toUpload) {
      if (!file.type.startsWith('image/')) { toast.error(`"${file.name}" không phải ảnh`); continue; }
      if (file.size > 5 * 1024 * 1024) { toast.error(`"${file.name}" vượt 5MB`); continue; }
      setUploadingImages(true);
      try {
        const { url } = await uploadProductImage(file);
        if (url) setImageUrls(prev => (prev.length >= 5 ? prev : [...prev, url]));
      } catch (err) {
        toast.error(err?.message || 'Tải ảnh lên thất bại');
      } finally {
        setUploadingImages(false);
      }
    }
    e.target.value = '';
  };

  const removeImage = (i) => {
    setImageUrls(prev => prev.filter((_, idx) => idx !== i));
  };

  const validate = () => {
    const e = {};
    if (!form.name.trim()) e.name = 'Tên sản phẩm là bắt buộc';
    if (form.name.trim().length > 0 && form.name.trim().length < 5) e.name = 'Tên phải có ít nhất 5 ký tự';
    if (!form.category) e.category = 'Vui lòng chọn danh mục';
    if (!form.condition) e.condition = 'Vui lòng chọn tình trạng';
    if (priceType === 'fixed') {
      if (!form.price || Number(form.price) <= 0) e.price = 'Giá phải lớn hơn 0';
      if (Number(form.price) > 10000000) e.price = 'Giá không vượt quá 10.000.000đ';
    }
    if (!form.description.trim()) e.description = 'Mô tả là bắt buộc';
    if (form.description.trim().length > 0 && form.description.trim().length < 20) e.description = 'Mô tả phải có ít nhất 20 ký tự';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (ev) => {
    ev.preventDefault();
    // Require email verification (replaces phone verification)
    if (!isEmailVerified) { setShowEmailModal(true); return; }
    if (!validate()) { toast.error('Vui lòng kiểm tra lại thông tin'); return; }
    setIsSubmitting(true);
    try {
      const payload = {
        name: form.name.trim(), category: form.category,
        categoryId: form.categoryId ? Number(form.categoryId) : undefined,
        condition: form.condition,
        price: priceType === 'contact' ? 0 : Number(form.price),
        description: form.description.trim(),
        contactNote: priceType === 'contact'
          ? (form.contactNote.trim() || 'Giá liên hệ — vui lòng nhắn tin để thương lượng')
          : (form.contactNote.trim() || undefined),
        imageUrl: imageUrls[0] || undefined,
        imageUrls: imageUrls.length > 0 ? imageUrls : undefined,
      };
      if (isEditMode) {
        await productsApi.update(editProductId, payload);
        toast.success('Đã cập nhật! Sản phẩm chờ kiểm duyệt lại.');
        navigate(`/products/${editProductId}`);
      } else {
        const res = await productsApi.create(payload);
        toast.success('Đăng sản phẩm thành công.');
        const newId = res.data?.id || res.data?.Id;
        navigate(newId ? `/products/${newId}` : '/products');
      }
    } catch (err) {
      const msg =
        err.userFacingMessage ||
        err.response?.data?.message ||
        err.response?.data?.Message ||
        'Thao tác thất bại. Vui lòng thử lại.';
      toast.error(typeof msg === 'string' ? msg : 'Thao tác thất bại.');
    } finally { setIsSubmitting(false); }
  };

  const pricePreview = priceType === 'contact' ? 'Giá liên hệ'
    : form.price > 0 ? `${formatPrice(form.price)}đ` : '---';

  if (loadingEdit) {
    return (
      <div className="post-product-page" style={{ textAlign: 'center', padding: '4rem' }}>
        <LoadingState label="Đang tải sản phẩm..." />
      </div>
    );
  }

  return (
    <div className="post-product-page">
      {/* Modal: yêu cầu xác thực EMAIL (không còn SĐT) */}
      {showEmailModal && (
        <div style={{ position:'fixed', inset:0, background:'rgba(0,0,0,.5)', display:'flex', alignItems:'center', justifyContent:'center', zIndex:1000, padding:'var(--space-4)' }}
          onClick={() => setShowEmailModal(false)}>
          <div style={{ background:'var(--bg-primary)', borderRadius:'var(--radius-xl)', padding:'var(--space-8)', maxWidth:420, width:'100%', boxShadow:'var(--shadow-xl)' }}
            onClick={e => e.stopPropagation()}>
            <div style={{ textAlign:'center', marginBottom:'var(--space-6)' }}>
              <h2 style={{ fontSize:'var(--text-xl)', fontWeight:'var(--weight-medium)', color:'var(--text-primary)', marginBottom:'var(--space-2)' }}>Xác thực email</h2>
              <p style={{ fontSize:'var(--text-sm)', color:'var(--text-secondary)', lineHeight:1.6 }}>
                Bạn cần xác thực email sinh viên (<strong>.edu.vn</strong>) trước khi đăng bán sản phẩm. Kiểm tra hộp thư và nhập mã OTP đã gửi lúc đăng ký.
              </p>
            </div>
            <div style={{ display:'flex', flexDirection:'column', gap:'var(--space-3)' }}>
              <button style={{ padding:'var(--space-3) var(--space-4)', background:'var(--primary-500)', color:'#fff', border:'none', borderRadius:'var(--radius-md)', fontSize:'var(--text-sm)', fontWeight:'var(--weight-medium)', cursor:'pointer' }}
                onClick={() => { setShowEmailModal(false); navigate('/auth'); }}>
                Xác thực email ngay
              </button>
              <button style={{ padding:'var(--space-3) var(--space-4)', background:'transparent', color:'var(--text-secondary)', border:'1px solid var(--border-light)', borderRadius:'var(--radius-md)', fontSize:'var(--text-sm)', cursor:'pointer' }}
                onClick={() => setShowEmailModal(false)}>
                Để sau
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="post-product-container">
        <div className="post-product-header">
          <div>
            <h1 className="post-product-title">{isEditMode ? 'Sửa tin đăng' : 'Đăng bán sản phẩm'}</h1>
            <p className="post-product-subtitle">
              {isEditMode ? 'Cập nhật thông tin — sau khi lưu tin sẽ chờ kiểm duyệt lại.' : 'Đăng sách, tài liệu hoặc dụng cụ học tập bạn muốn trao đổi'}
            </p>
          </div>
          <Link to="/transactions/guide" style={{ display:'inline-flex', alignItems:'center', gap:'var(--space-2)', padding:'var(--space-2) var(--space-4)', background:'var(--primary-50)', color:'var(--primary-700)', borderRadius:'var(--radius-md)', textDecoration:'none', fontSize:'var(--text-sm)', fontWeight:'var(--weight-medium)', border:'1px solid var(--primary-200)' }}>
            Hướng dẫn giao dịch
          </Link>
        </div>

        {/* Banner xác thực email (thay SĐT) */}
        {!isEmailVerified && (
          <div style={{ background:'var(--warning-light)', border:'1px solid #fbbf24', borderRadius:'var(--radius-md)', padding:'var(--space-3) var(--space-4)', marginBottom:'var(--space-6)', display:'flex', alignItems:'center', gap:'var(--space-3)', fontSize:'var(--text-sm)', color:'#92400e' }}>
            <span>Bạn chưa xác thực email. Vui lòng{' '}
              <button onClick={() => navigate('/auth')} style={{ background:'none', border:'none', color:'#92400e', fontWeight:'var(--weight-medium)', textDecoration:'underline', cursor:'pointer', padding:0 }}>
                xác thực email .edu.vn
              </button>
              {' '}trước khi đăng bán.</span>
          </div>
        )}

        <form className="post-product-form" onSubmit={handleSubmit}>
          <div className="post-product-grid">
            <div className="post-product-main">
              <div className="post-field">
                <label className="post-label" htmlFor="name">Tên sản phẩm <span className="post-required">*</span></label>
                <input type="text" id="name" name="name" className={`post-input ${errors.name?'error':''}`}
                  placeholder="VD: Giáo trình Giải tích 1 – Nguyễn Đình Trí"
                  value={form.name} onChange={handleChange} maxLength={150} />
                {errors.name && <span className="post-error">{errors.name}</span>}
                <span className="post-hint">{form.name.length}/150 ký tự</span>
              </div>

              <div className="post-row">
                <div className="post-field">
                  <label className="post-label" htmlFor="category">Danh mục <span className="post-required">*</span></label>
                  <select id="category" name="category" className={`post-select ${errors.category?'error':''}`} value={form.category} onChange={handleChange}>
                    {categories.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
                  </select>
                  {errors.category && <span className="post-error">{errors.category}</span>}
                </div>
                <div className="post-field">
                  <label className="post-label" htmlFor="condition">Tình trạng <span className="post-required">*</span></label>
                  <select id="condition" name="condition" className={`post-select ${errors.condition?'error':''}`} value={form.condition} onChange={handleChange}>
                    {CONDITIONS.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
                  </select>
                  {errors.condition && <span className="post-error">{errors.condition}</span>}
                </div>
              </div>

              {/* Giá */}
              <div className="post-field">
                <label className="post-label">Giá bán <span className="post-required">*</span></label>
                <div style={{ display:'flex', gap:'var(--space-3)', marginBottom:'var(--space-2)' }}>
                  {[['fixed','Giá cố định'],['contact','Giá liên hệ']].map(([val,lbl]) => (
                    <label key={val} style={{ display:'flex', alignItems:'center', gap:'var(--space-2)', cursor:'pointer', fontSize:'var(--text-sm)', color:'var(--text-primary)', padding:'var(--space-2) var(--space-3)', border:`1.5px solid ${priceType===val?'var(--primary-500)':'var(--border-light)'}`, borderRadius:'var(--radius-md)', background:priceType===val?'var(--primary-50)':'var(--bg-primary)' }}>
                      <input type="radio" name="priceType" value={val} checked={priceType===val} onChange={()=>setPriceType(val)} style={{ accentColor:'var(--primary-500)' }} />
                      {lbl}
                    </label>
                  ))}
                </div>
                {priceType === 'fixed' ? (
                  <>
                    <div className="post-price-input-wrapper">
                      <input type="number" name="price" className={`post-input post-price-input ${errors.price?'error':''}`}
                        placeholder="VD: 45000" value={form.price} onChange={handleChange} min={0} max={10000000} step={1000} />
                      <span className="post-price-suffix">đ</span>
                    </div>
                    {errors.price && <span className="post-error">{errors.price}</span>}
                    {form.price > 0 && <span className="post-hint">= {formatPrice(form.price)}đ</span>}
                  </>
                ) : (
                  <div style={{ padding:'var(--space-3)', background:'var(--info-light)', borderRadius:'var(--radius-md)', fontSize:'var(--text-sm)', color:'#1565c0' }}>
                    Giá sẽ được thương lượng khi gặp mặt. Ghi gợi ý giá trong phần Ghi chú.
                  </div>
                )}
              </div>

              <div className="post-field">
                <label className="post-label" htmlFor="description">Mô tả chi tiết <span className="post-required">*</span></label>
                <textarea id="description" name="description" className={`post-textarea ${errors.description?'error':''}`}
                  placeholder="Mô tả tình trạng sách, nội dung chính, lý do bán... Càng chi tiết càng dễ bán!"
                  value={form.description} onChange={handleChange} rows={6} maxLength={2000} />
                {errors.description && <span className="post-error">{errors.description}</span>}
                <span className="post-hint">{form.description.length}/2000 ký tự</span>
              </div>

              <div className="post-field">
                <label className="post-label" htmlFor="contactNote">Ghi chú giao dịch <span className="post-optional">(tùy chọn)</span></label>
                <input type="text" id="contactNote" name="contactNote" className="post-input"
                  placeholder={priceType==='contact' ? 'VD: Giá khoảng 50.000đ, gặp tại cổng trường...' : 'VD: Giao dịch tại cổng trường ĐH Bách Khoa, buổi chiều'}
                  value={form.contactNote} onChange={handleChange} maxLength={200} />
                <span className="post-hint">Không chia sẻ SĐT hay thông tin cá nhân.</span>
              </div>

              <div style={{ background:'var(--primary-50)', border:'1px solid var(--primary-200)', borderRadius:'var(--radius-md)', padding:'var(--space-4)', marginTop:'var(--space-4)' }}>
                <h4 style={{ fontSize:'var(--text-sm)', fontWeight:'var(--weight-medium)', color:'var(--primary-700)', marginBottom:'var(--space-2)' }}>Lưu ý khi đăng bán</h4>
                <ul style={{ paddingLeft:'var(--space-5)', margin:0, fontSize:'var(--text-xs)', color:'var(--primary-900)', lineHeight:1.7 }}>
                  <li>Sản phẩm được admin kiểm duyệt trước khi hiển thị công khai.</li>
                  <li>Mô tả phải trung thực — sai mô tả dẫn đến tranh chấp và khóa tài khoản.</li>
                  <li>Giao dịch được xác nhận bằng mã OTP tại điểm gặp mặt.</li>
                  <li><Link to="/transactions/guide" style={{ color:'var(--primary-700)', fontWeight:'var(--weight-medium)' }}>Xem đầy đủ hướng dẫn</Link></li>
                </ul>
              </div>
            </div>

            {/* Sidebar: ảnh + preview */}
            <div className="post-product-sidebar">
              <div className="post-field">
                <label className="post-label">Hình ảnh sản phẩm</label>
                <div className="post-image-upload">
                  <input type="file" ref={fileInputRef} accept="image/*" multiple onChange={handleFileUpload} style={{ display:'none' }} disabled={uploadingImages} />
                  <button type="button" className="post-file-upload-btn" onClick={() => fileInputRef.current?.click()} disabled={uploadingImages}>
                    {uploadingImages ? 'Đang tải ảnh…' : 'Chọn ảnh từ thiết bị'}
                  </button>
                  <div className="post-image-divider"><span>hoặc dán link ảnh</span></div>
                  <div className="post-image-url-row">
                    <input type="text" name="imageUrl" className="post-input" placeholder="Dán link ảnh (URL)..." value={form.imageUrl} onChange={handleChange}
                      onKeyDown={e => { if (e.key==='Enter') { e.preventDefault(); handleImageUrlAdd(); } }} />
                    <button type="button" className="post-image-add-btn" onClick={handleImageUrlAdd}>+ Thêm</button>
                  </div>
                  <span className="post-hint">Tối đa 5 ảnh · 5MB/ảnh — ảnh tải lên lưu trên server (không nhét base64 vào DB)</span>
                  {imageUrls.length > 0 && (
                    <div className="post-image-preview-grid">
                      {imageUrls.map((url, idx) => (
                        <div key={idx} className="post-image-preview-item">
                          <img src={url} alt={`Ảnh ${idx+1}`} onError={e => { e.target.src='https://via.placeholder.com/150?text=Loi'; }} />
                          <button type="button" className="post-image-remove-btn" onClick={() => removeImage(idx)}>Xóa</button>
                          {idx === 0 && <span className="post-image-main-badge">Ảnh chính</span>}
                        </div>
                      ))}
                    </div>
                  )}
                  {imageUrls.length === 0 && (
                    <div className="post-image-empty">
                      <p>Chưa có ảnh nào</p>
                      <p className="post-hint">Thêm ảnh để thu hút người mua</p>
                    </div>
                  )}
                </div>
              </div>

              <div className="post-preview-card">
                <h3 className="post-preview-title">Xem trước</h3>
                <div className="post-preview-content">
                  {imageUrls[0] ? (
                    <img className="post-preview-image" src={imageUrls[0]} alt="Preview" onError={e => { e.target.src='https://via.placeholder.com/300x180?text=EduCycle'; }} />
                  ) : (
                    <div className="post-preview-image-placeholder">Chưa có ảnh</div>
                  )}
                  <div className="post-preview-info">
                    <h4 className="post-preview-name">{form.name || 'Tên sản phẩm...'}</h4>
                    <div className="post-preview-meta">
                      {form.category && (
                        <span className="post-preview-badge">
                          {getCategoryDisplayLabel(form.category) || form.category}
                        </span>
                      )}
                      {form.condition && <span className="post-preview-condition">{form.condition}</span>}
                    </div>
                    <div className="post-preview-price" style={{ color: priceType==='contact' ? 'var(--accent-500)' : 'inherit' }}>
                      {pricePreview}
                    </div>
                    <div className="post-preview-seller">bởi <strong>{user?.username || 'Bạn'}</strong></div>
                  </div>
                </div>
              </div>

              <div className="post-tips">
                <h4 className="post-tips-title">Mẹo đăng bán hiệu quả</h4>
                <ul className="post-tips-list">
                  <li>Chụp ảnh rõ ràng, đủ sáng</li>
                  <li>Mô tả tình trạng thật chi tiết</li>
                  <li>Giá hợp lý: 40–60% giá gốc với sách đã dùng</li>
                  <li>Ghi rõ địa điểm giao dịch thuận tiện</li>
                </ul>
              </div>
            </div>
          </div>

          <div className="post-actions">
            <button type="button" className="post-btn-cancel" onClick={() => navigate(-1)}>Hủy</button>
            <button type="submit" className="post-btn-submit" disabled={isSubmitting || uploadingImages}>
              {isSubmitting ? 'Đang lưu…' : isEditMode ? 'Lưu thay đổi' : 'Đăng bán ngay'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

