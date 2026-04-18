import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { publicProfileApi } from '../lib/api';
import { maskUsername } from '../lib/mask-username';
import './UserPublicProfilePage.css';

export default function UserPublicProfilePage() {
  const { id } = useParams();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    let cancelled = false;
    setLoading(true);
    publicProfileApi
      .getUser(id)
      .then((res) => {
        if (!cancelled) setProfile(res.data);
      })
      .catch(() => {
        if (!cancelled) setProfile(null);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => { cancelled = true; };
  }, [id]);

  if (loading) {
    return (
      <div className="upp-wrap">
        <div className="upp-card upp-loading">Đang tải hồ sơ…</div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="upp-wrap">
        <div className="upp-card">
          <h1>Không tìm thấy người dùng</h1>
          <p className="upp-muted">Tài khoản không tồn tại hoặc đã bị xóa.</p>
          <Link to="/" className="upp-back">Về trang chủ</Link>
        </div>
      </div>
    );
  }

  const avg = typeof profile.averageRating === 'number' ? profile.averageRating.toFixed(1) : '—';
  const reviews = Array.isArray(profile.recentReviews) ? profile.recentReviews : [];

  return (
    <div className="upp-wrap">
      <div className="upp-breadcrumb">
        <Link to="/">Trang chủ</Link>
        <span>/</span>
        <span>Hồ sơ</span>
      </div>

      <div className="upp-card upp-header">
        <div className="upp-avatar" aria-hidden>
          {profile.avatar ? (
            <img src={profile.avatar} alt="" />
          ) : (
            <span>{(profile.username || '?').charAt(0).toUpperCase()}</span>
          )}
        </div>
        <div className="upp-head-text">
          <h1>@{maskUsername(profile.username)}</h1>
          <div className="upp-stats">
            <span className="upp-stars">{avg}/5</span>
            <span className="upp-muted">({profile.reviewCount ?? 0} đánh giá)</span>
          </div>
          {profile.bio && <p className="upp-bio">{profile.bio}</p>}
        </div>
      </div>

      <div className="upp-card">
        <h2 className="upp-section-title">Đánh gần đây</h2>
        {reviews.length === 0 ? (
          <p className="upp-muted">Chưa có đánh giá công khai.</p>
        ) : (
          <ul className="upp-review-list">
            {reviews.map((r) => (
              <li key={r.id} className="upp-review-item">
                <div className="upp-review-meta">
                  <strong>{maskUsername(r.reviewerUsername)}</strong>
                  <span className="upp-stars">{r.rating}/5</span>
                  <span className="upp-muted">
                    {r.createdAt ? new Date(r.createdAt).toLocaleDateString('vi-VN') : ''}
                  </span>
                </div>
                <p className="upp-review-content">{r.content}</p>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
