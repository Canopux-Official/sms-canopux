import mongoose from 'mongoose';
import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';
import Admin from './src/models/Admin';

dotenv.config();

const seedAdmin = async () => {
  try {
    const MONGO_URI = process.env.MONGO_URI;
    if (!MONGO_URI) throw new Error('MONGO_URI not defined in .env');

    await mongoose.connect(MONGO_URI);;
    console.log('✅ Connected to MongoDB');

    await Admin.deleteMany({});
    console.log('🗑️  Cleared existing admins');

    const hashed = await bcrypt.hash('adminpassword123', 10);

    await Admin.create({
      name: 'Super Admin',
      phoneNumber: '9999999999',
      role: 'superadmin',
      email: 'canopus.incglobe@gmail.com',
      password: hashed,
    });

    console.log('✅ Super admin seeded successfully!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding admin:', error);
    process.exit(1);
  }
};

seedAdmin();