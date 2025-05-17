import React, { useContext, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AuthProvider, AuthContext } from '../context/AuthContext';
import { ComplaintProvider } from '../context/ComplaintContext';

// Common components
import Header from './Common/Header';
import Footer from './Common/Footer';
import HomePage from './HomePage';

// Customer components
import CustomerLogin from './Customer/Login';
import CustomerRegister from './Customer/Register';
import CustomerComplaints from './Customer/Complaints';
import CustomerDashboard from './Customer/Dashboard';
import CreateComplaint from './Customer/CreateComplaint';
import ComplaintDetail from './Customer/ComplaintDetail';

// Admin components
import AdminLogin from './Admin/Login';
import AdminDashboard from './Admin/Dashboard';
import AdminComplaintDetail from './Admin/ComplaintDetail';

// ScrollToTop component to handle scroll position on route change
const ScrollToTop = () => {
  const { pathname } = useLocation();
  
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  
  return null;
};

// Protected route component
const ProtectedRoute = ({ element, requiredRole }) => {
  const { isAuthenticated, user, loading } = useContext(AuthContext);
  
  // Show loading indicator while checking authentication
  if (loading) {
    return <div className="flex justify-center items-center h-screen">Loading...</div>;
  }
  
  // Check if user is authenticated
  if (!isAuthenticated()) {
    return <Navigate to="/login" />;
  }
  
  // Check if user has required role
  if (requiredRole && user.role !== requiredRole) {
    return <Navigate to="/" />;
  }
  
  return element;
};

const App = () => {
  return (
    <AuthProvider>
      <ComplaintProvider>
        <Router>
          <ScrollToTop />
          <div className="flex flex-col min-h-screen">
            <Header />
            <main className="flex-grow">
              <Routes>
                {/* Public routes */}
                <Route path="/" element={<HomePage />} />
                <Route path="/login" element={<CustomerLogin />} />
                <Route path="/register" element={<CustomerRegister />} />
                <Route path="/admin/login" element={<AdminLogin />} />
                
                {/* Customer routes */}
                <Route 
                  path="/complaints" 
                  element={<ProtectedRoute element={<CustomerComplaints />} requiredRole="customer" />} 
                />
                <Route 
                  path="/dashboard" 
                  element={<ProtectedRoute element={<CustomerDashboard />} requiredRole="customer" />} 
                />
                <Route 
                  path="/complaints/new" 
                  element={<ProtectedRoute element={<CreateComplaint />} requiredRole="customer" />} 
                />
                <Route 
                  path="/complaints/:id" 
                  element={<ProtectedRoute element={<ComplaintDetail />} requiredRole="customer" />} 
                />
                
                {/* Admin routes */}
                <Route 
                  path="/admin" 
                  element={<ProtectedRoute element={<AdminDashboard />} requiredRole="admin" />} 
                />
                <Route 
                  path="/admin/complaints/:id" 
                  element={<ProtectedRoute element={<AdminComplaintDetail />} requiredRole="admin" />} 
                />
                
                {/* Fallback route */}
                <Route path="*" element={<Navigate to="/" />} />
              </Routes>
            </main>
            <Footer />
          </div>
        </Router>
      </ComplaintProvider>
    </AuthProvider>
  );
};

export default App;