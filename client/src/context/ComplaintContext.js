import React, { createContext, useState, useContext, useCallback } from 'react';
import api from '../utils/api';
import { AuthContext } from './AuthContext';

// Create the complaint context
export const ComplaintContext = createContext();

// Create the complaint provider component
export const ComplaintProvider = ({ children }) => {
  const { isAuthenticated } = useContext(AuthContext);
  const [complaints, setComplaints] = useState([]);
  const [currentComplaint, setCurrentComplaint] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Fetch all complaints
  const fetchComplaints = useCallback(async () => {
    if (!isAuthenticated()) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const response = await api.get('/complaints');
      setComplaints(response.data.complaints);
      return response.data.complaints;
    } catch (err) {
      const message = err.response?.data?.message || 'Failed to fetch complaints';
      setError(message);
      throw new Error(message);
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated]);

  // Fetch a single complaint by ID
  const fetchComplaint = useCallback(async (id) => {
    if (!isAuthenticated()) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const response = await api.get(`/complaints/${id}`);
      setCurrentComplaint(response.data.complaint);
      return response.data.complaint;
    } catch (err) {
      const message = err.response?.data?.message || 'Failed to fetch complaint';
      setError(message);
      throw new Error(message);
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated]);

  // Create a new complaint
  const createComplaint = async (complaintData) => {
    if (!isAuthenticated()) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const response = await api.post('/complaints', complaintData);
      
      // Update complaints list
      setComplaints([response.data.complaint, ...complaints]);
      setCurrentComplaint(response.data.complaint);
      
      return response.data.complaint;
    } catch (err) {
      const message = err.response?.data?.message || 'Failed to create complaint';
      setError(message);
      throw new Error(message);
    } finally {
      setLoading(false);
    }
  };

  // Respond to a complaint (admin only)
  const respondToComplaint = async (id, responseData) => {
    if (!isAuthenticated()) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const response = await api.post(`/complaints/${id}/respond`, responseData);
      
      // Update current complaint
      setCurrentComplaint(response.data.complaint);
      
      // Update complaints list
      setComplaints(
        complaints.map(complaint => 
          complaint.id === id ? response.data.complaint : complaint
        )
      );
      
      return response.data.complaint;
    } catch (err) {
      const message = err.response?.data?.message || 'Failed to respond to complaint';
      setError(message);
      throw new Error(message);
    } finally {
      setLoading(false);
    }
  };

  // Update complaint status (admin only) - FIXED VERSION
  const updateComplaintStatus = async (id, statusData) => {
    if (!isAuthenticated()) return;
    
    setLoading(true);
    setError(null);
    
    try {
      // Make sure we're passing the entire statusData object
      const response = await api.patch(`/complaints/${id}/status`, statusData);
      
      // Update current complaint
      setCurrentComplaint(response.data.complaint);
      
      // Update complaints list
      setComplaints(
        complaints.map(complaint => 
          complaint.id === id ? response.data.complaint : complaint
        )
      );
      
      return response.data.complaint;
    } catch (err) {
      const message = err.response?.data?.message || 'Failed to update complaint status';
      setError(message);
      throw new Error(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ComplaintContext.Provider
      value={{
        complaints,
        currentComplaint,
        loading,
        error,
        fetchComplaints,
        fetchComplaint,
        createComplaint,
        respondToComplaint,
        updateComplaintStatus,
        setCurrentComplaint
      }}
    >
      {children}
    </ComplaintContext.Provider>
  );
};