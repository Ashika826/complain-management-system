import React, { useState, useEffect, useContext } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { ComplaintContext } from '../context/ComplaintContext';
import api from '../utils/api';

// Hero section illustration
const HeroIllustration = () => (
  <svg className="w-full h-full" viewBox="0 0 500 400" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="250" cy="200" r="150" fill="#EBF4FF" />
    <rect x="180" y="120" width="140" height="180" rx="8" fill="white" stroke="#3B82F6" strokeWidth="2" />
    <rect x="200" y="150" width="100" height="10" rx="2" fill="#DBEAFE" />
    <rect x="200" y="170" width="80" height="10" rx="2" fill="#DBEAFE" />
    <rect x="200" y="190" width="60" height="10" rx="2" fill="#DBEAFE" />
    <rect x="200" y="230" width="100" height="30" rx="4" fill="#3B82F6" />
    <circle cx="330" cy="150" r="30" fill="#BFDBFE" />
    <circle cx="170" cy="250" r="20" fill="#93C5FD" />
    <circle cx="350" cy="280" r="15" fill="#60A5FA" />
  </svg>
);

// Status badge component
const StatusBadge = ({ status }) => {
  const getStatusColor = (status) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'in-progress':
        return 'bg-blue-100 text-blue-800';
      case 'resolved':
        return 'bg-green-100 text-green-800';
      case 'closed':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(status)}`}>
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </span>
  );
};

// Star rating component
const StarRating = ({ rating }) => {
  return (
    <div className="flex items-center">
      {[1, 2, 3, 4, 5].map((star) => (
        <svg
          key={star}
          className={`w-4 h-4 ${
            star <= rating ? 'text-yellow-400' : 'text-gray-300'
          }`}
          fill="currentColor"
          viewBox="0 0 20 20"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118l-2.8-2.034c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
        </svg>
      ))}
      <span className="ml-1 text-sm text-gray-600">{rating > 0 ? rating.toFixed(1) : 'No ratings'}</span>
    </div>
  );
};

// Category badge component
const CategoryBadge = ({ category }) => {
  const getCategoryColor = (category) => {
    switch (category?.toLowerCase()) {
      case 'product':
        return 'bg-purple-100 text-purple-800';
      case 'service':
        return 'bg-blue-100 text-blue-800';
      case 'billing':
        return 'bg-red-100 text-red-800';
      case 'technical':
        return 'bg-green-100 text-green-800';
      case 'general':
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getCategoryColor(category)}`}>
      {category}
    </span>
  );
};

// Stat card component
const StatCard = ({ title, value, icon, color }) => (
  <div className="bg-white rounded-lg shadow-md overflow-hidden">
    <div className="p-5">
      <div className="flex items-center">
        <div className={`rounded-md p-3 ${color}`}>
          {icon}
        </div>
        <div className="ml-5">
          <p className="text-gray-500 text-sm font-medium">{title}</p>
          <p className="text-2xl font-bold">{value}</p>
        </div>
      </div>
    </div>
  </div>
);

// Testimonial component
const Testimonial = ({ content, author, role, rating }) => (
  <div className="bg-white rounded-lg shadow-md p-6">
    <div className="flex items-center mb-4">
      <div className="h-10 w-10 rounded-full bg-blue-500 flex items-center justify-center text-white font-bold">
        {author.charAt(0)}
      </div>
      <div className="ml-3">
        <p className="font-medium text-gray-900">{author}</p>
        <p className="text-sm text-gray-500">{role}</p>
      </div>
    </div>
    <p className="text-gray-600 italic">"{content}"</p>
    <div className="mt-4">
      <StarRating rating={rating || 5} />
    </div>
  </div>
);

// Features section
const FeatureCard = ({ icon, title, description }) => (
  <div className="bg-white rounded-lg shadow-md p-6">
    <div className="rounded-full bg-blue-100 w-12 h-12 flex items-center justify-center text-blue-600 mb-4">
      {icon}
    </div>
    <h3 className="text-lg font-medium text-gray-900 mb-2">{title}</h3>
    <p className="text-gray-600">{description}</p>
  </div>
);

// Scroll to top component
const ScrollToTop = () => {
  const { pathname } = useLocation();
  
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  
  return null;
};

// Home page component
const HomePage = () => {
  const { isAuthenticated } = useContext(AuthContext);
  const { complaints, fetchComplaints } = useContext(ComplaintContext);
  const [homepageData, setHomepageData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch homepage data
  useEffect(() => {
    const getHomepageData = async () => {
      try {
        setLoading(true);
        const response = await api.get('/homepage/data');
        setHomepageData(response.data);
        setError(null);
      } catch (err) {
        console.error('Failed to fetch homepage data:', err);
        setError('Failed to load homepage data. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    getHomepageData();
  }, []);

  // Fetch complaints if authenticated
  useEffect(() => {
    if (isAuthenticated()) {
      fetchComplaints();
    }
  }, [isAuthenticated, fetchComplaints]);

  // Format date
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  // Sample testimonials data - in a real app, this could come from backend
  const testimonials = [
    {
      content: "मेरो गुनासो कति छिटो सम्बोधन गरियो भनेर म छक्क परेँ। ग्राहक सेवा टोली सक्रिय थियो र मेरो समस्या मात्र एक दिनमा समाधान गरियो!",
      author: "प्रकाश श्रेष्ठ",
      role: "ग्राहक",
      rating: 5
    },
    {
      content: "ट्र्याकिङ सुविधा उत्कृष्ट छ। मैले हरेक चरणमा आफ्नो गुनासोको स्थिति देख्न सक्थें र सञ्चार स्पष्ट र पारदर्शी थियो।",
      author: "सविता तामाङ",
      role: "ग्राहक",
      rating: 4
    },
    {
      content: "यो प्रणालीले गुनासो दर्ता गर्न र समाधान गर्न धेरै सजिलो बनाएको छ। म यसलाई राम्रो ग्राहक सेवालाई महत्व दिने जो कोहीलाई पनि सिफारिस गर्छु।",
      author: "अनिल पौडेल",
      role: "ग्राहक",
      rating: 5
    },
    {
      content: "पहिला मेरो गुनासोहरू कहिल्यै पनि समयमै समाधान हुँदैनथे, तर यो प्रणाली आएपछि सबै कुरा परिवर्तन भएको छ। धेरै धन्यवाद टोलीलाई!",
      author: "सुमना महर्जन",
      role: "ग्राहक",
      rating: 5
    },
    {
      content: "प्रणालीको प्रयोग गर्न सजिलो छ र मोबाइलमा पनि राम्रोसँग काम गर्छ। मेरो गुनासो समाधान प्रक्रिया सरल र प्रभावकारी थियो।",
      author: "नवराज गुरुङ",
      role: "ग्राहक",
      rating: 4
    }
  ];

  return (
    <>
      <ScrollToTop />
      <div className="bg-gray-50 min-h-screen">
        {/* Hero Section */}
        <section className="bg-gradient-to-br from-blue-50 to-indigo-100 py-16">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col md:flex-row items-center justify-between">
              <div className="md:w-1/2 mb-8 md:mb-0">
                <h1 className="text-4xl sm:text-5xl font-extrabold text-gray-900 leading-tight mb-4">
                  We're here to <span className="text-blue-600">help</span> you
                </h1>
                <p className="text-xl text-gray-600 mb-8 max-w-lg">
                  Our complaint management system makes it easy to submit, track, and resolve your concerns.
                </p>
                <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4">
                  {isAuthenticated() ? (
                    <Link 
                      to="/complaints/new" 
                      className="inline-flex items-center justify-center px-5 py-3 border border-transparent text-base font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
                    >
                      Submit New Complaint
                    </Link>
                  ) : (
                    <>
                      <Link 
                        to="/login" 
                        className="inline-flex items-center justify-center px-5 py-3 border border-transparent text-base font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
                      >
                        Sign In
                      </Link>
                      <Link 
                        to="/register" 
                        className="inline-flex items-center justify-center px-5 py-3 border border-gray-300 text-base font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                      >
                        Create Account
                      </Link>
                    </>
                  )}
                </div>
              </div>
              <div className="md:w-1/2 max-w-md mx-auto">
                <HeroIllustration />
              </div>
            </div>
          </div>
        </section>

        {/* Stats Section */}
        <section className="py-12 px-4 sm:px-6 lg:px-8">
          <div className="container mx-auto">
            {loading ? (
              <div className="text-center py-8">
                <svg className="animate-spin h-10 w-10 text-blue-500 mx-auto" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                <p className="mt-4 text-gray-600">Loading statistics...</p>
              </div>
            ) : error ? (
              <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded text-center">
                <p>{error}</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard 
                  title="Total Complaints" 
                  value={homepageData?.stats?.total || 0} 
                  icon={
                    <svg className="h-6 w-6 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                    </svg>
                  }
                  color="bg-blue-600"
                />
                <StatCard 
                  title="Resolved" 
                  value={homepageData?.stats?.resolved || 0} 
                  icon={
                    <svg className="h-6 w-6 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  }
                  color="bg-green-600"
                />
                <StatCard 
                  title="Satisfaction Rate" 
                  value={`${homepageData?.stats?.satisfaction || '0'}/5`} 
                  icon={
                    <svg className="h-6 w-6 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                    </svg>
                  }
                  color="bg-yellow-500"
                />
                <StatCard 
                  title="Avg. Response Time" 
                  value={homepageData?.stats?.responseTime || '24h'}
                  icon={
                    <svg className="h-6 w-6 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  }
                  color="bg-purple-600"
                />
              </div>
            )}
          </div>
        </section>

        {/* Recent Complaints Section */}
        <section className="py-12 px-4 sm:px-6 lg:px-8">
          <div className="container mx-auto">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-gray-900">Recent Complaints</h2>
              {isAuthenticated() && (
                <Link 
                  to="/complaints" 
                  className="text-blue-600 hover:text-blue-800 font-medium"
                >
                  View All Complaints
                </Link>
              )}
            </div>
            
            {loading ? (
              <div className="text-center py-8">
                <p className="text-gray-600">Loading recent complaints...</p>
              </div>
            ) : error ? (
              <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded text-center">
                <p>{error}</p>
              </div>
            ) : isAuthenticated() ? (
              complaints && complaints.length > 0 ? (
                <div className="bg-white shadow overflow-hidden sm:rounded-md">
                  <ul className="divide-y divide-gray-200">
                    {complaints.slice(0, 5).map((complaint) => (
                      <li key={complaint.id}>
                        <Link to={`/complaints/${complaint.id}`} className="block hover:bg-gray-50">
                          <div className="px-4 py-4 sm:px-6">
                            <div className="flex items-center justify-between">
                              <p className="text-sm font-medium text-blue-600 truncate">
                                {complaint.title}
                              </p>
                              <div className="ml-2 flex-shrink-0 flex">
                                <StatusBadge status={complaint.status} />
                              </div>
                            </div>
                            <div className="mt-2 sm:flex sm:justify-between">
                              <div className="sm:flex">
                                <p className="flex items-center text-sm text-gray-500">
                                  <CategoryBadge category={complaint.category} />
                                </p>
                                {complaint.rating > 0 && (
                                  <p className="mt-2 flex items-center text-sm text-gray-500 sm:mt-0 sm:ml-6">
                                    <StarRating rating={complaint.rating} />
                                  </p>
                                )}
                              </div>
                              <div className="mt-2 flex items-center text-sm text-gray-500 sm:mt-0">
                                <svg className="flex-shrink-0 mr-1.5 h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                                  <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
                                </svg>
                                <p>
                                  Submitted on <time dateTime={complaint.createdAt}>{formatDate(complaint.createdAt)}</time>
                                </p>
                              </div>
                            </div>
                            <div className="mt-2">
                              <p className="text-sm text-gray-600 line-clamp-2">
                                {complaint.description}
                              </p>
                            </div>
                          </div>
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              ) : (
                <div className="bg-white shadow rounded-lg p-6 text-center">
                  <p className="text-gray-500">No complaints found. Submit your first complaint now!</p>
                  <Link 
                    to="/complaints/new" 
                    className="mt-4 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700"
                  >
                    Submit New Complaint
                  </Link>
                </div>
              )
            ) : homepageData?.recentComplaints && homepageData.recentComplaints.length > 0 ? (
              <div className="bg-white shadow overflow-hidden sm:rounded-md">
                <ul className="divide-y divide-gray-200">
                  {homepageData.recentComplaints.map((complaint) => (
                    <li key={complaint.id}>
                      <div className="px-4 py-4 sm:px-6">
                        <div className="flex items-center justify-between">
                          <p className="text-sm font-medium text-blue-600 truncate">
                            {complaint.title}
                          </p>
                          <div className="ml-2 flex-shrink-0 flex">
                            <StatusBadge status={complaint.status} />
                          </div>
                        </div>
                        <div className="mt-2 sm:flex sm:justify-between">
                          <div className="sm:flex">
                            <p className="flex items-center text-sm text-gray-500">
                              <CategoryBadge category={complaint.category} />
                            </p>
                            {complaint.rating > 0 && (
                              <p className="mt-2 flex items-center text-sm text-gray-500 sm:mt-0 sm:ml-6">
                                <StarRating rating={complaint.rating} />
                              </p>
                            )}
                          </div>
                          <div className="mt-2 flex items-center text-sm text-gray-500 sm:mt-0">
                            <svg className="flex-shrink-0 mr-1.5 h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                              <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
                            </svg>
                            <p>
                              Submitted on <time dateTime={complaint.createdAt}>{formatDate(complaint.createdAt)}</time>
                            </p>
                          </div>
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
                <div className="bg-gray-50 px-4 py-3 text-center">
                  <p className="text-sm text-gray-500">Sign in to view more details and submit your own complaints</p>
                  <div className="mt-3 flex justify-center space-x-3">
                    <Link
                      to="/login"
                      className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700"
                    >
                      Sign In
                    </Link>
                    <Link
                      to="/register"
                      className="inline-flex items-center px-3 py-1.5 border border-gray-300 text-xs font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                    >
                      Register
                    </Link>
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-white shadow rounded-lg p-6 text-center">
                <p className="text-gray-500">Sign in to view and manage your complaints.</p>
                <div className="mt-4 flex flex-col sm:flex-row justify-center space-y-4 sm:space-y-0 sm:space-x-4">
                  <Link 
                    to="/login" 
                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700"
                  >
                    Sign In
                  </Link>
                  <Link 
                    to="/register" 
                    className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                  >
                    Create Account
                  </Link>
                </div>
              </div>
            )}
          </div>
        </section>

        {/* Features Section */}
        <section className="py-12 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-white to-blue-50">
          <div className="container mx-auto">
            <div className="text-center max-w-3xl mx-auto mb-12">
              <h2 className="text-3xl font-extrabold text-gray-900 sm:text-4xl">
                Features that make us special
              </h2>
              <p className="mt-4 text-lg text-gray-600">
                Our complaint management system is designed to provide the best experience for both customers and administrators.
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              <FeatureCard 
                icon={
                  <svg className="h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                }
                title="Fast Response"
                description="Get quick responses to your complaints with our efficient management system."
              />
              <FeatureCard 
                icon={
                  <svg className="h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                  </svg>
                }
                title="Secure & Private"
                description="Your complaints and personal information are kept secure and private."
              />
              <FeatureCard 
                icon={
                  <svg className="h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                  </svg>
                }
                title="Track Progress"
                description="Keep track of your complaint status and responses in real-time."
              />
              <FeatureCard 
                icon={
                  <svg className="h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                  </svg>
                }
                title="Rate Service"
                description="Rate the service after your complaint is resolved to help us improve."
              />
              <FeatureCard 
                icon={
                  <svg className="h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
                  </svg>
                }
                title="Multiple Categories"
                description="Submit complaints across various categories for better organization."
              />
              <FeatureCard 
                icon={
                  <svg className="h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
                  </svg>
                }
                title="Direct Communication"
                description="Communicate directly with our support team through the complaint system."
              />
            </div>
          </div>
        </section>

        {/* Testimonials Section */}
        <section className="py-12 px-4 sm:px-6 lg:px-8">
          <div className="container mx-auto">
            <div className="text-center max-w-3xl mx-auto mb-12">
              <h2 className="text-3xl font-extrabold text-gray-900 sm:text-4xl">
                What our users say
              </h2>
              <p className="mt-4 text-lg text-gray-600">
                Hear from our satisfied customers about their experience using our complaint management system.
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {testimonials.map((testimonial, index) => (
                <Testimonial 
                  key={index}
                  content={testimonial.content}
                  author={testimonial.author}
                  role={testimonial.role}
                  rating={testimonial.rating}
                />
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-12 px-4 sm:px-6 lg:px-8 bg-blue-600">
          <div className="container mx-auto text-center">
            <h2 className="text-3xl font-extrabold text-white sm:text-4xl">
              Ready to get started?
            </h2>
            <p className="mt-4 text-xl text-blue-100 max-w-3xl mx-auto">
              Join thousands of satisfied customers who have used our complaint management system to resolve their issues.
            </p>
            <div className="mt-8 flex justify-center">
              {isAuthenticated() ? (
                <Link
                  to="/complaints/new"
                  className="inline-flex items-center justify-center px-5 py-3 border border-transparent text-base font-medium rounded-md text-blue-600 bg-white hover:bg-blue-50"
                >
                  Submit New Complaint
                </Link>
              ) : (
                <Link
                  to="/register"
                  className="inline-flex items-center justify-center px-5 py-3 border border-transparent text-base font-medium rounded-md text-blue-600 bg-white hover:bg-blue-50"
                >
                  Create Free Account
                </Link>
              )}
            </div>
          </div>
        </section>
      </div>
    </>
  );
};

export default HomePage;