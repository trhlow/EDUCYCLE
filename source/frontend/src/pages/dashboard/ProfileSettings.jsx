import { useAuth } from '../../contexts/AuthContext';

export default function ProfileSettings() {
  const { user } = useAuth();

  return (
    <div className="animate-fade-in max-w-2xl">
      <h1 className="font-display text-2xl font-bold text-gray-900 mb-6">Profile Settings</h1>

      <div className="bg-white rounded-xl p-6 shadow-md">
        {/* Avatar */}
        <div className="flex items-center gap-4 mb-8 pb-6 border-b border-gray-200">
          <div className="w-16 h-16 rounded-full bg-primary-100 text-primary-600 flex items-center justify-center text-2xl font-bold">
            {user?.email?.[0]?.toUpperCase() || 'U'}
          </div>
          <div>
            <p className="text-lg font-semibold text-gray-900">{user?.email}</p>
            <p className="text-sm text-gray-500">Role: {user?.role || 'User'}</p>
          </div>
        </div>

        {/* Profile Form */}
        <form className="space-y-6">
          <div>
            <label className="block text-sm font-semibold text-gray-900 mb-2">Email</label>
            <input
              type="email"
              value={user?.email || ''}
              disabled
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg text-base bg-gray-50 text-gray-500 cursor-not-allowed"
            />
            <p className="mt-1 text-xs text-gray-400">Email cannot be changed</p>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-900 mb-2">User ID</label>
            <input
              type="text"
              value={user?.userId || ''}
              disabled
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg text-base bg-gray-50 text-gray-500 font-mono text-sm cursor-not-allowed"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-900 mb-2">Role</label>
            <input
              type="text"
              value={user?.role || 'User'}
              disabled
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg text-base bg-gray-50 text-gray-500 cursor-not-allowed"
            />
          </div>
        </form>
      </div>
    </div>
  );
}
