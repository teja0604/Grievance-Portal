const express = require('express');
const { register, login, getUserStats, mapUserToClient } = require('../controllers/authController');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');
const prisma = require('../config/prisma');
const isAdmin = require('../middleware/isAdmin');

// Public routes
router.get('/stats', getUserStats);

// Register route
router.post('/register', register);

// Login route
router.post('/login', login);

// Get user profile
router.get('/profile', authMiddleware, async (req, res) => {
    try {
        if (req.user.id === 'admin') {
            return res.json({ id: 'admin', _id: 'admin', email: req.user.email, role: 'admin', name: 'Admin' });
        }
        const user = await prisma.user.findUnique({
            where: { id: req.user.id }
        });
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        res.json(mapUserToClient(user));
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Get all staff users (for admin assign dropdown)
router.get('/staff', authMiddleware, isAdmin, async (req, res) => {
    try {
        const staff = await prisma.user.findMany({
            where: { role: 'STAFF' },
            select: {
                id: true,
                name: true,
                email: true,
                department: true
            }
        });
        const mappedStaff = staff.map(s => ({
            _id: s.id,
            id: s.id,
            name: s.name,
            email: s.email,
            department: s.department
        }));
        console.log('Staff found:', mappedStaff.length, 'staff members');
        res.json(mappedStaff);
    } catch (error) {
        console.error('Error fetching staff:', error);
        res.status(500).json({ message: 'Error fetching staff list' });
    }
});

module.exports = router;