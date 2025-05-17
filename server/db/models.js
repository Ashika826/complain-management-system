const fs = require('fs').promises;
const path = require('path');

// Database file paths
const USERS_PATH = path.join(__dirname, 'data', 'users.json');
const COMPLAINTS_PATH = path.join(__dirname, 'data', 'complaints.json');

// Ensure data directory and files exist
const initializeDB = async () => {
  try {
    // Create data directory if it doesn't exist
    await fs.mkdir(path.join(__dirname, 'data'), { recursive: true });
    
    // Check if users.json exists, if not create it
    try {
      await fs.access(USERS_PATH);
    } catch (error) {
      await fs.writeFile(USERS_PATH, JSON.stringify([]));
    }
    
    // Check if complaints.json exists, if not create it
    try {
      await fs.access(COMPLAINTS_PATH);
    } catch (error) {
      await fs.writeFile(COMPLAINTS_PATH, JSON.stringify([]));
    }
  } catch (error) {
    console.error('Failed to initialize database:', error);
    throw error;
  }
};

// User related database operations
const userModel = {
  async getAll() {
    const data = await fs.readFile(USERS_PATH, 'utf8');
    return JSON.parse(data);
  },
  
  async getById(id) {
    const users = await this.getAll();
    return users.find(user => user.id === id);
  },
  
  async getByUsername(username) {
    const users = await this.getAll();
    return users.find(user => user.username === username);
  },
  
  async create(user) {
    const users = await this.getAll();
    
    // Check if user already exists
    const existingUser = users.find(u => u.username === user.username);
    if (existingUser) {
      throw new Error('Username already exists');
    }
    
    // Add the new user
    users.push(user);
    await fs.writeFile(USERS_PATH, JSON.stringify(users, null, 2));
    return user;
  },
  
  async update(id, updatedData) {
    const users = await this.getAll();
    const index = users.findIndex(user => user.id === id);
    
    if (index === -1) {
      throw new Error('User not found');
    }
    
    users[index] = { ...users[index], ...updatedData };
    await fs.writeFile(USERS_PATH, JSON.stringify(users, null, 2));
    return users[index];
  },
  
  async delete(id) {
    const users = await this.getAll();
    const filteredUsers = users.filter(user => user.id !== id);
    await fs.writeFile(USERS_PATH, JSON.stringify(filteredUsers, null, 2));
  }
};

// Complaint related database operations
const complaintModel = {
  async getAll() {
    const data = await fs.readFile(COMPLAINTS_PATH, 'utf8');
    return JSON.parse(data);
  },
  
  async getById(id) {
    const complaints = await this.getAll();
    return complaints.find(complaint => complaint.id === id);
  },
  
  async getByUser(userId) {
    const complaints = await this.getAll();
    return complaints.filter(complaint => complaint.userId === userId);
  },
  
  async create(complaint) {
    const complaints = await this.getAll();
    complaints.push(complaint);
    await fs.writeFile(COMPLAINTS_PATH, JSON.stringify(complaints, null, 2));
    return complaint;
  },
  
  async update(id, updatedData) {
    const complaints = await this.getAll();
    const index = complaints.findIndex(complaint => complaint.id === id);
    
    if (index === -1) {
      throw new Error('Complaint not found');
    }
    
    complaints[index] = { ...complaints[index], ...updatedData };
    await fs.writeFile(COMPLAINTS_PATH, JSON.stringify(complaints, null, 2));
    return complaints[index];
  },
  
  async delete(id) {
    const complaints = await this.getAll();
    const filteredComplaints = complaints.filter(complaint => complaint.id !== id);
    await fs.writeFile(COMPLAINTS_PATH, JSON.stringify(filteredComplaints, null, 2));
  }
};

module.exports = {
  initializeDB,
  userModel,
  complaintModel
};