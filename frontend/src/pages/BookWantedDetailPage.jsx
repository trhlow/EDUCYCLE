import { useParams, Link, useNavigate } from 'react-router-dom';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { bookWantedApi } from '../api/endpoints';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../components/Toast';
import { getApiErrorMessage } from '../utils/apiError';
import './BookWantedPages.css';

export default function BookWantedDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  const toast = useToast();
  const queryClient = useQueryClient();

  const { data: post, isPending, isError } = useQuery({
    queryKey: ['book-wanted', id],
    enabled: Boolean(id),
    queryFn: async () => {
      const res = await bookWantedApi.getById(id);
      return res.data;
    },
  });

  const status = post?.status?.toUpperCase() ?? 'OPEN';
  const ownerId = post?.requesterUserId != null ? String(post.requesterUserId) : '';
  const isOwner = isAuthenticated && user?.id && ownerId === String(user.id);

  const handleClose = async () => {
    if (!window.confirm('Đóng tin này? Người khác sẽ không thấy trong danh sách đang tìm.')) return;
    try {
      await bookWantedApi.update(id, { status: 'CLOSED' });
      toast.success('Đã đóng tin.');
      queryClient.invalidateQueries({ queryKey: ['book-wanted'] });
      navigate('/book-wanted/mine');
    } catch (err) {
      toast.error(getApiErrorMessage(err, 'Không đóng được tin.'));
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('Xóa vĩnh viễn tin này?')) return;
    try {
      await bookWantedApi.delete(id);
      toast.success('Đã xóa tin.');
      queryClient.invalidateQueries({ queryKey: ['book-wanted'] });
      navigate('/book-wanted/mine');
    } catch (err) {
      toast.error(getApiErrorMessage(err, 'Không xóa được tin.'));
    }
  };

  if (isPending) {
    return (
      <div className="bw-page">
        <p className="bw-empty">Đang tải…</p>
      </div>
    );
  }

  if (isError || !post) {
    return (
      <div className="bw-page">
        <p className="bw-empty">Không tìm thấy tin.</p>
        <Link to="/book-wanted" className="bw-btn bw-btn--primary" style={{ marginTop: 'var(--space-4)', display: 'inline-flex' }}>
          Về danh sách
        </Link>
      </div>
    );
  }

  return (
    <div className="bw-page">
      <div className="bw-breadcrumb">
        <Link to="/book-wanted">Tìm sách</Link>
        <span> / </span>
        <span>{post.title}</span>
      </div>

      <article className="bw-detail">
        <h1 className="bw-page__title" style={{ marginBottom: 'var(--space-3)' }}>
          {post.title}
        </h1>
        <p style={{ fontSize: 'var(--text-sm)', color: 'var(--text-secondary)', marginBottom: 'var(--space-4)' }}>
          <span className={`bw-badge ${status === 'OPEN' ? 'bw-badge--open' : 'bw-badge--closed'}`}>
            {status === 'OPEN' ? 'Đang tìm' : 'Đã đóng'}
          </span>
          {post.category && (
            <span style={{ marginLeft: 'var(--space-3)' }}>Danh mục: {post.category}</span>
          )}
          {post.createdAt && (
            <span style={{ marginLeft: 'var(--space-3)' }}>
              Đăng: {new Date(post.createdAt).toLocaleString('vi-VN')}
            </span>
          )}
        </p>
        {post.description && (
          <div style={{ fontSize: 'var(--text-base)', color: 'var(--text-primary)', whiteSpace: 'pre-wrap', lineHeight: 'var(--leading-relaxed)' }}>
            {post.description}
          </div>
        )}
        <p style={{ marginTop: 'var(--space-6)', fontSize: 'var(--text-sm)', color: 'var(--text-secondary)' }}>
          Người đăng: <strong>{post.requesterMaskedUsername || 'Ẩn danh'}</strong>
          {ownerId && (
            <>
              {' '}
              ·{' '}
              <Link to={`/users/${ownerId}`}>Xem hồ sơ công khai</Link>
            </>
          )}
        </p>

        {isOwner && (
          <div className="bw-detail__actions">
            <Link to={`/book-wanted/${id}/edit`} className="bw-btn bw-btn--primary">
              Sửa tin
            </Link>
            {status === 'OPEN' && (
              <button type="button" className="bw-btn bw-btn--ghost" onClick={handleClose}>
                Đóng tin
              </button>
            )}
            <button type="button" className="bw-btn bw-btn--danger" onClick={handleDelete}>
              Xóa tin
            </button>
          </div>
        )}
      </article>
    </div>
  );
}
