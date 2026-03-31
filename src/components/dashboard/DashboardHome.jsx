import { useMemo } from 'react';
import { FiUsers, FiFileText, FiDollarSign, FiTrendingUp, FiActivity, FiAlertCircle } from 'react-icons/fi';
import { format } from 'date-fns';
import { MOCK_STUDENTS, MOCK_ENROLLMENTS, MOCK_PAYMENTS, MOCK_ACTIVITY_LOGS, SCHOOL_INFO } from '../../data/mockData';
import { useAuthStore } from '../../store/authStore';
import styles from './DashboardHome.module.css';

const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

export default function DashboardHome() {
  const { user } = useAuthStore();

  const metrics = useMemo(() => {
    const totalRevenue = MOCK_PAYMENTS.filter(p => p.payment_status === 'completed')
      .reduce((sum, p) => sum + p.amount, 0);
    return {
      totalStudents: MOCK_STUDENTS.length,
      totalEnrolled: MOCK_ENROLLMENTS.filter(e => e.enrollment_status === 'enrolled').length,
      totalRevenue,
      pendingPortal: MOCK_STUDENTS.filter(s => !s.portal_activated).length,
    };
  }, []);

  const recentPayments = MOCK_PAYMENTS.slice(-4).reverse();
  const recentLogs = MOCK_ACTIVITY_LOGS.slice(0, 5);

  const paymentByMethod = useMemo(() => {
    const grouped = { gcash: 0, card: 0, over_the_counter: 0 };
    MOCK_PAYMENTS.forEach(p => { grouped[p.payment_method] = (grouped[p.payment_method] || 0) + p.amount; });
    const total = Object.values(grouped).reduce((a, b) => a + b, 0);
    return Object.entries(grouped).map(([k, v]) => ({
      label: k === 'over_the_counter' ? 'Counter' : k === 'gcash' ? 'GCash' : 'Card',
      amount: v,
      pct: total > 0 ? Math.round((v / total) * 100) : 0,
      color: k === 'gcash' ? '#0070b8' : k === 'card' ? '#7c3aed' : '#15803d',
    }));
  }, []);

  const statCards = [
    { label: 'Total Students', value: metrics.totalStudents, icon: FiUsers, color: 'blue', delta: '+3 this week' },
    { label: 'Enrolled This Term', value: metrics.totalEnrolled, icon: FiFileText, color: 'green', delta: 'Active enrollments' },
    { label: 'Total Revenue', value: `₱${metrics.totalRevenue.toLocaleString()}`, icon: FiDollarSign, color: 'gold', delta: 'All time payments' },
    { label: 'Pending Portal', value: metrics.pendingPortal, icon: FiAlertCircle, color: 'orange', delta: 'Needs activation' },
  ];

  return (
    <div className={styles.page}>
      <div className={styles.pageHeader}>
        <div>
          <h1 className={styles.pageTitle}>Dashboard Overview</h1>
          <p className={styles.pageSub}>
            Welcome back, <strong>{user?.full_name}</strong> &bull; {SCHOOL_INFO.school_year} {SCHOOL_INFO.current_semester}
          </p>
        </div>
        <div className={styles.dateBadge}>
          {format(new Date(), 'EEEE, MMMM d, yyyy')}
        </div>
      </div>

      {/* STAT CARDS */}
      <div className={styles.statGrid}>
        {statCards.map((s) => (
          <div className={`${styles.statCard} ${styles[`stat_${s.color}`]}`} key={s.label}>
            <div className={styles.statIcon}><s.icon /></div>
            <div className={styles.statBody}>
              <span className={styles.statValue}>{s.value}</span>
              <span className={styles.statLabel}>{s.label}</span>
              <span className={styles.statDelta}>{s.delta}</span>
            </div>
          </div>
        ))}
      </div>

      <div className={styles.midGrid}>
        {/* PAYMENT BREAKDOWN */}
        <div className={styles.card}>
          <div className={styles.cardHeader}>
            <h3>Payment Breakdown</h3>
            <span className={styles.cardSub}>By method</span>
          </div>
          <div className={styles.paymentChart}>
            {paymentByMethod.map((p) => (
              <div key={p.label} className={styles.paymentBar}>
                <div className={styles.paymentBarMeta}>
                  <span className={styles.paymentBarLabel}>{p.label}</span>
                  <span className={styles.paymentBarAmt}>₱{p.amount.toLocaleString()} <span className={styles.paymentBarPct}>({p.pct}%)</span></span>
                </div>
                <div className={styles.barTrack}>
                  <div className={styles.barFill} style={{ width: `${p.pct}%`, background: p.color }} />
                </div>
              </div>
            ))}
          </div>
          <div className={styles.totalRow}>
            <span>Total Collected</span>
            <strong>₱{MOCK_PAYMENTS.reduce((s,p) => s + p.amount, 0).toLocaleString()}</strong>
          </div>
        </div>

        {/* ENROLLMENT STATS */}
        <div className={styles.card}>
          <div className={styles.cardHeader}>
            <h3>Enrollment Summary</h3>
            <span className={styles.cardSub}>{SCHOOL_INFO.school_year}</span>
          </div>
          <div className={styles.enrollSummary}>
            {[
              { label: 'Grade 11', count: MOCK_ENROLLMENTS.filter(e => e.grade_level === 'Grade 11').length, color: '#1e4a8a' },
              { label: 'Grade 12', count: MOCK_ENROLLMENTS.filter(e => e.grade_level === 'Grade 12').length, color: '#a0720a' },
              { label: 'New Enrollees', count: MOCK_STUDENTS.filter(s => s.student_type === 'new').length, color: '#15803d' },
              { label: 'Returning', count: MOCK_STUDENTS.filter(s => s.student_type === 'old').length, color: '#7c3aed' },
            ].map((item) => (
              <div className={styles.enrollItem} key={item.label}>
                <div className={styles.enrollCircle} style={{ background: item.color }}>
                  {item.count}
                </div>
                <span>{item.label}</span>
              </div>
            ))}
          </div>
          <div className={styles.strandBreakdown}>
            <p className={styles.strandTitle}>By Track</p>
            {['ABM', 'STEM', 'HUMSS', 'TVL-ICT'].map((track) => (
              <div className={styles.strandRow} key={track}>
                <span>{track}</span>
                <div className={styles.strandBar}>
                  <div className={styles.strandFill} style={{ width: `${Math.random() * 60 + 20}%` }} />
                </div>
                <span>{Math.floor(Math.random() * 3) + 1}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className={styles.bottomGrid}>
        {/* RECENT PAYMENTS */}
        <div className={styles.card}>
          <div className={styles.cardHeader}>
            <h3>Recent Payments</h3>
            <a href="/dashboard/payments" className={styles.viewAll}>View All</a>
          </div>
          <div className={styles.tableWrap}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>OR #</th>
                  <th>Student</th>
                  <th>Category</th>
                  <th>Amount</th>
                  <th>Method</th>
                </tr>
              </thead>
              <tbody>
                {recentPayments.map((p) => (
                  <tr key={p.id}>
                    <td><code>{p.or_number.split('-').slice(-1)[0]}</code></td>
                    <td>{p.student.first_name} {p.student.last_name}</td>
                    <td>{p.category_name}</td>
                    <td><strong>₱{p.amount.toLocaleString()}</strong></td>
                    <td>
                      <span className={`${styles.methodBadge} ${styles[`method_${p.payment_method}`]}`}>
                        {p.payment_method === 'over_the_counter' ? 'Counter' : p.payment_method === 'gcash' ? 'GCash' : 'Card'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* ACTIVITY LOG */}
        <div className={styles.card}>
          <div className={styles.cardHeader}>
            <h3>Activity Log</h3>
            <a href="/dashboard/activity" className={styles.viewAll}>View All</a>
          </div>
          <div className={styles.activityList}>
            {recentLogs.map((log) => (
              <div className={styles.activityItem} key={log.id}>
                <div className={`${styles.activityDot} ${styles[`dot_${log.user_type}`]}`} />
                <div className={styles.activityBody}>
                  <p className={styles.activityDesc}>{log.description}</p>
                  <div className={styles.activityMeta}>
                    <span>{log.user_name}</span>
                    <span className={styles.activityTime}>
                      {format(new Date(log.created_at), 'MMM d, h:mm a')}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}