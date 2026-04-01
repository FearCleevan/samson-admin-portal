// src/lib/supabase.js
// ─────────────────────────────────────────────────────────────
// Supabase client — School Admin Dashboard
// Replace the env vars in your .env file:
//   VITE_SUPABASE_URL=https://xxxx.supabase.co
//   VITE_SUPABASE_ANON_KEY=your-anon-public-key
// ─────────────────────────────────────────────────────────────
import { createClient } from '@supabase/supabase-js';

const supabaseUrl  = import.meta.env.VITE_SUPABASE_URL  || '';
const supabaseKey  = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

if (!supabaseUrl || !supabaseKey) {
  console.warn('[Supabase] Missing env vars — running in mock-data mode.');
}

export const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    autoRefreshToken: true,
    persistSession:   true,
    detectSessionInUrl: false,
  },
});

// ─────────────────────────────────────────────────────────────
// AUTH HELPERS
// ─────────────────────────────────────────────────────────────

/** Sign in an admin via email/password (Supabase Auth) */
export async function signInAdmin(email, password) {
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) throw error;
  return data;
}

export async function signOutAdmin() {
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
}

export async function getAdminProfile(authUid) {
  const { data, error } = await supabase
    .from('admin_users')
    .select('*')
    .eq('id', authUid)        // When connecting, store Supabase auth UID in admin_users.id
    .single();
  if (error) throw error;
  return data;
}

// ─────────────────────────────────────────────────────────────
// STUDENTS
// ─────────────────────────────────────────────────────────────

export async function fetchStudents() {
  const { data, error } = await supabase
    .from('students')
    .select('*')
    .order('created_at', { ascending: false });
  if (error) throw error;
  return data;
}

export async function createStudent(studentData) {
  const { data, error } = await supabase
    .from('students')
    .insert([studentData])
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function updateStudent(id, updates) {
  const { data, error } = await supabase
    .from('students')
    .update(updates)
    .eq('id', id)
    .select()
    .single();
  if (error) throw error;
  return data;
}

/** Generate and store activation token for portal */
export async function generateActivationToken(studentId, studentDbId) {
  const token = `activate-${studentId}-${Math.random().toString(36).slice(2, 10)}`;
  const expires = new Date(Date.now() + 72 * 60 * 60 * 1000); // 72 hours

  const { error } = await supabase
    .from('students')
    .update({
      activation_token: token,
      activation_token_expires: expires.toISOString(),
    })
    .eq('id', studentDbId);

  if (error) throw error;
  return token;
}

// ─────────────────────────────────────────────────────────────
// ENROLLMENTS
// ─────────────────────────────────────────────────────────────

export async function fetchEnrollments(filters = {}) {
  let query = supabase
    .from('enrollments')
    .select(`
      *,
      student:students(*),
      strand:strands(*, track:tracks(*))
    `)
    .order('enrollment_date', { ascending: false });

  if (filters.school_year) query = query.eq('school_year', filters.school_year);
  if (filters.semester)    query = query.eq('semester', filters.semester);
  if (filters.status)      query = query.eq('enrollment_status', filters.status);

  const { data, error } = await query;
  if (error) throw error;
  return data;
}

export async function createEnrollment(enrollmentData) {
  const { data, error } = await supabase
    .from('enrollments')
    .insert([enrollmentData])
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function addEnrollmentSubjects(enrollmentId, subjectIds) {
  const rows = subjectIds.map(subject_id => ({ enrollment_id: enrollmentId, subject_id }));
  const { data, error } = await supabase
    .from('enrollment_subjects')
    .insert(rows)
    .select();
  if (error) throw error;
  return data;
}

// ─────────────────────────────────────────────────────────────
// PAYMENTS
// ─────────────────────────────────────────────────────────────

export async function fetchPayments(filters = {}) {
  let query = supabase
    .from('payments')
    .select(`
      *,
      student:students(student_id, first_name, last_name, student_email),
      category:payment_categories(name, code),
      received_by_user:admin_users(full_name)
    `)
    .order('payment_date', { ascending: false });

  if (filters.student_id)    query = query.eq('student_id', filters.student_id);
  if (filters.payment_method) query = query.eq('payment_method', filters.payment_method);

  const { data, error } = await query;
  if (error) throw error;
  return data;
}

export async function createPayment(paymentData) {
  const { data, error } = await supabase
    .from('payments')
    .insert([paymentData])
    .select(`
      *,
      student:students(student_id, first_name, last_name, student_email),
      category:payment_categories(name)
    `)
    .single();
  if (error) throw error;
  return data;
}

// ─────────────────────────────────────────────────────────────
// TRACKS & SUBJECTS
// ─────────────────────────────────────────────────────────────

export async function fetchTracks() {
  const { data, error } = await supabase
    .from('tracks')
    .select('*, strands(*)')
    .eq('is_active', true)
    .order('code');
  if (error) throw error;
  return data;
}

export async function fetchSubjects(filters = {}) {
  let query = supabase
    .from('subjects')
    .select('*, strand:strands(code, name, track:tracks(code, name))')
    .eq('is_active', true);

  if (filters.grade_level) query = query.eq('grade_level', filters.grade_level);
  if (filters.semester)    query = query.eq('semester', filters.semester);
  if (filters.strand_id)   query = query.eq('strand_id', filters.strand_id);

  const { data, error } = await query;
  if (error) throw error;
  return data;
}

// ─────────────────────────────────────────────────────────────
// ACTIVITY LOGS
// ─────────────────────────────────────────────────────────────

export async function logActivity({ userId, userType, action, module, description, targetId, targetType, metadata }) {
  const { error } = await supabase
    .from('activity_logs')
    .insert([{ user_id: userId, user_type: userType, action, module, description, target_id: targetId, target_type: targetType, metadata }]);
  if (error) console.error('[ActivityLog]', error);
}

export async function fetchActivityLogs(limit = 100) {
  const { data, error } = await supabase
    .from('activity_logs')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(limit);
  if (error) throw error;
  return data;
}

// ─────────────────────────────────────────────────────────────
// ADMIN USERS
// ─────────────────────────────────────────────────────────────

export async function fetchAdminUsers() {
  const { data, error } = await supabase
    .from('admin_users')
    .select('id, username, email, full_name, role, is_active, created_at, last_login')
    .order('created_at', { ascending: false });
  if (error) throw error;
  return data;
}

export async function fetchAccessRequests() {
  const { data, error } = await supabase
    .from('admin_access_requests')
    .select('*')
    .order('created_at', { ascending: false });
  if (error) throw error;
  return data;
}

export async function approveAccessRequest(requestId, adminId) {
  const { error } = await supabase
    .from('admin_access_requests')
    .update({ status: 'approved', reviewed_by: adminId, reviewed_at: new Date().toISOString() })
    .eq('id', requestId);
  if (error) throw error;
}

// ─────────────────────────────────────────────────────────────
// PAYMENT CATEGORIES
// ─────────────────────────────────────────────────────────────

export async function fetchPaymentCategories() {
  const { data, error } = await supabase
    .from('payment_categories')
    .select('*')
    .eq('is_active', true)
    .order('name');
  if (error) throw error;
  return data;
}

// ─────────────────────────────────────────────────────────────
// SCHOOL SETTINGS
// ─────────────────────────────────────────────────────────────

export async function fetchSchoolSettings() {
  const { data, error } = await supabase
    .from('school_settings')
    .select('*');
  if (error) throw error;
  // Convert to key-value object
  return Object.fromEntries((data || []).map(s => [s.setting_key, s.setting_value]));
}

export async function updateSchoolSetting(key, value, adminId) {
  const { error } = await supabase
    .from('school_settings')
    .upsert({ setting_key: key, setting_value: value, updated_by: adminId, updated_at: new Date().toISOString() });
  if (error) throw error;
}