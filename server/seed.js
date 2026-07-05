require('dotenv').config();
const bcrypt = require('bcrypt');
const mongoose = require('mongoose');
const connectDB = require('./config/db');
const User = require('./models/User');

const ADMIN_EMAIL = process.env.SEED_ADMIN_EMAIL || 'admin@eams.local';
const ADMIN_PASSWORD = process.env.SEED_ADMIN_PASSWORD || 'Admin123!';

async function seed() {
  await connectDB();

  const existing = await User.findOne({ email: ADMIN_EMAIL });
  if (existing) {
    console.log(`Admin already exists: ${ADMIN_EMAIL}`);
  } else {
    const passwordHash = await bcrypt.hash(ADMIN_PASSWORD, 10);
    await User.create({
      name: 'System Admin',
      email: ADMIN_EMAIL,
      passwordHash,
      role: 'admin',
    });
    console.log(`Bootstrap admin created: ${ADMIN_EMAIL} / ${ADMIN_PASSWORD}`);
  }

  await mongoose.disconnect();
}

seed().catch((err) => {
  console.error(err);
  process.exit(1);
});
