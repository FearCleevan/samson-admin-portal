import { useState } from 'react';
import { FiX, FiUser, FiBook, FiDollarSign, FiCheckCircle, FiPlus, FiMinus } from 'react-icons/fi';
import { toast } from 'react-toastify';
import { MOCK_TRACKS, MOCK_SUBJECTS, MOCK_PAYMENT_CATEGORIES, SCHOOL_INFO } from '../../data/mockData';
import styles from './EnrollmentModal.module.css';

const STEPS = ['Personal Info', 'Academic Details', 'Payment', 'Confirm'];

const SEMESTERS_BY_LEVEL = {
  'Grade 11': ['1st', '2nd'],
  'Grade 12': ['1st', '2nd'],
};

export default function EnrollmentModal({ onClose, onSubmit }) {
  const [step, setStep] = useState(0);
  const [isLoading, setIsLoading] = useState(false);

  const [form, setForm] = useState({
    // Personal
    first_name: '', middle_name: '', last_name: '', suffix: '',
    gender: '', birthdate: '', address: '',
    contact_number: '',
    student_email: '', // for portal link
    guardian_name: '', guardian_contact: '', guardian_email: '',
    lrn: '',
    student_type: 'new', // new | old
    // Academic
    grade_level: 'Grade 11', strand_id: '', track_id: '',
    school_year: SCHOOL_INFO.school_year,
    semester: '1st',
    selected_semesters: [], // for old students
    // Payment
    payment_category_id: '',
    payment_amount: '',
    payment_method: 'over_the_counter',
    reference_number: '',
    add_payment: false,
  });

  const [errors, setErrors] = useState({});

  const upd = (field, val) => setForm((f) => ({ ...f, [field]: val }));

  const selectedTrack = MOCK_TRACKS.find((t) => t.id === form.track_id);
  const trackSubjects = MOCK_SUBJECTS.filter(
    (s) => (s.strand_id === form.strand_id || s.is_core) && s.grade_level === form.grade_level && s.semester === form.semester
  );

  const validateStep = () => {
    const e = {};
    if (step === 0) {
      if (!form.first_name.trim()) e.first_name = 'Required';
      if (!form.last_name.trim()) e.last_name = 'Required';
      if (!form.gender) e.gender = 'Required';
      if (!form.student_email.trim()) e.student_email = 'Required';
      if (!form.guardian_name.trim()) e.guardian_name = 'Required';
    }
    if (step === 1) {
      if (!form.track_id) e.track_id = 'Select a track';
      if (!form.strand_id) e.strand_id = 'Select a strand';
    }
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const nextStep = () => {
    if (!validateStep()) return;
    setStep((s) => Math.min(s + 1, STEPS.length - 1));
  };

  const prevStep = () => setStep((s) => Math.max(s - 1, 0));

  const handleSubmit = async () => {
    setIsLoading(true);
    await new Promise((r) => setTimeout(r, 1200));
    const studentId = `${new Date().getFullYear()}-${String(Math.floor(Math.random() * 9000) + 1000)}`;
    const student = {
      id: `stu-${Date.now()}`,
      student_id: studentId,
      lrn: form.lrn,
      first_name: form.first_name,
      middle_name: form.middle_name,
      last_name: form.last_name,
      gender: form.gender,
      birthdate: form.birthdate,
      address: form.address,
      contact_number: form.contact_number,
      student_email: form.student_email,
      guardian_name: form.guardian_name,
      guardian_contact: form.guardian_contact,
      guardian_email: form.guardian_email,
      student_type: form.student_type,
      status: 'active',
      portal_activated: false,
    };
    const enrollmentData = {
      student,
      strand_id: form.strand_id,
      strand_name: selectedTrack?.strands.find(s => s.id === form.strand_id)?.name || '',
      track_name: selectedTrack?.code || '',
      grade_level: form.grade_level,
      semester: form.semester,
      school_year: form.school_year,
    };
    setIsLoading(false);
    onSubmit(enrollmentData);
  };

  return (
    <div className={styles.overlay}>
      <div className={styles.modal}>
        {/* HEADER */}
        <div className={styles.modalHeader}>
          <div>
            <h2>New Enrollment</h2>
            <p>Senior High School — {SCHOOL_INFO.school_year}</p>
          </div>
          <button className={styles.closeBtn} onClick={onClose}><FiX /></button>
        </div>

        {/* STEPPER */}
        <div className={styles.stepper}>
          {STEPS.map((s, i) => (
            <div key={s} className={`${styles.step} ${i <= step ? styles.stepActive : ''} ${i < step ? styles.stepDone : ''}`}>
              <div className={styles.stepNum}>{i < step ? <FiCheckCircle /> : i + 1}</div>
              <span className={styles.stepLabel}>{s}</span>
              {i < STEPS.length - 1 && <div className={`${styles.stepLine} ${i < step ? styles.stepLineDone : ''}`} />}
            </div>
          ))}
        </div>

        {/* BODY */}
        <div className={styles.modalBody}>
          {/* STEP 0: Personal Info */}
          {step === 0 && (
            <div className={styles.section}>
              <div className={styles.sectionHeader}><FiUser /> Personal Information</div>
              <div className={styles.formGrid}>
                <div className={styles.field}>
                  <label>First Name *</label>
                  <input value={form.first_name} onChange={e => upd('first_name', e.target.value)} placeholder="First Name" className={errors.first_name ? styles.inputError : ''} />
                  {errors.first_name && <span className={styles.errMsg}>{errors.first_name}</span>}
                </div>
                <div className={styles.field}>
                  <label>Middle Name</label>
                  <input value={form.middle_name} onChange={e => upd('middle_name', e.target.value)} placeholder="Middle Name" />
                </div>
                <div className={styles.field}>
                  <label>Last Name *</label>
                  <input value={form.last_name} onChange={e => upd('last_name', e.target.value)} placeholder="Last Name" className={errors.last_name ? styles.inputError : ''} />
                  {errors.last_name && <span className={styles.errMsg}>{errors.last_name}</span>}
                </div>
                <div className={styles.field}>
                  <label>Suffix</label>
                  <select value={form.suffix} onChange={e => upd('suffix', e.target.value)}>
                    <option value="">None</option>
                    <option>Jr.</option><option>Sr.</option><option>III</option><option>IV</option>
                  </select>
                </div>
                <div className={styles.field}>
                  <label>Gender *</label>
                  <select value={form.gender} onChange={e => upd('gender', e.target.value)} className={errors.gender ? styles.inputError : ''}>
                    <option value="">Select Gender</option>
                    <option>Male</option><option>Female</option><option>Other</option>
                  </select>
                  {errors.gender && <span className={styles.errMsg}>{errors.gender}</span>}
                </div>
                <div className={styles.field}>
                  <label>Birthdate</label>
                  <input type="date" value={form.birthdate} onChange={e => upd('birthdate', e.target.value)} />
                </div>
                <div className={`${styles.field} ${styles.fieldFull}`}>
                  <label>Address</label>
                  <input value={form.address} onChange={e => upd('address', e.target.value)} placeholder="Complete Address" />
                </div>
                <div className={styles.field}>
                  <label>LRN</label>
                  <input value={form.lrn} onChange={e => upd('lrn', e.target.value)} placeholder="Learner Reference Number" />
                </div>
                <div className={styles.field}>
                  <label>Contact Number</label>
                  <input value={form.contact_number} onChange={e => upd('contact_number', e.target.value)} placeholder="09XXXXXXXXX" />
                </div>
                <div className={`${styles.field} ${styles.fieldFull}`}>
                  <label>Student/Parent Gmail Account *</label>
                  <input type="email" value={form.student_email} onChange={e => upd('student_email', e.target.value)} placeholder="student@gmail.com" className={errors.student_email ? styles.inputError : ''} />
                  <span className={styles.fieldHint}>This email will receive the Student ID and portal activation link.</span>
                  {errors.student_email && <span className={styles.errMsg}>{errors.student_email}</span>}
                </div>
              </div>

              <div className={styles.sectionHeader} style={{marginTop: 20}}><FiUser /> Guardian Information</div>
              <div className={styles.formGrid}>
                <div className={styles.field}>
                  <label>Guardian Name *</label>
                  <input value={form.guardian_name} onChange={e => upd('guardian_name', e.target.value)} placeholder="Guardian Full Name" className={errors.guardian_name ? styles.inputError : ''} />
                  {errors.guardian_name && <span className={styles.errMsg}>{errors.guardian_name}</span>}
                </div>
                <div className={styles.field}>
                  <label>Guardian Contact</label>
                  <input value={form.guardian_contact} onChange={e => upd('guardian_contact', e.target.value)} placeholder="09XXXXXXXXX" />
                </div>
                <div className={styles.field}>
                  <label>Guardian Email</label>
                  <input type="email" value={form.guardian_email} onChange={e => upd('guardian_email', e.target.value)} placeholder="guardian@gmail.com" />
                </div>
                <div className={styles.field}>
                  <label>Enrollee Type</label>
                  <div className={styles.radioGroup}>
                    {['new', 'old'].map(t => (
                      <label key={t} className={`${styles.radioCard} ${form.student_type === t ? styles.radioCardActive : ''}`}>
                        <input type="radio" name="student_type" value={t} checked={form.student_type === t} onChange={() => upd('student_type', t)} />
                        {t === 'new' ? '🎓 New Enrollee / Freshman' : '🔄 Old Enrollee / Returning'}
                      </label>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* STEP 1: Academic */}
          {step === 1 && (
            <div className={styles.section}>
              <div className={styles.sectionHeader}><FiBook /> Academic Details</div>
              <div className={styles.formGrid}>
                <div className={styles.field}>
                  <label>Grade Level</label>
                  <select value={form.grade_level} onChange={e => upd('grade_level', e.target.value)}>
                    <option>Grade 11</option>
                    <option>Grade 12</option>
                  </select>
                </div>
                <div className={styles.field}>
                  <label>School Year</label>
                  <input value={form.school_year} onChange={e => upd('school_year', e.target.value)} />
                </div>
                <div className={styles.field}>
                  <label>Track *</label>
                  <select value={form.track_id} onChange={e => { upd('track_id', e.target.value); upd('strand_id', ''); }} className={errors.track_id ? styles.inputError : ''}>
                    <option value="">Select Track</option>
                    {MOCK_TRACKS.map(t => <option key={t.id} value={t.id}>{t.name} ({t.code})</option>)}
                  </select>
                  {errors.track_id && <span className={styles.errMsg}>{errors.track_id}</span>}
                </div>
                <div className={styles.field}>
                  <label>Strand *</label>
                  <select value={form.strand_id} onChange={e => upd('strand_id', e.target.value)} disabled={!form.track_id} className={errors.strand_id ? styles.inputError : ''}>
                    <option value="">Select Strand</option>
                    {selectedTrack?.strands.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                  </select>
                  {errors.strand_id && <span className={styles.errMsg}>{errors.strand_id}</span>}
                </div>

                {form.student_type === 'old' ? (
                  <div className={`${styles.field} ${styles.fieldFull}`}>
                    <label>Select Semester(s) to Enroll</label>
                    <div className={styles.checkboxGroup}>
                      {SEMESTERS_BY_LEVEL[form.grade_level].map(sem => (
                        <label key={sem} className={styles.checkCard}>
                          <input
                            type="checkbox"
                            checked={form.selected_semesters.includes(sem)}
                            onChange={() => {
                              const arr = form.selected_semesters.includes(sem)
                                ? form.selected_semesters.filter(s => s !== sem)
                                : [...form.selected_semesters, sem];
                              upd('selected_semesters', arr);
                            }}
                          />
                          {sem} Semester — {form.grade_level}
                        </label>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className={styles.field}>
                    <label>Semester</label>
                    <select value={form.semester} onChange={e => upd('semester', e.target.value)}>
                      {SEMESTERS_BY_LEVEL[form.grade_level].map(s => <option key={s} value={s}>{s} Semester</option>)}
                    </select>
                  </div>
                )}
              </div>

              {/* SUBJECTS PREVIEW */}
              {form.strand_id && (
                <div className={styles.subjectsPreview}>
                  <h4>Subjects to be Enrolled ({trackSubjects.length})</h4>
                  <div className={styles.subjectsList}>
                    {trackSubjects.map(s => (
                      <div key={s.id} className={styles.subjectItem}>
                        <span className={`${styles.subjectTag} ${s.is_core ? styles.coreTag : styles.electiveTag}`}>{s.is_core ? 'Core' : 'Applied'}</span>
                        <span className={styles.subjectName}>{s.subject_name}</span>
                        <span className={styles.subjectCode}>{s.subject_code}</span>
                        <span className={styles.subjectUnits}>{s.units} units</span>
                      </div>
                    ))}
                  </div>
                  <div className={styles.totalUnits}>Total Units: <strong>{trackSubjects.reduce((s, x) => s + Number(x.units), 0)}</strong></div>
                </div>
              )}
            </div>
          )}

          {/* STEP 2: Payment */}
          {step === 2 && (
            <div className={styles.section}>
              <div className={styles.sectionHeader}><FiDollarSign /> Payment (Optional)</div>
              <div className={styles.paymentToggle}>
                <label className={`${styles.radioCard} ${form.add_payment ? styles.radioCardActive : ''}`}>
                  <input type="radio" name="pay" checked={form.add_payment} onChange={() => upd('add_payment', true)} />
                  Add Payment Now
                </label>
                <label className={`${styles.radioCard} ${!form.add_payment ? styles.radioCardActive : ''}`}>
                  <input type="radio" name="pay" checked={!form.add_payment} onChange={() => upd('add_payment', false)} />
                  Skip for Now
                </label>
              </div>

              {form.add_payment && (
                <div className={styles.formGrid} style={{marginTop: 16}}>
                  <div className={styles.field}>
                    <label>Payment Category</label>
                    <select value={form.payment_category_id} onChange={e => upd('payment_category_id', e.target.value)}>
                      <option value="">Select Category</option>
                      {MOCK_PAYMENT_CATEGORIES.map(c => <option key={c.id} value={c.id}>{c.name} {c.default_amount ? `(₱${c.default_amount})` : ''}</option>)}
                    </select>
                  </div>
                  <div className={styles.field}>
                    <label>Amount (₱)</label>
                    <input type="number" value={form.payment_amount} onChange={e => upd('payment_amount', e.target.value)} placeholder="0.00" />
                  </div>
                  <div className={`${styles.field} ${styles.fieldFull}`}>
                    <label>Payment Method</label>
                    <div className={styles.methodGrid}>
                      {[
                        { val: 'gcash', label: '📱 GCash' },
                        { val: 'card', label: '💳 Card' },
                        { val: 'over_the_counter', label: '🏦 Over the Counter' },
                      ].map(m => (
                        <label key={m.val} className={`${styles.methodCard} ${form.payment_method === m.val ? styles.methodActive : ''}`}>
                          <input type="radio" name="method" value={m.val} checked={form.payment_method === m.val} onChange={() => upd('payment_method', m.val)} />
                          {m.label}
                        </label>
                      ))}
                    </div>
                  </div>
                  {(form.payment_method === 'gcash' || form.payment_method === 'card') && (
                    <div className={styles.field}>
                      <label>Reference Number</label>
                      <input value={form.reference_number} onChange={e => upd('reference_number', e.target.value)} placeholder="Transaction Reference" />
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* STEP 3: Confirm */}
          {step === 3 && (
            <div className={styles.section}>
              <div className={styles.confirmCard}>
                <div className={styles.confirmIcon}><FiCheckCircle /></div>
                <h3>Review Enrollment Details</h3>
                <p>Please verify all information before submitting.</p>
              </div>
              <div className={styles.summaryList}>
                <div className={styles.summaryRow}><span>Full Name</span><strong>{form.first_name} {form.middle_name} {form.last_name}</strong></div>
                <div className={styles.summaryRow}><span>Email</span><strong>{form.student_email}</strong></div>
                <div className={styles.summaryRow}><span>LRN</span><strong>{form.lrn || '—'}</strong></div>
                <div className={styles.summaryRow}><span>Enrollee Type</span><strong>{form.student_type === 'new' ? 'New Enrollee' : 'Returning Student'}</strong></div>
                <div className={styles.summaryRow}><span>Grade Level</span><strong>{form.grade_level}</strong></div>
                <div className={styles.summaryRow}><span>Track</span><strong>{selectedTrack?.name}</strong></div>
                <div className={styles.summaryRow}><span>Semester</span><strong>{form.semester} — {form.school_year}</strong></div>
                {form.add_payment && (
                  <>
                    <div className={styles.summaryRow}><span>Payment Category</span><strong>{MOCK_PAYMENT_CATEGORIES.find(c=>c.id===form.payment_category_id)?.name || '—'}</strong></div>
                    <div className={styles.summaryRow}><span>Amount</span><strong>₱{Number(form.payment_amount).toLocaleString()}</strong></div>
                    <div className={styles.summaryRow}><span>Method</span><strong>{form.payment_method}</strong></div>
                  </>
                )}
              </div>
              {form.student_type === 'new' && (
                <div className={styles.noticeBox}>
                  <strong>📧 Email Notification:</strong> Upon submission, an email will be sent to <em>{form.student_email}</em> with the Student ID and a unique activation link to create a portal password.
                </div>
              )}
              {form.student_type === 'old' && (
                <div className={styles.noticeBox}>
                  <strong>📧 Email Confirmation:</strong> A confirmation email will be sent to notify the student of their enrollment for the selected semester.
                </div>
              )}
            </div>
          )}
        </div>

        {/* FOOTER */}
        <div className={styles.modalFooter}>
          <button className={styles.cancelBtn} onClick={step === 0 ? onClose : prevStep}>
            {step === 0 ? 'Cancel' : '← Back'}
          </button>
          {step < STEPS.length - 1 ? (
            <button className={styles.nextBtn} onClick={nextStep}>Next →</button>
          ) : (
            <button className={styles.submitBtn} onClick={handleSubmit} disabled={isLoading}>
              {isLoading ? <span className={styles.spinner} /> : <FiCheckCircle />}
              {isLoading ? 'Processing...' : 'Confirm Enrollment'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}