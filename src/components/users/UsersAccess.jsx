import { useState } from 'react';
import { FiPlus, FiEdit2, FiShield, FiUser, FiCheck, FiX, FiClock } from 'react-icons/fi';
import { format } from 'date-fns';
import { toast } from 'react-toastify';
import { MOCK_ADMIN_USERS, MOCK_ACCESS_REQUESTS } from '../../data/mockData';
import styles from './UsersAccess.module.css';

export default function UsersAccess() {
  const [users, setUsers] = useState(MOCK_ADMIN_USERS.map(({ password, ...u }) => u));
  const [requests, setRequests] = useState(MOCK_ACCESS_REQUESTS);
  const [activeTab, setActiveTab] = useState('users');
  const [showModal, setShowModal] = useState(false);
  const [editingUser, setEditingUser] = useState(null);

  const [form, setForm] = useState({ username: '', email: '', full_name: '', role: 'admin', password: '', is_active: true });

  const handleSaveUser = () => {
    if (!form.username || !form.email || !form.full_name) { toast.error('All fields required'); return; }
    if (editingUser) {
      setUsers(users.map(u => u.id === editingUser.id ? { ...u, ...form } : u));
      toast.success('User updated successfully!');
    } else {
      const newUser = { id: `usr-${Date.now()}`, ...form, created_at: new Date().toISOString(), last_login: null };
      setUsers([...users, newUser]);
      toast.success('Admin user created! Login credentials sent to email.');
    }
    setShowModal(false); setEditingUser(null);
    setForm({ username: '', email: '', full_name: '', role: 'admin', password: '', is_active: true });
  };

  const handleApproveRequest = (req) => {
    setRequests(requests.map(r => r.id === req.id ? { ...r, status: 'approved', reviewed_at: new Date().toISOString() } : r));
    const newUser = {
      id: `usr-${Date.now()}`, username: req.requester_email.split('@')[0],
      email: req.requester_email, full_name: req.requester_name,
      role: req.requested_role, is_active: true, created_at: new Date().toISOString(), last_login: null
    };
    setUsers([...users, newUser]);
    toast.success(`Request approved. ${req.requester_name} now has ${req.requested_role} access.`);
  };

  const handleRejectRequest = (req) => {
    setRequests(requests.map(r => r.id === req.id ? { ...r, status: 'rejected', reviewed_at: new Date().toISOString() } : r));
    toast.info('Request rejected.');
  };

  const openEdit = (user) => { setForm({ ...user, password: '' }); setEditingUser(user); setShowModal(true); };

  const pendingCount = requests.filter(r => r.status === 'pending').length;

  return (
    <div className={styles.page}>
      <div className={styles.pageHeader}>
        <div>
          <h1 className={styles.pageTitle}>Users & Access Management</h1>
          <p className={styles.pageSub}>Manage admin accounts and access requests (Super Admin only)</p>
        </div>
        <button className={styles.primaryBtn} onClick={() => { setShowModal(true); setEditingUser(null); setForm({ username: '', email: '', full_name: '', role: 'admin', password: '', is_active: true }); }}>
          <FiPlus /> Create User
        </button>
      </div>

      {/* ROLE INFO */}
      <div className={styles.roleCards}>
        <div className={styles.roleCard}>
          <div className={styles.roleIcon} style={{ background: '#fef3c7', color: '#92400e' }}><FiShield /></div>
          <div>
            <h4>Super Admin</h4>
            <p>Full access: enrollment, payments, courses, users, settings, activity logs</p>
          </div>
          <span className={styles.rolePill} style={{ background: '#fef3c7', color: '#92400e' }}>{users.filter(u => u.role === 'super_admin').length} users</span>
        </div>
        <div className={styles.roleCard}>
          <div className={styles.roleIcon} style={{ background: '#dbeafe', color: '#1e40af' }}><FiUser /></div>
          <div>
            <h4>Admin</h4>
            <p>Access: enrollment, payments, courses, students — no user management or settings</p>
          </div>
          <span className={styles.rolePill} style={{ background: '#dbeafe', color: '#1e40af' }}>{users.filter(u => u.role === 'admin').length} users</span>
        </div>
      </div>

      {/* TABS */}
      <div className={styles.tabs}>
        <button className={`${styles.tab} ${activeTab === 'users' ? styles.tabActive : ''}`} onClick={() => setActiveTab('users')}>Admin Users ({users.length})</button>
        <button className={`${styles.tab} ${activeTab === 'requests' ? styles.tabActive : ''}`} onClick={() => setActiveTab('requests')}>
          Access Requests {pendingCount > 0 && <span className={styles.badge}>{pendingCount}</span>}
        </button>
      </div>

      {/* USERS TABLE */}
      {activeTab === 'users' && (
        <div className={styles.tableCard}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>User</th>
                <th>Username</th>
                <th>Role</th>
                <th>Status</th>
                <th>Last Login</th>
                <th>Created</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map(user => (
                <tr key={user.id}>
                  <td>
                    <div className={styles.userCell}>
                      <div className={`${styles.avatar} ${user.role === 'super_admin' ? styles.avatarSuper : styles.avatarAdmin}`}>
                        {user.full_name.charAt(0)}
                      </div>
                      <div>
                        <span className={styles.uName}>{user.full_name}</span>
                        <span className={styles.uEmail}>{user.email}</span>
                      </div>
                    </div>
                  </td>
                  <td><code className={styles.uCode}>{user.username}</code></td>
                  <td>
                    <span className={`${styles.roleBadge} ${user.role === 'super_admin' ? styles.roleSuper : styles.roleAdmin}`}>
                      {user.role === 'super_admin' ? '⭐ Super Admin' : '🔑 Admin'}
                    </span>
                  </td>
                  <td>
                    <span className={`${styles.statusDot} ${user.is_active ? styles.dotActive : styles.dotInactive}`} />
                    {user.is_active ? 'Active' : 'Inactive'}
                  </td>
                  <td className={styles.muted}>{user.last_login ? format(new Date(user.last_login), 'MMM d, h:mm a') : 'Never'}</td>
                  <td className={styles.muted}>{format(new Date(user.created_at), 'MMM d, yyyy')}</td>
                  <td>
                    <button className={styles.actionBtn} onClick={() => openEdit(user)}><FiEdit2 /></button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* ACCESS REQUESTS */}
      {activeTab === 'requests' && (
        <div className={styles.requestList}>
          {requests.length === 0 ? (
            <div className={styles.emptyState}>No access requests.</div>
          ) : requests.map(req => (
            <div key={req.id} className={`${styles.requestCard} ${styles[`req_${req.status}`]}`}>
              <div className={styles.reqInfo}>
                <div className={styles.reqAvatar}>{req.requester_name.charAt(0)}</div>
                <div>
                  <div className={styles.reqName}>{req.requester_name}</div>
                  <div className={styles.reqEmail}>{req.requester_email}</div>
                  <div className={styles.reqMeta}>
                    Requesting: <strong>{req.requested_role}</strong> &bull; {format(new Date(req.created_at), 'MMM d, yyyy h:mm a')}
                  </div>
                  {req.reason && <div className={styles.reqReason}>"{req.reason}"</div>}
                </div>
              </div>
              <div className={styles.reqActions}>
                {req.status === 'pending' ? (
                  <>
                    <button className={styles.approveBtn} onClick={() => handleApproveRequest(req)}><FiCheck /> Approve</button>
                    <button className={styles.rejectBtn} onClick={() => handleRejectRequest(req)}><FiX /> Reject</button>
                  </>
                ) : (
                  <span className={`${styles.reqStatus} ${req.status === 'approved' ? styles.reqApproved : styles.reqRejected}`}>
                    {req.status === 'approved' ? <FiCheck /> : <FiX />} {req.status}
                    {req.reviewed_at && <span className={styles.reviewedAt}> — {format(new Date(req.reviewed_at), 'MMM d')}</span>}
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* CREATE/EDIT USER MODAL */}
      {showModal && (
        <div className={styles.overlay}>
          <div className={styles.formModal}>
            <div className={styles.fmHeader}>
              <h3>{editingUser ? 'Edit Admin User' : 'Create Admin User'}</h3>
              <button className={styles.closeBtn} onClick={() => setShowModal(false)}>✕</button>
            </div>
            <div className={styles.fmBody}>
              <div className={styles.fmGrid}>
                <div className={styles.field}><label>Full Name *</label><input value={form.full_name} onChange={e => setForm(f=>({...f,full_name:e.target.value}))} placeholder="Full Name" /></div>
                <div className={styles.field}><label>Username *</label><input value={form.username} onChange={e => setForm(f=>({...f,username:e.target.value}))} placeholder="username" /></div>
                <div className={`${styles.field} ${styles.fullField}`}><label>Email *</label><input type="email" value={form.email} onChange={e => setForm(f=>({...f,email:e.target.value}))} placeholder="admin@school.edu.ph" /></div>
                <div className={styles.field}><label>Role</label><select value={form.role} onChange={e => setForm(f=>({...f,role:e.target.value}))}><option value="admin">Admin</option><option value="super_admin">Super Admin</option></select></div>
                <div className={styles.field}><label>Status</label><select value={form.is_active ? 'active' : 'inactive'} onChange={e => setForm(f=>({...f,is_active:e.target.value==='active'}))}><option value="active">Active</option><option value="inactive">Inactive</option></select></div>
                {!editingUser && <div className={`${styles.field} ${styles.fullField}`}><label>Temporary Password *</label><input type="password" value={form.password} onChange={e => setForm(f=>({...f,password:e.target.value}))} placeholder="Set temporary password" /></div>}
              </div>
            </div>
            <div className={styles.fmFooter}>
              <button className={styles.cancelBtn} onClick={() => setShowModal(false)}>Cancel</button>
              <button className={styles.saveBtn} onClick={handleSaveUser}>{editingUser ? 'Update User' : 'Create User'}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}