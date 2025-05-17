import React, { useContext, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ComplaintContext } from '../../context/ComplaintContext';
import api from '../../utils/api';

const ResolvedComplaints = () => {
  const { complaints, fetchComplaints, loading, error } = useContext(ComplaintContext);
  const [resolvedComplaints, setResolvedComplaints] = useState([]);
  const [ratingData, setRatingData] = useState({});
  const [ratingErrors, setRatingErrors] = useState({});
  const [ratingSuccess, setRatingSuccess] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Fetch complaints on component mount
  useEffect(() => {
    fetchComplaints();
  }, [fetchComplaints]);

  // Filter resolved complaints
  useEffect(() => {
    if (complaints) {
      const resolved = complaints.filter(
        complaint => complaint.status === 'resolved'
      );
      setResolvedComplaints(resolved);
      
      // Initialize rating state for each complaint
      const initialRating = {};
      const initialErrors = {};
      const initialSuccess = {};
      
      resolved.forEach(complaint => {
        initialRating[complaint.id] = complaint.rating || 0;
        initialErrors[complaint.id] = '';
        initialSuccess[complaint.id] = false;
      });
      
      setRatingData(initialRating);
      setRatingErrors(initialErrors);
      setRatingSuccess(initialSuccess);
    }
  }, [complaints]);

  // Format date
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  // Handle rating change
  const handleRatingChange = (complaintId, value) => {
    setRatingData({
      ...ratingData,
      [complaintId]: value
    });
    
    // Clear any error or success message
    setRatingErrors({
      ...ratingErrors,
      [complaintId]: ''
    });
    setRatingSuccess({
      ...ratingSuccess,
      [complaintId]: false
    });
  };

  // Submit rating
  const handleRatingSubmit = async (complaintId) => {
    // Validate rating
    if (!ratingData[complaintId] || ratingData[complaintId] < 1) {
      setRatingErrors({
        ...ratingErrors,
        [complaintId]: 'Please select a rating from 1 to 5'
      });
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      // Call API to submit rating
      await api.post(`/complaints/${complaintId}/rate`, {
        rating: ratingData[complaintId]
      });
      
      // Show success message
      setRatingSuccess({
        ...ratingSuccess,
        [complaintId]: true
      });
      
      // Clear error message
      setRatingErrors({
        ...ratingErrors,
        [complaintId]: ''
      });
      
      // Refresh complaints data
      fetchComplaints();
    } catch (err) {
      setRatingErrors({
        ...ratingErrors,
        [complaintId]: err.response?.data?.message || 'Failed to submit rating'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Render star rating component
  const StarRating = ({ complaintId }) => {
    const rating = ratingData[complaintId];
    const isRated = ratingSuccess[complaintId] || (complaints.find(c => c.id === complaintId)?.rating > 0);
    
    return (
      <div className="flex flex-col">
        <div className="flex space-x-1 mb-2">
          {[1, 2, 3, 4, 5].map(star => (
            <button
              key={star}
              type="button"
              onClick={() => handleRatingChange(complaintId, star)}
              disabled={isRated}
              className={`text-2xl focus:outline-none ${
                star <= rating
                  ? 'text-yellow-400 hover:text-yellow-500'
                  : 'text-gray-300 hover:text-yellow-400'
              }`}
            >
              ★
            </button>
          ))}
        </div>
        
        {isRated ? (
          <p className="text-green-600 text-sm">Thank you for your feedback!</p>
        ) : (
          <button
            onClick={() => handleRatingSubmit(complaintId)}
            disabled={isSubmitting}
            className="bg-blue-500 hover:bg-blue-700 text-white text-sm py-1 px-2 rounded"
          >
            {isSubmitting ? 'Submitting...' : 'Submit Rating'}
          </button>
        )}
        
        {ratingErrors[complaintId] && (
          <p className="text-red-500 text-sm mt-1">{ratingErrors[complaintId]}</p>
        )}
      </div>
    );
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <p className="text-gray-500">Loading resolved complaints...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
        <p>Error: {error}</p>
      </div>
    );
  }

  return (
    <div>
      <h2 className="text-xl font-semibold mb-4">Resolved Complaints</h2>
      
      {resolvedComplaints.length === 0 ? (
        <div className="bg-gray-100 p-6 rounded text-center">
          <p className="text-gray-600">You don't have any resolved complaints yet.</p>
        </div>
      ) : (
        <div className="space-y-6">
          {resolvedComplaints.map(complaint => (
            <div key={complaint.id} className="bg-white shadow rounded-lg overflow-hidden">
              <div className="p-6">
                <div className="flex justify-between items-start">
                  <Link to={`/complaints/${complaint.id}`} className="text-lg font-medium text-blue-600 hover:underline">
                    {complaint.title}
                  </Link>
                  <span className="bg-green-100 text-green-800 px-2 py-1 text-xs font-medium rounded-full">
                    Resolved
                  </span>
                </div>
                
                <div className="mt-2 text-sm text-gray-500">
                  <p>Category: {complaint.category}</p>
                  <p>Submitted: {formatDate(complaint.createdAt)}</p>
                  <p>Resolved: {formatDate(complaint.updatedAt)}</p>
                </div>
                
                <div className="mt-4 flex justify-between items-center">
                  <div>
                    <h3 className="text-sm font-medium text-gray-700">Rate our service</h3>
                    <StarRating complaintId={complaint.id} />
                  </div>
                  
                  <Link
                    to={`/complaints/${complaint.id}`}
                    className="text-blue-500 hover:text-blue-700 text-sm font-medium"
                  >
                    View Details
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ResolvedComplaints;