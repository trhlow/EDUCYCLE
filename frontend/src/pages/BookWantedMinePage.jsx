import { Link } from 'react-router-dom';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { bookWantedApi } from '../api/endpoints';
import { extractPage } from '../utils/pageApi';
import { useToast } from '../components/Toast';
import { getApiErrorMessage } from '../utils/apiError';
import './BookWantedPages.css';

export default function BookWantedMinePage() {
  const toast = useToast();
  const queryClient = useQueryClient();

  const { data, isPending } = useQuery({
    queryKey: ['book-wanted', 'mine', 0],
    queryFn: async () => {
      const res = await bookWantedApi.listMine({ page: 0, size: 50 });
      return extractPage(res);
    },
  });

  const posts = data?.content ?? [];

  const handleDelete = async (postId) => {
    if (!window.confirm('Xóa vĩnh viễn tin này?')) return;
    try {
      await bookWantedApi.delete(postId);
      toast.success('Đã xóa tin.');
      queryClient.invalidateQueries({ queryKey: ['book-wanted'] });
    } catch (err) {
      toast.error(getApiErrorMessage(err, 'Không xóa được tin.'));
    }
  };

  const handleClose = async (postId) => {
    if (!window.confirm('Đóng tin này?')) return;
    try {
      await bookWantedApi.update(postId, { status: 'CLOSED' });
      toast.success('Đã đóng tin.');
      queryClient.invalidateQueries({ queryKey: ['book-wanted'] });
    } catch (err) {
      toast.error(getApiErrorMessage(err, 'Không đóng được tin.'));
    }
  };

  return (
    <div className="bw-page">
      <div className="bw-page__head">
        <div>
          <h1 className="bw-page__title">Tin tìm sách của tôi</h1>
          <p className="bw-page__lead">Quản lý các nhu cầu bạn đã đăng.</p>
        </div>
        <div className="bw-toolbar">
          <Link to="/book-wanted" className="bw-btn bw-btn--ghost">
            Xem tất cả tin
          </Link>
          <Link to="/book-wanted/new" className="bw-btn bw-btn--primary">
            Đăng tin mới
          </Link>
        </div>
      </div>

      {isPending && <p className="bw-empty">Đang tải…</p>}

      {!isPending && posts.length === 0 && (
        <div className="bw-empty">
          <p>Bạn chưa có tin nào.</p>
          <Link to="/book-wanted/new" className="bw-btn bw-btn--primary" style={{ marginTop: 'var(--space-4)' }}>
            Đăng tin tìm sách
          </Link>
        </div>
      )}

      {!isPending && posts.length > 0 && (
        <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
          {posts.map((p) => {
            const id = String(p.id);
            const st = (p.status || 'OPEN').toUpperCase();
            return (
              <li
                key={id}
                className="bw-detail"
                style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}
              >
                <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', gap: 'var(--space-3)', alignItems: 'flex-start' }}>
                  <div>
                    <Link to={`/book-wanted/${id}`} style={{ fontWeight: 600, fontSize: 'var(--text-base)', color: 'var(--text-primary)', textDecoration: 'none' }}>
                      {p.title}
                    </Link>
                    <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-tertiary)', marginTop: 'var(--space-1)' }}>
                      {p.createdAt && new Date(p.createdAt).toLocaleString('vi-VN')}
                      {p.category && ` · ${p.category}`}
                    </div>
                  </div>
                  <span className={`bw-badge ${st === 'OPEN' ? 'bw-badge--open' : 'bw-badge--closed'}`}>
                    {st === 'OPEN' ? 'Đang tìm' : 'Đã đóng'}
                  </span>
                </div>
                <div className="bw-detail__actions" style={{ marginTop: 0 }}>
                  <Link to={`/book-wanted/${id}/edit`} className="bw-btn bw-btn--primary">
                    Sửa
                  </Link>
                  <Link to={`/book-wanted/${id}`} className="bw-btn bw-btn--ghost">
                    Xem
                  </Link>
                  {st === 'OPEN' && (
                    <button type="button" className="bw-btn bw-btn--ghost" onClick={() => handleClose(id)}>
                      Đóng tin
                    </button>
                  )}
                  <button type="button" className="bw-btn bw-btn--danger" onClick={() => handleDelete(id)}>
                    Xóa
                  </button>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
