export const NAV_LINKS = ['Platform', 'Features', 'Solutions', 'Pricing', 'Resources'];

export const STATS = [
  { num: '50K+', label: 'Students Managed' },
  { num: '2K+', label: 'Educators Onboard' },
  { num: '100+', label: 'Institutions Trust Us' },
  { num: '99.9%', label: 'Platform Uptime' },
];





export const FEATURES = [
  { col: 'bc-4', icon: '👥', iconCls: 'fi-blue', title: 'Student Management', desc: 'Centralized profiles, enrollment history, documents, and records — everything in one place.', preview: ['Bulk import / export', 'Document vault', 'Academic timeline'] },
  { col: 'bc-4', icon: '✅', iconCls: 'fi-green', title: 'Attendance Tracking', desc: 'Real-time marking, monthly reports, alerts for low attendance, and parent notifications.', preview: ['Bulk mark by class', 'Parent alerts', 'Monthly reports'] },
  { col: 'bc-4', icon: '📊', iconCls: 'fi-purple', title: 'Analytics Dashboard', desc: 'Live institutional overview with trends, performance, and actionable insights.', preview: ['Attendance trends', 'Performance graphs', 'Fee analytics'] },
  { col: 'bc-6', icon: '💰', iconCls: 'fi-orange', title: 'Fee & Finance', desc: 'Flexible fee structures, digital payments, invoice generation, dues tracking, and comprehensive financial reports.', preview: ['Custom fee plans', 'Payment receipts', 'Dues reminders', 'Financial reports'] },
  { col: 'bc-6', icon: '📚', iconCls: 'fi-cyan', title: 'Academic Management', desc: 'Subjects, tests, marks, grades, result publishing, and complete academic progress tracking.', preview: ['Test & exam management', 'Grade computation', 'Result publishing'] },
  { col: 'bc-3', icon: '🧑‍🏫', iconCls: 'fi-pink', title: 'Faculty', desc: 'Faculty profiles, schedules, workload, and attendance management.', preview: ['Schedule management'] },
  { col: 'bc-3', icon: '📢', iconCls: 'fi-white', title: 'Communication', desc: 'Announcements, notices, and institutional updates delivered instantly.', preview: ['Targeted broadcasts', 'Notice board'] },
  { col: 'bc-3', icon: '🎓', iconCls: 'fi-blue', title: 'Admissions', desc: 'Manage applications, approvals, and student onboarding end-to-end.', preview: ['Application pipeline'] },
  { col: 'bc-3', icon: '🔒', iconCls: 'fi-green', title: 'Role-Based Access', desc: 'Granular permissions for Admin, Faculty, Students, and Parents.', preview: ['Custom roles', 'Audit logs'] },
];

export const ROLES = {
  Admin: {
    headline: 'Run your institution like a CEO.',
    desc: 'Get a bird\'s-eye view of every department — students, faculty, finances, attendance, and performance — all from a single command center.',
    feats: ['Institution-wide overview', 'Student & faculty statistics', 'Fee collection & dues', 'Attendance tracking across batches', 'Automated reports & insights', 'Role management & permissions'],
    stats: [{ val: '12,842', lbl: 'Students' }, { val: '94.6%', lbl: 'Attendance' }, { val: '₹18.4L', lbl: 'Fees' }],
    list: [{ icon: '📊', text: 'Analytics Dashboard' }, { icon: '👥', text: 'Student Records' }, { icon: '💰', text: 'Finance Overview' }, { icon: '📢', text: 'Broadcast Notice' }],
  },
  Faculty: {
    headline: 'Spend less time on admin. More on teaching.',
    desc: 'Mark attendance in seconds, enter marks from a spreadsheet-style interface, and see student performance at a glance.',
    feats: ['Today\'s class schedule', 'One-tap attendance marking', 'Marks & grades entry', 'Student performance tracking', 'Assignment management', 'Academic reporting'],
    stats: [{ val: '4', lbl: 'Classes Today' }, { val: '38', lbl: 'Students' }, { val: '91%', lbl: 'Avg Attend.' }],
    list: [{ icon: '📋', text: 'Mark Attendance' }, { icon: '✍️', text: 'Enter Marks' }, { icon: '📅', text: 'View Schedule' }, { icon: '📊', text: 'Class Analytics' }],
  },
  Student: {
    headline: 'Everything you need, in one place.',
    desc: 'Your courses, attendance record, grades, fee status, and institutional announcements — accessible anytime, anywhere.',
    feats: ['Course & subject overview', 'Attendance history & percentage', 'Exam results & grades', 'Fee status & payment history', 'Institutional announcements', 'Study materials access'],
    stats: [{ val: '89%', lbl: 'Attendance' }, { val: 'A+', lbl: 'Grade' }, { val: '₹0', lbl: 'Dues' }],
    list: [{ icon: '📚', text: 'My Courses' }, { icon: '📊', text: 'My Grades' }, { icon: '💳', text: 'Fee Status' }, { icon: '📢', text: 'Notices' }],
  },
  Parent: {
    headline: 'Stay connected to your child\'s education.',
    desc: 'Track attendance daily, monitor academic performance, receive fee reminders, and stay updated on institutional announcements.',
    feats: ['Real-time attendance visibility', 'Academic performance tracking', 'Fee status & payment history', 'Institutional announcements', 'Low-attendance alerts', 'Direct communication'],
    stats: [{ val: '91%', lbl: 'Attendance' }, { val: 'B+', lbl: 'Grade' }, { val: '✓', lbl: 'Fees Paid' }],
    list: [{ icon: '✅', text: 'Today\'s Attendance' }, { icon: '📊', text: 'Performance' }, { icon: '💸', text: 'Fee Status' }, { icon: '🔔', text: 'Alerts' }],
  },
};

export const ANALYTICS_CARDS = [
  { title: 'Monthly Attendance', bars: [45,60,52,70,65,80,75,90,85,95,88,93], metric: '94.6%', label: 'Avg Attendance This Month', trend: '↑ 3.2% vs last month', cls: 'mb-blue' },
  { title: 'Fee Collection', bars: [80,60,90,70,85,55,75,95,65,88,72,98], metric: '₹18.4L', label: 'Collected This Quarter', trend: '↑ 12.5% vs last quarter', cls: 'mb-primary' },
  { title: 'Student Performance', bars: [60,70,65,80,75,85,78,88,82,90,86,92], metric: '78.3', label: 'Avg Score Across All Tests', trend: '↑ 5.8% improvement', cls: 'mb-green' },
];

export const FLOW_STEPS = [
  { icon: '✅', title: 'Attendance Recorded', desc: 'Faculty marks attendance in under 30 seconds using bulk marking.' },
  { icon: '🔄', title: 'Student Records Updated', desc: 'Attendance synced in real-time to each student\'s individual profile.' },
  { icon: '📱', title: 'Parent Notification Triggered', desc: 'Automated alert sent to parent with attendance status instantly.' },
  { icon: '📊', title: 'Analytics Refreshed', desc: 'Institution-wide attendance trends updated live on the dashboard.' },
];

export const AUTO_FEATS = [
  { icon: '🔔', title: 'Attendance Alerts', desc: 'Automated notifications when attendance drops below threshold.' },
  { icon: '💸', title: 'Fee Reminders', desc: 'Scheduled reminders sent to students with pending dues.' },
  { icon: '📉', title: 'Performance Alerts', desc: 'Flag students at academic risk before it becomes critical.' },
  { icon: '📄', title: 'Report Generation', desc: 'Auto-generate progress reports on schedule, no manual effort.' },
];

export const SEC_LAYERS = [
  { icon: '🛡️', title: 'Role-Based Access Control', desc: 'Granular permissions — every user sees only what they need.' },
  { icon: '🔐', title: 'Secure Authentication', desc: 'JWT dual-token auth with OTP verification and session management.' },
  { icon: '🔒', title: 'Data Encryption', desc: 'All sensitive data encrypted at rest and in transit.' },
  { icon: '📋', title: 'Audit Logs', desc: 'Complete activity trail across every user action and data change.' },
  { icon: '🏢', title: 'Multi-Tenant Architecture', desc: 'Each organization is fully isolated — zero data cross-contamination.' },
  { icon: '☁️', title: 'Backup & Recovery', desc: 'Automated daily backups with point-in-time recovery.' },
];

export const INTEGRATIONS = [
  { icon: '💳', name: 'Razorpay', status: 'soon' },
  { icon: '📧', name: 'Email (SMTP)', status: 'ok' },
  { icon: '💬', name: 'WhatsApp', status: 'soon' },
  { icon: '📱', name: 'SMS Gateway', status: 'soon' },
  { icon: '☁️', name: 'Cloud Storage', status: 'ok' },
  { icon: '🔑', name: 'OAuth (Google)', status: 'soon' },
  { icon: '🪪', name: 'Biometric Systems', status: 'soon' },
  { icon: '⚡', name: 'REST API', status: 'ok' },
];

export const PRICING_PLANS = [
  {
    name: 'Starter',
    desc: 'For small coaching institutes & schools',
    monthly: '4,999',
    yearly: '3,999',
    note: 'Per month, billed annually',
    feats: ['Up to 500 students', 'Student management', 'Attendance tracking', 'Basic academics', 'Basic reports', 'Role-based access', 'Email support'],
    btn: { label: 'Start Free Trial', cls: 'outline' },
  },
  {
    name: 'Professional',
    desc: 'For growing institutions',
    monthly: '12,999',
    yearly: '9,999',
    note: 'Per month, billed annually',
    feats: ['Up to 5,000 students', 'Everything in Starter', 'Advanced analytics', 'Fee management', 'Faculty management', 'Communication module', 'Automation & alerts', 'Advanced reports', 'Priority support'],
    btn: { label: 'Get Started', cls: 'filled' },
    featured: true,
  },
  {
    name: 'Enterprise',
    desc: 'For universities & large organizations',
    monthly: null,
    yearly: null,
    feats: ['Unlimited students', 'Everything in Professional', 'Multi-campus support', 'Custom workflows', 'API access', 'Dedicated account manager', 'Custom integrations', 'SLA guarantee', 'On-premise option'],
    btn: { label: 'Talk to Sales', cls: 'outline' },
  },
];

export const TESTIMONIALS = [
  { stars: 5, text: '"Canopux SMS transformed how we manage our institute. What used to take hours in spreadsheets now happens automatically. The attendance tracking alone saves us 2 hours a day."', name: 'Rajesh Kumar', role: 'Principal, Sunrise Academy', initials: 'RK', color: '#2563EB' },
  { stars: 5, text: '"The parent communication feature has drastically reduced the calls we receive. Parents can see attendance and fees directly — everyone is on the same page now."', name: 'Priya Sharma', role: 'Academic Coordinator, Bright Future College', initials: 'PS', color: '#10B981' },
  { stars: 5, text: '"Setting up was quick. The team was helpful. The analytics dashboard gives me insights I never had before. I can now make decisions based on real data."', name: 'Arvind Singh', role: 'Director, Pinnacle Coaching Centre', initials: 'AS', color: '#8B5CF6' },
];

export const FAQS = [
  { q: 'What types of institutions can use the platform?', a: 'Canopux SMS is designed for schools, colleges, coaching institutes, universities, and any educational organization that manages students and faculty. The platform scales from 50 to 50,000+ students.' },
  { q: 'Can we migrate our existing student data?', a: 'Yes. We support bulk import via CSV/Excel files. Our onboarding team assists with data migration to ensure a smooth transition from your existing system.' },
  { q: 'Does it support multiple campuses?', a: 'Multi-campus support is available on the Enterprise plan. Each campus can be managed independently while providing a unified view for the central administration.' },
  { q: 'Can administrators define custom roles and permissions?', a: 'Yes. The platform supports role-based access control with customizable permission sets. You can create roles beyond Admin, Faculty, and Student as per your institutional hierarchy.' },
  { q: 'Is the system mobile responsive?', a: 'Fully. The platform is accessible on any device. A dedicated mobile app built with Capacitor is also available for Android and iOS for enhanced native performance.' },
  { q: 'How secure is student data?', a: 'Security is built into the core. Data is encrypted at rest and in transit, sessions are managed with JWT dual-token architecture, and every tenant\'s data is fully isolated via multi-tenant architecture.' },
  { q: 'Can we integrate payment gateways for fee collection?', a: 'Payment gateway integration (Razorpay and others) is on our roadmap and will be available soon. Currently, fee management, invoicing, and dues tracking are fully functional.' },
  { q: 'Do you provide onboarding and support?', a: 'Yes. All plans include onboarding assistance. Professional plan includes priority support, and Enterprise includes a dedicated account manager.' },
];