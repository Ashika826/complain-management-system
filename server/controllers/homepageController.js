const { complaintModel } = require('../db/models');

// Get homepage statistics and data
const getHomepageData = async (req, res) => {
  try {
    // Fetch all complaints
    const allComplaints = await complaintModel.getAll();
    
    // Calculate statistics
    const totalCount = allComplaints.length;
    const resolvedCount = allComplaints.filter(c => c.status === 'resolved').length;
    const pendingCount = allComplaints.filter(c => c.status === 'pending').length;
    const inProgressCount = allComplaints.filter(c => c.status === 'in-progress').length;
    
    // Calculate average rating
    const ratedComplaints = allComplaints.filter(c => c.rating > 0);
    const avgRating = ratedComplaints.length > 0 
      ? ratedComplaints.reduce((sum, c) => sum + c.rating, 0) / ratedComplaints.length
      : 0;
    
    // Get most recent complaints (public info only)
    const recentComplaints = [...allComplaints]
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      .slice(0, 5)
      .map(c => ({
        id: c.id,
        title: c.title,
        category: c.category,
        status: c.status,
        createdAt: c.createdAt,
        updatedAt: c.updatedAt,
        rating: c.rating || 0
        // Exclude sensitive data like userId, full description, and responses
      }));
    
    // Get top rated complaints
    const topRatedComplaints = [...ratedComplaints]
      .sort((a, b) => b.rating - a.rating)
      .slice(0, 3)
      .map(c => ({
        id: c.id,
        title: c.title,
        category: c.category,
        status: c.status,
        rating: c.rating,
        // Include a truncated feedback comment if needed
      }));
    
    // Calculate response time statistics (in a real app, this would be based on actual data)
    // For demonstration, we'll use a fixed value
    const avgResponseTime = "24h";
    
    // Category distribution
    const categories = {};
    allComplaints.forEach(complaint => {
      const category = complaint.category;
      categories[category] = (categories[category] || 0) + 1;
    });
    
    // Status distribution
    const statusDistribution = {
      pending: pendingCount,
      inProgress: inProgressCount,
      resolved: resolvedCount,
      closed: allComplaints.filter(c => c.status === 'closed').length
    };
    
    // Return the data
    res.status(200).json({
      stats: {
        total: totalCount,
        resolved: resolvedCount,
        pending: pendingCount,
        inProgress: inProgressCount,
        satisfaction: avgRating.toFixed(1),
        responseTime: avgResponseTime
      },
      recentComplaints,
      topRatedComplaints,
      categories,
      statusDistribution
    });
  } catch (error) {
    console.error('Homepage data error:', error);
    res.status(500).json({ message: 'Server error while fetching homepage data' });
  }
};

module.exports = {
  getHomepageData
};