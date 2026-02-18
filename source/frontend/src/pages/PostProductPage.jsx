import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../components/Toast';
import { productsApi, categoriesApi } from '../api/endpoints';
import './PostProductPage.css';

/* ── Phone Verification Modal ── */
function PhoneVerifyModal({ onVerified, onClose }) {
  const [step, setStep] = useState('input'); // input | otp
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [sending, setSending] = useState(false);
  const { verifyPhone } = useAuth();
  const toast = useToast();

  const handleSendOtp = () => {
    if (!/^(0[3-9])[0-9]{8}$/.test(phone)) {
      toast.error('Số điện thoại không hợp lệ (VD: 0912345678)');
      return;
    }
    setSending(true);
    // Mock: simulate sending OTP
    setTimeout(() => {
      setSending(false);
      setStep('otp');
      toast.success('Mã OTP đã gửi đến ' + phone);
    }, 1000);
  };

  const handleVerify = async () => {
    if (otp.length < 4) {
      toast.error('Vui lòng nhập mã OTP (4-6 số)');
      return;
    }
    setSending(true);
    const ok = await verifyPhone(phone, otp);
    setSending(false);
    if (ok) {
      toast.success('Xác thực số điện thoại thành công!');
      onVerified();
    } else {
      toast.error('Mã OTP không đúng!');
    }
  };

  return (
    <div className="phone-modal-overlay" onClick={onClose}>
      <div className="phone-modal" onClick={(e) => e.stopPropagation()}>
        <button className="phone-modal-close" onClick={onClose}>✕</button>
        <div className="phone-modal-icon">📱</div>
        <h3 className="phone-modal-title">Xác Thực Số Điện Thoại</h3>
        <p className="phone-modal-desc">
          Bạn cần xác thực SĐT trước khi đăng bán để đảm bảo an toàn giao dịch
          và dễ dàng liên lạc khi cần.
        </p>

        {step === 'input' ? (
          <div className="phone-modal-form">
            <label className="phone-modal-label">Số điện thoại</label>
            <input
              type="tel"
              className="phone-modal-input"
              placeholder="0912 345 678"
              value={phone}
              onChange={(e) => setPhone(e.target.value.replace(/\s/g, ''))}
              maxLength={11}
            />
            <button
              className="phone-modal-btn"
              onClick={handleSendOtp}
              disabled={sending}
            >
              {sending ? '⏳ Đang gửi...' : '📤 Gửi Mã OTP'}
            </button>
          </div>
        ) : (
          <div className="phone-modal-form">
            <label className="phone-modal-label">Nhập mã OTP</label>
            <input
              type="text"
              className="phone-modal-input phone-modal-otp"
              placeholder="• • • • • •"
              value={otp}
              onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
              maxLength={6}
              autoFocus
            />
            <p className="phone-modal-hint">Mã OTP đã gửi đến {phone}</p>
            <button
              className="phone-modal-btn"
              onClick={handleVerify}
              disabled={sending}
            >
              {sending ? '⏳ Đang xác thực...' : '✅ Xác Nhận'}
            </button>
            <button
              type="button"
              className="phone-modal-btn-secondary"
              onClick={() => setStep('input')}
            >
              ← Đổi số khác
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

const FALLBACK_CATEGORIES = [
  { value: '', label: '-- Chọn danh mục --' },
  { value: 'Giáo Trình', label: 'Giáo Trình' },
  { value: 'Sách Chuyên Ngành', label: 'Sách Chuyên Ngành' },
  { value: 'Tài Liệu Ôn Thi', label: 'Tài Liệu Ôn Thi' },
  { value: 'Dụng Cụ Học Tập', label: 'Dụng Cụ Học Tập' },
  { value: 'Ngoại Ngữ', label: 'Ngoại Ngữ' },
  { value: 'Khác', label: 'Khác' },
];

const CONDITIONS = [
  { value: '', label: '-- Tình trạng --' },
  { value: 'Mới 100%', label: 'Mới 100% (chưa sử dụng)' },
  { value: 'Như mới (95%)', label: 'Như mới (95%)' },
  { value: 'Tốt (80-90%)', label: 'Tốt (80-90%)' },
  { value: 'Khá (60-80%)', label: 'Khá (60-80%)' },
  { value: 'Cũ (dưới 60%)', label: 'Cũ (dưới 60%)' },
];

export default function PostProductPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const toast = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [previewImages, setPreviewImages] = useState([]);
  const [uploadedFiles, setUploadedFiles] = useState([]);
  const [errors, setErrors] = useState({});
  const fileInputRef = useRef(null);
  const [categories, setCategories] = useState(FALLBACK_CATEGORIES);
  const [showPhoneModal, setShowPhoneModal] = useState(false);
  const isPhoneVerified = user?.phoneVerified === true;

  const [form, setForm] = useState({
    name: '',
    category: '',
    categoryId: '',
    condition: '',
    price: '',
    description: '',
    contactNote: '',
    imageUrl: '',
  });

  // Fetch categories from API
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await categoriesApi.getAll();
        const data = Array.isArray(res.data) ? res.data : [];
        if (data.length > 0) {
          setCategories([
            { value: '', label: '-- Chọn danh mục --', id: '' },
            ...data.map((c) => ({
              value: c.name || c.Name || '',
              label: c.name || c.Name || '',
              id: c.id || c.Id || '',
            })),
          ]);
        }
      } catch {
        // Keep fallback categories
      }
    };
    fetchCategories();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === 'category') {
      const cat = categories.find((c) => c.value === value);
      setForm((prev) => ({ ...prev, category: value, categoryId: cat?.id || '' }));
    } else {
      setForm((prev) => ({ ...prev, [name]: value }));
    }
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  const handleImageUrlAdd = () => {
    const url = form.imageUrl.trim();
    if (!url) return;
    if (previewImages.length >= 5) {
      toast.error('Tối đa 5 ảnh');
      return;
    }
    setPreviewImages((prev) => [...prev, url]);
    setUploadedFiles((prev) => [...prev, null]);
    setForm((prev) => ({ ...prev, imageUrl: '' }));
  };

  const handleFileUpload = (e) => {
    const files = Array.from(e.target.files);
    if (!files.length) return;

    const remaining = 5 - previewImages.length;
    if (remaining <= 0) {
      toast.error('Tối đa 5 ảnh');
      return;
    }

    const filesToAdd = files.slice(0, remaining);
    if (files.length > remaining) {
      toast.info(`Chỉ thêm được ${remaining} ảnh nữa (tối đa 5)`);
    }

    filesToAdd.forEach((file) => {
      if (!file.type.startsWith('image/')) {
        toast.error(`"${file.name}" không phải là file ảnh`);
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        toast.error(`"${file.name}" vượt quá 5MB`);
        return;
      }

      const reader = new FileReader();
      reader.onload = (event) => {
        setPreviewImages((prev) => [...prev, event.target.result]);
        setUploadedFiles((prev) => [...prev, file]);
      };
      reader.readAsDataURL(file);
    });

    // Reset input để có thể chọn lại cùng file
    e.target.value = '';
  };

  const removeImage = (index) => {
    setPreviewImages((prev) => prev.filter((_, i) => i !== index));
    setUploadedFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const validate = () => {
    const newErrors = {};
    if (!form.name.trim()) newErrors.name = 'Tên sản phẩm là bắt buộc';
    if (form.name.trim().length > 0 && form.name.trim().length < 5)
      newErrors.name = 'Tên sản phẩm phải có ít nhất 5 ký tự';
    if (!form.category) newErrors.category = 'Vui lòng chọn danh mục';
    if (!form.condition) newErrors.condition = 'Vui lòng chọn tình trạng';
    if (!form.price || Number(form.price) <= 0)
      newErrors.price = 'Giá phải lớn hơn 0';
    if (Number(form.price) > 10000000)
      newErrors.price = 'Giá không được vượt quá 10.000.000đ';
    if (!form.description.trim())
      newErrors.description = 'Mô tả sản phẩm là bắt buộc';
    if (form.description.trim().length > 0 && form.description.trim().length < 20)
      newErrors.description = 'Mô tả phải có ít nhất 20 ký tự';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Gate: must verify phone first
    if (!isPhoneVerified) {
      setShowPhoneModal(true);
      return;
    }

    if (!validate()) {
      toast.error('Vui lòng kiểm tra lại thông tin');
      return;
    }

    setIsSubmitting(true);
    try {
      const hasFiles = uploadedFiles.some((f) => f !== null);

      let res;
      if (hasFiles) {
        // Gửi qua FormData khi có file upload
        const formData = new FormData();
        formData.append('name', form.name.trim());
        formData.append('category', form.category);
        if (form.categoryId) formData.append('categoryId', form.categoryId);
        formData.append('condition', form.condition);
        formData.append('price', Number(form.price));
        formData.append('description', form.description.trim());
        if (form.contactNote.trim()) formData.append('contactNote', form.contactNote.trim());

        uploadedFiles.forEach((file, index) => {
          if (file) {
            formData.append('images', file);
          } else if (previewImages[index]) {
            formData.append('imageUrls', previewImages[index]);
          }
        });

        res = await productsApi.create(formData);
      } else {
        const payload = {
          name: form.name.trim(),
          category: form.category,
          categoryId: form.categoryId || undefined,
          condition: form.condition,
          price: Number(form.price),
          description: form.description.trim(),
          contactNote: form.contactNote.trim() || undefined,
          imageUrls: previewImages.length > 0 ? previewImages : undefined,
          imageUrl: previewImages[0] || undefined,
        };
        res = await productsApi.create(payload);
      }
      toast.success('Đăng sản phẩm thành công! 🎉');
      const newId = res.data?.id || res.data?.Id;
      navigate(newId ? `/products/${newId}` : '/products');
    } catch (err) {
      // Mock success when backend is unavailable
      const isNetworkError =
        err.code === 'ERR_NETWORK' ||
        err.message?.includes('Network Error') ||
        !err.response;

      if (isNetworkError) {
        toast.success('Đăng sản phẩm thành công! 🎉 (chế độ demo)');
        navigate('/products');
        return;
      }

      const msg =
        err.response?.data?.message ||
        err.response?.data?.Message ||
        'Đăng sản phẩm thất bại. Vui lòng thử lại.';
      toast.error(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatPrice = (value) => {
    if (!value) return '';
    return Number(value).toLocaleString('vi-VN');
  };

  return (
    <div className="post-product-page">
      <div className="post-product-container">
        {/* Header */}
        <div className="post-product-header">
          <h1 className="post-product-title">📦 Đăng Bán Sản Phẩm</h1>
          <p className="post-product-subtitle">
            Đăng sách, tài liệu hoặc dụng cụ học tập bạn muốn trao đổi với sinh viên khác
          </p>
        </div>

        <form className="post-product-form" onSubmit={handleSubmit}>
          <div className="post-product-grid">
            {/* Left Column - Main Info */}
            <div className="post-product-main">
              {/* Product Name */}
              <div className="post-field">
                <label className="post-label" htmlFor="name">
                  Tên sản phẩm <span className="post-required">*</span>
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  className={`post-input ${errors.name ? 'error' : ''}`}
                  placeholder="VD: Giáo trình Giải tích 1 – Nguyễn Đình Trí"
                  value={form.name}
                  onChange={handleChange}
                  maxLength={150}
                />
                {errors.name && <span className="post-error">{errors.name}</span>}
                <span className="post-hint">{form.name.length}/150 ký tự</span>
              </div>

              {/* Category + Condition Row */}
              <div className="post-row">
                <div className="post-field">
                  <label className="post-label" htmlFor="category">
                    Danh mục <span className="post-required">*</span>
                  </label>
                  <select
                    id="category"
                    name="category"
                    className={`post-select ${errors.category ? 'error' : ''}`}
                    value={form.category}
                    onChange={handleChange}
                  >
                    {categories.map((cat) => (
                      <option key={cat.value} value={cat.value}>
                        {cat.label}
                      </option>
                    ))}
                  </select>
                  {errors.category && <span className="post-error">{errors.category}</span>}
                </div>

                <div className="post-field">
                  <label className="post-label" htmlFor="condition">
                    Tình trạng <span className="post-required">*</span>
                  </label>
                  <select
                    id="condition"
                    name="condition"
                    className={`post-select ${errors.condition ? 'error' : ''}`}
                    value={form.condition}
                    onChange={handleChange}
                  >
                    {CONDITIONS.map((cond) => (
                      <option key={cond.value} value={cond.value}>
                        {cond.label}
                      </option>
                    ))}
                  </select>
                  {errors.condition && <span className="post-error">{errors.condition}</span>}
                </div>
              </div>

              {/* Price */}
              <div className="post-field">
                <label className="post-label" htmlFor="price">
                  Giá bán (VNĐ) <span className="post-required">*</span>
                </label>
                <div className="post-price-input-wrapper">
                  <input
                    type="number"
                    id="price"
                    name="price"
                    className={`post-input post-price-input ${errors.price ? 'error' : ''}`}
                    placeholder="VD: 45000"
                    value={form.price}
                    onChange={handleChange}
                    min={0}
                    max={10000000}
                    step={1000}
                  />
                  <span className="post-price-suffix">đ</span>
                </div>
                {errors.price && <span className="post-error">{errors.price}</span>}
                {form.price > 0 && (
                  <span className="post-hint">= {formatPrice(form.price)}đ</span>
                )}
              </div>

              {/* Description */}
              <div className="post-field">
                <label className="post-label" htmlFor="description">
                  Mô tả chi tiết <span className="post-required">*</span>
                </label>
                <textarea
                  id="description"
                  name="description"
                  className={`post-textarea ${errors.description ? 'error' : ''}`}
                  placeholder="Mô tả tình trạng sách, nội dung chính, lý do bán, ghi chú thêm... Càng chi tiết càng dễ bán!"
                  value={form.description}
                  onChange={handleChange}
                  rows={6}
                  maxLength={2000}
                />
                {errors.description && <span className="post-error">{errors.description}</span>}
                <span className="post-hint">{form.description.length}/2000 ký tự</span>
              </div>

              {/* Contact Note */}
              <div className="post-field">
                <label className="post-label" htmlFor="contactNote">
                  Ghi chú giao dịch <span className="post-optional">(tùy chọn)</span>
                </label>
                <input
                  type="text"
                  id="contactNote"
                  name="contactNote"
                  className="post-input"
                  placeholder="VD: Giao dịch tại cổng trường ĐH Bách Khoa, buổi chiều"
                  value={form.contactNote}
                  onChange={handleChange}
                  maxLength={200}
                />
                <span className="post-hint">
                  Thông tin này sẽ hiển thị trên trang sản phẩm. Không chia sẻ SĐT hay thông tin cá nhân.
                </span>
              </div>
            </div>

            {/* Right Column - Images & Preview */}
            <div className="post-product-sidebar">
              {/* Images */}
              <div className="post-field">
                <label className="post-label">Hình ảnh sản phẩm</label>
                <div className="post-image-upload">
                  {/* File upload button */}
                  <input
                    type="file"
                    ref={fileInputRef}
                    accept="image/*"
                    multiple
                    onChange={handleFileUpload}
                    style={{ display: 'none' }}
                  />
                  <button
                    type="button"
                    className="post-file-upload-btn"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    📁 Chọn ảnh từ thiết bị
                  </button>

                  <div className="post-image-divider">
                    <span>hoặc dán link ảnh</span>
                  </div>

                  <div className="post-image-url-row">
                    <input
                      type="text"
                      name="imageUrl"
                      className="post-input"
                      placeholder="Dán link ảnh (URL)..."
                      value={form.imageUrl}
                      onChange={handleChange}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          handleImageUrlAdd();
                        }
                      }}
                    />
                    <button
                      type="button"
                      className="post-image-add-btn"
                      onClick={handleImageUrlAdd}
                    >
                      + Thêm
                    </button>
                  </div>
                  <span className="post-hint">Tối đa 5 ảnh (mỗi ảnh tối đa 5MB). Hỗ trợ JPG, PNG, GIF, WebP.</span>

                  {previewImages.length > 0 && (
                    <div className="post-image-preview-grid">
                      {previewImages.map((url, index) => (
                        <div key={index} className="post-image-preview-item">
                          <img
                            src={url}
                            alt={`Ảnh ${index + 1}`}
                            onError={(e) => {
                              e.target.src = 'https://via.placeholder.com/150?text=L%E1%BB%97i+%E1%BA%A3nh';
                            }}
                          />
                          <button
                            type="button"
                            className="post-image-remove-btn"
                            onClick={() => removeImage(index)}
                            title="Xóa ảnh"
                          >
                            ✕
                          </button>
                          {index === 0 && (
                            <span className="post-image-main-badge">Ảnh chính</span>
                          )}
                        </div>
                      ))}
                    </div>
                  )}

                  {previewImages.length === 0 && (
                    <div className="post-image-empty">
                      <span className="post-image-empty-icon">📷</span>
                      <p>Chưa có ảnh nào</p>
                      <p className="post-hint">Thêm ảnh để thu hút người mua hơn</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Preview Card */}
              <div className="post-preview-card">
                <h3 className="post-preview-title">👁️ Xem trước</h3>
                <div className="post-preview-content">
                  {previewImages[0] ? (
                    <img
                      className="post-preview-image"
                      src={previewImages[0]}
                      alt="Preview"
                      onError={(e) => {
                        e.target.src = 'https://via.placeholder.com/300x180?text=EduCycle';
                      }}
                    />
                  ) : (
                    <div className="post-preview-image-placeholder">📚</div>
                  )}
                  <div className="post-preview-info">
                    <h4 className="post-preview-name">
                      {form.name || 'Tên sản phẩm...'}
                    </h4>
                    <div className="post-preview-meta">
                      {form.category && (
                        <span className="post-preview-badge">{form.category}</span>
                      )}
                      {form.condition && (
                        <span className="post-preview-condition">{form.condition}</span>
                      )}
                    </div>
                    <div className="post-preview-price">
                      {form.price > 0
                        ? `${formatPrice(form.price)}đ`
                        : '---'}
                    </div>
                    <div className="post-preview-seller">
                      bởi <strong>{user?.username || 'Bạn'}</strong>
                    </div>
                  </div>
                </div>
              </div>

              {/* Tips */}
              <div className="post-tips">
                <h4 className="post-tips-title">💡 Mẹo đăng bán hiệu quả</h4>
                <ul className="post-tips-list">
                  <li>Chụp ảnh rõ ràng, đủ sáng</li>
                  <li>Mô tả tình trạng thật chi tiết (% mới, có ghi chú không, v.v.)</li>
                  <li>Đặt giá hợp lý (40-60% giá gốc với sách đã dùng)</li>
                  <li>Ghi rõ địa điểm giao dịch thuận tiện</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Submit */}
          <div className="post-actions">
            <button
              type="button"
              className="post-btn-cancel"
              onClick={() => navigate(-1)}
            >
              Hủy
            </button>
            {!isPhoneVerified && (
              <button
                type="button"
                className="post-btn-verify"
                onClick={() => setShowPhoneModal(true)}
              >
                📱 Xác thực SĐT để đăng bán
              </button>
            )}
            <button
              type="submit"
              className="post-btn-submit"
              disabled={isSubmitting}
            >
              {isSubmitting ? '⏳ Đang đăng...' : '📤 Đăng Bán Ngay'}
            </button>
          </div>
        </form>
      </div>

      {/* Phone Verification Modal */}
      {showPhoneModal && (
        <PhoneVerifyModal
          onVerified={() => setShowPhoneModal(false)}
          onClose={() => setShowPhoneModal(false)}
        />
      )}
    </div>
  );
}
