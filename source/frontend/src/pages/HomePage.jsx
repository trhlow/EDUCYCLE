import { Link } from 'react-router-dom';
import { FiArrowRight, FiBookOpen, FiShield, FiStar } from 'react-icons/fi';

export default function HomePage() {
  return (
    <div className="animate-fade-in">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-primary-50 to-accent-50 py-16 md:py-24 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="font-display text-4xl md:text-6xl font-extrabold text-gray-900 mb-6 leading-tight">
            Discover Your Next{' '}
            <span className="text-primary-500">Learning Adventure</span>
          </h1>
          <p className="text-lg md:text-xl text-gray-600 mb-8 max-w-2xl mx-auto leading-relaxed">
            Access thousands of courses from expert educators worldwide. Buy, sell, and share
            educational resources in our trusted marketplace.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              to="/products"
              className="px-8 py-3.5 bg-primary-500 text-white font-semibold rounded-lg hover:bg-primary-600 transition-all hover:-translate-y-0.5 shadow-md hover:shadow-lg text-lg no-underline inline-flex items-center gap-2"
            >
              Browse Courses <FiArrowRight />
            </Link>
            <Link
              to="/auth"
              className="px-8 py-3.5 border-2 border-primary-500 text-primary-500 font-semibold rounded-lg hover:bg-primary-50 transition-all text-lg no-underline"
            >
              Start Selling
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 md:py-20 px-4">
        <div className="max-w-6xl mx-auto">
          <h2 className="font-display text-3xl md:text-4xl font-bold text-center text-gray-900 mb-12">
            Why Choose EduCycle?
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <FeatureCard
              icon={<FiBookOpen size={32} />}
              title="Quality Resources"
              description="Curated educational content reviewed by experts. Only the best courses make it to our marketplace."
            />
            <FeatureCard
              icon={<FiShield size={32} />}
              title="Secure Transactions"
              description="Protected payments and guaranteed satisfaction. Your trust is our top priority."
            />
            <FeatureCard
              icon={<FiStar size={32} />}
              title="Expert Educators"
              description="Learn from industry leaders and experienced professionals who are passionate about teaching."
            />
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-primary-500 py-16 px-4">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="font-display text-3xl md:text-4xl font-bold text-white mb-4">
            Ready to Start Learning?
          </h2>
          <p className="text-primary-100 text-lg mb-8">
            Join thousands of learners who are advancing their skills with EduCycle.
          </p>
          <Link
            to="/products"
            className="px-8 py-3.5 bg-white text-primary-600 font-semibold rounded-lg hover:bg-primary-50 transition-all text-lg no-underline inline-flex items-center gap-2"
          >
            Explore Courses <FiArrowRight />
          </Link>
        </div>
      </section>
    </div>
  );
}

function FeatureCard({ icon, title, description }) {
  return (
    <div className="bg-white rounded-xl p-8 shadow-md hover:shadow-lg transition-all hover:-translate-y-1 text-center">
      <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary-50 text-primary-500 mb-4">
        {icon}
      </div>
      <h3 className="font-display text-xl font-semibold text-gray-900 mb-3">{title}</h3>
      <p className="text-gray-600 leading-relaxed">{description}</p>
    </div>
  );
}
