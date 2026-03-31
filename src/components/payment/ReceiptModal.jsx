import { useRef } from 'react';
import { FiX, FiPrinter, FiDownload } from 'react-icons/fi';
import { format } from 'date-fns';
import { SCHOOL_INFO } from '../../data/mockData';
import styles from './ReceiptModal.module.css';

export default function ReceiptModal({ payment, onClose }) {
  const receiptRef = useRef(null);

  const handlePrint = () => {
    const content = receiptRef.current.innerHTML;
    const win = window.open('', '_blank');
    win.document.write(`
      <html><head><title>OR - ${payment.or_number}</title>
      <style>
        body { font-family: 'Courier New', monospace; padding: 20px; max-width: 380px; margin: 0 auto; font-size: 12px; }
        .receipt-header { text-align: center; margin-bottom: 16px; }
        .school-name { font-size: 16px; font-weight: bold; text-transform: uppercase; }
        .divider { border: none; border-top: 1px dashed #333; margin: 10px 0; }
        .or-number { font-size: 14px; font-weight: bold; text-align: center; letter-spacing: 2px; }
        .row { display: flex; justify-content: space-between; margin: 4px 0; }
        .label { color: #666; }
        .value { font-weight: bold; }
        .amount-big { font-size: 22px; font-weight: bold; text-align: center; margin: 12px 0; }
        .footer-note { text-align: center; font-size: 10px; color: #666; margin-top: 14px; }
        @media print { body { margin: 0; } }
      </style></head><body>
      <div class="receipt-header">
        <div class="school-name">${SCHOOL_INFO.name}</div>
        <div>${SCHOOL_INFO.address}</div>
        <div>OFFICIAL RECEIPT</div>
      </div>
      <hr class="divider">
      <div class="or-number">${payment.or_number}</div>
      <hr class="divider">
      <div class="row"><span class="label">Date:</span><span class="value">${format(new Date(payment.payment_date), 'MMMM d, yyyy h:mm a')}</span></div>
      <div class="row"><span class="label">Student:</span><span class="value">${payment.student.first_name} ${payment.student.last_name}</span></div>
      <div class="row"><span class="label">Student ID:</span><span class="value">${payment.student.student_id}</span></div>
      <hr class="divider">
      <div class="row"><span class="label">Payment For:</span><span class="value">${payment.category_name}</span></div>
      <div class="row"><span class="label">Method:</span><span class="value">${payment.payment_method === 'over_the_counter' ? 'Over the Counter' : payment.payment_method.toUpperCase()}</span></div>
      ${payment.reference_number ? `<div class="row"><span class="label">Reference:</span><span class="value">${payment.reference_number}</span></div>` : ''}
      <hr class="divider">
      <div class="amount-big">₱${payment.amount.toLocaleString('en-PH', { minimumFractionDigits: 2 })}</div>
      <hr class="divider">
      <div class="footer-note">This is your Official Receipt. Please keep it for your records.<br>Thank you!</div>
      </body></html>
    `);
    win.document.close();
    win.focus();
    setTimeout(() => { win.print(); win.close(); }, 300);
  };

  return (
    <div className={styles.overlay}>
      <div className={styles.modal}>
        <div className={styles.header}>
          <h2>Official Receipt</h2>
          <div className={styles.headerActions}>
            <button className={styles.printBtn} onClick={handlePrint}><FiPrinter /> Print</button>
            <button className={styles.closeBtn} onClick={onClose}><FiX /></button>
          </div>
        </div>

        <div className={styles.body}>
          <div className={styles.receipt} ref={receiptRef}>
            {/* RECEIPT HEADER */}
            <div className={styles.receiptHeader}>
              <div className={styles.schoolSeal}>🎓</div>
              <h3 className={styles.schoolName}>{SCHOOL_INFO.name}</h3>
              <p className={styles.schoolAddress}>{SCHOOL_INFO.address}</p>
              <div className={styles.orTitle}>OFFICIAL RECEIPT</div>
            </div>

            <div className={styles.divider} />

            <div className={styles.orNumberRow}>
              <span className={styles.orLabel}>OR No.</span>
              <span className={styles.orNumber}>{payment.or_number}</span>
            </div>

            <div className={styles.divider} />

            {/* PAYMENT INFO */}
            <div className={styles.infoBlock}>
              <div className={styles.infoRow}>
                <span>Date & Time</span>
                <span>{format(new Date(payment.payment_date), 'MMMM d, yyyy h:mm a')}</span>
              </div>
              <div className={styles.infoRow}>
                <span>Student Name</span>
                <span><strong>{payment.student.first_name} {payment.student.last_name}</strong></span>
              </div>
              <div className={styles.infoRow}>
                <span>Student ID</span>
                <span><code>{payment.student.student_id}</code></span>
              </div>
            </div>

            <div className={styles.divider} />

            <div className={styles.infoBlock}>
              <div className={styles.infoRow}>
                <span>Payment For</span>
                <span><strong>{payment.category_name}</strong></span>
              </div>
              <div className={styles.infoRow}>
                <span>Payment Method</span>
                <span>
                  <span className={`${styles.methodChip} ${styles[`method_${payment.payment_method}`]}`}>
                    {payment.payment_method === 'over_the_counter' ? 'Over the Counter' : payment.payment_method === 'gcash' ? 'GCash' : 'Card'}
                  </span>
                </span>
              </div>
              {payment.reference_number && (
                <div className={styles.infoRow}>
                  <span>Reference #</span>
                  <span>{payment.reference_number}</span>
                </div>
              )}
              {payment.notes && (
                <div className={styles.infoRow}>
                  <span>Notes</span>
                  <span>{payment.notes}</span>
                </div>
              )}
            </div>

            <div className={styles.divider} />

            <div className={styles.amountBlock}>
              <span>AMOUNT PAID</span>
              <div className={styles.bigAmount}>₱{payment.amount.toLocaleString('en-PH', { minimumFractionDigits: 2 })}</div>
            </div>

            <div className={styles.divider} />

            <div className={styles.statusRow}>
              <div className={styles.statusPaid}>✓ PAID</div>
              <div className={styles.receivedBy}>Received by: {payment.received_by_name}</div>
            </div>

            <div className={styles.receiptFooter}>
              <p>This is your Official Receipt. Please keep it for your records.</p>
              <p>For concerns, contact: {SCHOOL_INFO.email} | {SCHOOL_INFO.phone}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}