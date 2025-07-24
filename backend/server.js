const express = require("express");
const connectDB = require("./config/db");
const dotenv = require("dotenv");
const cors = require("cors");
const colors = require("colors");

console.log("🚀 Starting server initialization...");

dotenv.config();
console.log("✅ Environment variables loaded");

const app = express();
console.log("✅ Express app created");

const allowedOrigins = [
  "http://localhost:3000",
  "http://localhost:3001",
  "https://pingit-messenger.vercel.app",
  "https://pingit-messenger.onrender.com",
];

app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin) return callback(null, true);

      if (allowedOrigins.indexOf(origin) !== -1) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: [
      "Origin",
      "X-Requested-With",
      "Content-Type",
      "Accept",
      "Authorization",
    ],
  })
);

console.log("✅ CORS configured");

app.options("*", cors());
app.use(express.json());

console.log("✅ Middleware configured");

app.get("/", (req, res) => {
  res.send("API is running successfully");
});

app.get("/health", (req, res) => {
  res.status(200).json({ status: "OK", message: "Server is running" });
});

console.log("✅ Health routes added");

try {
  const userRoutes = require("./routes/userRoutes");
  const chatRoutes = require("./routes/chatRoutes");
  const messageRoutes = require("./routes/messageRoutes");
  const { notFound, errorHandler } = require("./middleware/errorMiddleware");

  app.use("/api/user", userRoutes);
  app.use("/api/chat", chatRoutes);
  app.use("/api/message", messageRoutes);
  app.use(notFound);
  app.use(errorHandler);

  console.log("✅ Routes and middleware loaded");
} catch (error) {
  console.error("❌ Error loading routes:", error.message);
  process.exit(1);
}

const PORT = process.env.PORT || 3001;
console.log(`🔍 Attempting to start server on port ${PORT}`);

const server = app
  .listen(PORT, "0.0.0.0", () => {
    console.log(`🎉 Server started successfully on PORT ${PORT}`.yellow.bold);
  })
  .on("error", (err) => {
    console.error("❌ Server failed to start:", err);
    process.exit(1);
  });

console.log("✅ Server listen called");

try {
  const io = require("socket.io")(server, {
    pingTimeout: 60000,
    cors: {
      origin: allowedOrigins,
      credentials: true,
      methods: ["GET", "POST"],
    },
  });

  console.log("✅ Socket.io initialized");

  io.on("connection", (socket) => {
    console.log("Connected to socket.io");

    socket.on("setup", (userData) => {
      socket.join(userData._id);
      socket.emit("connected");
    });

    socket.on("join chat", (room) => {
      socket.join(room);
      console.log("User Joined Room: " + room);
    });

    socket.on("typing", (room) => socket.in(room).emit("typing"));
    socket.on("stop typing", (room) => socket.in(room).emit("stop typing"));

    socket.on("new message", (newMessageRecieved) => {
      const chat = newMessageRecieved.chat;

      if (!chat.users) return console.log("chat.users not defined");

      chat.users.forEach((user) => {
        if (user._id === newMessageRecieved.sender._id) return;

        socket.in(user._id).emit("message recieved", newMessageRecieved);
      });
    });

    socket.on("disconnect", () => {
      console.log("USER DISCONNECTED");
    });
  });
} catch (error) {
  console.error("❌ Socket.io initialization failed:", error);
}

process.on("uncaughtException", (err) => {
  console.error("❌ Uncaught Exception:", err);
  process.exit(1);
});

process.on("unhandledRejection", (err, promise) => {
  console.error(`❌ Unhandled Rejection: ${err.message}`);
  server.close(() => {
    process.exit(1);
  });
});

process.on("SIGTERM", () => {
  console.log("SIGTERM received, shutting down gracefully");
  server.close(() => {
    console.log("Server closed");
    process.exit(0);
  });
});

connectDB()
  .then(() => {
    console.log("✅ Database connection completed");
  })
  .catch((err) => {
    console.error("❌ Database connection failed:", err);
    process.exit(1);
  });
