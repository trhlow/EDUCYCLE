export default function AdminUsers() {
  return (
    <div className="animate-fade-in">
      <h1 className="font-display text-2xl font-bold text-gray-900 mb-6">User Management</h1>

      <div className="bg-white rounded-xl shadow-md p-8 text-center">
        <div className="text-5xl mb-4">👥</div>
        <h3 className="text-xl font-semibold text-gray-900 mb-2">User Management</h3>
        <p className="text-gray-500">
          User management requires a dedicated endpoint from the backend. The admin API for listing
          and managing users will be integrated when the backend endpoint is available.
        </p>
      </div>
    </div>
  );
}
