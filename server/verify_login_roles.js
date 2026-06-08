
require('dotenv').config();
const { register, login } = require('./controllers/authController');
const seedAdmin = require('./utils/seedAdmin');
const { PrismaClient } = require('@prisma/client');
const { PrismaPg } = require('@prisma/adapter-pg');
const { Pool } = require('pg');
const jwt = require('jsonwebtoken');

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function run() {
    try {
        console.log('--- Cleaning up existing test admin user ---');
        await prisma.user.deleteMany({
            where: { email: 'admin@gmail.com' }
        });
        console.log('Cleanup completed successfully.');

        console.log('--- Testing Seed Admin Helper ---');
        await seedAdmin();

        // Check DB state
        const dbAdmin = await prisma.user.findUnique({
            where: { email: 'admin@gmail.com' }
        });
        console.log('Admin user in database:', dbAdmin);
        if (!dbAdmin || dbAdmin.role !== 'ADMIN') {
            console.error('FAIL: Admin was not seeded or does not have role ADMIN');
            process.exit(1);
        }
        console.log('SUCCESS: Admin seeded correctly with role:', dbAdmin.role);

        console.log('--- Testing Admin Login ---');
        let statusVal = null;
        let jsonVal = null;

        const req = {
            body: {
                email: "admin@gmail.com",
                password: "123456"
            }
        };

        const res = {
            status: function(code) {
                statusVal = code;
                return this;
            },
            json: function(data) {
                jsonVal = data;
                return this;
            }
        };

        await login(req, res);

        console.log('Login Response Status:', statusVal);
        console.log('Login Response Body:', jsonVal);

        if (statusVal !== 200) {
            console.error('FAIL: Login failed');
            process.exit(1);
        }

        // Verify mapped role in user object
        if (jsonVal.user.role !== 'admin') {
            console.error('FAIL: User role was not lowercase in client user object:', jsonVal.user.role);
            process.exit(1);
        }
        console.log('SUCCESS: User role mapped back correctly for frontend compatibility:', jsonVal.user.role);

        // Verify JWT token payload
        const decoded = jwt.verify(jsonVal.token, process.env.JWT_SECRET);
        console.log('Decoded JWT Payload:', decoded);

        if (decoded.id !== dbAdmin.id || decoded.role !== 'ADMIN') {
            console.error('FAIL: JWT payload does not match the expected structure { id, role: "ADMIN" }');
            process.exit(1);
        }
        console.log('SUCCESS: JWT payload verified successfully.');

        // Test middleware role comparison
        console.log('--- Testing Authorization Middleware Comparisons ---');
        const mockReqAdmin = {
            user: decoded
        };
        
        let nextCalledAdmin = false;
        const isAdminMiddleware = require('./middleware/isAdmin');
        isAdminMiddleware(mockReqAdmin, {}, () => {
            nextCalledAdmin = true;
        });

        if (nextCalledAdmin) {
            console.log('SUCCESS: isAdmin middleware allows ADMIN role successfully.');
        } else {
            console.error('FAIL: isAdmin middleware rejected ADMIN role.');
            process.exit(1);
        }

        // Test invalid login
        console.log('--- Testing Non-existent Login ---');
        let failStatusVal = null;
        let failJsonVal = null;
        
        const failReq = {
            body: {
                email: "nonexistent@gmail.com",
                password: "password"
            }
        };

        const failRes = {
            status: function(code) {
                failStatusVal = code;
                return this;
            },
            json: function(data) {
                failJsonVal = data;
                return this;
            }
        };

        await login(failReq, failRes);
        console.log('Fail Response Status:', failStatusVal);
        console.log('Fail Response Body:', failJsonVal);

        if (failStatusVal === 400 && failJsonVal.message === 'Email not found') {
            console.log('SUCCESS: Login query correctly returns "Email not found" when user is not found.');
        } else {
            console.error('FAIL: Email not found validation failed.');
            process.exit(1);
        }

        console.log('\n====================================');
        console.log('ALL TESTS PASSED SUCCESSFULLY!');
        console.log('====================================');

    } catch (error) {
        console.error('Verification run failed with error:', error);
        process.exit(1);
    } finally {
        await prisma.$disconnect();
        await pool.end();
    }
}

run();
