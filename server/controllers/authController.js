const prisma = require('../config/prisma');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const roleMap = {
  student: 'STUDENT',
  staff: 'STAFF',
  admin: 'ADMIN'
};

// Helper to map DB user back to MongoDB format for frontend compatibility
const mapUserToClient = (user) => {
    if (!user) return null;
    return {
        _id: user.id,
        id: user.id,
        email: user.email,
        role: user.role.toLowerCase(),
        name: user.name,
        department: user.department,
        createdAt: user.createdAt
    };
};

// Register a new user
const register = async (req, res) => {
    const { email, password, role, name, department } = req.body;

    try {
        // Validate required fields
        if (!email || !password || !role || !name || !department) {
            return res.status(400).json({ 
                message: 'All fields are required: email, password, role, name, department' 
            });
        }

        // Validate email format
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return res.status(400).json({ message: 'Please enter a valid email address' });
        }

        // Validate password length
        if (password.length < 6) {
            return res.status(400).json({ message: 'Password must be at least 6 characters long' });
        }

        // Validate role
        const allowedRoles = ['student', 'staff', 'admin'];
        if (!allowedRoles.includes(role)) {
            return res.status(400).json({
                message: 'Invalid role. Must be student, staff, or admin'
            });
        }

        // Check if user already exists
        const existingUser = await prisma.user.findUnique({
            where: { email: email.toLowerCase().trim() }
        });
        if (existingUser) {
            return res.status(400).json({ message: 'User with this email already exists' });
        }

        // Hash the password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Create a new user
        await prisma.user.create({
            data: {
                email: email.toLowerCase().trim(),
                password: hashedPassword,
                role: roleMap[role],
                name: name.trim(),
                department: department.trim()
            }
        });

        console.log('User registered successfully:', { email, role, name, department });
        res.status(201).json({ message: 'User registered successfully' });
    } catch (error) {
        console.error('Registration error:', error);
        // Prisma unique constraint violation code is P2002
        if (error.code === 'P2002') {
            return res.status(400).json({ message: 'User with this email already exists' });
        }
        res.status(500).json({ message: 'Server error during registration' });
    }
};

// Login a user
const login = async (req, res) => {
    let { email, password } = req.body;

    try {
        if (!email || !password) {
            return res.status(400).json({ message: 'Email and password are required' });
        }

        email = email.toLowerCase().trim();

        const user = await prisma.user.findUnique({
            where: { email }
        });

        console.log("Login email:", email);
        console.log("User found:", user);

        if (!user) {
            return res.status(400).json({ message: 'Email not found' });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ message: 'Incorrect password' });
        }

        const clientUser = mapUserToClient(user);
        const token = jwt.sign(
            { 
                id: user.id, 
                role: user.role,
                name: user.name,
                email: user.email,
                department: user.department
            },
            process.env.JWT_SECRET,
            { expiresIn: '1h' }
        );

        res.status(200).json({ token, user: clientUser });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

// Get user statistics (public)
const getUserStats = async (req, res) => {
    try {
        console.log('getUserStats called');
        
        const totalUsers = await prisma.user.count();
        console.log('Total users:', totalUsers);
        
        const studentCount = await prisma.user.count({
            where: { role: 'STUDENT' }
        });
        console.log('Student count:', studentCount);
        
        const staffCount = await prisma.user.count({
            where: { role: 'STAFF' }
        });
        console.log('Staff count:', staffCount);
        
        const stats = {
            total: totalUsers,
            students: studentCount,
            staff: staffCount
        };
        
        console.log('Returning user stats:', stats);
        res.json(stats);
    } catch (error) {
        console.error('Error in getUserStats:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

module.exports = { register, login, getUserStats, mapUserToClient };