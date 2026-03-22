import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../components/Toast';
import './ProfilePage.css';

export default function ProfilePage() {
  const { user, updateProfile, logout, verifyPhone } = useAuth();
  const toast = useToast();
  const [formData, setFormData] = useState({
    username: user?.username || '',
    email: user?.email || '',
    bio: user?.bio || '',
    phone: user?.phone || '',
    address: user?.address || '',
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

  const handleProfileSave = (e) => {
    e.preventDefault();
    updateProfile(formData);
    toast.success('Đã cập nhật hồ sơ thành công!');
  };

  const handlePasswordChange = (e) => {
    e.preventDefault();
    if (passwordForm.newPassword.length < 8) {
      toast.error('Mật khẩu mới phải có ít nhất 8 ký tự');
      return;
    }
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      toast.error('Mật khẩu xác nhận không khớp');
      return;
    }
    toast.success('Đã đổi mật khẩu thành công!');
    setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
  };

  const handleDeleteAccount = () => {
    if (window.confirm('Bạn có chắc chắn muốn xóa tài khoản? Hành động này không thể hoàn tác.')) {
      logout();
      toast.info('Tài khoản đã được xóa');
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
      toast.success('Xác thực số điện thoại thành công! ✅');
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
    <div className="profile-page">
      <div className="profile-container">
        <aside className="profile-sidebar">
          <div className="profile-avatar-section">
            <div className="profile-avatar">
              {user?.username?.[0]?.toUpperCase() || '👤'}
            </div>
            <h2 className="profile-name">{user?.username}</h2>
            <p className="profile-email">{user?.email}</p>
            <span className="profile-role">{user?.role?.toUpperCase() === 'ADMIN' ? 'Quản trị viên' : 'Thành viên'}</span>

            <div className="profile-badges">
              <span className={`profile-badge ${isEmailVerified ? 'verified' : 'unverified'}`}>
                {isEmailVerified ? '✅' : '⚠️'} Email
              </span>
              <span className={`profile-badge ${isPhoneVerified ? 'verified' : 'unverified'}`}>
                {isPhoneVerified ? '✅' : '⚠️'} SĐT
              </span>
            </div>
          </div>

          <nav className="profile-nav">
            {[
              { id: 'profile', icon: '👤', label: 'Hồ Sơ' },
              { id: 'verification', icon: '🛡️', label: 'Xác Thực' },
              { id: 'security', icon: '🔒', label: 'Bảo Mật' },
              { id: 'notifications', icon: '🔔', label: 'Thông Báo' },
              { id: 'danger', icon: '⚠️', label: 'Vùng Nguy Hiểm' },
            ].map((item) => (
              <button
                key={item.id}
                className={`profile-nav-btn ${activeSection === item.id ? 'active' : ''}`}
                onClick={() => setActiveSection(item.id)}
              >
                <span>{item.icon}</span> {item.label}
              </button>
            ))}
          </nav>
        </aside>

        <main className="profile-main">
          {activeSection === 'profile' && (
            <section className="profile-section">
              <h2 className="profile-section-title">Thông Tin Cá Nhân</h2>
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
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    />
                  </div>
                </div>
                <div className="profile-form-row">
                  <div className="profile-form-group">
                    <label>Số điện thoại</label>
                    <input
                      type="tel"
                      value={formData.phone}
                      placeholder="0123 456 789"
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    />
                  </div>
                  <div className="profile-form-group">
                    <label>Địa chỉ</label>
                    <input
                      type="text"
                      value={formData.address}
                      placeholder="Thành phố, Quốc gia"
                      onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    />
                  </div>
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
                <button type="submit" className="profile-save-btn">Lưu Thay Đổi</button>
              </form>
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
                  <div className="verify-card-icon">📧</div>
                  <div className="verify-card-info">
                    <h3>Email</h3>
                    <p>{user?.email}</p>
                  </div>
                  <span className={`verify-status ${isEmailVerified ? 'verified' : ''}`}>
                    {isEmailVerified ? '✅ Đã xác thực' : '⚠️ Chưa xác thực'}
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
                  <div className="verify-card-icon">📱</div>
                  <div className="verify-card-info">
                    <h3>Số Điện Thoại</h3>
                    <p>{isPhoneVerified ? (user?.phone || 'Đã xác thực') : 'Chưa xác thực'}</p>
                  </div>
                  <span className={`verify-status ${isPhoneVerified ? 'verified' : ''}`}>
                    {isPhoneVerified ? '✅ Đã xác thực' : '⚠️ Chưa xác thực'}
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
                        📱 Xác Thực Số Điện Thoại
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
                            {verifySending ? '⏳ Đang xác thực...' : '✅ Xác Nhận'}
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
                <button type="submit" className="profile-save-btn">Đổi Mật Khẩu</button>
              </form>
            </section>
          )}

          {activeSection === 'notifications' && (
            <section className="profile-section">
              <h2 className="profile-section-title">Cài Đặt Thông Báo</h2>
              <div className="profile-notification-list">
                {[
                  { id: 'email_orders', label: 'Thông báo đơn hàng qua email', desc: 'Nhận email khi có đơn hàng mới' },
                  { id: 'email_promo', label: 'Khuyến mãi và ưu đãi', desc: 'Nhận thông tin về tài liệu được chia sẻ mới' },
                  { id: 'email_updates', label: 'Cập nhật giao dịch', desc: 'Thông báo khi giao dịch có thay đổi trạng thái' },
                  { id: 'email_newsletter', label: 'Bản tin hàng tuần', desc: 'Tổng hợp sản phẩm mới và phổ biến' },
                ].map((item) => (
                  <div key={item.id} className="profile-notification-item">
                    <div>
                      <div className="profile-notification-label">{item.label}</div>
                      <div className="profile-notification-desc">{item.desc}</div>
                    </div>
                    <label className="profile-toggle">
                      <input type="checkbox" defaultChecked={item.id !== 'email_newsletter'} />
                      <span className="profile-toggle-slider" />
                    </label>
                  </div>
                ))}
              </div>
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
  );
}
