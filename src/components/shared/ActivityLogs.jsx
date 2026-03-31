import { useState, useMemo } from 'react';
import { FiActivity, FiSearch, FiFilter } from 'react-icons/fi';
import { format } from 'date-fns';
import { MOCK_ACTIVITY_LOGS } from '../../data/mockData';
import styles from './ActivityLogs.module.css';

const MODULE_COLORS = { Enrollment: 'blue', Payment: 'green', Auth: 'purple', Students: 'orange', Courses: 'teal', Users: 'red' };

export default function ActivityLogs() {
  const [logs] = useState([...MOCK_ACTIVITY_LOGS, ...MOCK_ACTIVITY_LOGS.map((l, i) => ({...l, id: `log-extra-${i}`, created_at: new Date(Date.now() - i * 7200000).toISOString()}))]);
  const [search, setSearch] = useState('');
  const [filterModule, setFilterModule] = useState('all');
  const [filterRole, setFilterRole] = useState('all');

  const filtered = useMemo(() => {
    return logs.filter(l => {
      const q = search.toLowerCase();
      const matchSearch = !q || l.description.toLowerCase().includes(q) || l.user_name?.toLowerCase().includes(q);
      const matchModule = filterModule === 'all' || l.module === filterModule;
      const matchRole = filterRole === 'all' || l.user_type === filterRole;
      return matchSearch && matchModule && matchRole;
    });
  }, [logs, search, filterModule, filterRole]);

  const modules = [...new Set(logs.map(l => l.module))];

  return (
    <div className={styles.page}>
      <div className={styles.pageHeader}>
        <div>
          <h1 className={styles.pageTitle}>Activity Logs</h1>
          <p className={styles.pageSub}>Track all system actions and admin activities</p>
        </div>
        <div className={styles.totalBadge}>{logs.length} total entries</div>
      </div>

      <div className={styles.toolbar}>
        <div className={styles.searchWrap}>
          <FiSearch className={styles.searchIcon} />
          <input className={styles.searchInput} placeholder="Search logs..." value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <select className={styles.selectFilter} value={filterModule} onChange={e => setFilterModule(e.target.value)}>
          <option value="all">All Modules</option>
          {modules.map(m => <option key={m} value={m}>{m}</option>)}
        </select>
        <select className={styles.selectFilter} value={filterRole} onChange={e => setFilterRole(e.target.value)}>
          <option value="all">All Roles</option>
          <option value="super_admin">Super Admin</option>
          <option value="admin">Admin</option>
        </select>
      </div>

      <div className={styles.logCard}>
        <div className={styles.logList}>
          {filtered.length === 0 ? (
            <div className={styles.empty}>No activity logs found.</div>
          ) : filtered.map(log => (
            <div key={log.id} className={styles.logItem}>
              <div className={`${styles.logDot} ${styles[`dot_${log.user_type}`]}`} />
              <div className={styles.logBody}>
                <div className={styles.logTop}>
                  <span className={`${styles.moduleBadge} ${styles[`mod_${MODULE_COLORS[log.module] || 'blue'}`]}`}>{log.module}</span>
                  <span className={styles.logAction}>{log.action}</span>
                  <span className={styles.logTime}>{format(new Date(log.created_at), 'MMM d, yyyy h:mm:ss a')}</span>
                </div>
                <p className={styles.logDesc}>{log.description}</p>
                <div className={styles.logMeta}>
                  <span className={`${styles.rolePill} ${log.user_type === 'super_admin' ? styles.superPill : styles.adminPill}`}>
                    {log.user_type === 'super_admin' ? '⭐' : '🔑'} {log.user_name}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}