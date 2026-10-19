import './ShowcaseSection.css';
import { FeatureVideo } from '../common/FeatureVideo/FeatureVideo';
import { VIDEO_REGISTRY } from '../../data/videoManifest';

export default function ShowcaseSection() {
  const showcaseData = [
    {
      rev: false,
      title: "Know what's happening across your institution",
      desc: 'Turn thousands of student records into clear, actionable insights. The admin dashboard gives you a live overview of attendance, finance, and academic performance.',
      tags: ['Real-time Data', 'Live Analytics', 'Drill-down Reports'],
      video: VIDEO_REGISTRY.admin_dashboard,
    },
    {
      rev: true,
      title: 'Attendance in seconds, not hours',
      desc: 'Mark attendance for an entire class in one click. Track trends over time, get low-attendance alerts, and notify parents automatically.',
      tags: ['Bulk Marking', 'Parent Alerts', 'Monthly Reports'],
      video: VIDEO_REGISTRY.student_attendance,
    },
    {
      rev: false,
      title: 'Academics & results, end-to-end',
      desc: 'From creating tests to entering marks and publishing results — the entire academic cycle is handled within one clean interface.',
      tags: ['Test Management', 'Marks Entry', 'Result Publishing'],
      video: VIDEO_REGISTRY.marks_exams,
    },
  ];

  return (
    <section className="lp-showcase">
      <div className="lp-container">
        <div className="showcase-header">
          <div className="section-tag glow-tag">Product Showcase</div>
          <h2 className="section-headline">Everything connected. Nothing scattered.</h2>
          <p className="section-sub center">
            See how Canopux SMS looks and feels across every critical workflow — with smooth, high-fidelity live animations.
          </p>
        </div>
        <div className="showcase-items">
          {showcaseData.map((item, i) => (
            <div key={i} className={`showcase-item ${item.rev ? 'rev' : ''}`}>
              <div className="showcase-info">
                <h3>{item.title}</h3>
                <p>{item.desc}</p>
                <div className="showcase-tags">
                  {item.tags.map((t) => (
                    <span key={t} className="sc-tag">
                      {t}
                    </span>
                  ))}
                </div>
              </div>
              <div className="showcase-video-wrapper">
                <FeatureVideo
                  videoUrl={item.video?.videoUrl}
                  posterUrl={item.video?.posterUrl}
                  title={item.video?.title || item.title}
                  badge={item.video?.badge}
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
