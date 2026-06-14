const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const cors = require("cors");
const path = require("path");
require("dotenv").config();

const connectDB = require("./config/db");
const errorHandler = require("./middleware/error");
const setupSocket = require("./socket");

// Connect to database
connectDB();

const app = express();
const server = http.createServer(app);

// Socket.io setup
const io = new Server(server, {
  cors: {
    origin:
      process.env.NODE_ENV === "production"
        ? process.env.CLIENT_URL
        : "http://localhost:3000",
    methods: ["GET", "POST"],
    credentials: true,
  },
});

// Setup socket handlers
setupSocket(io);

// Middleware
app.use(
  cors({
    origin:
      process.env.NODE_ENV === "production"
        ? process.env.CLIENT_URL
        : "http://localhost:3000",
    credentials: true,
  }),
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Static folder for uploads
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// Routes
app.use("/api/auth", require("./routes/auth"));
app.use("/api/users", require("./routes/users"));
app.use("/api/bikes", require("./routes/bikes"));
app.use("/api/rides", require("./routes/rides"));
app.use("/api/forum", require("./routes/forum"));
app.use("/api/marketplace", require("./routes/marketplace"));
app.use("/api/messages", require("./routes/messages"));

// Health check
app.get("/api/health", (req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

// Error handler
app.use(errorHandler);

// Serve static assets in production
if (process.env.NODE_ENV === "production") {
  app.use(express.static(path.join(__dirname, "../client/build")));

  app.get("*", (req, res) => {
    res.sendFile(path.resolve(__dirname, "../client/build", "index.html"));
  });
}

const PORT = process.env.PORT || 5000;

server.listen(PORT, () => {
  console.log(`                        
     BikeBond Server Running                                                  
     Port: ${PORT}                                 
    Mode: ${process.env.NODE_ENV || "development"}                       
  `);
});

server.on("error", (err) => {
  if (err.code === "EADDRINUSE") {
    console.error(
      `Port ${PORT} is already in use. Stop the other process or change PORT in server/.env.`,
    );
    process.exit(1);
  }

  if (err.code === "EPERM") {
    console.error(
      `Permission denied while binding to port ${PORT}. Try a different PORT in server/.env.`,
    );
    process.exit(1);
  }

  throw err;
});

// Handle unhandled promise rejections
process.on("unhandledRejection", (err, promise) => {
  console.error(`Error: ${err.message}`);
  server.close(() => process.exit(1));
});
