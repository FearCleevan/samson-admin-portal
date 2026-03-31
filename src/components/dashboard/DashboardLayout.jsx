import { useState } from 'react';
import { NavLink, useNavigate, Outlet } from 'react-router-dom';
import {
  FiGrid, FiUsers, FiBookOpen, FiDollarSign, FiLayers,
  FiSettings, FiLogOut, FiMenu, FiX, FiShield, FiBell,
  FiChevronDown, FiUser, FiActivity, FiFileText
} from 'react-icons/fi';
import { useAuthStore } from '../../store/authStore';
import { SCHOOL_INFO } from '../../data/mockData';
import styles from './DashboardLayout.module.css';

const NAV_ITEMS = [
  { path: '/dashboard', label: 'Dashboard', icon: FiGrid, exact: true },
  { path: '/dashboard/enrollment', label: 'Enrollment', icon: FiFileText },
  { path: '/dashboard/payments', label: 'Payments', icon: FiDollarSign },
  { path: '/dashboard/courses', label: 'Tracks & Subjects', icon: FiBookOpen },
  { path: '/dashboard/students', label: 'Students', icon: FiUsers },
  { path: '/dashboard/activity', label: 'Activity Logs', icon: FiActivity },
];

const ADMIN_ONLY = [
  { path: '/dashboard/users', label: 'Users & Access', icon: FiShield, superAdminOnly: true },
  { path: '/dashboard/settings', label: 'Settings', icon: FiSettings, superAdminOnly: true },
];

export default function DashboardLayout() {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const visibleAdminItems = ADMIN_ONLY.filter(
    (item) => !item.superAdminOnly || user?.role === 'super_admin'
  );

  return (
    <div className={`${styles.layout} ${sidebarOpen ? styles.sidebarOpen : styles.sidebarClosed}`}>
      {/* SIDEBAR */}
      <aside className={styles.sidebar}>
        <div className={styles.sidebarTop}>
          <div className={styles.logoArea}>
            <div className={styles.logoIcon}><FiShield /></div>
            {sidebarOpen && (
              <div className={styles.logoText}>
                <span className={styles.logoName}>Admin Portal</span>
                <span className={styles.logoSub}>{SCHOOL_INFO.name}</span>
              </div>
            )}
          </div>
          <button className={styles.toggleBtn} onClick={() => setSidebarOpen(!sidebarOpen)} aria-label="Toggle sidebar">
            {sidebarOpen ? <FiX /> : <FiMenu />}
          </button>
        </div>

        <nav className={styles.nav}>
          <div className={styles.navGroup}>
            {sidebarOpen && <span className={styles.navLabel}>Main Menu</span>}
            {NAV_ITEMS.map(({ path, label, icon: Icon, exact }) => (
              <NavLink
                key={path}
                to={path}
                end={exact}
                className={({ isActive }) => `${styles.navItem} ${isActive ? styles.navItemActive : ''}`}
              >
                <Icon className={styles.navIcon} />
                {sidebarOpen && <span>{label}</span>}
              </NavLink>
            ))}
          </div>

          {visibleAdminItems.length > 0 && (
            <div className={styles.navGroup}>
              {sidebarOpen && <span className={styles.navLabel}>Administration</span>}
              {visibleAdminItems.map(({ path, label, icon: Icon }) => (
                <NavLink
                  key={path}
                  to={path}
                  className={({ isActive }) => `${styles.navItem} ${isActive ? styles.navItemActive : ''}`}
                >
                  <Icon className={styles.navIcon} />
                  {sidebarOpen && <span>{label}</span>}
                </NavLink>
              ))}
            </div>
          )}
        </nav>

        <div className={styles.sidebarBottom}>
          <button className={styles.logoutBtn} onClick={handleLogout}>
            <FiLogOut className={styles.navIcon} />
            {sidebarOpen && <span>Sign Out</span>}
          </button>
        </div>
      </aside>

      {/* MAIN CONTENT */}
      <div className={styles.mainWrapper}>
        {/* HEADER */}
        <header className={styles.header}>
          <div className={styles.headerLeft}>
            <h2 className={styles.pageTitle}>{SCHOOL_INFO.school_year} &bull; {SCHOOL_INFO.current_semester}</h2>
          </div>
          <div className={styles.headerRight}>
            <button className={styles.iconBtn} aria-label="Notifications">
              <FiBell />
              <span className={styles.notifDot} />
            </button>
            <div className={styles.userMenu}>
              <button className={styles.userBtn} onClick={() => setUserMenuOpen(!userMenuOpen)}>
                <div className={styles.avatar}>{user?.full_name?.charAt(0)}</div>
                <div className={styles.userInfo}>
                  <span className={styles.userName}>{user?.full_name}</span>
                  <span className={styles.userRole}>{user?.role === 'super_admin' ? 'Super Admin' : 'Admin'}</span>
                </div>
                <FiChevronDown className={`${styles.chevron} ${userMenuOpen ? styles.chevronOpen : ''}`} />
              </button>
              {userMenuOpen && (
                <div className={styles.userDropdown}>
                  <div className={styles.dropdownInfo}>
                    <span className={styles.dropdownName}>{user?.full_name}</span>
                    <span className={styles.dropdownEmail}>{user?.email}</span>
                  </div>
                  <hr className={styles.divider} />
                  <button className={styles.dropdownItem}><FiUser /> My Profile</button>
                  <button className={styles.dropdownItem} onClick={handleLogout}><FiLogOut /> Sign Out</button>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* BODY */}
        <main className={styles.body}>
          <Outlet />
        </main>

        {/* FOOTER */}
        <footer className={styles.footer}>
          <span>&copy; {new Date().getFullYear()} {SCHOOL_INFO.name}</span>
          <span className={styles.footerDivider}>|</span>
          <span>{SCHOOL_INFO.address}</span>
          <span className={styles.footerDivider}>|</span>
          <span>School Management System v1.0</span>
        </footer>
      </div>
    </div>
  );
}