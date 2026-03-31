import { useState } from 'react';
import { FiX, FiSearch, FiDollarSign } from 'react-icons/fi';
import { MOCK_STUDENTS, MOCK_PAYMENT_CATEGORIES } from '../../data/mockData';
import styles from './PaymentModal.module.css';

export default function PaymentModal({ onClose, onSubmit }) {
  const [studentSearch, setStudentSearch] = useState('');
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [form, setForm] = useState({
    payment_category_id: '',
    amount: '',
    payment_method: 'over_the_counter',
    reference_number: '',
    notes: '',
  });
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const filteredStudents = MOCK_STUDENTS.filter(s => {
    const q = studentSearch.toLowerCase();
    return !q || `${s.first_name} ${s.last_name}`.toLowerCase().includes(q) || s.student_id.toLowerCase().includes(q);
  }).slice(0, 6);

  const selectedCategory = MOCK_PAYMENT_CATEGORIES.find(c => c.id === form.payment_category_id);

  const upd = (k, v) => {
    setForm(f => ({ ...f, [k]: v }));
    if (k === 'payment_category_id') {
      const cat = MOCK_PAYMENT_CATEGORIES.find(c => c.id === v);
      if (cat?.default_amount) setForm(f => ({ ...f, payment_category_id: v, amount: cat.default_amount.toString() }));
    }
  };

  const validate = () => {
    const e = {};
    if (!selectedStudent) e.student = 'Select a student';
    if (!form.payment_category_id) e.category = 'Select a category';
    if (!form.amount || isNaN(form.amount) || Number(form.amount) <= 0) e.amount = 'Enter a valid amount';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;
    setIsLoading(true);
    await new Promise(r => setTimeout(r, 900));
    onSubmit({
      student_id: selectedStudent.id,
      student: selectedStudent,
      payment_category_id: form.payment_category_id,
      category_name: selectedCategory?.name || '',
      amount: Number(form.amount),
      payment_method: form.payment_method,
      reference_number: form.reference_number || null,
      notes: form.notes,
      received_by_name: 'Current User',
    });
  };

  return (
    <div className={styles.overlay}>
      <div className={styles.modal}>
        <div className={styles.header}>
          <div className={styles.headerIcon}><FiDollarSign /></div>
          <div>
            <h2>Record Payment</h2>
            <p>Process and issue official receipt</p>
          </div>
          <button className={styles.closeBtn} onClick={onClose}><FiX /></button>
        </div>

        <div className={styles.body}>
          {/* STUDENT SELECTOR */}
          <div className={styles.section}>
            <label className={styles.sectionLabel}>1. Select Student</label>
            {!selectedStudent ? (
              <div className={styles.studentSearch}>
                <div className={styles.searchWrap}>
                  <FiSearch className={styles.sIcon} />
                  <input className={styles.searchInput} placeholder="Search by name or Student ID..." value={studentSearch} onChange={e => setStudentSearch(e.target.value)} autoFocus />
                </div>
                {studentSearch && (
                  <div className={styles.studentList}>
                    {filteredStudents.length === 0 ? (
                      <div className={styles.noResults}>No students found</div>
                    ) : filteredStudents.map(s => (
                      <div key={s.id} className={styles.studentOption} onClick={() => { setSelectedStudent(s); setStudentSearch(''); }}>
                        <div className={styles.sAvatar}>{s.first_name.charAt(0)}</div>
                        <div>
                          <span className={styles.sName}>{s.first_name} {s.last_name}</span>
                          <span className={styles.sId}>{s.student_id}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
                {errors.student && <span className={styles.errMsg}>{errors.student}</span>}
              </div>
            ) : (
              <div className={styles.selectedStudent}>
                <div className={styles.sAvatar}>{selectedStudent.first_name.charAt(0)}</div>
                <div className={styles.selInfo}>
                  <span className={styles.selName}>{selectedStudent.first_name} {selectedStudent.last_name}</span>
                  <span className={styles.selId}>{selectedStudent.student_id} &bull; {selectedStudent.student_email}</span>
                </div>
                <button className={styles.changeBtn} onClick={() => setSelectedStudent(null)}>Change</button>
              </div>
            )}
          </div>

          {/* PAYMENT DETAILS */}
          <div className={styles.section}>
            <label className={styles.sectionLabel}>2. Payment Details</label>
            <div className={styles.formGrid}>
              <div className={styles.field}>
                <label>Payment Category *</label>
                <select value={form.payment_category_id} onChange={e => upd('payment_category_id', e.target.value)} className={errors.category ? styles.inputError : ''}>
                  <option value="">Select Category</option>
                  {MOCK_PAYMENT_CATEGORIES.filter(c => c.is_active).map(c => (
                    <option key={c.id} value={c.id}>{c.name}{c.default_amount ? ` — ₱${c.default_amount}` : ''}</option>
                  ))}
                </select>
                {errors.category && <span className={styles.errMsg}>{errors.category}</span>}
              </div>

              <div className={styles.field}>
                <label>Amount (₱) *</label>
                <input type="number" value={form.amount} onChange={e => upd('amount', e.target.value)} placeholder="0.00" min="0" step="0.01" className={errors.amount ? styles.inputError : ''} />
                {errors.amount && <span className={styles.errMsg}>{errors.amount}</span>}
              </div>

              <div className={`${styles.field} ${styles.fullField}`}>
                <label>Payment Method</label>
                <div className={styles.methodGrid}>
                  {[
                    { val: 'gcash', emoji: '📱', label: 'GCash' },
                    { val: 'card', emoji: '💳', label: 'Card' },
                    { val: 'over_the_counter', emoji: '🏦', label: 'Counter' },
                  ].map(m => (
                    <label key={m.val} className={`${styles.methodCard} ${form.payment_method === m.val ? styles.methodActive : ''}`}>
                      <input type="radio" name="method" value={m.val} checked={form.payment_method === m.val} onChange={() => upd('payment_method', m.val)} />
                      <span>{m.emoji}</span>
                      <span>{m.label}</span>
                    </label>
                  ))}
                </div>
              </div>

              {(form.payment_method === 'gcash' || form.payment_method === 'card') && (
                <div className={styles.field}>
                  <label>Reference / Transaction #</label>
                  <input value={form.reference_number} onChange={e => upd('reference_number', e.target.value)} placeholder="e.g. GC-XXXXXXXXXXXX" />
                </div>
              )}

              <div className={`${styles.field} ${styles.fullField}`}>
                <label>Notes (optional)</label>
                <textarea value={form.notes} onChange={e => upd('notes', e.target.value)} placeholder="Additional notes..." rows={2} />
              </div>
            </div>
          </div>

          {/* PREVIEW */}
          {selectedStudent && form.amount && (
            <div className={styles.preview}>
              <div className={styles.previewRow}><span>Student</span><strong>{selectedStudent.first_name} {selectedStudent.last_name}</strong></div>
              <div className={styles.previewRow}><span>Category</span><strong>{selectedCategory?.name || '—'}</strong></div>
              <div className={styles.previewRow}><span>Amount</span><strong className={styles.previewAmount}>₱{Number(form.amount).toLocaleString()}</strong></div>
              <div className={styles.previewRow}><span>Method</span><strong>{form.payment_method === 'over_the_counter' ? 'Over the Counter' : form.payment_method.toUpperCase()}</strong></div>
              {(form.payment_method === 'gcash' || form.payment_method === 'card') && (
                <div className={styles.emailNote}>📧 Email notification will be sent to <em>{selectedStudent.student_email}</em></div>
              )}
            </div>
          )}
        </div>

        <div className={styles.footer}>
          <button className={styles.cancelBtn} onClick={onClose}>Cancel</button>
          <button className={styles.submitBtn} onClick={handleSubmit} disabled={isLoading}>
            {isLoading ? <span className={styles.spinner} /> : <FiDollarSign />}
            {isLoading ? 'Processing...' : 'Record & Generate OR'}
          </button>
        </div>
      </div>
    </div>
  );
}