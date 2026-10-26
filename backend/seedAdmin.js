
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';
import User from './models/userModel.js';

dotenv.config();

const seedAdmin = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);

    console.log('MongoDB connected');

    const phone = '0984735563';
    const plainPassword = 'zxcvbnm';

    const existing = await User.findOne({ phone });

    if (existing) {
      console.log('Admin already exists.');
    } else {
      const hashedPassword = await bcrypt.hash(plainPassword, 10);

      await User.create({
        fullName: 'Super Admin',
        phone,
        password: hashedPassword,
        role: 'admin',
      });

      console.log('Admin created successfully!');
    }

  } catch (error) {
    console.error('Error creating admin:', error.message);
  } finally {
    await mongoose.disconnect();
  }
};

seedAdmin();
