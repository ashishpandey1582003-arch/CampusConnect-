import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Student from './models/Student.js';
import Admin from './models/Admin.js';
import bcrypt from 'bcryptjs';

import dns from 'node:dns';

dotenv.config();
dns.setServers(['8.8.8.8', '8.8.4.4']);

const run = async () => {
  const args = process.argv.slice(2);
  if (args.length < 2) {
    console.log('Usage: node reset_user_password.js <email> <new_password>');
    process.exit(1);
  }

  const email = args[0].toLowerCase();
  const newPassword = args[1];

  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB');

    const targetRole = args[2] ? args[2].toLowerCase() : 'all';
    let updatedCount = 0;

    // 1. Try finding Student
    if (targetRole === 'all' || targetRole === 'student') {
      let student = await Student.findOne({ email });
      if (student) {
        student.password = newPassword;
        await student.save();
        console.log(`Successfully reset password for Student: ${email} to "${newPassword}"`);
        updatedCount++;
      }
    }

    // 2. Try finding Admin
    if (targetRole === 'all' || targetRole === 'admin') {
      let admin = await Admin.findOne({ email });
      if (admin) {
        admin.password = newPassword;
        await admin.save();
        console.log(`Successfully reset password for Admin: ${email} to "${newPassword}"`);
        updatedCount++;
      }
    }

    if (updatedCount === 0) {
      console.log(`No user found with email: ${email}`);
    }

    console.log(`No user found with email: ${email}`);
    await mongoose.connection.close();
  } catch (err) {
    console.error('Error resetting password:', err);
    process.exit(1);
  }
};

run();
