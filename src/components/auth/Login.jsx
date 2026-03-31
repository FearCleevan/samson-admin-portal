import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiEye, FiEyeOff, FiLock, FiUser, FiShield } from 'react-icons/fi';
import { toast } from 'react-toastify';
import { useAuthStore } from '../../store/authStore';
import { SCHOOL_INFO } from '../../data/mockData';
import styles from './Login.module.css';

export default function Login() {
  const navigate = useNavigate();
  const { login, isLoading, isAuthenticated } = useAuthStore();
  const [form, setForm] = useState({ username: '', password: '' });
  const [showPass, setShowPass] = useState(false);
  const [showForgot, setShowForgot] = useState(false);
  const [forgotEmail, setForgotEmail] = useState('');

  useEffect(() => {
    if (isAuthenticated) navigate('/dashboard', { replace: true });
  }, [isAuthenticated, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.username.trim() || !form.password.trim()) {
      toast.error('Please enter username and password.');
      return;
    }
    const result = await login(form.username.trim(), form.password);
    if (result.success) {
      toast.success('Welcome back!');
      navigate('/dashboard');
    } else {
      toast.error(result.error || 'Login failed.');
    }
  };

  const handleForgot = (e) => {
    e.preventDefault();
    if (!forgotEmail.trim()) { toast.error('Enter your email.'); return; }
    toast.info('Your request has been sent to the Super Admin for review.');
    setForgotEmail('');
    setShowForgot(false);
  };

  return (
    <div className={styles.loginPage}>
      <div className={styles.leftPanel}>
        <div className={styles.leftContent}>
          <div className={styles.schoolBadge}>
            <div className={styles.badgeIcon}><FiShield /></div>
            <div>
              <span className={styles.badgeLabel}>Admin Portal</span>
              <span className={styles.badgeSub}>School Management System</span>
            </div>
          </div>
          <h1 className={styles.heroTitle}>
            Manage Your<br />
            <span className={styles.heroAccent}>School With</span><br />
            Confidence.
          </h1>
          <p className={styles.heroDesc}>
            Enrollment, payments, track management, and student records — all in one secure, centralized platform.
          </p>
          <div className={styles.featureList}>
            {['Enrollment Management', 'Payment Processing', 'Track & Subject Control', 'Activity Monitoring'].map((f) => (
              <div className={styles.featureItem} key={f}>
                <span className={styles.featureDot} />
                <span>{f}</span>
              </div>
            ))}
          </div>
        </div>
        <div className={styles.leftBg} aria-hidden="true">
          <div className={styles.bgOrb1} />
          <div className={styles.bgOrb2} />
          <div className={styles.bgGrid} />
        </div>
      </div>

      <div className={styles.rightPanel}>
        <div className={styles.formCard}>
          <div className={styles.formHeader}>
            <div className={styles.logoMark}>
              <FiShield size={22} />
            </div>
            <div>
              <h2 className={styles.formTitle}>Admin Sign In</h2>
              <p className={styles.formSub}>{SCHOOL_INFO.name}</p>
            </div>
          </div>

          {!showForgot ? (
            <form onSubmit={handleSubmit} className={styles.form} autoComplete="off">
              <div className={styles.inputGroup}>
                <label className={styles.label}>Username</label>
                <div className={styles.inputWrap}>
                  <FiUser className={styles.inputIcon} />
                  <input
                    type="text"
                    className={styles.input}
                    placeholder="Enter your username"
                    value={form.username}
                    onChange={(e) => setForm({ ...form, username: e.target.value })}
                    autoComplete="username"
                  />
                </div>
              </div>

              <div className={styles.inputGroup}>
                <label className={styles.label}>Password</label>
                <div className={styles.inputWrap}>
                  <FiLock className={styles.inputIcon} />
                  <input
                    type={showPass ? 'text' : 'password'}
                    className={styles.input}
                    placeholder="Enter your password"
                    value={form.password}
                    onChange={(e) => setForm({ ...form, password: e.target.value })}
                    autoComplete="current-password"
                  />
                  <button type="button" className={styles.eyeBtn} onClick={() => setShowPass(!showPass)} aria-label="Toggle password">
                    {showPass ? <FiEyeOff /> : <FiEye />}
                  </button>
                </div>
              </div>

              <button type="button" className={styles.forgotLink} onClick={() => setShowForgot(true)}>
                Forgot Password?
              </button>

              <button type="submit" className={styles.submitBtn} disabled={isLoading}>
                {isLoading ? <span className={styles.spinner} /> : null}
                {isLoading ? 'Signing in...' : 'Sign In to Dashboard'}
              </button>

              <div className={styles.hint}>
                <span>Demo: <code>superadmin</code> / <code>Admin@1234</code></span>
              </div>
            </form>
          ) : (
            <form onSubmit={handleForgot} className={styles.form}>
              <div className={styles.forgotHeader}>
                <h3>Password Recovery</h3>
                <p>Submit your email and the Super Admin will review your reset request.</p>
              </div>
              <div className={styles.inputGroup}>
                <label className={styles.label}>Registered Email</label>
                <div className={styles.inputWrap}>
                  <FiUser className={styles.inputIcon} />
                  <input
                    type="email"
                    className={styles.input}
                    placeholder="your@email.com"
                    value={forgotEmail}
                    onChange={(e) => setForgotEmail(e.target.value)}
                  />
                </div>
              </div>
              <button type="submit" className={styles.submitBtn}>
                Submit Request
              </button>
              <button type="button" className={styles.forgotLink} onClick={() => setShowForgot(false)}>
                ← Back to Sign In
              </button>
            </form>
          )}
        </div>

        <p className={styles.footer}>
          &copy; {new Date().getFullYear()} {SCHOOL_INFO.name} &mdash; {SCHOOL_INFO.address}
        </p>
      </div>
    </div>
  );
}