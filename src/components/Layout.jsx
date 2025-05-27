import { Link, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

export default function Layout() {
  const { user, logout, isAdmin } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/auth');
    } catch (error) {
      console.error('Error logging out:', error);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <Link to="/" className="flex items-center gap-2 text-primary-600">
                <i className="fas fa-briefcase text-xl"></i>
                <span className="font-semibold text-lg">JobConnect Pro</span>
              </Link>
              <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
                <Link to="/jobs" className="text-gray-900 hover:text-primary-600 px-3 py-2 text-sm font-medium">
                  Browse Jobs
                </Link>
                {user && (
                  <>
                    <Link to="/applications" className="text-gray-900 hover:text-primary-600 px-3 py-2 text-sm font-medium">
                      My Applications
                    </Link>
                    <Link to="/post-job" className="text-gray-900 hover:text-primary-600 px-3 py-2 text-sm font-medium">
                      Post a Job
                    </Link>
                  </>
                )}
                {isAdmin && (
                  <Link to="/admin" className="text-gray-900 hover:text-primary-600 px-3 py-2 text-sm font-medium">
                    Admin Dashboard
                  </Link>
                )}
              </div>
            </div>
            <div className="flex items-center">
              {user ? (
                <div className="flex items-center gap-4">
                  <span className="text-sm text-gray-700">{user.email}</span>
                  <button
                    onClick={handleLogout}
                    className="btn btn-secondary"
                  >
                    Logout
                  </button>
                </div>
              ) : (
                <Link to="/auth" className="btn btn-primary">
                  Sign In
                </Link>
              )}
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Outlet />
      </main>
    </div>
  );
}