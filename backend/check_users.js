import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Student from './models/Student.js';
import Admin from './models/Admin.js';

import dns from 'node:dns';

dotenv.config();
dns.setServers(['8.8.8.8', '8.8.4.4']);

const run = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB');

    const students = await Student.find({}, 'name email role');
    const admins = await Admin.find({}, 'name email role');

    console.log('--- Students in DB ---');
    console.log(students);

    console.log('--- Admins in DB ---');
    console.log(admins);

    await mongoose.connection.close();
  } catch (err) {
    console.error(err);
  }
};

run();
