import React, { useContext, useEffect, useState, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ComplaintContext } from '../../context/ComplaintContext';

const ComplaintDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { 
    fetchComplaint, 
    currentComplaint, 
    loading, 
    error, 
    respondToComplaint,
    updateComplaintStatus 
  } = useContext(ComplaintContext);

  const [responseText, setResponseText] = useState('');
  const [responseError, setResponseError] = useState('');
  const [newStatus, setNewStatus] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Fetch complaint on component mount or id change
  useEffect(() => {
    fetchComplaint(id);
  }, [fetchComplaint, id]);

  // Set initial status value once complaint is loaded
  useEffect(() => {
    if (currentComplaint) {
      setNewStatus(currentComplaint.status);
    }
  }, [currentComplaint]);

  // Generate consistent colors for usernames
  const userColors = useMemo(() => {
    if (!currentComplaint || !currentComplaint.responses) return {};
    
    const colors = [
      'bg-blue-50 border-blue-200 text-blue-800',
      'bg-purple-50 border-purple-200 text-purple-800',
      'bg-green-50 border-green-200 text-green-800',
      'bg-amber-50 border-amber-200 text-amber-800',
      'bg-indigo-50 border-indigo-200 text-indigo-800',
      'bg-rose-50 border-rose-200 text-rose-800',
      'bg-teal-50 border-teal-200 text-teal-800',
    ];
    
    const userColorMap = {};
    const adminNames = [...new Set(currentComplaint.responses.map(r => r.adminName))];
    
    adminNames.forEach((name, index) => {
      userColorMap[name] = colors[index % colors.length];
    });
    
    return userColorMap;
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

  // Get status color
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

  // Handle response submission
  const handleResponseSubmit = async (e) => {
    e.preventDefault();
    
    if (!responseText.trim()) {
      setResponseError('Response cannot be empty');
      return;
    }
    
    setSubmitting(true);
    setResponseError('');
    
    try {
      await respondToComplaint(id, { 
        response: responseText,
        status: newStatus !== currentComplaint.status ? newStatus : undefined 
      });
      
      // Clear response text after successful submission
      setResponseText('');
      
      // If status was changed, update it
      if (newStatus !== currentComplaint.status) {
        fetchComplaint(id);
      } else {
        // Just fetch the complaint to get the updated responses
        fetchComplaint(id);
      }
    } catch (err) {
      setResponseError('Failed to submit response. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  // Handle status change
  const handleStatusChange = async (e) => {
    const status = e.target.value;
    setNewStatus(status);
    
    try {
      await updateComplaintStatus(id, { status });
      // Refresh complaint data after update
      fetchComplaint(id);
    } catch (err) {
      console.error('Failed to update status:', err);
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
    return (
      <div className="flex justify-center items-center h-64">
        <div className="flex flex-col items-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mb-4"></div>
          <p className="text-gray-600 font-medium">Loading complaint details...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border-l-4 border-red-500 text-red-700 p-4 rounded-md shadow-sm">
        <div className="flex items-center">
          <svg className="h-5 w-5 text-red-500 mr-2" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
          </svg>
          <p className="font-medium">Error: {error}</p>
        </div>
        <button
          onClick={() => navigate('/admin')}
          className="mt-4 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
        >
          <svg className="h-4 w-4 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Return to Dashboard
        </button>
      </div>
    );
  }

  if (!currentComplaint) {
    return (
      <div className="bg-amber-50 border-l-4 border-amber-500 text-amber-700 p-4 rounded-md shadow-sm">
        <div className="flex items-center">
          <svg className="h-5 w-5 text-amber-500 mr-2" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
          <p className="font-medium">Complaint not found</p>
        </div>
        <p className="mt-2 text-sm">The requested complaint could not be found or you may not have permission to view it.</p>
        <button
          onClick={() => navigate('/admin')}
          className="mt-4 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-amber-600 hover:bg-amber-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-amber-500"
        >
          <svg className="h-4 w-4 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Return to Dashboard
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Complaint Details</h1>
          <p className="text-gray-600 mt-1">Managing customer issue #{id.substring(0, 8)}</p>
        </div>
        <button
          onClick={() => navigate('/admin')}
          className="inline-flex items-center px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-800 font-medium rounded-lg transition-colors"
        >
          <svg className="h-4 w-4 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Back to Dashboard
        </button>
      </div>

      {/* Complaint details */}
      <div className="bg-white shadow-sm rounded-xl overflow-hidden mb-8">
        <div className="p-1 bg-gradient-to-r from-blue-500 to-blue-600"></div>
        <div className="p-6">
          <div className="flex flex-col md:flex-row justify-between md:items-center gap-4 mb-6">
            <h2 className="text-xl font-bold text-gray-800">{currentComplaint.title}</h2>
            
            <div className="flex items-center space-x-2">
              <span className="text-sm text-gray-600 whitespace-nowrap">Status:</span>
              <select
                value={newStatus}
                onChange={handleStatusChange}
                className={`appearance-none pl-3 pr-8 py-1.5 text-sm font-medium rounded-lg ${getStatusColor(newStatus)} border focus:ring-2 focus:ring-blue-500 focus:outline-none cursor-pointer`}
                style={{backgroundPosition: 'right 0.5rem center', backgroundRepeat: 'no-repeat', backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e")`, backgroundSize: '1.5em 1.5em', paddingRight: '2.5rem'}}
              >
                <option value="pending">Pending</option>
                <option value="in-progress">In Progress</option>
                <option value="resolved">Resolved</option>
                <option value="closed">Closed</option>
              </select>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <div className="flex items-center space-x-2">
              <div className="bg-blue-100 p-2 rounded-full">
                <svg className="h-5 w-5 text-blue-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>
              <div>
                <p className="text-sm text-gray-500">Customer</p>
                <p className="text-sm font-medium">{currentComplaint.userName}</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-2">
              <div className="bg-blue-100 p-2 rounded-full">
                <svg className="h-5 w-5 text-blue-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                </svg>
              </div>
              <div>
                <p className="text-sm text-gray-500">Category</p>
                <p className="text-sm font-medium capitalize">{currentComplaint.category}</p>
              </div>
            </div>
            
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
      </div>

      {/* Response history */}
      <div className="bg-white shadow-sm rounded-xl overflow-hidden mb-8">
        <div className="px-6 py-4 border-b border-gray-100">
          <h3 className="text-lg font-semibold text-gray-800">Response History</h3>
        </div>
        
        {currentComplaint.responses.length === 0 ? (
          <div className="p-8 text-center">
            <div className="inline-flex items-center justify-center p-4 bg-blue-50 rounded-full mb-4">
              <svg className="h-8 w-8 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
              </svg>
            </div>
            <h4 className="text-lg font-medium text-gray-800 mb-2">No responses yet</h4>
            <p className="text-gray-600 max-w-md mx-auto">Be the first to respond to this customer's complaint by using the form below.</p>
          </div>
        ) : (
          <div className="p-6 space-y-6">
            {currentComplaint.responses.map(response => {
              const colorClass = userColors[response.adminName] || 'bg-gray-50 border-gray-200 text-gray-800';
              const nameInitials = getInitials(response.adminName);
              
              return (
                <div key={response.id} className={`p-5 rounded-lg border ${colorClass.replace('text-', 'border-')}`}>
                  <div className="flex items-start space-x-3">
                    <div className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center ${colorClass.replace('bg-', 'bg-').replace('-50', '-100').replace('text-', 'text-')}`}>
                      {nameInitials}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-start">
                        <div>
                          <p className={`font-medium ${colorClass.replace('bg-', 'text-').replace('-50', '-700')}`}>
                            {response.adminName}
                          </p>
                          <p className="text-xs text-gray-500 mt-0.5">{formatDate(response.createdAt)}</p>
                        </div>
                        {response.statusChange && (
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(response.statusChange)}`}>
                            Changed status to {response.statusChange}
                          </span>
                        )}
                      </div>
                      <div className="mt-3 text-sm text-gray-700 whitespace-pre-line">
                        {response.message}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Add response form */}
      <div className="bg-white shadow-sm rounded-xl overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100">
          <h3 className="text-lg font-semibold text-gray-800">Add Response</h3>
          <p className="text-sm text-gray-600 mt-1">Your response will be sent to the customer and added to the complaint history.</p>
        </div>
        
        <div className="p-6">
          <form onSubmit={handleResponseSubmit}>
            {responseError && (
              <div className="bg-red-50 border-l-4 border-red-500 text-red-700 p-4 rounded-md mb-4">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <svg className="h-5 w-5 text-red-500" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <p className="text-sm">{responseError}</p>
                  </div>
                </div>
              </div>
            )}
            
            <div className="mb-4">
              <textarea
                className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                rows="5"
                placeholder="Type your response to the customer here..."
                value={responseText}
                onChange={(e) => setResponseText(e.target.value)}
                required
              ></textarea>
            </div>
            
            <div className="flex justify-end">
              <button
                type="submit"
                className="px-6 py-2.5 bg-gradient-to-r from-blue-500 to-blue-600 text-white font-medium rounded-lg shadow-sm hover:from-blue-600 hover:to-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:outline-none transition-all disabled:opacity-70 disabled:cursor-not-allowed flex items-center"
                disabled={submitting}
              >
                {submitting ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Submitting...
                  </>
                ) : (
                  <>
                    <svg className="h-4 w-4 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                    Submit Response
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ComplaintDetail;