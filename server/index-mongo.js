const express = require("express")
const cors = require("cors")
const helmet = require("helmet")
const compression = require("compression")
const morgan = require("morgan")
const path = require("path")
require('dotenv').config()

// Database connection
const database = require('./config/database')
const mongoDataStorage = require('./lib/mongo-data-storage')

const applicationsRouter = require("./routes/applications")
const lendersRouter = require("./routes/lenders")
const uploadRouter = require("./routes/upload")
const archivesRouter = require("./routes/archives")

const app = express()
const PORT = process.env.PORT || 5000

// Middleware
app.use(helmet())
app.use(compression())
app.use(morgan("combined"))
app.use(
  cors({
    origin: process.env.CLIENT_URL || "http://localhost:3000",
    credentials: true,
  }),
)
app.use(express.json({ limit: "10mb" }))
app.use(express.urlencoded({ extended: true, limit: "10mb" }))

// Static file serving
app.use("/uploads", express.static(path.join(__dirname, "uploads")))

// Routes
app.use("/api/applications", applicationsRouter)
app.use("/api/lenders", lendersRouter)
app.use("/api/upload", uploadRouter)
app.use("/api/archives", archivesRouter)

// Health check
app.get("/api/health", (req, res) => {
  const dbStatus = database.getConnectionStatus();
  res.json({ 
    status: "OK", 
    timestamp: new Date().toISOString(),
    database: {
      connected: dbStatus.isConnected,
      host: dbStatus.host,
      name: dbStatus.name
    }
  })
})

// Error handling
app.use((err, req, res, next) => {
  console.error(err.stack)
  res.status(500).json({ error: "Something went wrong!" })
})

// 404 handler
app.use("*", (req, res) => {
  res.status(404).json({ error: "Route not found" })
})

// Start server with database connection
async function startServer() {
  try {
    // Connect to MongoDB
    await database.connect();
    
    // Initialize default data
    await mongoDataStorage.initializeDefaultData();
    
    // Start the server
    app.listen(PORT, () => {
      console.log("🚀 Server running on port", PORT)
      console.log("📊 Environment:", process.env.NODE_ENV || "development")
      console.log("💾 Data storage: MongoDB")
    })
  } catch (error) {
    console.error("❌ Failed to start server:", error);
    process.exit(1);
  }
}

// Handle graceful shutdown
process.on('SIGINT', async () => {
  console.log('\n🛑 Received SIGINT, shutting down gracefully...');
  try {
    await database.disconnect();
    process.exit(0);
  } catch (error) {
    console.error('❌ Error during shutdown:', error);
    process.exit(1);
  }
});

process.on('SIGTERM', async () => {
  console.log('\n🛑 Received SIGTERM, shutting down gracefully...');
  try {
    await database.disconnect();
    process.exit(0);
  } catch (error) {
    console.error('❌ Error during shutdown:', error);
    process.exit(1);
  }
});

startServer();
