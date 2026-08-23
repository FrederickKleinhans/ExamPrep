import type { ReactNode } from 'react';
import {
  ArrowDownRight,
  ArrowUpRight,
  BarChart3,
  BookOpenText,
  Bookmark,
  BriefcaseBusiness,
  CheckCircle2,
  ClipboardCheck,
  Flame,
  LayoutDashboard,
  NotebookPen,
  PlayCircle,
  Settings,
  ShieldCheck,
  Target,
  Trophy,
  Zap,
} from 'lucide-react';
import styles from './DashboardLayout.module.css';

export type DashboardSection =
  | 'dashboard'
  | 'study'
  | 'exam'
  | 'analytics'
  | 'bookmarks'
  | 'settings';

export interface CareerCert {
  code: string;
  progress: number;
  color: string;
}

export interface CareerTrack {
  id: string;
  name: string;
  icon: string;
  completion: number;
  total: number;
  percent: number;
  color: string;
  certs: CareerCert[];
}

export interface WeakArea {
  id: string;
  topic: string;
  cert: string;
  accuracy: number;
  progress: number;
}

export interface DashboardLayoutProps {
  activeSection: DashboardSection;
  metrics: {
    completion: number;
    completionDelta: number;
    avgScore: number;
    avgScoreDelta: number;
    streak: number;
    bestStreak: number;
    examsTaken: number;
    examsDelta: number;
  };
  tracks: CareerTrack[];
  weakAreas: WeakArea[];
  bookmarksCount: number;
  user: { name: string; plan: string };
  onNavigate: (section: string) => void;
  onQuickStudy: () => void;
  onPracticeExam: () => void;
  onReviewBookmarks: () => void;
  children?: ReactNode;
}

const sectionMeta: Record<DashboardSection, { title: string; subtitle: string; icon: typeof LayoutDashboard }> = {
  dashboard: { title: 'Dashboard', subtitle: 'Performance snapshot', icon: LayoutDashboard },
  study: { title: 'Study', subtitle: 'Your learning path', icon: BookOpenText },
  exam: { title: 'Exam', subtitle: 'Prepare for the next challenge', icon: ClipboardCheck },
  analytics: { title: 'Analytics', subtitle: 'Skill trends and insights', icon: BarChart3 },
  bookmarks: { title: 'Bookmarks', subtitle: 'Saved resources and notes', icon: Bookmark },
  settings: { title: 'Settings', subtitle: 'Tailor your study experience', icon: Settings },
};

const navGroups: Array<{
  label: string;
  items: Array<{
    key: string;
    label: string;
    icon: typeof LayoutDashboard;
    badge?: boolean;
  }>;
}> = [
  {
    label: 'Main',
    items: [
      { key: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
      { key: 'study', label: 'Study', icon: BookOpenText },
      { key: 'exam', label: 'Exam', icon: ClipboardCheck },
      { key: 'analytics', label: 'Analytics', icon: BarChart3 },
    ],
  },
  {
    label: 'Library',
    items: [{ key: 'bookmarks', label: 'Bookmarks', icon: Bookmark, badge: true }],
  },
  {
    label: 'Settings',
    items: [{ key: 'settings', label: 'Settings', icon: Settings }],
  },
];

const formatPercent = (value: number) => `${Math.round(value)}%`;
const formatDelta = (value: number) => `${value > 0 ? '+' : ''}${value}%`;
const getInitials = (name: string) =>
  name
    .split(' ')
    .map((part) => part[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

const trackIcons: Record<string, typeof LayoutDashboard> = {
  cloud: LayoutDashboard,
  security: ShieldCheck,
  identity: CheckCircle2,
  services: BriefcaseBusiness,
  default: Trophy,
};

export function DashboardLayout({
  activeSection,
  metrics,
  tracks,
  weakAreas,
  bookmarksCount,
  user,
  onNavigate,
  onQuickStudy,
  onPracticeExam,
  onReviewBookmarks,
  children,
}: DashboardLayoutProps) {
  const activeMeta = sectionMeta[activeSection] ?? sectionMeta.dashboard;
  const Icon = activeMeta.icon;

  const metricCards = [
    {
      label: 'Completion',
      value: formatPercent(metrics.completion),
      delta: metrics.completionDelta,
      accent: '#58a6ff',
      icon: Target,
    },
    {
      label: 'Avg score',
      value: formatPercent(metrics.avgScore),
      delta: metrics.avgScoreDelta,
      accent: '#3fb950',
      icon: Trophy,
    },
    {
      label: 'Study streak',
      value: `${metrics.streak}d`,
      delta: metrics.streak - metrics.bestStreak,
      deltaLabel: `Best ${metrics.bestStreak}d`,
      accent: '#d29922',
      icon: Flame,
    },
    {
      label: 'Exams taken',
      value: `${metrics.examsTaken}`,
      delta: metrics.examsDelta,
      accent: '#a78bfa',
      icon: NotebookPen,
    },
  ];

  const shellContent = children ?? (
    <>
      <section className={styles.quickActions} aria-label="Quick actions">
        <button type="button" className={styles.primaryAction} onClick={onQuickStudy}>
          <Zap size={16} />
          Quick study
        </button>
        <button type="button" className={styles.secondaryAction} onClick={onPracticeExam}>
          <PlayCircle size={16} />
          Practice exam
        </button>
        <button type="button" className={styles.secondaryAction} onClick={onReviewBookmarks}>
          <Bookmark size={16} />
          Review bookmarks
        </button>
      </section>

      <section className={styles.metricGrid} aria-label="Performance metrics">
        {metricCards.map(({ label, value, delta, deltaLabel, accent, icon: IconComponent }) => (
          <article key={label} className={styles.metricCard} style={{ ['--card-accent' as string]: accent }}>
            <div className={styles.metricHeader}>
              <span>{label}</span>
              <span className={styles.metricDot} />
            </div>
            <div className={styles.metricValue}>{value}</div>
            <div className={styles.metricMeta}>
              <span className={delta >= 0 ? styles.deltaPositive : styles.deltaNegative}>
                {delta >= 0 ? <ArrowUpRight size={12} /> : <ArrowDownRight size={12} />}
                {deltaLabel ?? formatDelta(delta)}
              </span>
              <span className={styles.metricIconWrap}>
                <IconComponent size={12} />
              </span>
            </div>
          </article>
        ))}
      </section>

      <section className={styles.contentGrid} aria-label="Career and review panels">
        <div className={styles.panel}>
          <div className={styles.sectionHeading}>
            <div>
              <span className={styles.eyebrow}>Career tracks</span>
              <h2>Focused learning paths</h2>
            </div>
            <button type="button" className={styles.linkButton} onClick={() => onNavigate('study')}>
              View all
            </button>
          </div>

          <div className={styles.trackGrid}>
            {tracks.map((track) => {
              const IconComponent = trackIcons[track.icon] ?? trackIcons.default;
              return (
                <article
                  key={track.id}
                  className={styles.trackCard}
                  style={{ ['--track-accent' as string]: track.color }}
                >
                  <button
                    type="button"
                    className={styles.trackAction}
                    onClick={() => onNavigate(track.id)}
                    aria-label={`Open ${track.name}`}
                  >
                    <div className={styles.trackHeader}>
                      <span className={styles.trackIconWrap}>
                        <IconComponent size={14} />
                      </span>
                      <span className={styles.trackName}>{track.name}</span>
                    </div>

                    <div className={styles.trackMetaRow}>
                      <strong>{track.completion}/{track.total}</strong>
                      <span>{formatPercent(track.percent)}</span>
                    </div>

                    <div className={styles.progressBar}>
                      <span style={{ width: `${Math.min(track.percent, 100)}%`, background: track.color }} />
                    </div>
                  </button>

                  <div className={styles.certList}>
                    {track.certs.map((cert) => (
                      <button
                        key={`${track.id}-${cert.code}`}
                        type="button"
                        className={styles.certChip}
                        onClick={(event) => {
                          event.stopPropagation();
                          onNavigate(`study:${cert.code.toLowerCase()}`);
                        }}
                        aria-label={`Study ${cert.code}`}
                      >
                        <span className={styles.certDot} style={{ background: cert.color }} />
                        <span className={styles.certCode}>{cert.code}</span>
                        <span className={styles.certMiniBarWrap}>
                          <span style={{ width: `${cert.progress}%`, background: cert.color }} />
                        </span>
                      </button>
                    ))}
                  </div>
                </article>
              );
            })}
          </div>
        </div>

        <div className={styles.panel}>
          <div className={styles.sectionHeading}>
            <div>
              <span className={styles.eyebrow}>Priority review</span>
              <h2>Weak areas</h2>
            </div>
          </div>

          <ol className={styles.reviewList}>
            {weakAreas.map((area, index) => (
              <li key={area.id} className={styles.reviewItem}>
                <div className={styles.reviewRow}>
                  <div className={styles.reviewRank}>#{index + 1}</div>
                  <div className={styles.reviewInfo}>
                    <div className={styles.reviewTopic}>{area.topic}</div>
                    <div className={styles.reviewCert}>{area.cert}</div>
                  </div>
                  <div className={styles.reviewAccuracy}>{formatPercent(area.accuracy)}</div>
                </div>
                <div className={styles.progressBar}>
                  <span style={{ width: `${Math.min(area.progress, 100)}%` }} />
                </div>
              </li>
            ))}
          </ol>
        </div>
      </section>
    </>
  );

  return (
    <div className={styles.shell}>
      <aside className={styles.sidebar} aria-label="Main navigation">
        <div className={styles.brandRow}>
          <div className={styles.brandMark}>
            <Zap size={18} />
          </div>
          <div className={styles.brandText}>
            <span className={styles.brandKicker}>CERT</span>
            <span className={styles.brandName}>Ready</span>
          </div>
        </div>

        <nav className={styles.nav} aria-label="Sidebar navigation">
          {navGroups.map((group) => (
            <div key={group.label} className={styles.navGroup}>
              <div className={styles.navLabel}>{group.label}</div>
              {group.items.map(({ key, label, icon: IconItem, badge }) => {
                const isActive = key === activeSection;
                return (
                  <button
                    key={key}
                    type="button"
                    className={`${styles.navItem} ${isActive ? styles.navItemActive : ''}`}
                    onClick={() => onNavigate(key)}
                  >
                    {isActive && <span className={styles.navGlow} />}
                    <span className={styles.navIconWrap}>
                      <IconItem size={16} />
                    </span>
                    <span className={styles.navText}>{label}</span>
                    {badge && bookmarksCount > 0 && (
                      <span className={styles.badge}>{bookmarksCount}</span>
                    )}
                  </button>
                );
              })}
            </div>
          ))}
        </nav>

        <div className={styles.profileCard}>
          <div className={styles.avatar}>{getInitials(user.name)}</div>
          <div className={styles.profileMeta}>
            <div className={styles.userName}>{user.name}</div>
            <div className={styles.userPlan}>{user.plan}</div>
          </div>
        </div>
      </aside>

      <main className={styles.content}>
        <div className={styles.contentInner}>
          <header className={styles.headerBar}>
            <div className={styles.headerTitleBlock}>
              <span className={styles.pageEyebrow}>Overview</span>
              <h1>
                <Icon size={18} />
                {activeMeta.title}
              </h1>
              <p>{activeMeta.subtitle}</p>
            </div>

            <div className={styles.streakPill}>
              <Flame size={14} />
              <span>{metrics.streak} day streak</span>
            </div>
          </header>

          {shellContent}
        </div>
      </main>
    </div>
  );
}

export default DashboardLayout;
