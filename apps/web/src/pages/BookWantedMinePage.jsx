import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { bookWantedApi } from '../api/endpoints';
import { extractPage } from '../utils/pageApi';
import { useToast } from '../components/Toast';
import { getApiErrorMessage } from '../utils/apiError';
import './BookWantedPages.css';

const PAGE_SIZE = 12;

export default function BookWantedMinePage() {
  const toast = useToast();
  const queryClient = useQueryClient();
  const [page, setPage] = useState(0);
  const [pending, setPending] = useState(null);

  const { data, isPending } = useQuery({
    queryKey: ['book-wanted', 'mine', page],
    queryFn: async () => {
      const res = await bookWantedApi.listMine({ page, size: PAGE_SIZE });
      return extractPage(res);
    },
    staleTime: 60_000,
  });

  const posts = data?.content ?? [];
  const totalPages = data?.totalPages ?? 0;
  const last = data?.last ?? true;

  const handleConfirmDelete = async (postId) => {
    try {
      await bookWantedApi.delete(postId);
      toast.success('Đã xóa tin.');
      setPending(null);
      queryClient.invalidateQueries({ queryKey: ['book-wanted'] });
    } catch (err) {
      toast.error(getApiErrorMessage(err, 'Không xóa được tin.'));
    }
  };

  const handleConfirmClose = async (postId) => {
    try {
      await bookWantedApi.update(postId, { status: 'CLOSED' });
      toast.success('Đã đóng tin.');
      setPending(null);
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

      <div aria-live="polite" aria-atomic="true">
        {isPending && (
          <ul className="bw-mine-skeleton-list" aria-hidden="true">
            {Array.from({ length: 4 }, (_, i) => (
              <li key={i} className="bw-detail bw-card--skeleton" />
            ))}
          </ul>
        )}

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

                  {pending?.type === 'delete' && pending.id === id && (
                    <div className="bw-confirm-bar" role="alert">
                      <p className="bw-confirm-bar__text">Xóa vĩnh viễn tin này?</p>
                      <div className="bw-confirm-bar__actions">
                        <button type="button" className="bw-btn bw-btn--danger" onClick={() => handleConfirmDelete(id)}>
                          Xác nhận xóa
                        </button>
                        <button type="button" className="bw-btn bw-btn--ghost" onClick={() => setPending(null)}>
                          Huỷ
                        </button>
                      </div>
                    </div>
                  )}

                  {pending?.type === 'close' && pending.id === id && (
                    <div className="bw-confirm-bar" role="alert">
                      <p className="bw-confirm-bar__text">Đóng tin này?</p>
                      <div className="bw-confirm-bar__actions">
                        <button type="button" className="bw-btn bw-btn--primary" onClick={() => handleConfirmClose(id)}>
                          Xác nhận đóng
                        </button>
                        <button type="button" className="bw-btn bw-btn--ghost" onClick={() => setPending(null)}>
                          Huỷ
                        </button>
                      </div>
                    </div>
                  )}

                  {(!pending || pending.id !== id) && (
                    <div className="bw-detail__actions" style={{ marginTop: 0 }}>
                      <Link to={`/book-wanted/${id}/edit`} className="bw-btn bw-btn--primary">
                        Sửa
                      </Link>
                      <Link to={`/book-wanted/${id}`} className="bw-btn bw-btn--ghost">
                        Xem
                      </Link>
                      {st === 'OPEN' && (
                        <button type="button" className="bw-btn bw-btn--ghost" onClick={() => setPending({ type: 'close', id })}>
                          Đóng tin
                        </button>
                      )}
                      <button type="button" className="bw-btn bw-btn--danger" onClick={() => setPending({ type: 'delete', id })}>
                        Xóa
                      </button>
                    </div>
                  )}
                </li>
              );
            })}
          </ul>
        )}

        {!isPending && totalPages > 1 && (
          <div className="bw-pagination">
            <button
              type="button"
              className="bw-btn bw-btn--ghost"
              disabled={page <= 0}
              onClick={() => setPage((x) => Math.max(0, x - 1))}
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
              onClick={() => setPage((x) => x + 1)}
            >
              Sau
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
