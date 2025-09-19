import mongoose from 'mongoose';
const dbURI =
  process.env.DATABASE_URL || "mongodb://localhost:27017/pocket-impact";

const connectDB = async () => {
    try {   
        await mongoose.connect(dbURI, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });
        console.log('Database connected successfully');
    }   catch (error) {
        console.error('Database connection failed:', error);
        throw error;
    }
};

export default connectDB;
