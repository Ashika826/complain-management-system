import React, { useState, useContext, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ComplaintContext } from '../../context/ComplaintContext';

const CreateComplaint = () => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: 'general' // Default category
  });
  const [formError, setFormError] = useState('');
  
  const { createComplaint, error, loading } = useContext(ComplaintContext);
  const navigate = useNavigate();
  
  // Update form error when context error changes
  useEffect(() => {
    if (error) {
      setFormError(error);
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
    if (!formData.title || !formData.description) {
      setFormError('Please fill in all required fields');
      return;
    }
    
    try {
      const newComplaint = await createComplaint(formData);
      // Redirect to the new complaint detail page
      navigate(`/complaints/${newComplaint.id}`);
    } catch (err) {
      // Error is handled by context and useEffect above
    }
  };
  
  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-gray-800 mb-2">Submit New Complaint</h1>
      <p className="text-gray-600 mb-8">Please provide details about your issue below</p>
      
      <div className="bg-white rounded-xl shadow-lg overflow-hidden">
        <div className="p-1 bg-gradient-to-r from-blue-500 to-purple-600"></div>
        
        <form onSubmit={handleSubmit} className="p-8">
          {formError && (
            <div className="bg-red-50 border-l-4 border-red-500 text-red-700 p-4 mb-6 rounded-md">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-red-500" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <p className="text-sm">{formError}</p>
                </div>
              </div>
            </div>
          )}
          
          <div className="space-y-6">
            <div>
              <label className="block text-gray-700 text-sm font-medium mb-2" htmlFor="title">
                Title <span className="text-red-500">*</span>
              </label>
              <input
                className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                id="title"
                type="text"
                name="title"
                value={formData.title}
                onChange={handleChange}
                placeholder="Brief title for your complaint"
                required
              />
            </div>
            
            <div>
              <label className="block text-gray-700 text-sm font-medium mb-2" htmlFor="category">
                Category
              </label>
              <div className="relative">
                <select
                  className="appearance-none w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition bg-white"
                  id="category"
                  name="category"
                  value={formData.category}
                  onChange={handleChange}
                >
                  <option value="general">General</option>
                  <option value="product">Product</option>
                  <option value="service">Service</option>
                  <option value="billing">Billing</option>
                  <option value="technical">Technical</option>
                  <option value="other">Other</option>
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
                  <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                    <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" />
                  </svg>
                </div>
              </div>
            </div>
            
            <div>
              <label className="block text-gray-700 text-sm font-medium mb-2" htmlFor="description">
                Description <span className="text-red-500">*</span>
              </label>
              <textarea
                className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                id="description"
                name="description"
                value={formData.description}
                onChange={handleChange}
                placeholder="Please describe your complaint in detail"
                rows="6"
                required
              ></textarea>
            </div>
            
            <div className="flex flex-col sm:flex-row sm:justify-between gap-4 pt-4">
              <button
                type="button"
                onClick={() => navigate('/')}
                className="order-2 sm:order-1 px-6 py-3 bg-gray-100 text-gray-700 font-medium rounded-lg hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition-colors w-full sm:w-auto"
              >
                Cancel
              </button>
              <button
                className="order-1 sm:order-2 px-6 py-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white font-medium rounded-lg hover:from-blue-600 hover:to-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all w-full sm:w-auto"
                type="submit"
                disabled={loading}
              >
                {loading ? (
                  <span className="flex items-center justify-center">
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Submitting...
                  </span>
                ) : 'Submit Complaint'}
              </button>
            </div>
          </div>
        </form>
      </div>
      
      <div className="mt-8 text-center text-sm text-gray-500">
        <p>Your complaint will be reviewed by our team within 48 hours</p>
      </div>
    </div>
  );
};

export default CreateComplaint;