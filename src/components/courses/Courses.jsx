import { useState } from 'react';
import { FiPlus, FiEdit2, FiTrash2, FiBook, FiLayers, FiChevronDown, FiChevronRight } from 'react-icons/fi';
import { toast } from 'react-toastify';
import { MOCK_TRACKS, MOCK_SUBJECTS, MOCK_TEACHERS } from '../../data/mockData';
import styles from './Courses.module.css';

export default function Courses() {
  const [tracks, setTracks] = useState(MOCK_TRACKS);
  const [subjects, setSubjects] = useState(MOCK_SUBJECTS);
  const [expandedTrack, setExpandedTrack] = useState('track-001');
  const [activeTab, setActiveTab] = useState('tracks'); // tracks | subjects
  const [showTrackModal, setShowTrackModal] = useState(false);
  const [showSubjectModal, setShowSubjectModal] = useState(false);
  const [editingTrack, setEditingTrack] = useState(null);
  const [editingSubject, setEditingSubject] = useState(null);
  const [subjectFilter, setSubjectFilter] = useState({ grade: 'all', semester: 'all', strand: 'all' });

  const [trackForm, setTrackForm] = useState({ code: '', name: '', description: '' });
  const [subjectForm, setSubjectForm] = useState({ subject_code: '', subject_name: '', units: 3, semester: '1st', grade_level: 'Grade 11', strand_id: '', is_core: false, teacher_id: '' });

  const filteredSubjects = subjects.filter(s => {
    const gMatch = subjectFilter.grade === 'all' || s.grade_level === subjectFilter.grade;
    const semMatch = subjectFilter.semester === 'all' || s.semester === subjectFilter.semester;
    const strMatch = subjectFilter.strand === 'all' || s.strand_id === subjectFilter.strand || (subjectFilter.strand === 'core' && s.is_core);
    return gMatch && semMatch && strMatch;
  });

  const handleSaveTrack = () => {
    if (!trackForm.code || !trackForm.name) { toast.error('Code and Name required'); return; }
    if (editingTrack) {
      setTracks(tracks.map(t => t.id === editingTrack.id ? { ...t, ...trackForm } : t));
      toast.success('Track updated!');
    } else {
      setTracks([...tracks, { id: `track-${Date.now()}`, ...trackForm, is_active: true, strands: [] }]);
      toast.success('Track created!');
    }
    setShowTrackModal(false); setEditingTrack(null); setTrackForm({ code: '', name: '', description: '' });
  };

  const handleSaveSubject = () => {
    if (!subjectForm.subject_code || !subjectForm.subject_name) { toast.error('Code and Name required'); return; }
    if (editingSubject) {
      setSubjects(subjects.map(s => s.id === editingSubject.id ? { ...s, ...subjectForm } : s));
      toast.success('Subject updated!');
    } else {
      setSubjects([...subjects, { id: `sub-${Date.now()}`, ...subjectForm, is_active: true }]);
      toast.success('Subject added!');
    }
    setShowSubjectModal(false); setEditingSubject(null);
    setSubjectForm({ subject_code: '', subject_name: '', units: 3, semester: '1st', grade_level: 'Grade 11', strand_id: '', is_core: false, teacher_id: '' });
  };

  const openEditTrack = (t) => { setTrackForm({ code: t.code, name: t.name, description: t.description || '' }); setEditingTrack(t); setShowTrackModal(true); };
  const openEditSubject = (s) => { setSubjectForm({ ...s }); setEditingSubject(s); setShowSubjectModal(true); };

  return (
    <div className={styles.page}>
      <div className={styles.pageHeader}>
        <div>
          <h1 className={styles.pageTitle}>Tracks & Subjects</h1>
          <p className={styles.pageSub}>Manage academic tracks, strands, and subject offerings</p>
        </div>
        <div className={styles.headerActions}>
          <button className={styles.secondaryBtn} onClick={() => { setShowSubjectModal(true); setEditingSubject(null); }}><FiBook /> Add Subject</button>
          <button className={styles.primaryBtn} onClick={() => { setShowTrackModal(true); setEditingTrack(null); }}><FiPlus /> Add Track</button>
        </div>
      </div>

      {/* TABS */}
      <div className={styles.tabs}>
        {[{ val: 'tracks', label: 'Tracks & Strands' }, { val: 'subjects', label: 'Subjects' }].map(t => (
          <button key={t.val} className={`${styles.tab} ${activeTab === t.val ? styles.tabActive : ''}`} onClick={() => setActiveTab(t.val)}>{t.label}</button>
        ))}
      </div>

      {/* TRACKS TAB */}
      {activeTab === 'tracks' && (
        <div className={styles.trackList}>
          {tracks.map(track => (
            <div key={track.id} className={styles.trackCard}>
              <div className={styles.trackHeader} onClick={() => setExpandedTrack(expandedTrack === track.id ? null : track.id)}>
                <div className={styles.trackLeft}>
                  <div className={styles.trackIcon}><FiLayers /></div>
                  <div>
                    <div className={styles.trackCode}>{track.code}</div>
                    <div className={styles.trackName}>{track.name}</div>
                    {track.description && <div className={styles.trackDesc}>{track.description}</div>}
                  </div>
                </div>
                <div className={styles.trackRight}>
                  <span className={styles.strandCount}>{track.strands.length} strand{track.strands.length !== 1 ? 's' : ''}</span>
                  <span className={`${styles.activeBadge} ${track.is_active ? styles.active : styles.inactive}`}>{track.is_active ? 'Active' : 'Inactive'}</span>
                  <button className={styles.editBtn} onClick={(e) => { e.stopPropagation(); openEditTrack(track); }}><FiEdit2 /></button>
                  {expandedTrack === track.id ? <FiChevronDown /> : <FiChevronRight />}
                </div>
              </div>

              {expandedTrack === track.id && (
                <div className={styles.strandList}>
                  <div className={styles.strandHeader}>
                    <span>Strands</span>
                    <button className={styles.addStrandBtn} onClick={() => toast.info('Strand management coming soon')}><FiPlus /> Add Strand</button>
                  </div>
                  {track.strands.length === 0 ? (
                    <div className={styles.noStrands}>No strands added yet.</div>
                  ) : track.strands.map(strand => (
                    <div key={strand.id} className={styles.strandItem}>
                      <div className={styles.strandLeft}>
                        <span className={styles.strandCode}>{strand.code}</span>
                        <span className={styles.strandName}>{strand.name}</span>
                      </div>
                      <div className={styles.strandActions}>
                        <span className={`${styles.activeBadge} ${strand.is_active ? styles.active : styles.inactive}`}>{strand.is_active ? 'Active' : 'Inactive'}</span>
                        <button className={styles.editBtn}><FiEdit2 /></button>
                      </div>
                    </div>
                  ))}
                  <div className={styles.subjectCount}>
                    {subjects.filter(s => track.strands.some(st => st.id === s.strand_id)).length} subjects assigned
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* SUBJECTS TAB */}
      {activeTab === 'subjects' && (
        <div className={styles.subjectsSection}>
          <div className={styles.subjectFilters}>
            <select value={subjectFilter.grade} onChange={e => setSubjectFilter(f => ({...f, grade: e.target.value}))}>
              <option value="all">All Grade Levels</option>
              <option value="Grade 11">Grade 11</option>
              <option value="Grade 12">Grade 12</option>
            </select>
            <select value={subjectFilter.semester} onChange={e => setSubjectFilter(f => ({...f, semester: e.target.value}))}>
              <option value="all">All Semesters</option>
              <option value="1st">1st Semester</option>
              <option value="2nd">2nd Semester</option>
            </select>
            <select value={subjectFilter.strand} onChange={e => setSubjectFilter(f => ({...f, strand: e.target.value}))}>
              <option value="all">All Strands</option>
              <option value="core">Core Subjects</option>
              {tracks.flatMap(t => t.strands).map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
            </select>
          </div>

          <div className={styles.tableCard}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Code</th>
                  <th>Subject Name</th>
                  <th>Grade</th>
                  <th>Semester</th>
                  <th>Units</th>
                  <th>Type</th>
                  <th>Strand</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredSubjects.map(sub => (
                  <tr key={sub.id}>
                    <td><code className={styles.subCode}>{sub.subject_code}</code></td>
                    <td><strong>{sub.subject_name}</strong></td>
                    <td>{sub.grade_level}</td>
                    <td>{sub.semester} Sem</td>
                    <td className={styles.units}>{sub.units}</td>
                    <td>
                      <span className={`${styles.typeBadge} ${sub.is_core ? styles.coreType : styles.electiveType}`}>
                        {sub.is_core ? 'Core' : 'Applied'}
                      </span>
                    </td>
                    <td>{sub.strand_id ? tracks.flatMap(t => t.strands).find(s => s.id === sub.strand_id)?.code || '—' : 'All'}</td>
                    <td>
                      <div className={styles.actions}>
                        <button className={styles.actionBtn} onClick={() => openEditSubject(sub)}><FiEdit2 /></button>
                        <button className={styles.actionBtn} onClick={() => { setSubjects(subjects.filter(s => s.id !== sub.id)); toast.success('Subject removed'); }}><FiTrash2 /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TRACK MODAL */}
      {showTrackModal && (
        <div className={styles.overlay}>
          <div className={styles.formModal}>
            <div className={styles.fmHeader}>
              <h3>{editingTrack ? 'Edit Track' : 'Add New Track'}</h3>
              <button className={styles.closeBtn} onClick={() => setShowTrackModal(false)}>✕</button>
            </div>
            <div className={styles.fmBody}>
              <div className={styles.field}><label>Track Code *</label><input value={trackForm.code} onChange={e => setTrackForm(f => ({...f, code: e.target.value}))} placeholder="e.g. ABM" /></div>
              <div className={styles.field}><label>Track Name *</label><input value={trackForm.name} onChange={e => setTrackForm(f => ({...f, name: e.target.value}))} placeholder="e.g. Accountancy, Business and Management" /></div>
              <div className={styles.field}><label>Description</label><textarea value={trackForm.description} onChange={e => setTrackForm(f => ({...f, description: e.target.value}))} rows={3} placeholder="Brief description..." /></div>
            </div>
            <div className={styles.fmFooter}>
              <button className={styles.cancelBtn} onClick={() => setShowTrackModal(false)}>Cancel</button>
              <button className={styles.saveBtn} onClick={handleSaveTrack}>Save Track</button>
            </div>
          </div>
        </div>
      )}

      {/* SUBJECT MODAL */}
      {showSubjectModal && (
        <div className={styles.overlay}>
          <div className={styles.formModal}>
            <div className={styles.fmHeader}>
              <h3>{editingSubject ? 'Edit Subject' : 'Add New Subject'}</h3>
              <button className={styles.closeBtn} onClick={() => setShowSubjectModal(false)}>✕</button>
            </div>
            <div className={styles.fmBody}>
              <div className={styles.fmGrid}>
                <div className={styles.field}><label>Subject Code *</label><input value={subjectForm.subject_code} onChange={e => setSubjectForm(f => ({...f, subject_code: e.target.value}))} placeholder="e.g. CORE-GM" /></div>
                <div className={styles.field}><label>Units</label><input type="number" value={subjectForm.units} onChange={e => setSubjectForm(f => ({...f, units: Number(e.target.value)}))} min={1} max={6} /></div>
                <div className={`${styles.field} ${styles.fullField}`}><label>Subject Name *</label><input value={subjectForm.subject_name} onChange={e => setSubjectForm(f => ({...f, subject_name: e.target.value}))} placeholder="e.g. General Mathematics" /></div>
                <div className={styles.field}><label>Grade Level</label><select value={subjectForm.grade_level} onChange={e => setSubjectForm(f => ({...f, grade_level: e.target.value}))}><option>Grade 11</option><option>Grade 12</option></select></div>
                <div className={styles.field}><label>Semester</label><select value={subjectForm.semester} onChange={e => setSubjectForm(f => ({...f, semester: e.target.value}))}><option value="1st">1st Semester</option><option value="2nd">2nd Semester</option></select></div>
                <div className={styles.field}><label>Strand (leave blank for core)</label><select value={subjectForm.strand_id} onChange={e => setSubjectForm(f => ({...f, strand_id: e.target.value}))}><option value="">All Strands (Core)</option>{tracks.flatMap(t => t.strands).map(s => <option key={s.id} value={s.id}>{s.name}</option>)}</select></div>
                <div className={styles.field}><label>Subject Type</label><select value={subjectForm.is_core ? 'core' : 'applied'} onChange={e => setSubjectForm(f => ({...f, is_core: e.target.value === 'core'}))}><option value="core">Core</option><option value="applied">Applied/Specialized</option></select></div>
              </div>
            </div>
            <div className={styles.fmFooter}>
              <button className={styles.cancelBtn} onClick={() => setShowSubjectModal(false)}>Cancel</button>
              <button className={styles.saveBtn} onClick={handleSaveSubject}>Save Subject</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}