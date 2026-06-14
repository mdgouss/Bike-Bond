const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    const rawUri = process.env.MONGODB_URI?.trim();
    const mongoUri = rawUri?.replace(/^['"]|['"]$/g, '');

    if (!mongoUri || !/^mongodb(\+srv)?:\/\//i.test(mongoUri)) {
      console.error(
        'Invalid MONGODB_URI in server/.env. It must start with mongodb:// or mongodb+srv://',
      );
      process.exit(1);
    }

    const conn = await mongoose.connect(mongoUri);
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`Error: ${error.message}`);
    process.exit(1);
  }
};

module.exports = connectDB;
