export interface VideoMetadata {
  key: string;
  title: string;
  category: 'core' | 'admin' | 'academic' | 'student' | 'finance' | 'hero';
  badge: string;
  videoUrl: string;
  posterUrl: string;
  publicId: string;
}

const CLOUD_NAME = 'dbsskv4bf';
const BASE_VIDEO = `https://res.cloudinary.com/${CLOUD_NAME}/video/upload/f_auto,q_auto/v1`;
const BASE_POSTER = `https://res.cloudinary.com/${CLOUD_NAME}/video/upload/so_0,f_webp,q_auto/v1`;

const makeVideo = (key: string, title: string, category: VideoMetadata['category'], badge: string): VideoMetadata => ({
  key,
  title,
  category,
  badge,
  publicId: `sms_canopux/${key}`,
  videoUrl: `${BASE_VIDEO}/sms_canopux/${key}.mp4`,
  posterUrl: `${BASE_POSTER}/sms_canopux/${key}.jpg`,
});

export const VIDEO_REGISTRY: Record<string, VideoMetadata> = {
  admin_dashboard: makeVideo('admin_dashboard', 'Admin Command Center', 'admin', 'canopux.org/app/admin/dashboard'),
  student_attendance: makeVideo('student_attendance', 'Attendance Tracking', 'core', 'canopux.org/app/attendance/daily'),
  marks_exams: makeVideo('marks_exams', 'Exams & Marks Entry', 'academic', 'canopux.org/app/academics/marks'),
  student_directory: makeVideo('student_directory', 'Student Directory & Records', 'core', 'canopux.org/app/students/directory'),
  billing_finance: makeVideo('billing_finance', 'Fee & Finance Management', 'finance', 'canopux.org/app/finance/fees'),
  notices_broadcast: makeVideo('notices_broadcast', 'Communication & Notice Broadcast', 'core', 'canopux.org/app/communication/notices'),
  upload_materials: makeVideo('upload_materials', 'Study Materials & LMS', 'academic', 'canopux.org/app/academics/materials'),
  session_manager: makeVideo('session_manager', 'Academic Session & Term Manager', 'admin', 'canopux.org/app/academics/sessions'),
  stream_manager: makeVideo('stream_manager', 'Stream & Course Manager', 'admin', 'canopux.org/app/academics/streams'),
  target_exam: makeVideo('target_exam', 'Competitive Exam Preparation', 'academic', 'canopux.org/app/exams/target'),
  branding_whitelabel: makeVideo('branding_whitelabel', 'Institution Branding & White-label', 'admin', 'canopux.org/app/settings/branding'),
  student_dashboard: makeVideo('student_dashboard', 'Student Portal Dashboard', 'student', 'canopux.org/app/student/home'),
  student_profile: makeVideo('student_profile', 'Student Profile & Details', 'student', 'canopux.org/app/student/profile'),
  student_assignment: makeVideo('student_assignment', 'Student Assignments', 'student', 'canopux.org/app/student/assignments'),
  student_notice: makeVideo('student_notice', 'Student Notice Board', 'student', 'canopux.org/app/student/notices'),
  platform_walkthrough: makeVideo('platform_walkthrough', 'Canopux SMS Platform Walkthrough', 'hero', 'canopux.org/app/platform/tour'),
};

export default VIDEO_REGISTRY;
