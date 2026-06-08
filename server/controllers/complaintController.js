const prisma = require('../config/prisma');
const { sendResolutionEmail } = require('../utils/mailer');
const nodemailer = require('nodemailer');

// Helper to map status to DB enum
const mapStatusToDb = (status) => {
    if (!status) return 'PENDING';
    const s = status.toUpperCase().replace('-', '_');
    if (['PENDING', 'IN_PROGRESS', 'RESOLVED'].includes(s)) {
        return s;
    }
    return 'PENDING';
};

// Helper to map status back to client format
const mapStatusToClient = (status) => {
    if (!status) return 'pending';
    const s = status.toLowerCase();
    if (s === 'in_progress') return 'in-progress';
    return s;
};

// Helper to map DB complaint back to MongoDB format for frontend compatibility
const mapComplaintToClient = (complaint) => {
    if (!complaint) return null;
    
    let raisedBy = null;
    if (complaint.student) {
        raisedBy = {
            _id: complaint.student.id,
            id: complaint.student.id,
            email: complaint.student.email,
            name: complaint.student.name,
            department: complaint.student.department
        };
    } else {
        raisedBy = complaint.studentId;
    }

    let assignedTo = null;
    if (complaint.assignedStaff) {
        assignedTo = {
            _id: complaint.assignedStaff.id,
            id: complaint.assignedStaff.id,
            email: complaint.assignedStaff.email,
            name: complaint.assignedStaff.name,
            department: complaint.assignedStaff.department
        };
    } else if (complaint.assignedStaffId) {
        assignedTo = {
            _id: complaint.assignedStaffId,
            id: complaint.assignedStaffId
        };
    }

    return {
        _id: complaint.id,
        id: complaint.id,
        title: complaint.title,
        description: complaint.description,
        imageUrl: complaint.imageUrl,
        status: mapStatusToClient(complaint.status),
        category: complaint.category,
        dueInDays: complaint.dueInDays,
        raisedBy,
        assignedTo,
        resolutionNotes: complaint.resolutionNotes,
        date: complaint.createdAt,
        createdAt: complaint.createdAt,
        updatedAt: complaint.updatedAt,
        staffUpdates: Array.isArray(complaint.staffUpdates) ? complaint.staffUpdates : []
    };
};

// Create a new complaint
const createComplaint = async (req, res) => {
    try {
        const { title, description, category, dueInDays } = req.body;
        const imageUrl = req.file ? `/uploads/${req.file.filename}` : '';
        const complaint = await prisma.complaint.create({
            data: {
                title,
                description,
                category,
                dueInDays: Number(dueInDays) || 3,
                imageUrl,
                studentId: req.user.id
            },
            include: {
                student: true,
                assignedStaff: true
            }
        });
        res.status(201).json({ message: 'Complaint submitted successfully', complaint: mapComplaintToClient(complaint) });
    } catch (error) {
        console.error('Create complaint error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

// Get all complaints for the logged-in user
const getMyComplaints = async (req, res) => {
    try {
        const complaints = await prisma.complaint.findMany({
            where: { studentId: req.user.id },
            orderBy: { createdAt: 'desc' },
            include: {
                student: true,
                assignedStaff: true
            }
        });
        res.json(complaints.map(mapComplaintToClient));
    } catch (error) {
        console.error('Get my complaints error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

// Get single complaint details
const getComplaintById = async (req, res) => {
    try {
        const complaint = await prisma.complaint.findUnique({
            where: { id: req.params.id },
            include: {
                student: true,
                assignedStaff: true
            }
        });
        if (!complaint) return res.status(404).json({ message: 'Complaint not found' });
        res.json(mapComplaintToClient(complaint));
    } catch (error) {
        console.error('Get complaint by ID error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

// Admin: Get all complaints split by status and sorted
const getAllComplaints = async (req, res) => {
    try {
        const complaints = await prisma.complaint.findMany({
            include: {
                student: true,
                assignedStaff: true
            },
            orderBy: { createdAt: 'desc' }
        });
        const mapped = complaints.map(mapComplaintToClient);
        
        // Split and sort
        const pending = mapped.filter(c => c.status === 'pending').sort((a, b) => a.dueInDays - b.dueInDays);
        const inProgress = mapped.filter(c => c.status === 'in-progress').sort((a, b) => a.dueInDays - b.dueInDays);
        const resolved = mapped.filter(c => c.status === 'resolved');
        
        res.json({ pending, inProgress, resolved });
    } catch (error) {
        console.error('Get all complaints error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

// Admin: Assign complaint to staff
const assignComplaint = async (req, res) => {
    try {
        const { staffId } = req.body;
        
        // Validate staffId is provided
        if (!staffId) {
            return res.status(400).json({ message: 'Staff ID is required.' });
        }
        
        // Check if staff exists and is actually a staff member
        const staff = await prisma.user.findFirst({
            where: { id: staffId, role: 'STAFF' }
        });
        if (!staff) {
            return res.status(400).json({ message: 'Invalid staff member selected.' });
        }
        
        const complaint = await prisma.complaint.update({
            where: { id: req.params.id },
            data: {
                assignedStaffId: staffId,
                status: 'IN_PROGRESS'
            },
            include: {
                student: true,
                assignedStaff: true
            }
        });
        
        // Send email to staff notifying assignment
        try {
            await sendResolutionEmail(
                staff.email,
                'New Complaint Assigned to You',
                `Hello ${staff.name || staff.email},\n\nA new complaint titled "${complaint.title || 'Complaint'}" has been assigned to you.\n\nPlease check the system for details.\n\nThank you.`
            );
            console.log(`Assignment email sent to staff: ${staff.email}`);
        } catch (mailError) {
            console.error('Error sending assignment email to staff:', mailError);
        }
        
        console.log(`Complaint ${complaint.id} assigned to staff ${staff.name || staff.email}`);
        res.json(mapComplaintToClient(complaint));
    } catch (error) {
        console.error('Error in assignComplaint:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

// Admin: Update complaint status and notes
const updateComplaintStatus = async (req, res) => {
    const { status, resolutionNotes } = req.body;

    try {
        const complaintBefore = await prisma.complaint.findUnique({
            where: { id: req.params.id },
            include: { student: true }
        });
        
        if (!complaintBefore) {
            return res.status(404).json({ message: 'Complaint not found' });
        }

        const dbStatus = mapStatusToDb(status);

        // Only send email if status is being set to "resolved" and raisedBy/student exists
        if (dbStatus === 'RESOLVED' && complaintBefore.student && complaintBefore.student.email) {
            try {
                await sendResolutionEmail(
                    complaintBefore.student.email,
                    'Your complaint has been resolved',
                    `Hello ${complaintBefore.student.name},\n\nYour complaint titled "${complaintBefore.title}" has been resolved.\n\nThank you.`
                );
                console.log(`Resolution email sent to ${complaintBefore.student.email}`);
            } catch (mailError) {
                console.error('Error sending resolution email:', mailError);
            }
        }

        const updated = await prisma.complaint.update({
            where: { id: req.params.id },
            data: {
                status: dbStatus,
                resolutionNotes: resolutionNotes
            },
            include: {
                student: true,
                assignedStaff: true
            }
        });

        res.json({ message: 'Complaint status updated successfully.', complaint: mapComplaintToClient(updated) });
    } catch (error) {
        console.error('Error in updateComplaintStatus:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// Staff: Get complaints assigned to the logged-in staff
const getAssignedComplaints = async (req, res) => {
    try {
        console.log('Staff assigned complaints request:', req.user);
        const staffId = req.user.id || req.user._id;
        if (!staffId) {
            console.error('No staff id found in token:', req.user);
            return res.status(400).json({ message: 'Invalid staff user.' });
        }
        const complaints = await prisma.complaint.findMany({
            where: { assignedStaffId: staffId },
            orderBy: { createdAt: 'desc' },
            include: {
                student: true,
                assignedStaff: true
            }
        });
        res.json(complaints.map(mapComplaintToClient));
    } catch (error) {
        console.error('Error in getAssignedComplaints:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// Staff: Submit update for a complaint (with photo and remarks)
const staffUpdateComplaint = async (req, res) => {
    try {
        const { remarks } = req.body;
        const photoUrl = req.file ? `/uploads/${req.file.filename}` : '';
        const complaint = await prisma.complaint.findUnique({
            where: { id: req.params.id }
        });
        if (!complaint) return res.status(404).json({ message: 'Complaint not found' });
        
        let staffUpdates = Array.isArray(complaint.staffUpdates) ? complaint.staffUpdates : [];
        staffUpdates.push({ photoUrl, remarks, updatedAt: new Date().toISOString() });
        
        const updated = await prisma.complaint.update({
            where: { id: req.params.id },
            data: {
                staffUpdates: staffUpdates
            },
            include: {
                student: true,
                assignedStaff: true
            }
        });
        
        res.json({ message: 'Update submitted', complaint: mapComplaintToClient(updated) });
    } catch (error) {
        console.error('Staff update error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

// Get complaint statistics (public)
const getComplaintStats = async (req, res) => {
    try {
        console.log('getComplaintStats called');
        
        const totalComplaints = await prisma.complaint.count();
        console.log('Total complaints:', totalComplaints);
        
        const resolvedComplaints = await prisma.complaint.count({
            where: { status: 'RESOLVED' }
        });
        console.log('Resolved complaints:', resolvedComplaints);
        
        // Calculate average response time (time from submission to first staff update)
        const resolvedComplaintsWithUpdates = await prisma.complaint.findMany({
            where: { status: 'RESOLVED' }
        });
        
        let totalResponseTime = 0;
        let countWithResponseTime = 0;
        
        resolvedComplaintsWithUpdates.forEach(complaint => {
            const updates = Array.isArray(complaint.staffUpdates) ? complaint.staffUpdates : [];
            if (updates.length > 0) {
                const firstUpdate = updates[0];
                const responseTime = new Date(firstUpdate.updatedAt) - complaint.createdAt;
                totalResponseTime += responseTime;
                countWithResponseTime++;
            }
        });
        
        const avgResponseTime = countWithResponseTime > 0 
            ? Math.round(totalResponseTime / countWithResponseTime / (1000 * 60 * 60)) // Convert to hours
            : 24; // Default 24 hours if no data
        
        const stats = {
            total: totalComplaints,
            resolved: resolvedComplaints,
            avgResponseTime: avgResponseTime
        };
        
        console.log('Returning stats:', stats);
        res.json(stats);
    } catch (error) {
        console.error('Error in getComplaintStats:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

const transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 587,
    secure: false,
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
});

// Warm up transporter connection in background
transporter.verify((err, info) => {
    if (err) {
        console.log('Transporter verification placeholder error:', err.message);
    } else {
        console.log('Transporter is ready for messages');
    }
});

module.exports = {
    createComplaint,
    getMyComplaints,
    getComplaintById,
    getAllComplaints,
    assignComplaint,
    updateComplaintStatus,
    getAssignedComplaints,
    staffUpdateComplaint,
    getComplaintStats,
    mapComplaintToClient,
    mapStatusToDb,
    mapStatusToClient
};