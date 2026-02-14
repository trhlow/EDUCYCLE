import { Link } from 'react-router-dom';
import './HomePage.css';

export default function HomePage() {
  return (
    <div>
      <section className="home-hero">
        <div className="home-hero-content">
          <h1 className="home-hero-title">
            Discover Your Next Learning Adventure
          </h1>
          <p className="home-hero-subtitle">
            Access thousands of courses from expert educators worldwide.
            Buy, sell, and share educational resources in one trusted marketplace.
          </p>
          <div className="home-hero-actions">
            <Link to="/products" className="home-btn-primary">
              Browse Courses
            </Link>
            <Link to="/auth" className="home-btn-secondary">
              Start Selling
            </Link>
          </div>
        </div>
      </section>

      <section className="home-features">
        <h2 className="home-features-title">Why Choose EduCycle?</h2>
        <div className="home-features-grid">
          <div className="home-feature-card">
            <div className="home-feature-icon">📚</div>
            <h3 className="home-feature-title">Quality Courses</h3>
            <p className="home-feature-text">
              Curated educational resources reviewed by experts to ensure top quality content.
            </p>
          </div>
          <div className="home-feature-card">
            <div className="home-feature-icon">💰</div>
            <h3 className="home-feature-title">Fair Pricing</h3>
            <p className="home-feature-text">
              Competitive prices with transparent fees. Sellers earn more, buyers pay less.
            </p>
          </div>
          <div className="home-feature-card">
            <div className="home-feature-icon">🔒</div>
            <h3 className="home-feature-title">Secure Transactions</h3>
            <p className="home-feature-text">
              Protected payments and verified accounts for peace of mind on every purchase.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
