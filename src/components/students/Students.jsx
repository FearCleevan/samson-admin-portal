import { useState } from 'react';
import { FiSearch, FiUser, FiMail } from 'react-icons/fi';
import { format } from 'date-fns';
import { MOCK_STUDENTS } from '../../data/mockData';
import styles from './Students.module.css';

export default function Students() {
  const [students] = useState(MOCK_STUDENTS);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('all');

  const filtered = students.filter(s => {
    const q = search.toLowerCase();
    const matchSearch = !q || `${s.first_name} ${s.last_name}`.toLowerCase().includes(q) || s.student_id.toLowerCase().includes(q) || (s.lrn || '').includes(q);
    const matchFilter = filter === 'all' || s.student_type === filter;
    return matchSearch && matchFilter;
  });

  return (
    <div className={styles.page}>
      <div className={styles.pageHeader}>
        <div>
          <h1 className={styles.pageTitle}>Student Records</h1>
          <p className={styles.pageSub}>View and manage all enrolled students</p>
        </div>
      </div>

      <div className={styles.toolbar}>
        <div className={styles.searchWrap}>
          <FiSearch className={styles.searchIcon} />
          <input className={styles.searchInput} placeholder="Search by name, ID, or LRN..." value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <div className={styles.filters}>
          {['all', 'new', 'old'].map(f => (
            <button key={f} className={`${styles.filterBtn} ${filter === f ? styles.filterActive : ''}`} onClick={() => setFilter(f)}>
              {f === 'all' ? 'All' : f === 'new' ? 'New Enrollees' : 'Returning'}
            </button>
          ))}
        </div>
      </div>

      <div className={styles.grid}>
        {filtered.map(s => (
          <div key={s.id} className={styles.studentCard}>
            <div className={styles.cardTop}>
              <div className={styles.avatar}>{s.first_name.charAt(0)}</div>
              <div className={styles.cardInfo}>
                <h4>{s.first_name} {s.middle_name ? s.middle_name.charAt(0) + '. ' : ''}{s.last_name}</h4>
                <code>{s.student_id}</code>
              </div>
              <span className={`${styles.portalBadge} ${s.portal_activated ? styles.portalActive : styles.portalPending}`}>
                {s.portal_activated ? '✓ Portal' : '⏳ Pending'}
              </span>
            </div>
            <div className={styles.cardBody}>
              <div className={styles.infoRow}><span>LRN</span><span>{s.lrn || '—'}</span></div>
              <div className={styles.infoRow}><span>Gender</span><span>{s.gender}</span></div>
              <div className={styles.infoRow}><FiMail size={11} /><span className={styles.email}>{s.student_email}</span></div>
              <div className={styles.infoRow}><span>Guardian</span><span>{s.guardian_name}</span></div>
              <div className={styles.infoRow}><span>Type</span>
                <span className={`${styles.typeBadge} ${s.student_type === 'new' ? styles.typeNew : styles.typeOld}`}>
                  {s.student_type === 'new' ? 'New' : 'Returning'}
                </span>
              </div>
            </div>
            <div className={styles.cardFooter}>
              Enrolled: {format(new Date(s.created_at), 'MMM d, yyyy')}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}