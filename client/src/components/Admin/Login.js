import React, { useState, useContext, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';

// Admin login illustration component (smaller and sleeker)
const AdminLoginIllustration = () => (
  <svg className="w-32 h-32 mx-auto" viewBox="0 0 128 128" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="64" cy="64" r="60" fill="#EBF8FF" />
    <rect x="44" y="34" width="40" height="60" rx="4" fill="white" stroke="#2C5282" strokeWidth="2" />
    <rect x="52" y="50" width="24" height="4" rx="1" fill="#BEE3F8" />
    <rect x="52" y="62" width="24" height="4" rx="1" fill="#BEE3F8" />
    <circle cx="64" cy="75" r="5" fill="#2C5282" />
    <path d="M64 85C69.523 85 74 81.9706 74 78C74 74.0294 69.523 71 64 71C58.477 71 54 74.0294 54 78C54 81.9706 58.477 85 64 85Z" fill="#2C5282" />
    <circle cx="80" cy="40" r="8" fill="#90CDF4" />
    <circle cx="48" cy="70" r="6" fill="#63B3ED" />
    <path d="M30 52L35 57M30 57L35 52" stroke="#2C5282" strokeWidth="2" strokeLinecap="round" />
    <path d="M94 94L99 99M94 99L99 94" stroke="#2C5282" strokeWidth="2" strokeLinecap="round" />
    <rect x="37" y="84" width="5" height="5" rx="1" stroke="#2C5282" strokeWidth="1.5" />
    <rect x="86" y="39" width="5" height="5" rx="1" stroke="#2C5282" strokeWidth="1.5" />
  </svg>
);

const Login = () => {
  const [formData, setFormData] = useState({
    username: '',
    password: ''
  });
  const [formError, setFormError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  const { login, isAuthenticated, isAdmin, logout, error } = useContext(AuthContext);
  const navigate = useNavigate();
  
  // Redirect if already authenticated as admin
  useEffect(() => {
    if (isAuthenticated()) {
      // Redirect to appropriate home page based on user role
      if (isAdmin()) {
        navigate('/admin');
      } else {
        navigate('/complaints');
      }
    }
  }, [isAuthenticated, isAdmin, navigate]);
  
  // Update form error when context error changes
  useEffect(() => {
    if (error) {
      setFormError(error);
      setIsLoading(false);
    }
  }, [error]);
  
  const handleChange = e => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    // Clear form error when user types
    setFormError('');
  };
  
  const handleSubmit = async e => {
    e.preventDefault();
    
    // Form validation
    if (!formData.username || !formData.password) {
      setFormError('Please fill in all fields');
      return;
    }
    
    setIsLoading(true);
    
    try {
      const result = await login(formData);
      
      // Check if the logged-in user is an admin
      if (result.user.role !== 'admin') {
        setFormError('Access denied. Admin credentials required.');
        // Logout non-admin user
        logout();
        setIsLoading(false);
      } else {
        // Redirect admin to admin dashboard
        navigate('/admin');
      }
    } catch (err) {
      // Error is handled by context and useEffect above
      setIsLoading(false);
    }
  };
  
  return (
    <div className="min-h-full flex flex-col justify-center py-8 sm:px-6 lg:px-8 bg-gray-50">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <AdminLoginIllustration />
        <h2 className="mt-2 text-center text-2xl font-extrabold text-gray-900">
          Admin Login
        </h2>
        <p className="mt-1 text-center text-sm text-gray-600">
          Access the administrator dashboard
        </p>
      </div>

      <div className="mt-4 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-6 px-4 shadow sm:rounded-lg sm:px-10">
          {formError && (
            <div className="rounded-md bg-red-50 p-3 mb-4">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-red-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-red-800">
                    {formError}
                  </h3>
                </div>
              </div>
            </div>
          )}

          <form className="space-y-5" onSubmit={handleSubmit}>
            <div>
              <label htmlFor="username" className="block text-sm font-medium text-gray-700">
                Admin Username
              </label>
              <div className="mt-1">
                <input
                  id="username"
                  name="username"
                  type="text"
                  autoComplete="username"
                  required
                  value={formData.username}
                  onChange={handleChange}
                  className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                Password
              </label>
              <div className="mt-1">
                <input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="current-password"
                  required
                  value={formData.password}
                  onChange={handleChange}
                  className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                />
              </div>
            </div>

            <div>
              <button
                type="submit"
                disabled={isLoading}
                className={`w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white ${isLoading ? 'bg-indigo-400 cursor-not-allowed' : 'bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500'}`}
              >
                {isLoading ? (
                  <div className="flex items-center">
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Signing in...
                  </div>
                ) : "Sign in as Admin"}
              </button>
            </div>
          </form>

          <div className="mt-5">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-gray-500">
                  Not an admin?
                </span>
              </div>
            </div>

            <div className="mt-4 grid grid-cols-2 gap-3">
              <Link
                to="/login"
                className="w-full inline-flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm bg-white text-sm font-medium text-gray-500 hover:bg-gray-50"
              >
                <span>Customer Login</span>
              </Link>
              <Link
                to="/"
                className="w-full inline-flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm bg-white text-sm font-medium text-gray-500 hover:bg-gray-50"
              >
                <span>Back to Home</span>
              </Link>
            </div>
          </div>
          
          <div className="mt-4 text-center">
            <p className="text-xs text-gray-500">
              Admin accounts are created via the command line.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;