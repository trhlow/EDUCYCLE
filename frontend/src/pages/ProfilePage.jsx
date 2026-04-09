import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../components/Toast';
import './ProfilePage.css';

export default function ProfilePage() {
  const { user, logout, verifyPhone, refreshUser, saveProfileToServer, changePassword, saveNotificationPrefsToServer } = useAuth();
  const toast = useToast();
  const [profileLoading, setProfileLoading] = useState(true);
  const [savingProfile, setSavingProfile] = useState(false);
  const [changingPw, setChangingPw] = useState(false);
  const [formData, setFormData] = useState({
    username: user?.username || '',
    email: user?.email || '',
    bio: user?.bio || '',
    avatar: user?.avatar || '',
  });

  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  const [activeSection, setActiveSection] = useState('profile');

  // Issue #1 FIX: Phone verification state — chỉ 2 bước: idle | input
  // BE /auth/verify-phone không dùng OTP riêng — gửi phone là verify luôn
  const [phoneVerifyStep, setPhoneVerifyStep] = useState('idle');
  const [verifyPhoneNumber, setVerifyPhoneNumber] = useState('');
  const [verifySending, setVerifySending] = useState(false);

  const [notifPrefs, setNotifPrefs] = useState({
    notifyProductModeration: true,
    notifyTransactions: true,
    notifyMessages: true,
  });
  const [savingNotifPrefs, setSavingNotifPrefs] = useState(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        await refreshUser();
      } catch (err) {
        if (!cancelled) {
          const msg = err?.response?.data?.message || err?.message || 'Không tải được hồ sơ từ server.';
          toast.error(typeof msg === 'string' ? msg : 'Không tải được hồ sơ.');
        }
      } finally {
        if (!cancelled) setProfileLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [refreshUser, toast]);

  useEffect(() => {
    if (!user) return;
    setFormData({
      username: user.username || '',
      email: user.email || '',
      bio: user.bio || '',
      avatar: user.avatar || '',
    });
  }, [user]);

  useEffect(() => {
    if (!user) return;
    setNotifPrefs({
      notifyProductModeration: user.notifyProductModeration ?? true,
      notifyTransactions: user.notifyTransactions ?? true,
      notifyMessages: user.notifyMessages ?? true,
    });
  }, [user]);

  const handleNotifToggle = async (key) => {
    const prev = { ...notifPrefs };
    const next = { ...prev, [key]: !prev[key] };
    setNotifPrefs(next);
    setSavingNotifPrefs(true);
    try {
      await saveNotificationPrefsToServer(next);
      toast.success('Đã lưu cài đặt thông báo.');
    } catch (err) {
      const msg = err?.response?.data?.message || err?.message;
      toast.error(typeof msg === 'string' ? msg : 'Không lưu được cài đặt.');
      setNotifPrefs(prev);
    } finally {
      setSavingNotifPrefs(false);
    }
  };

  const handleProfileSave = async (e) => {
    e.preventDefault();
    if (!formData.username?.trim()) {
      toast.error('Tên người dùng không được để trống');
      return;
    }
    setSavingProfile(true);
    try {
      await saveProfileToServer({
        username: formData.username.trim(),
        bio: formData.bio?.trim() || null,
        avatar: formData.avatar?.trim() || null,
      });
      toast.success('Đã cập nhật hồ sơ thành công!');
    } catch (err) {
      const msg = err?.response?.data?.message || err?.response?.data?.errors?.join?.(', ') || err?.message;
      toast.error(typeof msg === 'string' ? msg : 'Cập nhật hồ sơ thất bại.');
    } finally {
      setSavingProfile(false);
    }
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    if (!passwordForm.currentPassword) {
      toast.error('Vui lòng nhập mật khẩu hiện tại');
      return;
    }
    if (passwordForm.newPassword.length < 8) {
      toast.error('Mật khẩu mới phải có ít nhất 8 ký tự');
      return;
    }
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      toast.error('Mật khẩu xác nhận không khớp');
      return;
    }
    setChangingPw(true);
    try {
      await changePassword(passwordForm.currentPassword, passwordForm.newPassword);
      toast.success('Đã đổi mật khẩu thành công!');
      setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (err) {
      const msg = err?.response?.data?.message || err?.message;
      toast.error(typeof msg === 'string' ? msg : 'Đổi mật khẩu thất bại.');
    } finally {
      setChangingPw(false);
    }
  };

  const handleDeleteAccount = () => {
    if (
      window.confirm(
        'Xóa tài khoản vĩnh viễn chưa được hỗ trợ qua app. Liên hệ quản trị nếu cần. Bạn có muốn đăng xuất không?',
      )
    ) {
      logout();
      toast.info('Đã đăng xuất.');
    }
  };

  // Issue #1 FIX: Gọi BE thật — /auth/verify-phone nhận { phone } và mark verified
  const handleVerifyPhoneDirect = async () => {
    if (!/^(0[3-9])[0-9]{8}$/.test(verifyPhoneNumber)) {
      toast.error('Số điện thoại không hợp lệ (VD: 0912345678)');
      return;
    }
    setVerifySending(true);
    try {
      await verifyPhone(verifyPhoneNumber);
      toast.success('Xác thực số điện thoại thành công.');
      setPhoneVerifyStep('idle');
      setVerifyPhoneNumber('');
    } catch (err) {
      const msg = err?.response?.data?.message || err?.message || 'Xác thực thất bại. Vui lòng thử lại.';
      toast.error(msg);
    } finally {
      setVerifySending(false);
    }
  };

  // Issue #1: dùng user.emailVerified (không ?? true nữa — đã fix ở AuthContext)
  const isEmailVerified = user?.emailVerified ?? false;
  const isPhoneVerified = user?.phoneVerified ?? false;

  return (
    <div className="profile-page edu-page">
      <div className="edu-container">
        <div className="profile-container">
        <aside className="profile-sidebar">
          <div className="profile-avatar-section">
            <div className="profile-avatar">
              {user?.username?.[0]?.toUpperCase() || '?'}
            </div>
            <h2 className="profile-name">{user?.username}</h2>
            <p className="profile-email">{user?.email}</p>
            <span className="profile-role">{user?.role?.toUpperCase() === 'ADMIN' ? 'Quản trị viên' : 'Thành viên'}</span>

            <div className="profile-badges">
              <span className={`profile-badge ${isEmailVerified ? 'verified' : 'unverified'}`}>
                Email
              </span>
              <span className={`profile-badge ${isPhoneVerified ? 'verified' : 'unverified'}`}>
                SĐT
              </span>
            </div>
          </div>

          <nav className="profile-nav">
            {[
              { id: 'profile', label: 'Hồ sơ' },
              { id: 'verification', label: 'Xác thực' },
              { id: 'security', label: 'Bảo mật' },
              { id: 'notifications', label: 'Thông báo' },
              { id: 'danger', label: 'Vùng nguy hiểm' },
            ].map((item) => (
              <button
                key={item.id}
                className={`profile-nav-btn ${activeSection === item.id ? 'active' : ''}`}
                onClick={() => setActiveSection(item.id)}
              >
                {item.label}
              </button>
            ))}
          </nav>
        </aside>

        <main className="profile-main">
          {activeSection === 'profile' && (
            <section className="profile-section">
              <h2 className="profile-section-title">Thông Tin Cá Nhân</h2>
              {profileLoading ? (
                <p className="profile-section-desc">Đang tải hồ sơ từ server…</p>
              ) : (
              <form onSubmit={handleProfileSave} className="profile-form">
                <div className="profile-form-row">
                  <div className="profile-form-group">
                    <label>Tên người dùng</label>
                    <input
                      type="text"
                      value={formData.username}
                      onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                    />
                  </div>
                  <div className="profile-form-group">
                    <label>Email</label>
                    <input type="email" value={formData.email} readOnly disabled className="profile-input-readonly" />
                    <span className="profile-field-hint">Email dùng đăng nhập — không đổi tại đây.</span>
                  </div>
                </div>
                <p className="profile-field-hint" style={{ marginBottom: 'var(--space-3)' }}>
                  Số điện thoại: cập nhật tại mục <strong>Xác Thực</strong> (EduCycle P2P — không lưu địa chỉ nhà trên server).
                </p>
                <div className="profile-form-group full-width">
                  <label>Ảnh đại diện (URL — tuỳ chọn)</label>
                  <input
                    type="url"
                    value={formData.avatar}
                    placeholder="https://..."
                    onChange={(e) => setFormData({ ...formData, avatar: e.target.value })}
                  />
                </div>
                <div className="profile-form-group full-width">
                  <label>Tiểu sử</label>
                  <textarea
                    rows={4}
                    value={formData.bio}
                    placeholder="Giới thiệu về bản thân..."
                    onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                  />
                </div>
                <button type="submit" className="profile-save-btn" disabled={savingProfile}>
                  {savingProfile ? 'Đang lưu…' : 'Lưu Thay Đổi'}
                </button>
              </form>
              )}
            </section>
          )}

          {activeSection === 'verification' && (
            <section className="profile-section">
              <h2 className="profile-section-title">Xác Thực Tài Khoản</h2>
              <p className="profile-section-desc">
                Xác thực tài khoản giúp tăng độ tin cậy và cho phép đăng bán sản phẩm trên EduCycle.
              </p>

              {/* Email Verification */}
              <div className="verify-card">
                <div className="verify-card-header">
                  <div className="verify-card-info">
                    <h3>Email</h3>
                    <p>{user?.email}</p>
                  </div>
                  <span className={`verify-status ${isEmailVerified ? 'verified' : ''}`}>
                    {isEmailVerified ? 'Đã xác thực' : 'Chưa xác thực'}
                  </span>
                </div>
                {!isEmailVerified && (
                  <div className="verify-card-body">
                    <p style={{ fontSize: 'var(--text-sm)', color: 'var(--text-secondary)', marginBottom: 'var(--space-3)' }}>
                      Kiểm tra hộp thư của bạn và nhấp vào link xác thực đã được gửi lúc đăng ký.
                      Nếu chưa nhận được, hãy liên hệ hỗ trợ.
                    </p>
                  </div>
                )}
              </div>

              {/* Phone Verification — Issue #1 FIX */}
              <div className="verify-card">
                <div className="verify-card-header">
                  <div className="verify-card-info">
                    <h3>Số Điện Thoại</h3>
                    <p>{isPhoneVerified ? (user?.phone || 'Đã xác thực') : 'Chưa xác thực'}</p>
                  </div>
                  <span className={`verify-status ${isPhoneVerified ? 'verified' : ''}`}>
                    {isPhoneVerified ? 'Đã xác thực' : 'Chưa xác thực'}
                  </span>
                </div>

                {!isPhoneVerified && (
                  <div className="verify-card-body">
                    <p style={{ fontSize: 'var(--text-sm)', color: 'var(--text-secondary)', marginBottom: 'var(--space-3)' }}>
                      Xác thực số điện thoại để có thể đăng bán sản phẩm trên EduCycle.
                    </p>

                    {phoneVerifyStep === 'idle' && (
                      <button
                        className="verify-action-btn"
                        onClick={() => setPhoneVerifyStep('input')}
                      >
                        Xác thực số điện thoại
                      </button>
                    )}

                    {phoneVerifyStep === 'input' && (
                      <div className="verify-form">
                        <label>Nhập số điện thoại của bạn</label>
                        <input
                          type="tel"
                          placeholder="0912 345 678"
                          value={verifyPhoneNumber}
                          onChange={(e) => setVerifyPhoneNumber(e.target.value.replace(/\s/g, ''))}
                          maxLength={11}
                          autoFocus
                        />
                        <p style={{ fontSize: 'var(--text-xs)', color: 'var(--text-tertiary)', margin: 'var(--space-2) 0' }}>
                          Định dạng: 0912345678 (10 chữ số, bắt đầu bằng 03x–09x)
                        </p>
                        <div className="verify-form-actions">
                          <button
                            className="verify-action-btn"
                            onClick={handleVerifyPhoneDirect}
                            disabled={verifySending}
                          >
                            {verifySending ? 'Đang xác thực…' : 'Xác nhận'}
                          </button>
                          <button
                            className="verify-cancel-btn"
                            onClick={() => { setPhoneVerifyStep('idle'); setVerifyPhoneNumber(''); }}
                          >
                            Hủy
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </section>
          )}

          {activeSection === 'security' && (
            <section className="profile-section">
              <h2 className="profile-section-title">Đổi Mật Khẩu</h2>
              <form onSubmit={handlePasswordChange} className="profile-form">
                <div className="profile-form-group">
                  <label>Mật khẩu hiện tại</label>
                  <input
                    type="password"
                    value={passwordForm.currentPassword}
                    onChange={(e) => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })}
                  />
                </div>
                <div className="profile-form-row">
                  <div className="profile-form-group">
                    <label>Mật khẩu mới</label>
                    <input
                      type="password"
                      value={passwordForm.newPassword}
                      onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
                    />
                  </div>
                  <div className="profile-form-group">
                    <label>Xác nhận mật khẩu mới</label>
                    <input
                      type="password"
                      value={passwordForm.confirmPassword}
                      onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
                    />
                  </div>
                </div>
                <button type="submit" className="profile-save-btn" disabled={changingPw}>
                  {changingPw ? 'Đang xử lý…' : 'Đổi Mật Khẩu'}
                </button>
              </form>
            </section>
          )}

          {activeSection === 'notifications' && (
            <section className="profile-section">
              <h2 className="profile-section-title">Cài Đặt Thông Báo</h2>
              <p className="profile-section-desc" style={{ marginBottom: 'var(--space-4)' }}>
                Bật/tắt loại thông báo trong ứng dụng (chuông + WebSocket). Đã lưu trên tài khoản.
                {savingNotifPrefs && <span style={{ marginLeft: 8, color: 'var(--text-tertiary)' }}>Đang lưu…</span>}
              </p>
              <div className="profile-notification-list">
                {[
                  {
                    key: 'notifyProductModeration',
                    label: 'Kiểm duyệt sản phẩm',
                    desc: 'Khi admin duyệt / từ chối tin đăng của bạn.',
                  },
                  {
                    key: 'notifyTransactions',
                    label: 'Giao dịch & thanh toán P2P',
                    desc: 'Cập nhật trạng thái giao dịch, OTP, hoàn tất…',
                  },
                  {
                    key: 'notifyMessages',
                    label: 'Tin nhắn chat',
                    desc: 'Thông báo khi có tin nhắn mới trong giao dịch.',
                  },
                ].map((item) => (
                  <div key={item.key} className="profile-notification-item">
                    <div>
                      <div className="profile-notification-label">{item.label}</div>
                      <div className="profile-notification-desc">{item.desc}</div>
                    </div>
                    <label className="profile-toggle">
                      <input
                        type="checkbox"
                        checked={!!notifPrefs[item.key]}
                        disabled={savingNotifPrefs || profileLoading}
                        onChange={() => handleNotifToggle(item.key)}
                      />
                      <span className="profile-toggle-slider" />
                    </label>
                  </div>
                ))}
              </div>
              <p className="profile-field-hint" style={{ marginTop: 'var(--space-4)' }}>
                Email marketing tách riêng — sẽ bổ sung sau.
              </p>
            </section>
          )}

          {activeSection === 'danger' && (
            <section className="profile-section">
              <h2 className="profile-section-title" style={{ color: 'var(--error)' }}>Vùng Nguy Hiểm</h2>
              <div className="profile-danger-card">
                <div>
                  <h3>Xóa tài khoản</h3>
                  <p>Sau khi xóa, tất cả dữ liệu của bạn sẽ bị mất vĩnh viễn. Hành động này không thể hoàn tác.</p>
                </div>
                <button className="profile-danger-btn" onClick={handleDeleteAccount}>
                  Xóa Tài Khoản
                </button>
              </div>
            </section>
          )}
        </main>
        </div>
      </div>
    </div>
  );
}
