import { useState, useMemo, useRef } from 'react';
import { FiPlus, FiSearch, FiPrinter, FiEye, FiDollarSign, FiCheckCircle, FiFilter } from 'react-icons/fi';
import { format } from 'date-fns';
import { toast } from 'react-toastify';
import { MOCK_PAYMENTS, MOCK_STUDENTS, MOCK_PAYMENT_CATEGORIES, SCHOOL_INFO } from '../../data/mockData';
import PaymentModal from './PaymentModal';
import ReceiptModal from './ReceiptModal';
import styles from './Payments.module.css';

export default function Payments() {
  const [payments, setPayments] = useState(MOCK_PAYMENTS);
  const [search, setSearch] = useState('');
  const [filterMethod, setFilterMethod] = useState('all');
  const [showModal, setShowModal] = useState(false);
  const [viewReceipt, setViewReceipt] = useState(null);

  const filtered = useMemo(() => {
    return payments.filter((p) => {
      const name = `${p.student.first_name} ${p.student.last_name}`.toLowerCase();
      const or = p.or_number.toLowerCase();
      const q = search.toLowerCase();
      const matchSearch = !q || name.includes(q) || or.includes(q);
      const matchMethod = filterMethod === 'all' || p.payment_method === filterMethod;
      return matchSearch && matchMethod;
    });
  }, [payments, search, filterMethod]);

  const totalRevenue = useMemo(() => payments.reduce((s, p) => s + p.amount, 0), [payments]);
  const gcashTotal = useMemo(() => payments.filter(p => p.payment_method === 'gcash').reduce((s, p) => s + p.amount, 0), [payments]);
  const cardTotal = useMemo(() => payments.filter(p => p.payment_method === 'card').reduce((s, p) => s + p.amount, 0), [payments]);
  const counterTotal = useMemo(() => payments.filter(p => p.payment_method === 'over_the_counter').reduce((s, p) => s + p.amount, 0), [payments]);

  const handleNewPayment = (data) => {
    const date = new Date();
    const orNum = `OR-${format(date, 'yyyyMMdd')}-${String(payments.length + 1).padStart(5, '0')}`;
    const newPayment = {
      id: `pay-${Date.now()}`,
      or_number: orNum,
      ...data,
      payment_date: date.toISOString(),
      payment_status: 'completed',
    };
    setPayments([newPayment, ...payments]);
    setShowModal(false);
    toast.success(`Payment recorded! OR# ${orNum}`);
    if (data.payment_method === 'gcash' || data.payment_method === 'card') {
      toast.info(`Email notification sent to ${data.student.student_email}`);
    }
    setTimeout(() => setViewReceipt(newPayment), 500);
  };

  return (
    <div className={styles.page}>
      <div className={styles.pageHeader}>
        <div>
          <h1 className={styles.pageTitle}>Payment Management</h1>
          <p className={styles.pageSub}>Collect, record, and generate official receipts</p>
        </div>
        <button className={styles.primaryBtn} onClick={() => setShowModal(true)}>
          <FiPlus /> Record Payment
        </button>
      </div>

      {/* STAT CARDS */}
      <div className={styles.statGrid}>
        {[
          { label: 'Total Collected', val: `₱${totalRevenue.toLocaleString()}`, color: 'blue', icon: FiDollarSign },
          { label: 'GCash', val: `₱${gcashTotal.toLocaleString()}`, color: 'sky', icon: FiCheckCircle },
          { label: 'Card', val: `₱${cardTotal.toLocaleString()}`, color: 'purple', icon: FiCheckCircle },
          { label: 'Counter', val: `₱${counterTotal.toLocaleString()}`, color: 'green', icon: FiCheckCircle },
        ].map((s) => (
          <div className={`${styles.statCard} ${styles[`stat_${s.color}`]}`} key={s.label}>
            <div className={styles.statIcon}><s.icon /></div>
            <div>
              <span className={styles.statVal}>{s.val}</span>
              <span className={styles.statLabel}>{s.label}</span>
            </div>
          </div>
        ))}
      </div>

      {/* TOOLBAR */}
      <div className={styles.toolbar}>
        <div className={styles.searchWrap}>
          <FiSearch className={styles.searchIcon} />
          <input className={styles.searchInput} placeholder="Search by student name or OR number..." value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <div className={styles.filters}>
          <FiFilter className={styles.filterIcon} />
          {[
            { val: 'all', label: 'All' },
            { val: 'gcash', label: 'GCash' },
            { val: 'card', label: 'Card' },
            { val: 'over_the_counter', label: 'Counter' },
          ].map(f => (
            <button key={f.val} className={`${styles.filterBtn} ${filterMethod === f.val ? styles.filterActive : ''}`} onClick={() => setFilterMethod(f.val)}>
              {f.label}
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
                <th>OR Number</th>
                <th>Student</th>
                <th>Category</th>
                <th>Amount</th>
                <th>Method</th>
                <th>Reference</th>
                <th>Date</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr><td colSpan={9} className={styles.empty}>No payment records found.</td></tr>
              ) : filtered.map((p) => (
                <tr key={p.id}>
                  <td><code className={styles.orCode}>{p.or_number}</code></td>
                  <td>
                    <div className={styles.studentCell}>
                      <div className={styles.avatar}>{p.student.first_name.charAt(0)}</div>
                      <div>
                        <span className={styles.sName}>{p.student.last_name}, {p.student.first_name}</span>
                        <span className={styles.sId}>{p.student.student_id}</span>
                      </div>
                    </div>
                  </td>
                  <td>{p.category_name}</td>
                  <td><strong className={styles.amount}>₱{p.amount.toLocaleString()}</strong></td>
                  <td>
                    <span className={`${styles.methodBadge} ${styles[`method_${p.payment_method}`]}`}>
                      {p.payment_method === 'over_the_counter' ? 'Counter' : p.payment_method === 'gcash' ? 'GCash' : 'Card'}
                    </span>
                  </td>
                  <td className={styles.refNum}>{p.reference_number || <span className={styles.na}>—</span>}</td>
                  <td>{format(new Date(p.payment_date), 'MMM d, yyyy')}</td>
                  <td>
                    <span className={`${styles.statusBadge} ${styles[`status_${p.payment_status}`]}`}>{p.payment_status}</span>
                  </td>
                  <td>
                    <div className={styles.actions}>
                      <button className={styles.actionBtn} onClick={() => setViewReceipt(p)} title="View Receipt"><FiEye /></button>
                      <button className={styles.actionBtn} onClick={() => setViewReceipt(p)} title="Print Receipt"><FiPrinter /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className={styles.tableFooter}>
          Showing <strong>{filtered.length}</strong> of <strong>{payments.length}</strong> records &nbsp;|&nbsp;
          Total shown: <strong>₱{filtered.reduce((s, p) => s + p.amount, 0).toLocaleString()}</strong>
        </div>
      </div>

      {showModal && <PaymentModal onClose={() => setShowModal(false)} onSubmit={handleNewPayment} />}
      {viewReceipt && <ReceiptModal payment={viewReceipt} onClose={() => setViewReceipt(null)} />}
    </div>
  );
}