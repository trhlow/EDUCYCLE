import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import toast from 'react-hot-toast';

export default function AuthPage() {
  const [activeTab, setActiveTab] = useState('login');
  const { login, register, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  if (isAuthenticated) {
    navigate('/', { replace: true });
    return null;
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-50 to-accent-50 p-4">
      <div className="w-full max-w-md bg-white rounded-xl shadow-xl overflow-hidden animate-slide-up">
        {/* Header */}
        <div className="bg-gradient-to-br from-primary-500 to-primary-700 px-8 py-8 text-center text-white">
          <Link to="/" className="no-underline">
            <h1 className="font-display text-3xl font-extrabold mb-2">🎓 EduCycle</h1>
          </Link>
          <p className="text-primary-100 text-sm">Your marketplace for educational excellence</p>
        </div>

        {/* Tabs */}
        <div className="flex border-b-2 border-gray-200">
          <button
            onClick={() => setActiveTab('login')}
            className={`flex-1 py-4 text-base font-semibold transition-colors relative cursor-pointer ${
              activeTab === 'login' ? 'text-primary-600' : 'text-gray-400 hover:text-gray-600'
            }`}
          >
            Login
            {activeTab === 'login' && (
              <span className="absolute bottom-0 left-0 right-0 h-[3px] bg-primary-600" />
            )}
          </button>
          <button
            onClick={() => setActiveTab('register')}
            className={`flex-1 py-4 text-base font-semibold transition-colors relative cursor-pointer ${
              activeTab === 'register' ? 'text-primary-600' : 'text-gray-400 hover:text-gray-600'
            }`}
          >
            Register
            {activeTab === 'register' && (
              <span className="absolute bottom-0 left-0 right-0 h-[3px] bg-primary-600" />
            )}
          </button>
        </div>

        {/* Content */}
        <div className="p-8">
          {activeTab === 'login' ? (
            <LoginForm onLogin={login} navigate={navigate} />
          ) : (
            <RegisterForm onRegister={register} navigate={navigate} setActiveTab={setActiveTab} />
          )}
        </div>
      </div>
    </div>
  );
}

function LoginForm({ onLogin, navigate }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const validate = () => {
    const newErrors = {};
    if (!email || !email.includes('@')) newErrors.email = 'Please enter a valid email';
    if (!password) newErrors.password = 'Password is required';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);
    try {
      await onLogin(email, password);
      toast.success('Login successful!');
      navigate('/');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Login failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="animate-fade-in">
      <div className="mb-6">
        <label className="block text-sm font-semibold text-gray-900 mb-2">Email</label>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="your@email.com"
          className={`w-full px-4 py-3 border-2 rounded-lg text-base transition-colors focus:outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500/10 ${
            errors.email ? 'border-red-400' : 'border-gray-200'
          }`}
        />
        {errors.email && <p className="mt-2 text-sm text-red-500">{errors.email}</p>}
      </div>

      <div className="mb-6">
        <label className="block text-sm font-semibold text-gray-900 mb-2">Password</label>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="••••••••"
          className={`w-full px-4 py-3 border-2 rounded-lg text-base transition-colors focus:outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500/10 ${
            errors.password ? 'border-red-400' : 'border-gray-200'
          }`}
        />
        {errors.password && <p className="mt-2 text-sm text-red-500">{errors.password}</p>}
      </div>

      <button
        type="submit"
        disabled={loading}
        className="w-full py-3.5 bg-primary-500 text-white font-semibold rounded-lg hover:bg-primary-600 transition-all hover:-translate-y-0.5 shadow-sm hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer text-base"
      >
        {loading ? 'Signing in...' : 'Sign In'}
      </button>

      <div className="flex items-center gap-4 my-6 text-gray-400 text-sm">
        <span className="flex-1 h-px bg-gray-200" />
        or continue with
        <span className="flex-1 h-px bg-gray-200" />
      </div>

      <div className="flex gap-3">
        <button
          type="button"
          className="flex-1 py-3 border-2 border-gray-200 rounded-lg font-semibold hover:border-primary-500 hover:bg-primary-50 transition-colors cursor-pointer"
        >
          Google
        </button>
        <button
          type="button"
          className="flex-1 py-3 border-2 border-gray-200 rounded-lg font-semibold hover:border-primary-500 hover:bg-primary-50 transition-colors cursor-pointer"
        >
          Facebook
        </button>
      </div>
    </form>
  );
}

function RegisterForm({ onRegister, navigate, setActiveTab }) {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const validate = () => {
    const newErrors = {};
    if (!username || username.length < 3) newErrors.username = 'Username must be at least 3 characters';
    if (!email || !email.includes('@')) newErrors.email = 'Please enter a valid email';
    if (!password || password.length < 8) newErrors.password = 'Password must be at least 8 characters';
    if (password !== confirmPassword) newErrors.confirmPassword = 'Passwords do not match';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);
    try {
      await onRegister(username, email, password);
      toast.success('Registration successful!');
      navigate('/');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="animate-fade-in">
      <div className="mb-5">
        <label className="block text-sm font-semibold text-gray-900 mb-2">Username</label>
        <input
          type="text"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          placeholder="johndoe"
          className={`w-full px-4 py-3 border-2 rounded-lg text-base transition-colors focus:outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500/10 ${
            errors.username ? 'border-red-400' : 'border-gray-200'
          }`}
        />
        {errors.username && <p className="mt-2 text-sm text-red-500">{errors.username}</p>}
      </div>

      <div className="mb-5">
        <label className="block text-sm font-semibold text-gray-900 mb-2">Email</label>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="your@email.com"
          className={`w-full px-4 py-3 border-2 rounded-lg text-base transition-colors focus:outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500/10 ${
            errors.email ? 'border-red-400' : 'border-gray-200'
          }`}
        />
        {errors.email && <p className="mt-2 text-sm text-red-500">{errors.email}</p>}
      </div>

      <div className="mb-5">
        <label className="block text-sm font-semibold text-gray-900 mb-2">Password</label>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="••••••••"
          className={`w-full px-4 py-3 border-2 rounded-lg text-base transition-colors focus:outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500/10 ${
            errors.password ? 'border-red-400' : 'border-gray-200'
          }`}
        />
        {errors.password && <p className="mt-2 text-sm text-red-500">{errors.password}</p>}
      </div>

      <div className="mb-6">
        <label className="block text-sm font-semibold text-gray-900 mb-2">Confirm Password</label>
        <input
          type="password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          placeholder="••••••••"
          className={`w-full px-4 py-3 border-2 rounded-lg text-base transition-colors focus:outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500/10 ${
            errors.confirmPassword ? 'border-red-400' : 'border-gray-200'
          }`}
        />
        {errors.confirmPassword && (
          <p className="mt-2 text-sm text-red-500">{errors.confirmPassword}</p>
        )}
      </div>

      <button
        type="submit"
        disabled={loading}
        className="w-full py-3.5 bg-primary-500 text-white font-semibold rounded-lg hover:bg-primary-600 transition-all hover:-translate-y-0.5 shadow-sm hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer text-base"
      >
        {loading ? 'Creating account...' : 'Create Account'}
      </button>

      <p className="text-center mt-6 text-sm text-gray-500">
        Already have an account?{' '}
        <button
          type="button"
          onClick={() => setActiveTab('login')}
          className="text-primary-600 font-semibold hover:underline cursor-pointer"
        >
          Sign in
        </button>
      </p>
    </form>
  );
}
