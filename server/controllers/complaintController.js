const { v4: uuidv4 } = require('uuid');
const { complaintModel } = require('../db/models');

// Create a new complaint
const createComplaint = async (req, res) => {
  try {
    const { title, description, category } = req.body;
    
    // Validate input
    if (!title || !description || !category) {
      return res.status(400).json({ message: 'Title, description, and category are required' });
    }
    
    // Create new complaint
    const newComplaint = {
      id: uuidv4(),
      userId: req.user.id,
      userName: req.user.name,
      title,
      description,
      category,
      status: 'pending', // Initial status
      responses: [], // Array to store admin responses
      rating: 0, // Initial rating
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    await complaintModel.create(newComplaint);
    
    res.status(201).json({
      message: 'Complaint submitted successfully',
      complaint: newComplaint
    });
  } catch (error) {
    console.error('Create complaint error:', error);
    res.status(500).json({ message: 'Server error while creating complaint' });
  }
};

// Get all complaints (admin can see all, customer only sees their own)
const getComplaints = async (req, res) => {
  try {
    let complaints;
    
    // Admin can see all complaints
    if (req.user.role === 'admin') {
      complaints = await complaintModel.getAll();
    } else {
      // Customer can only see their own complaints
      complaints = await complaintModel.getByUser(req.user.id);
    }
    
    res.status(200).json({ complaints });
  } catch (error) {
    console.error('Get complaints error:', error);
    res.status(500).json({ message: 'Server error while fetching complaints' });
  }
};

// Get a specific complaint by ID
const getComplaint = async (req, res) => {
  try {
    const complaintId = req.params.id;
    const complaint = await complaintModel.getById(complaintId);
    
    if (!complaint) {
      return res.status(404).json({ message: 'Complaint not found' });
    }
    
    // Check if user has permission to view this complaint
    if (req.user.role !== 'admin' && complaint.userId !== req.user.id) {
      return res.status(403).json({ message: 'Forbidden: You do not have permission to view this complaint' });
    }
    
    res.status(200).json({ complaint });
  } catch (error) {
    console.error('Get complaint error:', error);
    res.status(500).json({ message: 'Server error while fetching complaint' });
  }
};

// Respond to a complaint (admin only)
const respondToComplaint = async (req, res) => {
  try {
    const complaintId = req.params.id;
    const { response, status } = req.body;
    
    // Validate input
    if (!response) {
      return res.status(400).json({ message: 'Response message is required' });
    }
    
    // Get the complaint
    const complaint = await complaintModel.getById(complaintId);
    
    if (!complaint) {
      return res.status(404).json({ message: 'Complaint not found' });
    }
    
    // Create the response object
    const responseObj = {
      id: uuidv4(),
      adminId: req.user.id,
      adminName: req.user.name,
      message: response,
      createdAt: new Date().toISOString()
    };
    
    // Update the complaint with the new response
    const updatedComplaint = {
      ...complaint,
      responses: [...complaint.responses, responseObj],
      status: status || complaint.status, // Update status if provided
      updatedAt: new Date().toISOString()
    };
    
    await complaintModel.update(complaintId, updatedComplaint);
    
    res.status(200).json({
      message: 'Response added successfully',
      complaint: updatedComplaint
    });
  } catch (error) {
    console.error('Respond to complaint error:', error);
    res.status(500).json({ message: 'Server error while responding to complaint' });
  }
};

// Update complaint status (admin only)
const updateComplaintStatus = async (req, res) => {
  try {
    const complaintId = req.params.id;
    const { status } = req.body;
    
    console.log('Status update request:', { complaintId, status, body: req.body });
    
    // Validate input
    if (!status || !['pending', 'in-progress', 'resolved', 'closed'].includes(status)) {
      return res.status(400).json({ 
        message: 'Valid status is required',
        receivedStatus: status,
        validStatuses: ['pending', 'in-progress', 'resolved', 'closed']
      });
    }
    
    // Get the complaint
    const complaint = await complaintModel.getById(complaintId);
    
    if (!complaint) {
      return res.status(404).json({ message: 'Complaint not found' });
    }
    
    // Update the complaint status
    const updatedComplaint = {
      ...complaint,
      status,
      updatedAt: new Date().toISOString()
    };
    
    await complaintModel.update(complaintId, updatedComplaint);
    
    res.status(200).json({
      message: 'Complaint status updated successfully',
      complaint: updatedComplaint
    });
  } catch (error) {
    console.error('Update complaint status error:', error);
    res.status(500).json({ message: 'Server error while updating complaint status' });
  }
};

// Rate a resolved complaint (customer only)
const rateComplaint = async (req, res) => {
  try {
    const complaintId = req.params.id;
    const { rating } = req.body;
    
    // Validate rating
    if (!rating || rating < 1 || rating > 5 || !Number.isInteger(rating)) {
      return res.status(400).json({ message: 'Rating must be an integer between 1 and 5' });
    }
    
    // Get the complaint
    const complaint = await complaintModel.getById(complaintId);
    
    if (!complaint) {
      return res.status(404).json({ message: 'Complaint not found' });
    }
    
    // Check if user owns this complaint
    if (complaint.userId !== req.user.id) {
      return res.status(403).json({ message: 'Forbidden: You can only rate your own complaints' });
    }
    
    // Check if complaint is resolved
    if (complaint.status !== 'resolved') {
      return res.status(400).json({ message: 'Only resolved complaints can be rated' });
    }
    
    // Update the complaint with the rating
    const updatedComplaint = {
      ...complaint,
      rating,
      updatedAt: new Date().toISOString()
    };
    
    await complaintModel.update(complaintId, updatedComplaint);
    
    res.status(200).json({
      message: 'Complaint rated successfully',
      complaint: updatedComplaint
    });
  } catch (error) {
    console.error('Rate complaint error:', error);
    res.status(500).json({ message: 'Server error while rating complaint' });
  }
};

module.exports = {
  createComplaint,
  getComplaints,
  getComplaint,
  respondToComplaint,
  updateComplaintStatus,
  rateComplaint
};