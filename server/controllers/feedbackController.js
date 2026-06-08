const prisma = require('../config/prisma');

// Helper to map DB feedback back to MongoDB format for frontend compatibility
const mapFeedbackToClient = (feedback) => {
    if (!feedback) return null;
    
    let userId = null;
    if (feedback.user) {
        userId = {
            _id: feedback.user.id,
            id: feedback.user.id,
            email: feedback.user.email,
            name: feedback.user.name
        };
    } else {
        userId = feedback.userId;
    }
    
    let staffId = null;
    if (feedback.staff) {
        staffId = {
            _id: feedback.staff.id,
            id: feedback.staff.id,
            email: feedback.staff.email,
            name: feedback.staff.name
        };
    } else {
        staffId = feedback.staffId;
    }
    
    let complaintId = null;
    if (feedback.complaint) {
        complaintId = {
            _id: feedback.complaint.id,
            id: feedback.complaint.id,
            title: feedback.complaint.title
        };
    } else {
        complaintId = feedback.complaintId;
    }

    return {
        _id: feedback.id,
        id: feedback.id,
        complaintId,
        userId,
        staffId,
        rating: feedback.rating,
        comment: feedback.comment,
        submittedAt: feedback.createdAt,
        createdAt: feedback.createdAt
    };
};

// Submit feedback (after complaint resolved)
const submitFeedback = async (req, res) => {
    try {
        const { complaintId, rating, comment } = req.body;
        
        // Find complaint and ensure it's resolved
        const complaint = await prisma.complaint.findUnique({
            where: { id: complaintId }
        });
        
        if (!complaint || complaint.status !== 'RESOLVED') {
            return res.status(400).json({ message: 'Feedback can only be submitted for resolved complaints.' });
        }
        
        // Only allow feedback if user is the complaint owner
        if (complaint.studentId !== req.user.id) {
            return res.status(403).json({ message: 'Not authorized to submit feedback for this complaint.' });
        }
        
        // Prevent duplicate feedback
        const existing = await prisma.feedback.findFirst({
            where: { complaintId, userId: req.user.id }
        });
        
        if (existing) {
            return res.status(400).json({ message: 'Feedback already submitted for this complaint.' });
        }
        
        const feedback = await prisma.feedback.create({
            data: {
                complaintId,
                userId: req.user.id,
                staffId: complaint.assignedStaffId,
                rating: Number(rating),
                comment
            },
            include: {
                user: true,
                staff: true,
                complaint: true
            }
        });
        
        res.status(201).json({ message: 'Feedback submitted', feedback: mapFeedbackToClient(feedback) });
    } catch (error) {
        console.error('Submit feedback error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

// Get all feedbacks (public)
const getAllFeedbacks = async (req, res) => {
    try {
        const feedbacks = await prisma.feedback.findMany({
            include: {
                user: true,
                staff: true,
                complaint: true
            },
            orderBy: { createdAt: 'desc' }
        });
        res.json(feedbacks.map(mapFeedbackToClient));
    } catch (error) {
        console.error('Get all feedbacks error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

module.exports = { submitFeedback, getAllFeedbacks, mapFeedbackToClient };