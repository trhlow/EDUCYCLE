import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../components/Toast';
import {
  profileFormSchema,
  changePasswordFormSchema,
  verifyPhoneSchema,
} from '../api/formSchemas';
import './ProfilePage.css';

export default function ProfilePage() {
  const { user, logout, verifyPhone, refreshUser, saveProfileToServer, changePassword, saveNotificationPrefsToServer } =
    useAuth();
  const toast = useToast();
  const [profileLoading, setProfileLoading] = useState(true);
  const [savingProfile, setSavingProfile] = useState(false);
  const [changingPw, setChangingPw] = useState(false);
  const [activeSection, setActiveSection] = useState('profile');

  const [phoneVerifyStep, setPhoneVerifyStep] = useState('idle');
  const [verifySending, setVerifySending] = useState(false);

  const [notifPrefs, setNotifPrefs] = useState({
    notifyProductModeration: true,
    notifyTransactions: true,
    notifyMessages: true,
  });
  const [savingNotifPrefs, setSavingNotifPrefs] = useState(false);

  const profileForm = useForm({
    resolver: zodResolver(profileFormSchema),
    defaultValues: { username: '', bio: '', avatar: '' },
    mode: 'onTouched',
  });

  const passwordForm = useForm({
    resolver: zodResolver(changePasswordFormSchema),
    defaultValues: { currentPassword: '', newPassword: '', confirmPassword: '' },
    mode: 'onTouched',
  });

  const phoneForm = useForm({
    resolver: zodResolver(verifyPhoneSchema),
    defaultValues: { phone: '' },
    mode: 'onTouched',
  });

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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!user) return;
    profileForm.reset({
      username: user.username || '',
      bio: user.bio || '',
      avatar: user.avatar || '',
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps -- reset when user profile fields change; form API stable
  }, [user?.id, user?.username, user?.email, user?.bio, user?.avatar]);

  useEffect(() => {
    if (!user) return;
    setNotifPrefs({
      notifyProductModeration: user.notifyProductModeration ?? true,
      notifyTransactions: user.notifyTransactions ?? true,
      notifyMessages: user.notifyMessages ?? true,
    });
  }, [user?.notifyProductModeration, user?.notifyTransactions, user?.notifyMessages]);

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

  const handleProfileSave = profileForm.handleSubmit(async (data) => {
    setSavingProfile(true);
    try {
      await saveProfileToServer({
        username: data.username.trim(),
        bio: data.bio?.trim() || null,
        avatar: data.avatar?.trim() || null,
      });
      toast.success('Đã cập nhật hồ sơ thành công!');
    } catch (err) {
      const msg = err?.response?.data?.message || err?.response?.data?.errors?.join?.(', ') || err?.message;
      toast.error(typeof msg === 'string' ? msg : 'Cập nhật hồ sơ thất bại.');
    } finally {
      setSavingProfile(false);
    }
  });

  const handlePasswordChange = passwordForm.handleSubmit(async (data) => {
    setChangingPw(true);
    try {
      await changePassword(data.currentPassword, data.newPassword);
      toast.success('Đã đổi mật khẩu thành công!');
      passwordForm.reset({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (err) {
      const msg = err?.response?.data?.message || err?.message;
      toast.error(typeof msg === 'string' ? msg : 'Đổi mật khẩu thất bại.');
    } finally {
      setChangingPw(false);
    }
  });

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

  const handleVerifyPhoneSubmit = phoneForm.handleSubmit(async (data) => {
    setVerifySending(true);
    try {
      await verifyPhone(data.phone);
      toast.success('Xác thực số điện thoại thành công.');
      setPhoneVerifyStep('idle');
      phoneForm.reset({ phone: '' });
    } catch (err) {
      const msg = err?.response?.data?.message || err?.message || 'Xác thực thất bại. Vui lòng thử lại.';
      toast.error(msg);
    } finally {
      setVerifySending(false);
    }
  });

  const isEmailVerified = user?.emailVerified ?? false;
  const isPhoneVerified = user?.phoneVerified ?? false;

  const {
    register: bindProfile,
    formState: { errors: profileErrors },
  } = profileForm;
  const {
    register: bindPw,
    formState: { errors: pwErrors },
  } = passwordForm;
  const {
    register: bindPhone,
    formState: { errors: phoneErrors },
  } = phoneForm;

  return (
    <div className="profile-page edu-page">
      <div className="edu-container">
        <div className="profile-container">
          <aside className="profile-sidebar">
            <div className="profile-avatar-section">
              <div className="profile-avatar">{user?.username?.[0]?.toUpperCase() || '?'}</div>
              <h2 className="profile-name">{user?.username}</h2>
              <p className="profile-email">{user?.email}</p>
              <span className="profile-role">{user?.role?.toUpperCase() === 'ADMIN' ? 'Quản trị viên' : 'Thành viên'}</span>

              <div className="profile-badges">
                <span className={`profile-badge ${isEmailVerified ? 'verified' : 'unverified'}`}>Email</span>
                <span className={`profile-badge ${isPhoneVerified ? 'verified' : 'unverified'}`}>SĐT</span>
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
                  type="button"
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
                  <form onSubmit={handleProfileSave} className="profile-form" noValidate>
                    <div className="profile-form-row">
                      <div className="profile-form-group">
                        <label htmlFor="profile-username">Tên người dùng</label>
                        <input
                          id="profile-username"
                          type="text"
                          autoComplete="nickname"
                          aria-invalid={!!profileErrors.username}
                          {...bindProfile('username')}
                        />
                        {profileErrors.username && (
                          <span className="profile-field-hint" style={{ color: 'var(--error)' }}>
                            {profileErrors.username.message}
                          </span>
                        )}
                      </div>
                      <div className="profile-form-group">
                        <label htmlFor="profile-email">Email</label>
                        <input id="profile-email" type="email" value={user?.email || ''} readOnly disabled className="profile-input-readonly" />
                        <span className="profile-field-hint">Email dùng đăng nhập — không đổi tại đây.</span>
                      </div>
                    </div>
                    <p className="profile-field-hint" style={{ marginBottom: 'var(--space-3)' }}>
                      Số điện thoại: cập nhật tại mục <strong>Xác Thực</strong> (EduCycle P2P — không lưu địa chỉ nhà trên server).
                    </p>
                    <div className="profile-form-group full-width">
                      <label htmlFor="profile-avatar">Ảnh đại diện (URL — tuỳ chọn)</label>
                      <input
                        id="profile-avatar"
                        type="url"
                        placeholder="https://..."
                        autoComplete="off"
                        aria-invalid={!!profileErrors.avatar}
                        {...bindProfile('avatar')}
                      />
                      {profileErrors.avatar && (
                        <span className="profile-field-hint" style={{ color: 'var(--error)' }}>
                          {profileErrors.avatar.message}
                        </span>
                      )}
                    </div>
                    <div className="profile-form-group full-width">
                      <label htmlFor="profile-bio">Tiểu sử</label>
                      <textarea id="profile-bio" rows={4} placeholder="Giới thiệu về bản thân..." {...bindProfile('bio')} />
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
                      <p
                        style={{
                          fontSize: 'var(--text-sm)',
                          color: 'var(--text-secondary)',
                          marginBottom: 'var(--space-3)',
                        }}
                      >
                        Kiểm tra hộp thư của bạn và nhấp vào link xác thực đã được gửi lúc đăng ký. Nếu chưa nhận được, hãy liên hệ hỗ trợ.
                      </p>
                    </div>
                  )}
                </div>

                <div className="verify-card">
                  <div className="verify-card-header">
                    <div className="verify-card-info">
                      <h3>Số Điện Thoại</h3>
                      <p>{isPhoneVerified ? user?.phone || 'Đã xác thực' : 'Chưa xác thực'}</p>
                    </div>
                    <span className={`verify-status ${isPhoneVerified ? 'verified' : ''}`}>
                      {isPhoneVerified ? 'Đã xác thực' : 'Chưa xác thực'}
                    </span>
                  </div>

                  {!isPhoneVerified && (
                    <div className="verify-card-body">
                      <p
                        style={{
                          fontSize: 'var(--text-sm)',
                          color: 'var(--text-secondary)',
                          marginBottom: 'var(--space-3)',
                        }}
                      >
                        Xác thực số điện thoại để có thể đăng bán sản phẩm trên EduCycle.
                      </p>

                      {phoneVerifyStep === 'idle' && (
                        <button type="button" className="verify-action-btn" onClick={() => setPhoneVerifyStep('input')}>
                          Xác thực số điện thoại
                        </button>
                      )}

                      {phoneVerifyStep === 'input' && (
                        <form className="verify-form" onSubmit={handleVerifyPhoneSubmit} noValidate>
                          <label htmlFor="verify-phone">Nhập số điện thoại của bạn</label>
                          <input
                            id="verify-phone"
                            type="tel"
                            placeholder="0912 345 678"
                            maxLength={11}
                            autoFocus
                            aria-invalid={!!phoneErrors.phone}
                            {...bindPhone('phone')}
                          />
                          {phoneErrors.phone && (
                            <p style={{ fontSize: 'var(--text-xs)', color: 'var(--error)', margin: 'var(--space-1) 0' }}>
                              {phoneErrors.phone.message}
                            </p>
                          )}
                          <p style={{ fontSize: 'var(--text-xs)', color: 'var(--text-tertiary)', margin: 'var(--space-2) 0' }}>
                            Định dạng: 0912345678 (10 chữ số, bắt đầu bằng 03x–09x)
                          </p>
                          <div className="verify-form-actions">
                            <button type="submit" className="verify-action-btn" disabled={verifySending}>
                              {verifySending ? 'Đang xác thực…' : 'Xác nhận'}
                            </button>
                            <button
                              type="button"
                              className="verify-cancel-btn"
                              onClick={() => {
                                setPhoneVerifyStep('idle');
                                phoneForm.reset({ phone: '' });
                              }}
                            >
                              Hủy
                            </button>
                          </div>
                        </form>
                      )}
                    </div>
                  )}
                </div>
              </section>
            )}

            {activeSection === 'security' && (
              <section className="profile-section">
                <h2 className="profile-section-title">Đổi Mật Khẩu</h2>
                <form onSubmit={handlePasswordChange} className="profile-form" noValidate>
                  <div className="profile-form-group">
                    <label htmlFor="pw-current">Mật khẩu hiện tại</label>
                    <input id="pw-current" type="password" autoComplete="current-password" aria-invalid={!!pwErrors.currentPassword} {...bindPw('currentPassword')} />
                    {pwErrors.currentPassword && (
                      <span className="profile-field-hint" style={{ color: 'var(--error)' }}>
                        {pwErrors.currentPassword.message}
                      </span>
                    )}
                  </div>
                  <div className="profile-form-row">
                    <div className="profile-form-group">
                      <label htmlFor="pw-new">Mật khẩu mới</label>
                      <input id="pw-new" type="password" autoComplete="new-password" aria-invalid={!!pwErrors.newPassword} {...bindPw('newPassword')} />
                      {pwErrors.newPassword && (
                        <span className="profile-field-hint" style={{ color: 'var(--error)' }}>
                          {pwErrors.newPassword.message}
                        </span>
                      )}
                    </div>
                    <div className="profile-form-group">
                      <label htmlFor="pw-confirm">Xác nhận mật khẩu mới</label>
                      <input id="pw-confirm" type="password" autoComplete="new-password" aria-invalid={!!pwErrors.confirmPassword} {...bindPw('confirmPassword')} />
                      {pwErrors.confirmPassword && (
                        <span className="profile-field-hint" style={{ color: 'var(--error)' }}>
                          {pwErrors.confirmPassword.message}
                        </span>
                      )}
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
                <h2 className="profile-section-title" style={{ color: 'var(--error)' }}>
                  Vùng Nguy Hiểm
                </h2>
                <div className="profile-danger-card">
                  <div>
                    <h3>Xóa tài khoản</h3>
                    <p>Sau khi xóa, tất cả dữ liệu của bạn sẽ bị mất vĩnh viễn. Hành động này không thể hoàn tác.</p>
                  </div>
                  <button type="button" className="profile-danger-btn" onClick={handleDeleteAccount}>
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
