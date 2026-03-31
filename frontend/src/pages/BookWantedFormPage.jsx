import { useState, useEffect, useMemo, useRef } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { bookWantedApi, categoriesApi } from '../api/endpoints';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../components/Toast';
import { getApiErrorMessage } from '../utils/apiError';
import { NAV_CATALOG, getCategoryDisplayLabel } from '../components/layout/navbarCatalogConfig';
import './BookWantedPages.css';

const FALLBACK_CATEGORY_OPTIONS = [
  { value: '', label: '— Không chọn —' },
  ...NAV_CATALOG.map((n) => ({ value: n.category, label: n.label })),
];

export default function BookWantedFormPage() {
  const { id: editId } = useParams();
  const isEdit = Boolean(editId);
  const navigate = useNavigate();
  const { user } = useAuth();
  const toast = useToast();
  const toastRef = useRef(toast);
  toastRef.current = toast;

  const [loading, setLoading] = useState(isEdit);
  const [submitting, setSubmitting] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('');
  const [titleError, setTitleError] = useState('');
  const [categoryOptions, setCategoryOptions] = useState(FALLBACK_CATEGORY_OPTIONS);

  useEffect(() => {
    categoriesApi
      .getAll()
      .then((res) => {
        const data = Array.isArray(res.data) ? res.data : [];
        if (data.length === 0) return;
        setCategoryOptions([
          { value: '', label: '— Không chọn —' },
          ...data
            .map((c) => {
              const name = c.name || c.Name || '';
              return {
                value: name,
                label: getCategoryDisplayLabel(name) || name,
              };
            })
            .filter((o) => o.value),
        ]);
      })
      .catch(() => {});
  }, []);

  const selectCategoryOptions = useMemo(() => {
    const known = new Set(categoryOptions.map((o) => o.value).filter(Boolean));
    const c = category.trim();
    if (c && !known.has(c)) {
      return [
        ...categoryOptions,
        { value: c, label: `${c} (danh mục đã lưu trước)` },
      ];
    }
    return categoryOptions;
  }, [categoryOptions, category]);

  useEffect(() => {
    if (!isEdit || !editId) return;
    if (!user?.id) return;

    let cancelled = false;
    (async () => {
      setLoading(true);
      try {
        const res = await bookWantedApi.getById(editId);
        if (cancelled) return;
        const p = res.data;
        const owner = p.requesterUserId != null ? String(p.requesterUserId) : '';
        if (String(user.id) !== owner) {
          toastRef.current.error('Bạn không thể sửa tin này.');
          navigate(`/book-wanted/${editId}`);
          return;
        }
        setTitle(p.title || '');
        setDescription(p.description || '');
        setCategory((p.category || '').trim());
      } catch {
        if (!cancelled) {
          toastRef.current.error('Không tải được tin.');
          navigate('/book-wanted');
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, [isEdit, editId, user?.id, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const t = title.trim();
    if (!t) {
      setTitleError('Vui lòng nhập tiêu đề.');
      return;
    }
    setTitleError('');
    setSubmitting(true);
    try {
      if (isEdit) {
        await bookWantedApi.update(editId, {
          title: t,
          description: description.trim(),
          category: category.trim(),
        });
        toast.success('Đã cập nhật tin.');
        navigate(`/book-wanted/${editId}`);
      } else {
        const res = await bookWantedApi.create({
          title: t,
          description: description.trim() || undefined,
          category: category.trim() || undefined,
        });
        const newId = res.data?.id ?? res.data?.Id;
        toast.success('Đã đăng tin tìm sách.');
        navigate(newId ? `/book-wanted/${newId}` : '/book-wanted/mine');
      }
    } catch (err) {
      toast.error(getApiErrorMessage(err, 'Không lưu được. Vui lòng thử lại.'));
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="bw-page">
        <p className="bw-empty">Đang tải…</p>
      </div>
    );
  }

  return (
    <div className="bw-page">
      <div className="bw-breadcrumb">
        <Link to="/book-wanted">Tìm sách</Link>
        <span> / </span>
        <span>{isEdit ? 'Sửa tin' : 'Đăng tin mới'}</span>
      </div>

      <h1 className="bw-page__title">{isEdit ? 'Sửa tin tìm sách' : 'Đăng tin tìm sách'}</h1>
      <p className="bw-page__lead" style={{ marginBottom: 'var(--space-6)' }}>
        Mô tả rõ tên sách, môn học hoặc tài liệu bạn cần để người có sách dễ liên hệ.
      </p>

      <form className="bw-form" onSubmit={handleSubmit}>
        <div>
          <label htmlFor="bw-title">Tiêu đề *</label>
          <input
            id="bw-title"
            value={title}
            onChange={(e) => { setTitle(e.target.value); if (titleError) setTitleError(''); }}
            maxLength={300}
            autoComplete="off"
          />
          {titleError && <p className="bw-form__error">{titleError}</p>}
        </div>
        <div>
          <label htmlFor="bw-category">Danh mục (tuỳ chọn)</label>
          <select
            id="bw-category"
            value={selectCategoryOptions.some((o) => o.value === category) ? category : ''}
            onChange={(e) => setCategory(e.target.value)}
            aria-label="Chọn danh mục sách cần tìm"
          >
            {selectCategoryOptions.map((o) => (
              <option key={o.value ? o.value : '__empty'} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
          <p className="bw-page__lead" style={{ marginTop: 'var(--space-2)', marginBottom: 0 }}>
            Chọn đúng danh mục giống khi đăng bán để dễ khớp với người có sách.
          </p>
        </div>
        <div>
          <label htmlFor="bw-desc">Mô tả chi tiết</label>
          <textarea
            id="bw-desc"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            maxLength={8000}
            placeholder="Tên sách, tác giả, phiên bản, khu vực nhận sách…"
          />
        </div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--space-3)' }}>
          <button type="submit" className="bw-btn bw-btn--primary" disabled={submitting}>
            {submitting ? 'Đang lưu…' : isEdit ? 'Cập nhật' : 'Đăng tin'}
          </button>
          <Link to={isEdit ? `/book-wanted/${editId}` : '/book-wanted'} className="bw-btn bw-btn--ghost">
            Huỷ
          </Link>
        </div>
      </form>
    </div>
  );
}
