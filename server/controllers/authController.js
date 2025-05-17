const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { v4: uuidv4 } = require('uuid');
const { userModel } = require('../db/models');

const JWT_SECRET = process.env.JWT_SECRET || 'your_jwt_secret_key';
const TOKEN_EXPIRY = '24h';

// Register a new customer
const register = async (req, res) => {
  try {
    const { username, password, name, email } = req.body;
    
    // Validate input
    if (!username || !password || !name || !email) {
      return res.status(400).json({ message: 'All fields are required' });
    }
    
    // Check if username already exists
    const existingUser = await userModel.getByUsername(username);
    if (existingUser) {
      return res.status(400).json({ message: 'Username already exists' });
    }
    
    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    
    // Create new user
    const newUser = {
      id: uuidv4(),
      username,
      password: hashedPassword,
      name,
      email,
      role: 'customer', // Default role is customer
      createdAt: new Date().toISOString()
    };
    
    await userModel.create(newUser);
    
    // Generate JWT token
    const token = jwt.sign(
      { id: newUser.id, username: newUser.username, role: newUser.role },
      JWT_SECRET,
      { expiresIn: TOKEN_EXPIRY }
    );
    
    // Return user data without password and token
    const { password: _, ...userWithoutPassword } = newUser;
    
    res.status(201).json({
      message: 'User registered successfully',
      user: userWithoutPassword,
      token
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ message: 'Server error during registration' });
  }
};

// Login user (customer or admin)
const login = async (req, res) => {
  try {
    const { username, password } = req.body;
    
    // Validate input
    if (!username || !password) {
      return res.status(400).json({ message: 'Username and password are required' });
    }
    
    // Check if user exists
    const user = await userModel.getByUsername(username);
    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }
    
    // Verify password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }
    
    // Generate JWT token
    const token = jwt.sign(
      { id: user.id, username: user.username, role: user.role },
      JWT_SECRET,
      { expiresIn: TOKEN_EXPIRY }
    );
    
    // Return user data without password and token
    const { password: _, ...userWithoutPassword } = user;
    
    res.status(200).json({
      message: 'Login successful',
      user: userWithoutPassword,
      token
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Server error during login' });
  }
};

// Get current user profile
const getProfile = async (req, res) => {
  try {
    // User is already attached to request in auth middleware
    const { password, ...userWithoutPassword } = req.user;
    
    res.status(200).json({
      user: userWithoutPassword
    });
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({ message: 'Server error while fetching profile' });
  }
};

// Update user profile
const updateProfile = async (req, res) => {
  try {
    const userId = req.user.id;
    const { name, email, currentPassword, newPassword } = req.body;
    
    // Validate basic input
    if (!name || !email) {
      return res.status(400).json({ message: 'Name and email are required' });
    }
    
    // Get current user data
    const user = await userModel.getById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    // Prepare update data
    const updateData = {
      name,
      email
    };
    
    // If user is changing password, verify current password and hash new password
    if (newPassword) {
      if (!currentPassword) {
        return res.status(400).json({ message: 'Current password is required to set a new password' });
      }
      
      // Verify current password
      const isMatch = await bcrypt.compare(currentPassword, user.password);
      if (!isMatch) {
        return res.status(400).json({ message: 'Current password is incorrect' });
      }
      
      // Hash new password
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(newPassword, salt);
      
      updateData.password = hashedPassword;
    }
    
    // Update user data
    const updatedUser = await userModel.update(userId, updateData);
    
    // Return updated user data without password
    const { password, ...userWithoutPassword } = updatedUser;
    
    res.status(200).json({
      message: 'Profile updated successfully',
      user: userWithoutPassword
    });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({ message: 'Server error while updating profile' });
  }
};

// Create admin user (used with curl)
const createAdmin = async (req, res) => {
  try {
    const { username, password, name, email, adminSecret } = req.body;
    
    // Check admin secret to prevent unauthorized admin creation
    const ADMIN_SECRET = process.env.ADMIN_SECRET || 'admin_setup_secret';
    if (adminSecret !== ADMIN_SECRET) {
      return res.status(403).json({ message: 'Invalid admin secret' });
    }
    
    // Validate input
    if (!username || !password || !name || !email) {
      return res.status(400).json({ message: 'All fields are required' });
    }
    
    // Check if username already exists
    const existingUser = await userModel.getByUsername(username);
    if (existingUser) {
      return res.status(400).json({ message: 'Username already exists' });
    }
    
    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    
    // Create new admin
    const newAdmin = {
      id: uuidv4(),
      username,
      password: hashedPassword,
      name,
      email,
      role: 'admin',
      createdAt: new Date().toISOString()
    };
    
    await userModel.create(newAdmin);
    
    // Return success without token
    res.status(201).json({
      message: 'Admin user created successfully'
    });
  } catch (error) {
    console.error('Create admin error:', error);
    res.status(500).json({ message: 'Server error during admin creation' });
  }
};

module.exports = {
  register,
  login,
  getProfile,
  updateProfile,
  createAdmin
};