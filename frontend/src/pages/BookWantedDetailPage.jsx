import { useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { bookWantedApi } from '../api/endpoints';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../components/Toast';
import { getApiErrorMessage } from '../utils/apiError';
import './BookWantedPages.css';

export default function BookWantedDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  const toast = useToast();
  const queryClient = useQueryClient();
  const [confirmAction, setConfirmAction] = useState(null);

  const { data: post, isPending, isError, error } = useQuery({
    queryKey: ['book-wanted', id],
    enabled: Boolean(id),
    staleTime: 60_000,
    queryFn: async () => {
      const res = await bookWantedApi.getById(id);
      return res.data;
    },
  });

  const statusForInquiries = post?.status?.toUpperCase() ?? '';
  const ownerForInquiries =
    isAuthenticated && user?.id && post?.requesterUserId != null
      && String(post.requesterUserId) === String(user.id);

  const { data: postInquiries = [] } = useQuery({
    queryKey: ['book-wanted', id, 'inquiries'],
    enabled: Boolean(id && ownerForInquiries && statusForInquiries === 'OPEN'),
    queryFn: async () => {
      const res = await bookWantedApi.listPostInquiries(id);
      return Array.isArray(res.data) ? res.data : [];
    },
  });

  const startInquiryMutation = useMutation({
    mutationFn: async () => {
      const res = await bookWantedApi.startInquiry(id);
      return res.data;
    },
    onSuccess: (data) => {
      const iid = data?.id;
      if (iid) navigate(`/book-wanted/inquiry/${iid}`);
      else toast.error('Không lấy được mã cuộc trao đổi.');
    },
    onError: (err) => {
      toast.error(getApiErrorMessage(err, 'Không bắt đầu được liên hệ.'));
    },
  });

  const handleStartContact = () => {
    if (!isAuthenticated) {
      navigate('/auth', { state: { from: `/book-wanted/${id}` } });
      return;
    }
    startInquiryMutation.mutate();
  };

  const statusCode = error?.response?.status;
  const status = post?.status?.toUpperCase() ?? 'OPEN';
  const ownerId = post?.requesterUserId != null ? String(post.requesterUserId) : '';
  const isOwner = isAuthenticated && user?.id && ownerId === String(user.id);

  const handleConfirmClose = async () => {
    try {
      await bookWantedApi.update(id, { status: 'CLOSED' });
      toast.success('Đã đóng tin.');
      queryClient.invalidateQueries({ queryKey: ['book-wanted'] });
      queryClient.invalidateQueries({ queryKey: ['book-wanted', id, 'inquiries'] });
      setConfirmAction(null);
      navigate('/book-wanted/mine');
    } catch (err) {
      toast.error(getApiErrorMessage(err, 'Không đóng được tin.'));
    }
  };

  const handleConfirmDelete = async () => {
    try {
      await bookWantedApi.delete(id);
      toast.success('Đã xóa tin.');
      queryClient.invalidateQueries({ queryKey: ['book-wanted'] });
      setConfirmAction(null);
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
    const msg =
      statusCode === 404
        ? 'Không tìm thấy tin.'
        : statusCode === 403
          ? 'Bạn không có quyền xem tin này.'
          : 'Không tải được tin. Vui lòng thử lại.';
    return (
      <div className="bw-page">
        <p className="bw-empty">{msg}</p>
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

        {!isOwner && status === 'OPEN' && (
          <div style={{ marginTop: 'var(--space-6)' }}>
            <p style={{ fontSize: 'var(--text-sm)', color: 'var(--text-secondary)', marginBottom: 'var(--space-3)' }}>
              Bạn có đúng sách hoặc tài liệu người này đang tìm? Hãy mở cuộc trao đổi để nhắn tin trực tiếp (tương tự trao đổi khi mua sách).
            </p>
            <button
              type="button"
              className="bw-btn bw-btn--primary"
              onClick={handleStartContact}
              disabled={startInquiryMutation.isPending}
              aria-label="Báo có sách và mở nhắn tin với người đăng tin"
            >
              {startInquiryMutation.isPending ? 'Đang mở…' : 'Báo có sách — nhắn tin'}
            </button>
          </div>
        )}

        {isOwner && status === 'OPEN' && postInquiries.length > 0 && (
          <section style={{ marginTop: 'var(--space-8)' }} aria-labelledby="bw-inquiries-heading">
            <h2 id="bw-inquiries-heading" className="bw-page__title" style={{ fontSize: 'var(--text-lg)' }}>
              Người đã liên hệ
            </h2>
            <p style={{ fontSize: 'var(--text-sm)', color: 'var(--text-secondary)', marginBottom: 'var(--space-4)' }}>
              Các tài khoản báo có thể giúp bạn tìm sách. Vào chat để trao đổi chi tiết.
            </p>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
              {postInquiries.map((row) => (
                <li key={row.inquiryId} className="bw-inquiry-row">
                  <span style={{ fontSize: 'var(--text-sm)', color: 'var(--text-primary)' }}>
                    <strong>{row.responderMaskedUsername || 'Ẩn danh'}</strong>
                    {row.createdAt && (
                      <span style={{ color: 'var(--text-tertiary)', marginLeft: 'var(--space-2)' }}>
                        · {new Date(row.createdAt).toLocaleString('vi-VN')}
                      </span>
                    )}
                  </span>
                  <Link to={`/book-wanted/inquiry/${row.inquiryId}`} className="bw-btn bw-btn--primary">
                    Mở chat
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        )}

        {isOwner && !confirmAction && (
          <div className="bw-detail__actions">
            <Link to={`/book-wanted/${id}/edit`} className="bw-btn bw-btn--primary">
              Sửa tin
            </Link>
            {status === 'OPEN' && (
              <button type="button" className="bw-btn bw-btn--ghost" onClick={() => setConfirmAction('close')}>
                Đóng tin
              </button>
            )}
            <button type="button" className="bw-btn bw-btn--danger" onClick={() => setConfirmAction('delete')}>
              Xóa tin
            </button>
          </div>
        )}

        {isOwner && confirmAction === 'close' && (
          <div className="bw-confirm-bar" role="alert">
            <p className="bw-confirm-bar__text">Đóng tin này? Người khác sẽ không thấy trong danh sách đang tìm.</p>
            <div className="bw-confirm-bar__actions">
              <button type="button" className="bw-btn bw-btn--primary" onClick={handleConfirmClose}>
                Xác nhận đóng
              </button>
              <button type="button" className="bw-btn bw-btn--ghost" onClick={() => setConfirmAction(null)}>
                Huỷ
              </button>
            </div>
          </div>
        )}

        {isOwner && confirmAction === 'delete' && (
          <div className="bw-confirm-bar" role="alert">
            <p className="bw-confirm-bar__text">Xóa vĩnh viễn tin này? Thao tác không hoàn tác.</p>
            <div className="bw-confirm-bar__actions">
              <button type="button" className="bw-btn bw-btn--danger" onClick={handleConfirmDelete}>
                Xác nhận xóa
              </button>
              <button type="button" className="bw-btn bw-btn--ghost" onClick={() => setConfirmAction(null)}>
                Huỷ
              </button>
            </div>
          </div>
        )}
      </article>
    </div>
  );
}

