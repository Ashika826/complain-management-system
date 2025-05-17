const jwt = require('jsonwebtoken');
const { userModel } = require('../db/models');

const JWT_SECRET = process.env.JWT_SECRET || 'your_jwt_secret_key';

// Middleware to verify JWT token
const authenticateJWT = async (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'Unauthorized: No token provided' });
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    
    // Find the user by the id from the token
    const user = await userModel.getById(decoded.id);
    if (!user) {
      return res.status(401).json({ message: 'Unauthorized: User not found' });
    }
    
    // Add user to request object
    req.user = user;
    next();
  } catch (error) {
    return res.status(401).json({ message: 'Unauthorized: Invalid token' });
  }
};

// Middleware to ensure the user is an admin
const requireAdmin = (req, res, next) => {
  if (!req.user || req.user.role !== 'admin') {
    return res.status(403).json({ message: 'Forbidden: Admin access required' });
  }
  next();
};

// Middleware to ensure the customer owns the resource or is an admin
const ensureOwnership = (req, res, next) => {
  if (req.user.role === 'admin') {
    // Admins can access all resources
    next();
  } else if (req.params.userId && req.user.id === req.params.userId) {
    // User is accessing their own resource
    next();
  } else if (req.params.complaintId) {
    // Check if the complaint belongs to the user
    // This would need to be implemented based on your complaint model structure
    // For now, we'll pass and assume the check happens in the controller
    next();
  } else {
    return res.status(403).json({ message: 'Forbidden: You do not have permission to access this resource' });
  }
};

module.exports = {
  authenticateJWT,
  requireAdmin,
  ensureOwnership
};