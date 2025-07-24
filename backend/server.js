const express = require("express");
const connectDB = require("./config/db");
const dotenv = require("dotenv");
const cors = require("cors");
const colors = require("colors");
const userRoutes = require("./routes/userRoutes");
const chatRoutes = require("./routes/chatRoutes");
const messageRoutes = require("./routes/messageRoutes");
const { notFound, errorHandler } = require("./middleware/errorMiddleware");

dotenv.config();
connectDB();
const app = express();

app.use(
  cors({
    origin: [
      "http://localhost:3000",
      "http://localhost:3001",
      "https://pingit-messenger.vercel.app",
      "https://pingit-messenger.onrender.com",
    ],
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: [
      "Origin",
      "X-Requested-With",
      "Content-Type",
      "Accept",
      "Authorization",
    ],
    optionsSuccessStatus: 200,
  })
);

app.options("*", cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.status(200).send("PingIt Messenger API is running");
});

app.get("/health", (req, res) => {
  res.status(200).json({
    status: "healthy",
    uptime: process.uptime(),
  });
});

app.use("/api/user", userRoutes);
app.use("/api/chat", chatRoutes);
app.use("/api/message", messageRoutes);

app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 3001;

const server = app.listen(PORT, () => {
  console.log(`Server started on PORT ${PORT}`.yellow.bold);
});

const io = require("socket.io")(server, {
  pingTimeout: 60000,
  cors: {
    origin: [
      "http://localhost:3000",
      "http://localhost:3001",
      "https://pingit-messenger.vercel.app",
      "https://pingit-messenger.onrender.com",
    ],
    credentials: true,
    methods: ["GET", "POST"],
  },
});

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
    if (!chat.users) return;
    chat.users.forEach((user) => {
      if (user._id === newMessageRecieved.sender._id) return;
      socket.in(user._id).emit("message recieved", newMessageRecieved);
    });
  });

  socket.on("disconnect", () => {
    console.log("USER DISCONNECTED");
  });
});

process.on("unhandledRejection", (err, promise) => {
  console.log(`Error: ${err.message}`.red);
  server.close(() => {
    process.exit(1);
  });
});

process.on("SIGTERM", () => {
  console.log("SIGTERM received, shutting down gracefully");
  server.close(() => {
    process.exit(0);
  });
});
