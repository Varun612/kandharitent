/**
 * Secure Administrator Credential Initialization & Recovery CLI Tool
 * Kandhari Tent & Caterers & Dwarka Shri Lawn, Lucknow
 *
 * Usage:
 *   node server/scripts/resetAdmin.js --password YourSecurePassword
 *   node server/scripts/resetAdmin.js --username admin --email varunkandhari612@gmail.com --password YourSecurePassword
 */

const fs = require('fs');
const path = require('path');
const bcrypt = require('bcryptjs');

const args = process.argv.slice(2);
const getArg = (flag, def) => {
  const idx = args.indexOf(flag);
  return idx !== -1 && args[idx + 1] ? args[idx + 1] : def;
};

const username = getArg('--username', 'admin');
const email = getArg('--email', 'varunkandhari612@gmail.com');
const password = getArg('--password', 'Kandhari@Admin2026');

if (password.length < 6) {
  console.error('❌ Error: Password must be at least 6 characters long.');
  process.exit(1);
}

const updateDbFile = async (filePath) => {
  if (!fs.existsSync(filePath)) return;
  const db = JSON.parse(fs.readFileSync(filePath, 'utf8'));
  if (!db.adminUsers) db.adminUsers = [];

  const salt = await bcrypt.genSalt(10);
  const passwordHash = await bcrypt.hash(password, salt);

  let admin = db.adminUsers.find(u => u.username.toLowerCase() === username.toLowerCase() || (u.email && u.email.toLowerCase() === email.toLowerCase()));
  if (admin) {
    admin.username = username;
    admin.email = email;
    admin.passwordHash = passwordHash;
    admin.role = 'admin';
    admin.updatedAt = new Date().toISOString();
  } else {
    admin = {
      id: 'admin-1',
      username,
      email,
      name: 'Varun Kandhari',
      passwordHash,
      role: 'admin',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    db.adminUsers.push(admin);
  }

  fs.writeFileSync(filePath, JSON.stringify(db, null, 2), 'utf8');
  console.log('✅ Successfully updated admin credentials in ' + filePath);
};

(async () => {
  console.log('=== KANDHARI TENT & DWARKA SHRI LAWN: SECURE ADMIN RECOVERY ===');
  console.log('• Username: ' + username);
  console.log('• Verified Email: ' + email);
  console.log('• Role: admin (Protected)');
  console.log('• Password Hashing: bcrypt (10 rounds)');

  await updateDbFile('server/data/localStore.json');
  await updateDbFile('client/server/data/localStore.json');

  console.log('\n🎉 Admin access securely initialized! You can now log in at /admin/login using:');
  console.log('   Username: ' + username + ' OR Email: ' + email);
  console.log('================================================================');
})();
