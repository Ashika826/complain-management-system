import React, { useContext, useEffect, useState, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ComplaintContext } from '../../context/ComplaintContext';
import { AuthContext } from '../../context/AuthContext';

// Status badge component
const StatusBadge = ({ status }) => {
  const getStatusColor = (status) => {
    switch (status) {
      case 'pending':
        return 'bg-amber-100 text-amber-800 border-amber-200';
      case 'in-progress':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'resolved':
        return 'bg-emerald-100 text-emerald-800 border-emerald-200';
      case 'closed':
        return 'bg-gray-100 text-gray-800 border-gray-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'pending':
        return (
          <svg className="w-4 h-4 mr-1.5" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
          </svg>
        );
      case 'in-progress':
        return (
          <svg className="w-4 h-4 mr-1.5" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-8.707l-3-3a1 1 0 00-1.414 0l-3 3a1 1 0 001.414 1.414L9 9.414V13a1 1 0 102 0V9.414l1.293 1.293a1 1 0 001.414-1.414z" clipRule="evenodd" />
          </svg>
        );
      case 'resolved':
        return (
          <svg className="w-4 h-4 mr-1.5" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
          </svg>
        );
      case 'closed':
        return (
          <svg className="w-4 h-4 mr-1.5" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
          </svg>
        );
      default:
        return null;
    }
  };

  return (
    <span className={`inline-flex items-center px-3 py-1.5 rounded-full text-sm font-medium ${getStatusColor(status)}`}>
      {getStatusIcon(status)}
      {status === 'in-progress' ? 'In Progress' : status.charAt(0).toUpperCase() + status.slice(1)}
    </span>
  );
};

// Category badge component
const CategoryBadge = ({ category }) => {
  const getCategoryColor = (category) => {
    switch (category?.toLowerCase()) {
      case 'product':
        return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'service':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'billing':
        return 'bg-rose-100 text-rose-800 border-rose-200';
      case 'technical':
        return 'bg-emerald-100 text-emerald-800 border-emerald-200';
      case 'general':
      default:
        return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  return (
    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border ${getCategoryColor(category)}`}>
      {category.charAt(0).toUpperCase() + category.slice(1)}
    </span>
  );
};

// Loading spinner component
const LoadingSpinner = () => (
  <div className="flex flex-col justify-center items-center h-64">
    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mb-4"></div>
    <p className="text-gray-600 font-medium">Loading complaint details...</p>
  </div>
);

// User bubble component
const UserBubble = ({ name, isAdmin = false }) => {
  // Get avatar initials for a name
  const getInitials = (name) => {
    if (!name) return '?';
    
    const parts = name.trim().split(' ');
    if (parts.length === 1) return name.charAt(0).toUpperCase();
    return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
  };

  return (
    <div className={`h-10 w-10 rounded-full flex items-center justify-center shadow-sm ${
      isAdmin ? 'bg-blue-500 text-white' : 'bg-emerald-500 text-white'
    }`}>
      <span className="font-medium">{getInitials(name)}</span>
    </div>
  );
};

const ComplaintDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { fetchComplaint, currentComplaint, loading, error, respondToComplaint } = useContext(ComplaintContext);
  const { user } = useContext(AuthContext);
  const [replyText, setReplyText] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [replyError, setReplyError] = useState('');
  const [consecutiveUserMessages, setConsecutiveUserMessages] = useState(0);

  // Generate consistent colors for usernames
  const userColors = useMemo(() => {
    if (!currentComplaint || !currentComplaint.responses) return {};
    
    const colors = [
      { bg: 'bg-blue-50', border: 'border-blue-200', text: 'text-blue-800', dark: 'text-blue-700', avatar: 'bg-blue-500' },
      { bg: 'bg-purple-50', border: 'border-purple-200', text: 'text-purple-800', dark: 'text-purple-700', avatar: 'bg-purple-500' },
      { bg: 'bg-emerald-50', border: 'border-emerald-200', text: 'text-emerald-800', dark: 'text-emerald-700', avatar: 'bg-emerald-500' },
      { bg: 'bg-amber-50', border: 'border-amber-200', text: 'text-amber-800', dark: 'text-amber-700', avatar: 'bg-amber-500' },
      { bg: 'bg-indigo-50', border: 'border-indigo-200', text: 'text-indigo-800', dark: 'text-indigo-700', avatar: 'bg-indigo-500' },
      { bg: 'bg-rose-50', border: 'border-rose-200', text: 'text-rose-800', dark: 'text-rose-700', avatar: 'bg-rose-500' },
      { bg: 'bg-teal-50', border: 'border-teal-200', text: 'text-teal-800', dark: 'text-teal-700', avatar: 'bg-teal-500' },
    ];
    
    const userColorMap = {};
    // Get unique admin names
    const adminNames = currentComplaint.responses
      .filter(r => r.adminName)
      .map(r => r.adminName);
    
    const uniqueAdmins = [...new Set(adminNames)];
    
    // Assign colors to each unique admin
    uniqueAdmins.forEach((name, index) => {
      userColorMap[name] = colors[index % colors.length];
    });
    
    // Special color for the user (myself)
    userColorMap['user'] = { 
      bg: 'bg-green-50', 
      border: 'border-green-200', 
      text: 'text-green-800', 
      dark: 'text-green-700',
      avatar: 'bg-green-500'
    };
    
    return userColorMap;
  }, [currentComplaint]);

  // Fetch complaint on component mount or id change
  useEffect(() => {
    fetchComplaint(id);
  }, [fetchComplaint, id]);

  // Calculate consecutive user messages whenever complaint updates
  useEffect(() => {
    if (currentComplaint && currentComplaint.responses) {
      let count = 0;
      for (let i = currentComplaint.responses.length - 1; i >= 0; i--) {
        const response = currentComplaint.responses[i];
        // If response has adminName, it's from admin
        if (response.adminName) {
          break;  // Found admin response, stop counting
        }
        // If no adminName, it's from user
        count++;
      }
      setConsecutiveUserMessages(count);
    }
  }, [currentComplaint]);

  // Format date
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Check if user can reply based on status and consecutive message limit
  const canReply = () => {
    if (!currentComplaint || 
        currentComplaint.status === 'resolved' || 
        currentComplaint.status === 'closed') {
      return false;
    }
    
    // Don't allow more than 3 consecutive user messages
    return consecutiveUserMessages < 3;
  };

  // Handle reply submission
  const handleReplySubmit = async (e) => {
    e.preventDefault();
    
    if (!replyText.trim()) {
      setReplyError('Please enter a reply');
      return;
    }
    
    // Double check rate limit before submission
    if (consecutiveUserMessages >= 3) {
      setReplyError('You have reached the maximum number of consecutive replies. Please wait for a response.');
      return;
    }
    
    setIsSubmitting(true);
    setReplyError('');
    
    try {
      await respondToComplaint(id, { 
        response: replyText
      });
      
      // Clear reply text after successful submission
      setReplyText('');
      
      // Refresh complaint data
      await fetchComplaint(id);
      
      // Update consecutive message count
      setConsecutiveUserMessages(prev => prev + 1);
    } catch (err) {
      setReplyError('Failed to submit reply. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Get avatar initials for a name
  const getInitials = (name) => {
    if (!name) return '?';
    
    const parts = name.split(' ');
    if (parts.length === 1) return name.charAt(0).toUpperCase();
    return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  if (error) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-6">
        <div className="bg-red-50 border-l-4 border-red-500 text-red-700 p-4 rounded-md shadow-sm">
          <div className="flex items-center">
            <svg className="h-5 w-5 text-red-500 mr-2" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            </svg>
            <p className="font-medium">Error: {error}</p>
          </div>
          <p className="mt-2 text-sm">Unable to load complaint details. Please try again.</p>
          <button
            onClick={() => navigate('/complaints')}
            className="mt-4 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
          >
            <svg className="h-4 w-4 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Back to Complaints
          </button>
        </div>
      </div>
    );
  }

  if (!currentComplaint) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-6">
        <div className="bg-amber-50 border-l-4 border-amber-500 text-amber-700 p-4 rounded-md shadow-sm">
          <div className="flex items-center">
            <svg className="h-5 w-5 text-amber-500 mr-2" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
            <p className="font-medium">Complaint not found</p>
          </div>
          <p className="mt-2 text-sm">The complaint you're looking for doesn't exist or has been removed.</p>
          <button
            onClick={() => navigate('/complaints')}
            className="mt-4 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-amber-600 hover:bg-amber-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-amber-500"
          >
            <svg className="h-4 w-4 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Back to Complaints
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Your Complaint</h1>
          <p className="text-gray-600 mt-1">Reference ID: #{id.substring(0, 8)}</p>
        </div>
        <button
          onClick={() => navigate('/complaints')}
          className="inline-flex items-center px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-800 font-medium rounded-lg transition-colors"
        >
          <svg className="h-4 w-4 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Back to Complaints
        </button>
      </div>

      {/* Complaint Card */}
      <div className="bg-white shadow-sm rounded-xl overflow-hidden mb-8">
        <div className="p-1 bg-gradient-to-r from-blue-500 to-blue-600"></div>
        
        {/* Complaint Header */}
        <div className="px-6 py-5 border-b border-gray-100">
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-y-3">
            <h2 className="text-xl font-bold text-gray-900">
              {currentComplaint.title}
            </h2>
            <div className="flex flex-wrap items-center gap-2">
              <CategoryBadge category={currentComplaint.category} />
              <StatusBadge status={currentComplaint.status} />
            </div>
          </div>
        </div>

        {/* Complaint Details */}
        <div className="px-6 py-5">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <div className="flex items-center space-x-2">
              <div className="bg-blue-100 p-2 rounded-full">
                <svg className="h-5 w-5 text-blue-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <div>
                <p className="text-sm text-gray-500">Submitted</p>
                <p className="text-sm font-medium">{formatDate(currentComplaint.createdAt)}</p>
              </div>
            </div>
            
            {currentComplaint.updatedAt !== currentComplaint.createdAt && (
              <div className="flex items-center space-x-2">
                <div className="bg-blue-100 p-2 rounded-full">
                  <svg className="h-5 w-5 text-blue-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Last Updated</p>
                  <p className="text-sm font-medium">{formatDate(currentComplaint.updatedAt)}</p>
                </div>
              </div>
            )}
          </div>
          
          <div className="bg-gray-50 rounded-lg p-4 border border-gray-100">
            <h3 className="text-sm font-medium text-gray-700 mb-3">Description</h3>
            <p className="text-gray-700 whitespace-pre-line">{currentComplaint.description}</p>
          </div>
        </div>

        {/* Conversation Thread */}
        <div className="px-6 py-5 border-t border-gray-100">
          <div className="flex items-center justify-between mb-5">
            <h3 className="text-lg font-semibold text-gray-800 flex items-center">
              <svg className="mr-2 h-5 w-5 text-gray-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M18 5v8a2 2 0 01-2 2h-5l-5 4v-4H4a2 2 0 01-2-2V5a2 2 0 012-2h12a2 2 0 012 2zM7 8H5v2h2V8zm2 0h2v2H9V8zm6 0h-2v2h2V8z" clipRule="evenodd" />
              </svg>
              Conversation
            </h3>
            <span className="inline-flex items-center bg-gray-100 px-2.5 py-0.5 rounded-full text-xs font-medium text-gray-800">
              {currentComplaint.responses.length} {currentComplaint.responses.length === 1 ? 'message' : 'messages'}
            </span>
          </div>

          {currentComplaint.responses.length === 0 ? (
            <div className="py-8 text-center bg-gray-50 rounded-lg my-5">
              <div className="inline-flex items-center justify-center p-4 bg-blue-50 rounded-full mb-4">
                <svg className="h-8 w-8 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">No responses yet</h3>
              <p className="text-gray-600 max-w-md mx-auto">
                Our team will respond to your complaint as soon as possible. Please check back later.
              </p>
            </div>
          ) : (
            <div className="space-y-6 my-5">
              {currentComplaint.responses.map((response, index) => {
                const isAdmin = response.adminName !== undefined;
                const userName = isAdmin ? response.adminName : (user?.name || 'You');
                const colorScheme = isAdmin 
                  ? userColors[response.adminName] || { bg: 'bg-gray-50', border: 'border-gray-200', text: 'text-gray-800', dark: 'text-gray-700' }
                  : userColors['user'];
                
                // Alternate left and right alignment
                const isLeft = index % 2 === 0;
                
                return (
                  <div key={response.id} className={`flex ${isLeft ? 'justify-start' : 'justify-end'}`}>
                    <div className={`flex max-w-[85%] ${isLeft ? 'flex-row' : 'flex-row-reverse'}`}>
                      <div className={`flex-shrink-0 ${isLeft ? 'mr-3' : 'ml-3'}`}>
                        <div className={`h-10 w-10 rounded-full flex items-center justify-center text-white ${colorScheme.avatar}`}>
                          {getInitials(userName)}
                        </div>
                      </div>
                      <div className={`flex-1 ${colorScheme.bg} border ${colorScheme.border} rounded-lg shadow-sm p-4`}>
                        <div className="flex justify-between items-center mb-2">
                          <span className={`font-medium ${colorScheme.text}`}>{isAdmin ? userName : 'You'}</span>
                          <span className="text-xs text-gray-500">{formatDate(response.createdAt)}</span>
                        </div>
                        <p className="text-gray-700 whitespace-pre-line">{response.message}</p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Message when user has sent 3 consecutive messages */}
          {(currentComplaint && 
           currentComplaint.status !== 'resolved' && 
           currentComplaint.status !== 'closed' && 
           consecutiveUserMessages >= 3) && (
            <div className="mt-6 bg-blue-50 border border-blue-200 p-4 rounded-lg">
              <div className="flex items-start">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-blue-400 mt-0.5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2h.01a1 1 0 100-2H9z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-blue-800">Waiting for response</h3>
                  <div className="mt-2 text-sm text-blue-700">
                    <p>You've sent multiple messages. Please wait for our team to respond before sending additional messages.</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Message when complaint is resolved or closed */}
          {(currentComplaint && 
           (currentComplaint.status === 'resolved' || currentComplaint.status === 'closed')) && (
            <div className="mt-6 bg-amber-50 border border-amber-200 p-4 rounded-lg">
              <div className="flex items-start">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-amber-400 mt-0.5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-amber-800">This complaint is {currentComplaint.status}</h3>
                  <div className="mt-2 text-sm text-amber-700">
                    <p>You cannot add more replies. If you need further assistance, please submit a new complaint.</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Reply Form - only show if complaint is not resolved or closed and within message limit */}
          {canReply() && (
            <div className="mt-8 border-t border-gray-100 pt-5">
              <h4 className="text-base font-medium text-gray-900 mb-3">Add Your Reply</h4>
              <form onSubmit={handleReplySubmit}>
                <div className="mt-1">
                  <textarea
                    id="reply"
                    name="reply"
                    rows="4"
                    className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                    placeholder="Type your message here..."
                    value={replyText}
                    onChange={(e) => setReplyText(e.target.value)}
                  ></textarea>
                </div>
                
                {replyError && (
                  <div className="mt-2 text-sm text-red-600 flex items-center">
                    <svg className="h-4 w-4 mr-1.5 text-red-500" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd"></path>
                    </svg>
                    {replyError}
                  </div>
                )}
                
                <div className="mt-4 flex justify-end">
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="px-6 py-2.5 bg-gradient-to-r from-blue-500 to-blue-600 text-white font-medium rounded-lg shadow-sm hover:from-blue-600 hover:to-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:outline-none transition-all disabled:opacity-70 disabled:cursor-not-allowed flex items-center"
                  >
                    {isSubmitting ? (
                      <>
                        <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Sending...
                      </>
                    ) : (
                      <>
                        <svg className="h-4 w-4 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                        </svg>
                        Send Message
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ComplaintDetail;