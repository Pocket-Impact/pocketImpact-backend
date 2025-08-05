import app from './app.js';
import connectDB from './config/db.js';
const PORT = process.env.PORT || 3000;
// Connect to the database
connectDB().then(() => {
  // Start the server
  app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
  });
}).catch((error) => {
  console.error('Failed to connect to the database:', error);
  process.exit(1);
});
