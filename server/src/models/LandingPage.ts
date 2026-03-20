import mongoose from 'mongoose';

// ==========================================
// 1. STATS SUB-SCHEMA (Used in Hero Section)
// ==========================================
const statSchema = new mongoose.Schema({
    // The final number the counter animates to. Example: 10000
    target: { type: Number, required: true },

    // The text that appears right after the number. Example: 'K+' or '%'
    suffix: { type: String, default: '' },

    // What to divide the target by for the display number (e.g., 10000 / 1000 = 10). Example: 1000
    divisor: { type: Number, default: 1 },

    // The text displayed underneath the number. Example: 'Students Trained'
    label: { type: String, required: true }
}, { _id: false });


// ==========================================
// 2. COURSES SUB-SCHEMA
// ==========================================
const courseSchema = new mongoose.Schema({
    // Unique string ID used for frontend React state (expandedId). Example: 'jee' or 'neet'
    courseId: { type: String, required: true },

    // The display name of the course. Example: 'JEE Main & Advanced'
    title: { type: String, required: true },

    // A short summary of the course. Example: 'Comprehensive preparation for India's most competitive exam'
    description: { type: String, required: true },

    // Difficulty or stage of the course. Example: 'Advanced' or 'Intermediate'
    level: { type: String, required: true },

    // Number of students enrolled, used for the icon tag. Example: 2500
    students: { type: Number, default: 0 },

    // Time commitment required. Example: '18 months'
    duration: { type: String, required: true },

    // Array of bullet points for the "Key Features" section. Example: ['Expert faculty', 'Mock tests', 'Doubt sessions']
    features: [{ type: String }],

    // The CSS background gradient for the course card. Example: 'linear-gradient(135deg, rgba(59,130,246,0.08) 0%, rgba(6,182,212,0.08) 100%)'
    gradient: { type: String }
});


// ==========================================
// 3. FACULTY SUB-SCHEMA
// ==========================================
const facultySchema = new mongoose.Schema({
    // The teacher's full name. Example: 'Dr. Rajesh Kumar'
    name: { type: String, required: true },

    // Their job role or designation. Example: 'Senior Professor'
    title: { type: String, required: true },

    // The core subject they teach. Example: 'Mathematics'
    subject: { type: String, required: true },

    // Number of years teaching (kept as string to allow things like '18+'). Example: '18'
    experience: { type: String, required: true },

    // Their degrees or educational background. Example: 'Ph.D. from IIT Delhi'
    qualification: { type: String, required: true },

    // Their specific area of expertise. Example: 'JEE Advanced problem solving'
    specialty: { type: String, required: true },

    // Two letter initials (optional, but good for fallbacks if image fails). Example: 'RK'
    initials: { type: String },

    // Direct URL to their profile picture (AWS S3, Cloudinary, etc.). Example: 'https://images.unsplash.com/photo-156860...'
    image: { type: String, required: true },

    // The detailed paragraph shown in the popup modal. Example: 'Dr. Rajesh Kumar has mentored over 3,000 JEE aspirants...'
    bio: { type: String, required: true }
});

const scoreEntrySchema = new mongoose.Schema({
    // The exam name. Example: 'JEE Main', 'NEET', 'CBSE Class 12'
    exam: { type: String, required: true },

    // The score/rank achieved. Example: 'AIR 127', '99.8%', '95/100'
    score: { type: String, required: true }
}, { _id: false });


// ==========================================
// 4. RESULTS / SUCCESS STORIES SUB-SCHEMA
// ==========================================
const resultSchema = new mongoose.Schema({
    name: { type: String, required: true },

    // Array of exam+score pairs. Example: [{ exam: 'JEE Main', score: '99.2%' }, { exam: 'NEET', score: 'AIR 450' }]
    scores: [scoreEntrySchema],

    course: { type: String, required: true },
    image: { type: String, required: true },
    bio: { type: String, required: true },

    // Array of current status lines. Example: ['Selected at Google', 'Startup Founder']
    currentStatus: [{ type: String }],

    youtubeLink: { type: String }
});


// ==========================================
// 5. FAQ SUB-SCHEMA
// ==========================================
const faqSchema = new mongoose.Schema({
    // The frequently asked question. Example: 'Do you provide online classes?'
    q: { type: String, required: true },

    // The answer to the question. Example: 'Yes, we offer a Hybrid Model (Offline + Online)...'
    a: { type: String, required: true }
});

// ==========================================
// 7. GALLERY SUB-SCHEMA
// ==========================================
const galleryImageSchema = new mongoose.Schema({
    // Direct URL to the uploaded image (Cloudinary). Example: 'https://res.cloudinary.com/...'
    url: { type: String, required: true },

    // Optional Cloudinary public_id for future deletion support. Example: 'gallery/abc123'
    publicId: { type: String }
}, { _id: false });


// ==========================================
// 6. MAIN LANDING PAGE SCHEMA
// ==========================================
const landingPageSchema = new mongoose.Schema({

    // --- HERO SECTION ---
    hero: {
        // The massive text at the very top of the site. Example: 'Transform Your Academic Excellence'
        heading: { type: String, default: 'Transform Your Academic Excellence' },

        // The paragraph right below the main heading. Example: 'Join JJ Institute Of Science and unlock your full potential...'
        subheading: { type: String, default: 'Join JJ Institute Of Science and unlock your full potential. Our proven methodology has helped thousands of students achieve their dreams in competitive exams.' },

        // Group photo for top candidates (Base64 or URL)
        image: { type: String },

        // Array of the 3 stats shown below the hero buttons
        stats: [statSchema]
    },

    // --- ARRAYS OF CONTENT ---
    // Array holding all course cards
    courses: [courseSchema],

    // Array holding all teacher profiles
    faculty: [facultySchema],

    // Array holding the four stats boxes at the top of the Faculty section
    facultyStats: [{
        value: { type: String, required: true },
        label: { type: String, required: true }
    }],

    // Array holding all student success stories for the scrolling marquee
    results: [resultSchema],

    // Array holding all the accordion dropdowns for the FAQ section
    faqs: [faqSchema],

    gallery: [galleryImageSchema],

    // --- FOOTER SECTION ---
    footer: {
        // --- CONTACT ---
        // Array of phone numbers to display. Example: ['+91 9876 543 210', '+91 8765 432 109']
        phones: [{ type: String }],

        // Contact email address. Example: 'contact@elite.com'
        email: { type: String },

        // Physical address of the institute. Example: '123 Ave, City — 110001'
        address: { type: String },

        // --- BOTTOM BAR ---
        // Copyright line. Example: '© 2025 JJ Institute Of Science. All rights reserved.'
        copyrightText: { type: String, default: '© 2025 JJ Institute Of Science. All rights reserved.' },

        // URLs for the social media icon links at the bottom
        socialLinks: {
            facebook: { type: String, default: '#' },
            instagram: { type: String, default: '#' },
            linkedin: { type: String, default: '#' },
            twitter: { type: String, default: '#' }
        }
    }
}, {
    // Automatically adds 'createdAt' and 'updatedAt' timestamps to the document
    timestamps: true
});

export default mongoose.model('LandingPage', landingPageSchema);