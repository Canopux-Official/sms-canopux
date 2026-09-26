import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import bcrypt from 'bcryptjs';
import Plan from '../models/Plan';
import Organization from '../models/Organization';
import Admin from '../models/Admin';
import Student from '../models/Student';

dotenv.config({ path: path.resolve(__dirname, '../../.env') });



async function run() {
    // if (!process.env.MONGO_URI?.includes('localhost')) {
    //     throw new Error('Refusing to seed: MONGO_URI does not look like a local database. Check your .env.');
    // }

    await mongoose.connect(process.env.MONGO_URI as any);
    console.log('✅ Connected to local dev DB');

    let plan = await Plan.findOne({ name: 'Dev Test Plan' });
    if (!plan) {
        plan = await Plan.create({
            name: 'Dev Test Plan',
            minStudents: 0,
            maxStudents: 100,
            monthlyPrice: 0,
            isCustom: false,
            isActive: true,
        });
    }

    let org = await Organization.findOne({ slug: 'canopuxorgtest' });
    if (!org) {
        org = await Organization.create({
            name: 'Test Institute 1',
            slug: 'canopuxorgtest',
            subdomain: 'canopuxorgtest.com',
            status: 'active',
            planId: plan._id,
            subscriptionStatus: 'active',
            branding: { primaryColor: '#2f6fed' },
            customDomainStatus: 'none',
            usage: { currentStudentCount: 0 },
            primaryContact: { name: 'Test Admin', email: 'dummyforwork2898@gmail.com', phone: '9999999999' },
        });
        console.log('✅ Created test Organization:', org.slug);
    } else {
        console.log('ℹ️  Test Organization already exists');
    }

    const adminEmail = 'dummyforwork2898@gmail.com';
    let admin = await Admin.findOne({ email: adminEmail, organizationId: org._id });
    if (!admin) {
        const hashedPassword = await bcrypt.hash('Test@1234', 10);
        admin = await Admin.create({
            name: 'Test Admin',
            phoneNumber: '9999999999',
            email: adminEmail,
            password: hashedPassword,
            role: 'superadmin',
            organizationId: org._id,
        });
        console.log('✅ Created test Admin — login with:', adminEmail, '/ Test@1234');
    } else {
        console.log('ℹ️  Test Admin already exists — login with:', adminEmail, '/ Test@1234');
    }

    const studentEnrollment = 'JIS0000001';
    let student = await Student.findOne({ enrollmentNumber: studentEnrollment, organizationId: org._id });
    if (!student) {
        const hashedPassword = await bcrypt.hash('Test@1234', 10);
        student = await Student.create({
            name: 'Test Student',
            phoneNumber: '8888888888',
            dob: new Date('2008-01-01'),
            currentClass: '11',
            academicSession: '2025-26',
            password: hashedPassword,
            organizationId: org._id,
            enrollmentNumber: studentEnrollment,
            isActive: true,
            admissionDate: new Date(),
        });
        console.log('✅ Created test Student — enrollment:', studentEnrollment, '/ Test@1234');
    } else {
        console.log('ℹ️  Test Student already exists — enrollment:', studentEnrollment, '/ Test@1234');
    }

    console.log('🎉 Local seed complete.');
    await mongoose.disconnect();
}

run().catch((err) => {
    console.error('❌ Seed failed:', err);
    process.exit(1);
});