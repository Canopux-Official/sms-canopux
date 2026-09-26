/**
 * One-time migration: creates the default "Canopux" Organization + Plan,
 * then backfills organizationId onto every existing collection.
 *
 * SAFE TO RE-RUN: every write is guarded by { organizationId: { $exists: false } },
 * so documents that already have an organizationId are skipped, not overwritten.
 *
 * Run with:  npx ts-node scripts/migrations/001-backfill-organization.ts
 * (run from server/, with MONGO_URI available in server/.env)
 */

import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(__dirname, '../../.env') });

import Organization from '../../src/models/Organization';
import Plan from '../../src/models/Plan';
import Admin from '../../src/models/Admin';
import Student from '../../src/models/Student';
import Stream from '../../src/models/Stream';
import Subject from '../../src/models/Subject';
import TargetExam from '../../src/models/TargetExam';
import Test from '../../src/models/Test';
import Result from '../../src/models/Result';
import Attendance from '../../src/models/Attendance';
import Notice from '../../src/models/Notice';
import Material from '../../src/models/Material';
import LandingPage from '../../src/models/LandingPage';

const DEFAULT_ORG_SLUG = 'canopux'; // change if you want the existing data under a different slug

async function run() {
    const MONGO_URI = process.env.MONGO_URI;
    if (!MONGO_URI) throw new Error('MONGO_URI not set — check server/.env');

    await mongoose.connect(MONGO_URI);
    console.log('✅ Connected to MongoDB');

    // ---- 1. Ensure a default Plan exists for the legacy org ----
    let legacyPlan = await Plan.findOne({ name: 'Legacy' });
    if (!legacyPlan) {
        legacyPlan = await Plan.create({
            name: 'Legacy',
            minStudents: 0,
            maxStudents: undefined, // unlimited — this is the pre-existing Canopux install, not a paying tenant
            monthlyPrice: 0,
            isCustom: true,
            isActive: true,
        });
        console.log('✅ Created Legacy plan:', legacyPlan._id);
    } else {
        console.log('ℹ️  Legacy plan already exists:', legacyPlan._id);
    }

    // ---- 2. Ensure the default Organization exists ----
    let defaultOrg = await Organization.findOne({ slug: DEFAULT_ORG_SLUG });
    if (!defaultOrg) {
        defaultOrg = await Organization.create({
            name: 'Canopux',
            slug: DEFAULT_ORG_SLUG,
            subdomain: DEFAULT_ORG_SLUG,
            status: 'active',
            planId: legacyPlan._id,
            subscriptionStatus: 'active',
            branding: {},
            customDomainStatus: 'none',
            usage: { currentStudentCount: 0 },
            primaryContact: {
                name: 'Canopux Admin',
                email: 'admin@canopux.org', // placeholder — update after migration
                phone: '0000000000',        // placeholder — update after migration
            },
        });
        console.log('✅ Created default Organization:', defaultOrg._id);
    } else {
        console.log('ℹ️  Default Organization already exists:', defaultOrg._id);
    }

    const orgId = defaultOrg._id;

    // ---- 3. Backfill organizationId onto every collection ----
    const targets: { name: string; model: mongoose.Model<any> }[] = [
        { name: 'Admin', model: Admin },
        { name: 'Student', model: Student },
        { name: 'Stream', model: Stream },
        { name: 'Subject', model: Subject },
        { name: 'TargetExam', model: TargetExam },
        { name: 'Test', model: Test },
        { name: 'Result', model: Result },
        { name: 'Attendance', model: Attendance },
        { name: 'Notice', model: Notice },
        { name: 'Material', model: Material },
    ];

    for (const { name, model } of targets) {
        const before = await model.countDocuments({ organizationId: { $exists: false } });
        if (before === 0) {
            console.log(`⏭  ${name}: nothing to backfill`);
            continue;
        }
        const res = await model.updateMany(
            { organizationId: { $exists: false } },
            { $set: { organizationId: orgId } }
        );
        console.log(`✅ ${name}: backfilled ${res.modifiedCount} / ${before} documents`);
    }

    // ---- 4. LandingPage is a special case — one per org, upsert instead of updateMany ----
    const existingLanding = await LandingPage.findOne({ organizationId: { $exists: true } });
    if (!existingLanding) {
        const singleton = await LandingPage.findOne(); // the old pre-migration singleton doc, if any
        if (singleton) {
            singleton.set('organizationId', orgId);
            await singleton.save();
            console.log('✅ LandingPage: attached existing singleton doc to default org');
        } else {
            console.log('⚠️  LandingPage: no existing document found — a blank one should be created manually if needed');
        }
    } else {
        console.log('ℹ️  LandingPage: already scoped to an organization');
    }

    // ---- 5. Reconcile the org's student count from real data ----
    const studentCount = await Student.countDocuments({ organizationId: orgId });
    defaultOrg.usage.currentStudentCount = studentCount;
    defaultOrg.usage.lastCalculatedAt = new Date();
    await defaultOrg.save();
    console.log(`✅ Organization usage.currentStudentCount set to ${studentCount}`);

    // ---- 6. Build the new compound indexes now that data is backfilled ----
    console.log('⏳ Syncing indexes...');
    for (const { name, model } of targets) {
        await model.syncIndexes();
        console.log(`✅ ${name}: indexes synced`);
    }
    await Organization.syncIndexes();
    await Plan.syncIndexes();
    await LandingPage.syncIndexes();

    console.log('🎉 Migration complete.');
    await mongoose.disconnect();
}

run().catch((err) => {
    console.error('❌ Migration failed:', err);
    process.exit(1);
});