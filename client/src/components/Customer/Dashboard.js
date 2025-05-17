import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import { ComplaintContext } from '../../context/ComplaintContext';
import Profile from './Profile';
import ResolvedComplaints from './ResolvedComplaints';

const Dashboard = () => {
  const [activeTab, setActiveTab] = useState('profile');
  const { user, isAuthenticated, loading } = useContext(AuthContext);
  const { complaints } = useContext(ComplaintContext);
  const navigate = useNavigate();

  // Redirect if not authenticated
  React.useEffect(() => {
    if (!loading && !isAuthenticated()) {
      navigate('/login');
    }
  }, [loading, isAuthenticated, navigate]);

  // Count of resolved complaints
  const resolvedCount = complaints ? 
    complaints.filter(complaint => complaint.status === 'resolved').length : 0;

  // Count of total complaints
  const totalCount = complaints ? complaints.length : 0;

  // Count of pending complaints
  const pendingCount = complaints ? 
    complaints.filter(complaint => complaint.status === 'pending' || complaint.status === 'in-progress').length : 0;

  if (loading || !user) {
    return (
      <div className="flex justify-center items-center h-64">
        <p className="text-gray-500">Loading...</p>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Customer Dashboard</h1>
      
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-gray-500 text-sm">Total Complaints</h2>
          <p className="text-3xl font-bold">{totalCount}</p>
        </div>
        
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-yellow-500 text-sm">Pending Complaints</h2>
          <p className="text-3xl font-bold">{pendingCount}</p>
        </div>
        
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-green-500 text-sm">Resolved Complaints</h2>
          <p className="text-3xl font-bold">{resolvedCount}</p>
        </div>
      </div>
      
      {/* Tabs */}
      <div className="bg-white shadow-md rounded-lg overflow-hidden mb-8">
        <div className="flex border-b">
          <button
            className={`px-6 py-3 w-1/2 sm:w-auto text-center ${
              activeTab === 'profile'
                ? 'border-b-2 border-blue-500 text-blue-600 font-medium'
                : 'text-gray-600 hover:text-blue-500'
            }`}
            onClick={() => setActiveTab('profile')}
          >
            Profile & Settings
          </button>
          <button
            className={`px-6 py-3 w-1/2 sm:w-auto text-center ${
              activeTab === 'resolved'
                ? 'border-b-2 border-blue-500 text-blue-600 font-medium'
                : 'text-gray-600 hover:text-blue-500'
            }`}
            onClick={() => setActiveTab('resolved')}
          >
            Resolved Complaints
          </button>
        </div>
        
        {/* Tab Content */}
        <div className="p-6">
          {activeTab === 'profile' && <Profile />}
          {activeTab === 'resolved' && <ResolvedComplaints />}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;