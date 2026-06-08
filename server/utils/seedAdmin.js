const prisma = require('../config/prisma');
const bcrypt = require('bcryptjs');

const seedAdmin = async () => {
    try {
        const adminEmail = 'admin@gmail.com';
        const existingAdmin = await prisma.user.findUnique({
            where: { email: adminEmail }
        });
        if (!existingAdmin) {
            console.log('Admin user does not exist. Seeding...');
            const hashedPassword = await bcrypt.hash('123456', 10);
            await prisma.user.create({
                data: {
                    email: adminEmail,
                    password: hashedPassword,
                    role: 'ADMIN',
                    name: 'Admin',
                    department: 'Administration'
                }
            });
            console.log('Admin user seeded successfully.');
        } else {
            console.log('Admin user already exists.');
        }

        const staffEmail = 'staff@gmail.com';
        const existingStaff = await prisma.user.findUnique({
            where: { email: staffEmail }
        });
        if (!existingStaff) {
            console.log('Staff user does not exist. Seeding...');
            const hashedPassword = await bcrypt.hash('123456', 10);
            await prisma.user.create({
                data: {
                    email: staffEmail,
                    password: hashedPassword,
                    role: 'STAFF',
                    name: 'Staff Member',
                    department: 'Maintenance'
                }
            });
            console.log('Staff user seeded successfully.');
        } else {
            console.log('Staff user already exists.');
        }
    } catch (seedError) {
        console.error('Error seeding users:', seedError);
    }
};

module.exports = seedAdmin;
