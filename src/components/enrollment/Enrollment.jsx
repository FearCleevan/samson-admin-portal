import { useState, useMemo } from 'react';
import { FiPlus, FiSearch, FiFilter, FiEye, FiMail, FiCheckCircle, FiClock } from 'react-icons/fi';
import { format } from 'date-fns';
import { toast } from 'react-toastify';
import { MOCK_ENROLLMENTS, MOCK_STUDENTS, MOCK_TRACKS, MOCK_SUBJECTS, MOCK_PAYMENT_CATEGORIES, SCHOOL_INFO } from '../../data/mockData';
import EnrollmentModal from './EnrollmentModal';
import styles from './Enrollment.module.css';

export default function Enrollment() {
  const [enrollments, setEnrollments] = useState(MOCK_ENROLLMENTS);
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [showModal, setShowModal] = useState(false);
  const [viewStudent, setViewStudent] = useState(null);

  const filtered = useMemo(() => {
    return enrollments.filter((e) => {
      const name = `${e.student.first_name} ${e.student.last_name}`.toLowerCase();
      const sid = e.student.student_id.toLowerCase();
      const q = search.toLowerCase();
      const matchSearch = !q || name.includes(q) || sid.includes(q);
      const matchStatus = filterStatus === 'all' || e.enrollment_status === filterStatus;
      return matchSearch && matchStatus;
    });
  }, [enrollments, search, filterStatus]);

  const handleNewEnrollment = (data) => {
    const newEnrollment = {
      id: `enr-${Date.now()}`,
      ...data,
      enrollment_date: new Date().toISOString(),
      enrollment_status: 'enrolled',
    };
    setEnrollments([newEnrollment, ...enrollments]);
    setShowModal(false);
    toast.success(`Student enrolled successfully! ${data.student.student_type === 'new' ? 'Activation link sent to email.' : 'Confirmation email sent.'}`);
  };

  return (
    <div className={styles.page}>
      <div className={styles.pageHeader}>
        <div>
          <h1 className={styles.pageTitle}>Enrollment Management</h1>
          <p className={styles.pageSub}>{SCHOOL_INFO.school_year} — {SCHOOL_INFO.current_semester}</p>
        </div>
        <button className={styles.primaryBtn} onClick={() => setShowModal(true)}>
          <FiPlus /> New Enrollment
        </button>
      </div>

      {/* SUMMARY CARDS */}
      <div className={styles.summaryGrid}>
        {[
          { label: 'Total Enrolled', val: enrollments.filter(e=>e.enrollment_status==='enrolled').length, color: 'blue' },
          { label: 'Pending', val: enrollments.filter(e=>e.enrollment_status==='pending').length, color: 'orange' },
          { label: 'Grade 11', val: enrollments.filter(e=>e.grade_level==='Grade 11').length, color: 'purple' },
          { label: 'Grade 12', val: enrollments.filter(e=>e.grade_level==='Grade 12').length, color: 'green' },
        ].map((s) => (
          <div className={`${styles.summaryCard} ${styles[`sum_${s.color}`]}`} key={s.label}>
            <span className={styles.sumVal}>{s.val}</span>
            <span className={styles.sumLabel}>{s.label}</span>
          </div>
        ))}
      </div>

      {/* FILTERS */}
      <div className={styles.toolbar}>
        <div className={styles.searchWrap}>
          <FiSearch className={styles.searchIcon} />
          <input
            className={styles.searchInput}
            placeholder="Search by name or student ID..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className={styles.filters}>
          <FiFilter className={styles.filterIcon} />
          {['all', 'enrolled', 'pending', 'cancelled'].map((s) => (
            <button
              key={s}
              className={`${styles.filterBtn} ${filterStatus === s ? styles.filterActive : ''}`}
              onClick={() => setFilterStatus(s)}
            >
              {s === 'all' ? 'All' : s.charAt(0).toUpperCase() + s.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* TABLE */}
      <div className={styles.tableCard}>
        <div className={styles.tableWrap}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Student ID</th>
                <th>Student Name</th>
                <th>Grade Level</th>
                <th>Track / Strand</th>
                <th>Semester</th>
                <th>Enrollment Date</th>
                <th>Status</th>
                <th>Portal</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr><td colSpan={9} className={styles.empty}>No enrollment records found.</td></tr>
              ) : filtered.map((enr) => (
                <tr key={enr.id}>
                  <td><code>{enr.student.student_id}</code></td>
                  <td>
                    <div className={styles.studentName}>
                      <div className={styles.nameAvatar}>{enr.student.first_name.charAt(0)}</div>
                      <div>
                        <span className={styles.nameMain}>{enr.student.last_name}, {enr.student.first_name}</span>
                        <span className={styles.nameSub}>{enr.student.student_email}</span>
                      </div>
                    </div>
                  </td>
                  <td>{enr.grade_level}</td>
                  <td>
                    <span className={styles.trackBadge}>{enr.track_name}</span>
                    <span className={styles.strandSub}>{enr.strand_name}</span>
                  </td>
                  <td>{enr.semester} — {enr.school_year}</td>
                  <td>{format(new Date(enr.enrollment_date), 'MMM d, yyyy')}</td>
                  <td>
                    <span className={`${styles.statusBadge} ${styles[`status_${enr.enrollment_status}`]}`}>
                      {enr.enrollment_status === 'enrolled' ? <FiCheckCircle /> : <FiClock />}
                      {enr.enrollment_status}
                    </span>
                  </td>
                  <td>
                    <span className={`${styles.portalBadge} ${enr.student.portal_activated ? styles.portalActive : styles.portalPending}`}>
                      {enr.student.portal_activated ? 'Active' : 'Pending'}
                    </span>
                  </td>
                  <td>
                    <div className={styles.actions}>
                      <button className={styles.actionBtn} onClick={() => setViewStudent(enr)} title="View Details"><FiEye /></button>
                      <button className={styles.actionBtn} title="Resend Email"><FiMail /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className={styles.tableFooter}>
          Showing <strong>{filtered.length}</strong> of <strong>{enrollments.length}</strong> records
        </div>
      </div>

      {/* ENROLLMENT MODAL */}
      {showModal && (
        <EnrollmentModal onClose={() => setShowModal(false)} onSubmit={handleNewEnrollment} />
      )}

      {/* VIEW MODAL */}
      {viewStudent && (
        <div className={styles.overlay} onClick={() => setViewStudent(null)}>
          <div className={styles.viewModal} onClick={(e) => e.stopPropagation()}>
            <div className={styles.viewHeader}>
              <h3>Enrollment Details</h3>
              <button className={styles.closeBtn} onClick={() => setViewStudent(null)}>✕</button>
            </div>
            <div className={styles.viewGrid}>
              <div className={styles.viewField}><span>Student ID</span><strong>{viewStudent.student.student_id}</strong></div>
              <div className={styles.viewField}><span>Full Name</span><strong>{viewStudent.student.first_name} {viewStudent.student.last_name}</strong></div>
              <div className={styles.viewField}><span>LRN</span><strong>{viewStudent.student.lrn || '—'}</strong></div>
              <div className={styles.viewField}><span>Email</span><strong>{viewStudent.student.student_email}</strong></div>
              <div className={styles.viewField}><span>Grade Level</span><strong>{viewStudent.grade_level}</strong></div>
              <div className={styles.viewField}><span>Track</span><strong>{viewStudent.track_name}</strong></div>
              <div className={styles.viewField}><span>Strand</span><strong>{viewStudent.strand_name}</strong></div>
              <div className={styles.viewField}><span>Semester</span><strong>{viewStudent.semester}</strong></div>
              <div className={styles.viewField}><span>School Year</span><strong>{viewStudent.school_year}</strong></div>
              <div className={styles.viewField}><span>Status</span>
                <span className={`${styles.statusBadge} ${styles[`status_${viewStudent.enrollment_status}`]}`}>{viewStudent.enrollment_status}</span>
              </div>
              <div className={styles.viewField}><span>Portal</span>
                <span className={`${styles.portalBadge} ${viewStudent.student.portal_activated ? styles.portalActive : styles.portalPending}`}>
                  {viewStudent.student.portal_activated ? 'Activated' : 'Pending Activation'}
                </span>
              </div>
              <div className={styles.viewField}><span>Enrolled On</span><strong>{format(new Date(viewStudent.enrollment_date), 'MMMM d, yyyy h:mm a')}</strong></div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}