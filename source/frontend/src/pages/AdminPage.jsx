import { useState } from 'react';
import './AdminPage.css';

const ADMIN_MENU = [
  { icon: '📊', label: 'Dashboard', view: 'overview' },
  { icon: '👥', label: 'Users', view: 'users' },
  { icon: '📚', label: 'Products', view: 'products' },
  { icon: '💳', label: 'Transactions', view: 'orders' },
  { icon: '🔍', label: 'Moderation', view: 'moderation' },
];

export default function AdminPage() {
  const [currentView, setCurrentView] = useState('overview');
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleViewChange = (view) => {
    setCurrentView(view);
    setSidebarOpen(false);
  };

  return (
    <div className="admin-layout">
      <aside className={`admin-sidebar ${sidebarOpen ? 'open' : ''}`}>
        <div className="admin-sidebar-brand">🎓 EduCycle Admin</div>

        <div className="admin-sidebar-section">
          <div className="admin-sidebar-section-title">Management</div>
          {ADMIN_MENU.map((item) => (
            <button
              key={item.view}
              className={`admin-sidebar-link ${currentView === item.view ? 'active' : ''}`}
              onClick={() => handleViewChange(item.view)}
            >
              <span className="admin-sidebar-link-icon">{item.icon}</span>
              {item.label}
            </button>
          ))}
        </div>

        {sidebarOpen && (
          <button className="admin-sidebar-link" onClick={() => setSidebarOpen(false)}>
            <span className="admin-sidebar-link-icon">✕</span>
            Close Menu
          </button>
        )}
      </aside>

      <div className="admin-main">
        <button className="admin-mobile-menu-btn" onClick={() => setSidebarOpen(true)}>
          ☰ Admin Menu
        </button>

        {currentView === 'overview' && <AdminOverview />}
        {currentView === 'users' && <AdminUsers />}
        {currentView === 'products' && <AdminProducts />}
        {currentView === 'orders' && <AdminOrders />}
        {currentView === 'moderation' && <AdminModeration />}
      </div>
    </div>
  );
}

function AdminOverview() {
  return (
    <>
      <h1 className="admin-page-title">Admin Dashboard</h1>

      <div className="admin-stats">
        <div className="admin-stat-card">
          <div className="admin-stat-label">Total Users</div>
          <div className="admin-stat-value">2,450</div>
          <div className="admin-stat-change positive">+12% this month</div>
        </div>
        <div className="admin-stat-card">
          <div className="admin-stat-label">Products</div>
          <div className="admin-stat-value">890</div>
          <div className="admin-stat-change positive">+5% this month</div>
        </div>
        <div className="admin-stat-card">
          <div className="admin-stat-label">Revenue</div>
          <div className="admin-stat-value">$45.2K</div>
          <div className="admin-stat-change positive">+18% this month</div>
        </div>
        <div className="admin-stat-card">
          <div className="admin-stat-label">Avg. Rating</div>
          <div className="admin-stat-value">4.7</div>
          <div className="admin-stat-change positive">+0.2 this month</div>
        </div>
      </div>

      <div className="admin-section">
        <div className="admin-section-header">
          <h2 className="admin-section-title">Recent Activity</h2>
        </div>
        <div className="admin-activity">
          {[
            { dot: 'green', text: 'New user registered: alice@example.com', time: '2 min ago' },
            { dot: 'blue', text: 'New product submitted: Advanced React Patterns', time: '15 min ago' },
            { dot: 'yellow', text: 'Review flagged: Course #234', time: '1 hour ago' },
            { dot: 'green', text: 'Payment processed: Order #1234 - $89.99', time: '2 hours ago' },
            { dot: 'red', text: 'Failed payment: Order #1235 - $49.99', time: '3 hours ago' },
            { dot: 'blue', text: 'Product approved: Data Science Fundamentals', time: '4 hours ago' },
          ].map((item, i) => (
            <div key={i} className="admin-activity-item">
              <span className={`admin-activity-dot ${item.dot}`} />
              <span>{item.text}</span>
              <span className="admin-activity-time">{item.time}</span>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}

function AdminUsers() {
  return (
    <>
      <h1 className="admin-page-title">User Management</h1>

      <div className="admin-section">
        <div className="admin-section-header">
          <div className="admin-section-actions">
            <input className="admin-search" type="text" placeholder="Search users..." />
          </div>
          <button className="admin-btn admin-btn-primary">+ Add User</button>
        </div>
        <table className="admin-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Name</th>
              <th>Email</th>
              <th>Role</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {[
              { id: '#001', name: 'John Doe', email: 'john@example.com', role: 'User', status: 'active' },
              { id: '#002', name: 'Jane Smith', email: 'jane@example.com', role: 'Seller', status: 'active' },
              { id: '#003', name: 'Bob Johnson', email: 'bob@example.com', role: 'Admin', status: 'active' },
              { id: '#004', name: 'Alice Lee', email: 'alice@example.com', role: 'User', status: 'banned' },
              { id: '#005', name: 'Charlie Brown', email: 'charlie@example.com', role: 'Seller', status: 'active' },
            ].map((user) => (
              <tr key={user.id}>
                <td style={{ fontWeight: 500 }}>{user.id}</td>
                <td style={{ fontWeight: 500, color: 'var(--text-primary)' }}>{user.name}</td>
                <td>{user.email}</td>
                <td>{user.role}</td>
                <td>
                  <span className={`admin-status ${user.status === 'active' ? 'admin-status-active' : 'admin-status-banned'}`}>
                    {user.status === 'active' ? 'Active' : 'Banned'}
                  </span>
                </td>
                <td>
                  <button className="admin-btn admin-btn-outline" style={{ fontSize: 'var(--text-xs)', padding: '0.25rem 0.75rem' }}>
                    Edit
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}

function AdminProducts() {
  return (
    <>
      <h1 className="admin-page-title">Product Management</h1>

      <div className="admin-section">
        <div className="admin-section-header">
          <div className="admin-section-actions">
            <input className="admin-search" type="text" placeholder="Search products..." />
          </div>
        </div>
        <table className="admin-table">
          <thead>
            <tr>
              <th>Product</th>
              <th>Seller</th>
              <th>Category</th>
              <th>Price</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {[
              { name: 'Advanced Python', seller: 'CodeMaster Pro', category: 'Programming', price: '$49.99', status: 'active' },
              { name: 'Web Dev Bootcamp', seller: 'WebDev Academy', category: 'Web Development', price: '$89.99', status: 'active' },
              { name: 'Data Science 101', seller: 'DataPro Institute', category: 'Data Science', price: '$69.99', status: 'pending' },
              { name: 'UI Design Course', seller: 'Design Guru', category: 'Design', price: '$59.99', status: 'active' },
            ].map((product, i) => (
              <tr key={i}>
                <td style={{ fontWeight: 500, color: 'var(--text-primary)' }}>{product.name}</td>
                <td>{product.seller}</td>
                <td>{product.category}</td>
                <td>{product.price}</td>
                <td>
                  <span className={`admin-status ${product.status === 'active' ? 'admin-status-active' : 'admin-status-pending'}`}>
                    {product.status === 'active' ? 'Active' : 'Pending'}
                  </span>
                </td>
                <td>
                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <button className="admin-btn admin-btn-outline" style={{ fontSize: 'var(--text-xs)', padding: '0.25rem 0.75rem' }}>
                      View
                    </button>
                    <button className="admin-btn admin-btn-outline" style={{ fontSize: 'var(--text-xs)', padding: '0.25rem 0.75rem', color: 'var(--error)' }}>
                      Remove
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}

function AdminOrders() {
  return (
    <>
      <h1 className="admin-page-title">Transactions</h1>

      <div className="admin-section">
        <div className="admin-section-header">
          <div className="admin-section-actions">
            <input className="admin-search" type="text" placeholder="Search transactions..." />
            <button className="admin-btn admin-btn-outline">Filter</button>
            <button className="admin-btn admin-btn-outline">Export</button>
          </div>
        </div>
        <table className="admin-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Date</th>
              <th>Buyer</th>
              <th>Product</th>
              <th>Amount</th>
              <th>Status</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {[
              { id: '#1230', date: 'Feb 14', buyer: 'John D.', product: 'Python Course', amount: '$49.99', status: 'complete' },
              { id: '#1231', date: 'Feb 14', buyer: 'Jane S.', product: 'React Bootcamp', amount: '$89.99', status: 'pending' },
              { id: '#1232', date: 'Feb 13', buyer: 'Bob J.', product: 'Design Course', amount: '$59.99', status: 'failed' },
              { id: '#1233', date: 'Feb 13', buyer: 'Alice L.', product: 'Marketing 101', amount: '$39.99', status: 'complete' },
              { id: '#1234', date: 'Feb 12', buyer: 'Charlie B.', product: 'Data Science', amount: '$69.99', status: 'complete' },
            ].map((tx) => (
              <tr key={tx.id}>
                <td style={{ fontWeight: 500 }}>{tx.id}</td>
                <td>{tx.date}</td>
                <td>{tx.buyer}</td>
                <td style={{ fontWeight: 500, color: 'var(--text-primary)' }}>{tx.product}</td>
                <td>{tx.amount}</td>
                <td>
                  <span className={`admin-status admin-status-${tx.status}`}>
                    {tx.status.charAt(0).toUpperCase() + tx.status.slice(1)}
                  </span>
                </td>
                <td>
                  <button className="admin-btn admin-btn-outline" style={{ fontSize: 'var(--text-xs)', padding: '0.25rem 0.75rem' }}>
                    View
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}

function AdminModeration() {
  return (
    <>
      <h1 className="admin-page-title">Content Moderation</h1>

      <div className="admin-section">
        <div className="admin-section-header">
          <h2 className="admin-section-title">Pending Approvals (3)</h2>
        </div>
        {[
          { title: 'Advanced React Patterns', seller: 'John Doe', category: 'Web Development', price: '$79.99', time: '2 hours ago' },
          { title: 'Machine Learning A-Z', seller: 'DataPro Institute', category: 'Data Science', price: '$99.99', time: '5 hours ago' },
          { title: 'DevOps Fundamentals', seller: 'CloudOps Expert', category: 'DevOps', price: '$69.99', time: '1 day ago' },
        ].map((item, i) => (
          <div key={i} className="admin-mod-card">
            <div className="admin-mod-title">{item.title}</div>
            <div className="admin-mod-meta">
              <span>Seller: {item.seller}</span>
              <span>Category: {item.category} &middot; Price: {item.price}</span>
              <span>Submitted: {item.time}</span>
            </div>
            <div className="admin-mod-actions">
              <button className="admin-btn admin-btn-outline">Preview</button>
              <button className="admin-btn admin-btn-success">Approve</button>
              <button className="admin-btn admin-btn-danger">Reject</button>
              <button className="admin-btn admin-btn-warning">Request Changes</button>
            </div>
          </div>
        ))}
      </div>
    </>
  );
}
