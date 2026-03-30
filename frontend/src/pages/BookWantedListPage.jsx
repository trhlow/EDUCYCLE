import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { bookWantedApi } from '../api/endpoints';
import { extractPage } from '../utils/pageApi';
import { useAuth } from '../contexts/AuthContext';
import './BookWantedPages.css';

const mapPost = (p) => ({
  id: String(p.id),
  title: p.title || '',
  description: p.description || '',
  category: p.category || '',
  status: (p.status || 'OPEN').toUpperCase(),
  createdAt: p.createdAt,
  requesterMaskedUsername: p.requesterMaskedUsername || 'Ẩn danh',
});

export default function BookWantedListPage() {
  const [page, setPage] = useState(0);
  const [qInput, setQInput] = useState('');
  const [q, setQ] = useState('');
  const { isAuthenticated } = useAuth();

  const { data, isPending } = useQuery({
    queryKey: ['book-wanted', 'open', page, q],
    queryFn: async () => {
      const res = await bookWantedApi.list({ page, size: 12, q: q.trim() || undefined });
      return extractPage(res);
    },
  });

  const posts = (data?.content ?? []).map(mapPost);
  const totalPages = data?.totalPages ?? 0;
  const last = data?.last ?? true;

  const handleSearch = (e) => {
    e.preventDefault();
    setPage(0);
    setQ(qInput.trim());
  };

  return (
    <div className="bw-page">
      <div className="bw-page__head">
        <div>
          <h1 className="bw-page__title">Tìm sách & tài liệu</h1>
          <p className="bw-page__lead">
            Sinh viên đăng nhu cầu cần mua hoặc tìm tài liệu. Bạn có sách phù hợp có thể xem hồ sơ công khai để liên hệ.
          </p>
        </div>
        <div className="bw-toolbar">
          {isAuthenticated && (
            <>
              <Link to="/book-wanted/mine" className="bw-btn bw-btn--ghost">
                Tin của tôi
              </Link>
              <Link to="/book-wanted/new" className="bw-btn bw-btn--primary">
                Đăng tin tìm sách
              </Link>
            </>
          )}
          {!isAuthenticated && (
            <Link to="/auth" className="bw-btn bw-btn--primary" state={{ from: '/book-wanted' }}>
              Đăng nhập để đăng tin
            </Link>
          )}
        </div>
      </div>

      <form className="bw-toolbar" onSubmit={handleSearch} style={{ marginBottom: 'var(--space-6)' }}>
        <input
          type="search"
          className="bw-search"
          placeholder="Tìm theo tiêu đề, mô tả…"
          value={qInput}
          onChange={(e) => setQInput(e.target.value)}
          aria-label="Từ khóa tìm tin tìm sách"
        />
        <button type="submit" className="bw-btn bw-btn--ghost">
          Tìm
        </button>
      </form>

      {isPending && <p className="bw-empty">Đang tải…</p>}

      {!isPending && posts.length === 0 && (
        <div className="bw-empty">
          <p>Chưa có tin nào đang mở.</p>
          {isAuthenticated && (
            <Link to="/book-wanted/new" className="bw-btn bw-btn--primary" style={{ marginTop: 'var(--space-4)' }}>
              Đăng tin đầu tiên
            </Link>
          )}
        </div>
      )}

      {!isPending && posts.length > 0 && (
        <div className="bw-grid">
          {posts.map((post) => (
            <Link key={post.id} to={`/book-wanted/${post.id}`} className="bw-card">
              <h2 className="bw-card__title">{post.title}</h2>
              <div className="bw-card__meta">
                {post.category && <span>{post.category} · </span>}
                <span>{post.requesterMaskedUsername}</span>
                {post.createdAt && (
                  <span>
                    {' '}
                    · {new Date(post.createdAt).toLocaleDateString('vi-VN')}
                  </span>
                )}
              </div>
              {post.description && <p className="bw-card__excerpt">{post.description}</p>}
              <span className={`bw-badge ${post.status === 'OPEN' ? 'bw-badge--open' : 'bw-badge--closed'}`}>
                {post.status === 'OPEN' ? 'Đang tìm' : 'Đã đóng'}
              </span>
            </Link>
          ))}
        </div>
      )}

      {!isPending && totalPages > 1 && (
        <div className="bw-pagination">
          <button
            type="button"
            className="bw-btn bw-btn--ghost"
            disabled={page <= 0}
            onClick={() => setPage((p) => Math.max(0, p - 1))}
          >
            Trước
          </button>
          <span style={{ fontSize: 'var(--text-sm)', color: 'var(--text-secondary)' }}>
            Trang {page + 1} / {totalPages}
          </span>
          <button
            type="button"
            className="bw-btn bw-btn--ghost"
            disabled={last}
            onClick={() => setPage((p) => p + 1)}
          >
            Sau
          </button>
        </div>
      )}
    </div>
  );
}
