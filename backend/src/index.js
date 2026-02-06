import dotenv from "dotenv";
import connectDB from "./config/database.js";
import app from "./app.js";

dotenv.config({ path: './.env' });

const startServer = async () => {
  try {
    // Connect to MongoDB
    await connectDB();

    // Use PORT from environment or default
    const PORT = process.env.PORT || 5000;

    // Start Express server
    app.listen(PORT, () => {
      console.log(`Server is running on port: ${PORT}`);
    });

  } catch (error) {
    console.error("Server startup failed:", error);
    process.exit(1); // Exit process if DB connection fails
  }
};

startServer();
