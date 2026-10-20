const bcrypt = require('bcryptjs');
const User = require('../models/User');

const strongPassword = (p) =>
  typeof p === 'string' &&
  p.length >= 8 &&
  /[A-Z]/.test(p) &&
  /[a-z]/.test(p) &&
  /[0-9]/.test(p) &&
  /[!@#$%^&*(),.?":{}|<>]/.test(p);

// Creates an admin account, or promotes an existing account to admin.
// - new e-mail            -> account is created with the given password
// - existing student      -> promoted to ADMIN (their password is NOT changed)
// - existing admin        -> nothing changes
const ensureAdmin = async ({ email, password, name, studentId, phone }) => {
  const normalizedEmail = String(email || '').trim().toLowerCase();
  if (!/^[^\s@]+@gmail\.com$/i.test(normalizedEmail)) {
    throw new Error('Admin e-mail must be a Gmail address ending with @gmail.com');
  }

  const existing = await User.findOne({ email: normalizedEmail });
  if (existing) {
    if (existing.role === 'ADMIN') return { action: 'exists', user: existing };
    existing.role = 'ADMIN';
    await existing.save();
    return { action: 'promoted', user: existing };
  }

  if (!strongPassword(password)) {
    throw new Error(
      'Admin password must be 8+ characters with an uppercase letter, a lowercase letter, a number and a special character'
    );
  }

  const passwordHash = await bcrypt.hash(password, await bcrypt.genSalt(10));
  const user = await User.create({
    name: (name || 'Campus Admin').trim(),
    email: normalizedEmail,
    studentId: (studentId || 'ADMIN-001').trim(),
    phone: (phone || '+91 0000000000').trim(),
    passwordHash,
    role: 'ADMIN',
    isEmailVerified: true
  });
  return { action: 'created', user };
};

// Runs when the server starts: if ADMIN_EMAIL is set, makes sure that admin exists.
const ensureAdminFromEnv = async () => {
  const email = process.env.ADMIN_EMAIL;
  if (!email || !email.trim()) return null;
  try {
    const result = await ensureAdmin({
      email,
      password: process.env.ADMIN_PASSWORD,
      name: process.env.ADMIN_NAME,
      studentId: process.env.ADMIN_STUDENT_ID,
      phone: process.env.ADMIN_PHONE
    });
    if (result.action === 'created') {
      console.log(`[Admin] Admin account created for ${result.user.email}. Remove ADMIN_PASSWORD from the environment now.`);
    } else if (result.action === 'promoted') {
      console.log(`[Admin] ${result.user.email} was promoted to ADMIN.`);
    } else {
      console.log(`[Admin] Admin ${result.user.email} already exists.`);
    }
    return result;
  } catch (err) {
    console.error(`[Admin] Could not set up admin from environment: ${err.message}`);
    return null;
  }
};

module.exports = { ensureAdmin, ensureAdminFromEnv, strongPassword };