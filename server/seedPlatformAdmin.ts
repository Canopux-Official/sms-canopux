// server/seedPlatformAdmin.ts
//
// Bootstraps the very first login for the Canopux Admin App (master-admin-sms).
// Run once per environment: npm run seed:platform-admin
//
// Override the seeded email/password via env vars if you don't want the defaults below:
//   PLATFORM_ADMIN_EMAIL=you@canopux.org PLATFORM_ADMIN_PASSWORD=SomethingStrong! npm run seed:platform-admin
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';
import PlatformAdmin from './src/models/PlatformAdmin';

dotenv.config();

const seedPlatformAdmin = async () => {
  try {
    const MONGO_URI = process.env.MONGO_URI;
    if (!MONGO_URI) throw new Error('MONGO_URI not defined in .env');

    await mongoose.connect(MONGO_URI);
    console.log('✅ Connected to MongoDB');

    const email = (process.env.PLATFORM_ADMIN_EMAIL || 'platform-admin@canopux.org').toLowerCase().trim();
    const password = process.env.PLATFORM_ADMIN_PASSWORD || 'ChangeMe123!';

    const existing = await PlatformAdmin.findOne({ email });
    if (existing) {
      console.log(`ℹ️  Platform admin already exists: ${email} — nothing to do.`);
      process.exit(0);
    }

    const hashed = await bcrypt.hash(password, 10);

    await PlatformAdmin.create({
      name: 'Canopux Platform Admin',
      email,
      password: hashed,
    });

    console.log('✅ Platform admin seeded successfully!');
    console.log(`   Login at the master-admin-sms app with:`);
    console.log(`     Email:    ${email}`);
    console.log(`     Password: ${password}`);
    console.log('   ⚠️  Change this password after first login.');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding platform admin:', error);
    process.exit(1);
  }
};

seedPlatformAdmin();