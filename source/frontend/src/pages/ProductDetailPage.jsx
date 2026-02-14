import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import './ProductDetailPage.css';

const PRODUCTS_DB = {
  '1': {
    id: '1',
    name: 'Advanced Python Programming Course',
    description: 'Master Python with real-world projects and advanced concepts',
    fullDescription: 'This comprehensive Python course takes you from intermediate to advanced level. You\'ll learn design patterns, async programming, testing, web scraping, data processing, and building production-ready applications. Each module includes hands-on projects that mirror real-world scenarios.',
    price: 49.99,
    category: 'Programming',
    imageUrl: 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=800&h=450&fit=crop',
    rating: 4.8,
    reviews: 342,
    seller: 'CodeMaster Pro',
    sellerCourses: 15,
    sellerRating: 4.9,
    learningPoints: [
      'Advanced Python patterns and best practices',
      'Asynchronous programming with asyncio',
      'Unit testing and test-driven development',
      'Web scraping and data pipeline automation',
      'Building REST APIs with FastAPI',
      'Database integration with SQLAlchemy',
    ],
    requirements: [
      'Basic Python knowledge (variables, loops, functions)',
      'A computer with Python 3.8+ installed',
      'Willingness to practice with real projects',
    ],
    reviewList: [
      { id: 'r1', user: 'Sarah M.', rating: 5, date: 'Feb 10, 2024', text: 'Excellent course! The projects were incredibly practical and helped me land a new job.' },
      { id: 'r2', user: 'James L.', rating: 5, date: 'Feb 8, 2024', text: 'Best Python course I\'ve taken. The async programming section was exactly what I needed.' },
      { id: 'r3', user: 'Maria G.', rating: 4, date: 'Feb 5, 2024', text: 'Very thorough content. Would have liked more exercises in the testing module.' },
    ],
  },
  '2': {
    id: '2',
    name: 'Complete Web Development Bootcamp',
    description: 'Learn HTML, CSS, JavaScript, React, and Node.js from scratch',
    fullDescription: 'A full-stack web development bootcamp covering everything from HTML basics to deploying production React + Node.js applications. Includes 40+ hours of video content with real-world projects including an e-commerce site, social media app, and portfolio website.',
    price: 89.99,
    category: 'Web Development',
    imageUrl: 'https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=800&h=450&fit=crop',
    rating: 4.9,
    reviews: 1205,
    seller: 'WebDev Academy',
    sellerCourses: 22,
    sellerRating: 4.8,
    learningPoints: [
      'HTML5, CSS3, and modern JavaScript (ES6+)',
      'React with hooks, context, and state management',
      'Node.js and Express.js backend development',
      'MongoDB and PostgreSQL databases',
      'Authentication and authorization patterns',
      'Deployment to cloud platforms',
    ],
    requirements: [
      'No prior programming experience needed',
      'A computer with internet access',
      'Dedication to complete all projects',
    ],
    reviewList: [
      { id: 'r1', user: 'Alex K.', rating: 5, date: 'Feb 12, 2024', text: 'Completely transformed my career. Went from zero to full-stack developer.' },
      { id: 'r2', user: 'Emily R.', rating: 5, date: 'Feb 10, 2024', text: 'The best bootcamp-style course online. Worth every penny!' },
      { id: 'r3', user: 'David P.', rating: 4, date: 'Feb 7, 2024', text: 'Great content. The React section is particularly well done.' },
    ],
  },
  '3': {
    id: '3',
    name: 'Data Science Fundamentals',
    description: 'Introduction to data analysis, statistics, and machine learning',
    fullDescription: 'Start your data science journey with this comprehensive course. Learn to analyze data, create visualizations, apply statistical methods, and build your first machine learning models using Python, Pandas, and Scikit-learn.',
    price: 69.99,
    category: 'Data Science',
    imageUrl: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800&h=450&fit=crop',
    rating: 4.7,
    reviews: 567,
    seller: 'DataPro Institute',
    sellerCourses: 8,
    sellerRating: 4.7,
    learningPoints: [
      'Data analysis with Pandas and NumPy',
      'Data visualization with Matplotlib and Seaborn',
      'Statistical analysis and hypothesis testing',
      'Introduction to machine learning with Scikit-learn',
      'Real-world datasets and case studies',
    ],
    requirements: [
      'Basic Python knowledge recommended',
      'Understanding of basic math concepts',
    ],
    reviewList: [
      { id: 'r1', user: 'Tom W.', rating: 5, date: 'Feb 8, 2024', text: 'Perfect introduction to data science. Very clear explanations.' },
      { id: 'r2', user: 'Lisa N.', rating: 4, date: 'Feb 5, 2024', text: 'Good fundamentals course with practical examples.' },
    ],
  },
  '4': {
    id: '4',
    name: 'UI/UX Design Masterclass',
    description: 'Create stunning user interfaces and exceptional user experiences',
    fullDescription: 'Learn the complete UI/UX design process from user research to high-fidelity prototypes. This course covers design thinking, wireframing, visual design principles, and prototyping with Figma.',
    price: 59.99,
    category: 'Design',
    imageUrl: 'https://images.unsplash.com/photo-1561070791-2526d30994b5?w=800&h=450&fit=crop',
    rating: 4.6,
    reviews: 423,
    seller: 'Design Guru',
    sellerCourses: 12,
    sellerRating: 4.8,
    learningPoints: [
      'Design thinking methodology',
      'User research and persona creation',
      'Wireframing and prototyping with Figma',
      'Visual design principles and color theory',
      'Responsive design and accessibility',
    ],
    requirements: [
      'No prior design experience needed',
      'Figma account (free version works)',
    ],
    reviewList: [
      { id: 'r1', user: 'Anna S.', rating: 5, date: 'Feb 11, 2024', text: 'Amazing course! Helped me build my design portfolio.' },
      { id: 'r2', user: 'Chris B.', rating: 4, date: 'Feb 7, 2024', text: 'Very comprehensive design course covering all the essentials.' },
    ],
  },
  '5': {
    id: '5',
    name: 'Digital Marketing Essentials',
    description: 'SEO, social media marketing, and content strategy',
    fullDescription: 'Master digital marketing with hands-on projects covering SEO, social media marketing, email campaigns, content strategy, and Google Analytics. Learn to create and execute effective marketing campaigns.',
    price: 39.99,
    category: 'Marketing',
    imageUrl: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800&h=450&fit=crop',
    rating: 4.5,
    reviews: 289,
    seller: 'Marketing Experts',
    sellerCourses: 6,
    sellerRating: 4.6,
    learningPoints: [
      'Search engine optimization (SEO) strategies',
      'Social media marketing and advertising',
      'Email marketing and automation',
      'Content strategy and copywriting',
      'Google Analytics and data-driven decisions',
    ],
    requirements: [
      'No prior marketing experience needed',
      'Access to social media accounts for practice',
    ],
    reviewList: [
      { id: 'r1', user: 'Mike T.', rating: 5, date: 'Feb 9, 2024', text: 'Practical and actionable. Already seeing results from the SEO tips.' },
      { id: 'r2', user: 'Rachel H.', rating: 4, date: 'Feb 6, 2024', text: 'Good overview of all major digital marketing channels.' },
    ],
  },
  '6': {
    id: '6',
    name: 'Mobile App Development with React Native',
    description: 'Build iOS and Android apps with a single codebase',
    fullDescription: 'Learn to build cross-platform mobile applications using React Native. This course covers navigation, state management, native APIs, push notifications, and publishing to app stores.',
    price: 79.99,
    category: 'Mobile Development',
    imageUrl: 'https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?w=800&h=450&fit=crop',
    rating: 4.7,
    reviews: 456,
    seller: 'AppDev Masters',
    sellerCourses: 10,
    sellerRating: 4.7,
    learningPoints: [
      'React Native core components and APIs',
      'Navigation with React Navigation',
      'State management with Redux and Context',
      'Native device features (camera, location, etc.)',
      'Push notifications and background tasks',
      'App store submission process',
    ],
    requirements: [
      'JavaScript and React knowledge required',
      'Mac recommended for iOS development',
      'Node.js installed on your machine',
    ],
    reviewList: [
      { id: 'r1', user: 'Kevin L.', rating: 5, date: 'Feb 13, 2024', text: 'Published my first app thanks to this course!' },
      { id: 'r2', user: 'Sophie M.', rating: 4, date: 'Feb 10, 2024', text: 'Very practical. Love the real-world project approach.' },
    ],
  },
};

export default function ProductDetailPage() {
  const { id } = useParams();
  const [activeTab, setActiveTab] = useState('description');
  const [selectedThumb, setSelectedThumb] = useState(0);

  const product = id ? PRODUCTS_DB[id] : null;

  if (!product) {
    return (
      <div className="pdp-container" style={{ textAlign: 'center', padding: '6rem 2rem' }}>
        <h2>Product not found</h2>
        <p style={{ color: 'var(--text-secondary)', margin: '1rem 0' }}>
          The product you're looking for doesn't exist or has been removed.
        </p>
        <Link to="/products" className="plp-reset-btn" style={{ display: 'inline-block', textDecoration: 'none' }}>
          Browse Products
        </Link>
      </div>
    );
  }

  const thumbImages = [
    product.imageUrl,
    product.imageUrl.replace('w=800', 'w=400'),
    product.imageUrl.replace('w=800', 'w=600'),
    product.imageUrl.replace('w=800', 'w=500'),
  ];

  return (
    <div className="pdp-container">
      <div className="pdp-breadcrumb">
        <Link to="/">Home</Link>
        <span>/</span>
        <Link to="/products">Products</Link>
        <span>/</span>
        <span>{product.name}</span>
      </div>

      <div className="pdp-layout">
        {/* Image Gallery */}
        <div className="pdp-gallery">
          <div className="pdp-main-image">
            <img src={thumbImages[selectedThumb]} alt={product.name} />
          </div>
          <div className="pdp-thumbnails">
            {thumbImages.map((thumb, index) => (
              <button
                key={index}
                className={`pdp-thumb ${selectedThumb === index ? 'active' : ''}`}
                onClick={() => setSelectedThumb(index)}
              >
                <img src={thumb} alt={`${product.name} thumbnail ${index + 1}`} />
              </button>
            ))}
          </div>
        </div>

        {/* Purchase Panel */}
        <div className="pdp-purchase-panel">
          <h1 className="pdp-title">{product.name}</h1>
          <div className="pdp-seller-row">
            by <span className="pdp-seller-name">{product.seller}</span>
          </div>
          <div className="pdp-rating-row">
            <span className="pdp-stars">★ {product.rating}</span>
            <span className="pdp-rating-text">({product.reviews} reviews)</span>
          </div>
          <span className="pdp-category-badge">{product.category}</span>
          <div className="pdp-price">${product.price}</div>
          <div className="pdp-actions">
            <button className="pdp-btn-cart">Add to Cart</button>
            <button className="pdp-btn-buy">Buy Now</button>
          </div>

          <div className="pdp-seller-card">
            <div className="pdp-seller-avatar">👤</div>
            <div className="pdp-seller-info">
              <div className="pdp-seller-info-name">{product.seller}</div>
              <div className="pdp-seller-info-meta">
                ★ {product.sellerRating} &middot; {product.sellerCourses} courses
              </div>
            </div>
          </div>
        </div>

        {/* Detail Tabs */}
        <div className="pdp-details">
          <div className="pdp-tabs">
            {['description', 'reviews', 'info'].map((tab) => (
              <button
                key={tab}
                className={`pdp-tab ${activeTab === tab ? 'active' : ''}`}
                onClick={() => setActiveTab(tab)}
              >
                {tab === 'description' ? 'Description' : tab === 'reviews' ? 'Reviews' : 'Course Info'}
              </button>
            ))}
          </div>

          <div className="pdp-tab-content">
            {activeTab === 'description' && (
              <div>
                <p className="pdp-description">{product.fullDescription}</p>

                <h3 className="pdp-section-title">What you'll learn</h3>
                <ul className="pdp-learn-list">
                  {product.learningPoints.map((point, i) => (
                    <li key={i}>{point}</li>
                  ))}
                </ul>

                <h3 className="pdp-section-title">Requirements</h3>
                <ul className="pdp-requirements-list">
                  {product.requirements.map((req, i) => (
                    <li key={i}>{req}</li>
                  ))}
                </ul>
              </div>
            )}

            {activeTab === 'reviews' && (
              <div>
                <h3 className="pdp-section-title">Student Reviews ({product.reviews})</h3>
                {product.reviewList.map((review) => (
                  <div key={review.id} className="pdp-review-card">
                    <div className="pdp-review-header">
                      <span className="pdp-review-user">{review.user}</span>
                      <span className="pdp-review-date">{review.date}</span>
                    </div>
                    <div className="pdp-review-stars">
                      {'★'.repeat(review.rating)}{'☆'.repeat(5 - review.rating)}
                    </div>
                    <p className="pdp-review-text">{review.text}</p>
                  </div>
                ))}
              </div>
            )}

            {activeTab === 'info' && (
              <div>
                <h3 className="pdp-section-title">Course Information</h3>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-4)' }}>
                  <div>
                    <strong style={{ color: 'var(--text-primary)' }}>Category:</strong>
                    <p style={{ color: 'var(--text-secondary)', fontSize: 'var(--text-sm)' }}>{product.category}</p>
                  </div>
                  <div>
                    <strong style={{ color: 'var(--text-primary)' }}>Price:</strong>
                    <p style={{ color: 'var(--text-secondary)', fontSize: 'var(--text-sm)' }}>${product.price}</p>
                  </div>
                  <div>
                    <strong style={{ color: 'var(--text-primary)' }}>Rating:</strong>
                    <p style={{ color: 'var(--text-secondary)', fontSize: 'var(--text-sm)' }}>{product.rating} / 5 ({product.reviews} reviews)</p>
                  </div>
                  <div>
                    <strong style={{ color: 'var(--text-primary)' }}>Instructor:</strong>
                    <p style={{ color: 'var(--text-secondary)', fontSize: 'var(--text-sm)' }}>{product.seller}</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
