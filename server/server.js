require("dotenv").config();

const express = require("express");
const cors = require("cors");
const http = require("http");
const { Server } = require("socket.io");

const connectDB = require("./config/db");
const Message = require("./models/Message");
const authRoutes = require("./routes/authRoutes");
const userRoutes = require("./routes/userRoutes");
const marketplaceRoutes = require("./routes/marketplaceRoutes");
const lostFoundRoutes = require("./routes/lostFoundRoutes");
const academicRoutes = require("./routes/academicRoutes");
const eventRoutes = require("./routes/eventRoutes");
const messageRoutes = require("./routes/messageRoutes");
const saveRoutes = require("./routes/saveRoutes");
const uploadRoutes = require("./routes/uploadRoutes");
const notificationRoutes = require("./routes/notificationRoutes");

const app = express();

const onlineUsers = new Map();

/* =========================
   CORS
========================= */

const allowedOrigins = [
  "https://studentdeck.netlify.app",
  "http://localhost:5173"
];

app.use((req, res, next) => {
  const origin = req.headers.origin;

  if (allowedOrigins.includes(origin)) {
    res.header(
      "Access-Control-Allow-Origin",
      origin
    );

    res.header(
      "Access-Control-Allow-Credentials",
      "true"
    );
  }

  res.header(
    "Access-Control-Allow-Methods",
    "GET,POST,PUT,DELETE,OPTIONS"
  );

  res.header(
    "Access-Control-Allow-Headers",
    "Content-Type,Authorization"
  );

  if (req.method === "OPTIONS") {
    return res.sendStatus(204);
  }

  next();
});

/* =========================
   MIDDLEWARE
========================= */

app.use(express.json());

/* =========================
   ROUTES
========================= */

app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/marketplace", marketplaceRoutes);
app.use("/api/lost-found", lostFoundRoutes);
app.use("/api/academic-resources", academicRoutes);
app.use("/api/events", eventRoutes);
app.use("/api/messages", messageRoutes);
app.use("/api/saves", saveRoutes);
app.use("/api/uploads", uploadRoutes);
app.use("/api/notifications", notificationRoutes);

/* =========================
   ROOT ROUTE
========================= */

app.get("/", (req, res) => {
  res.send("StudentDeck Backend is running!");
});

/* =========================
   HTTP SERVER
========================= */

const server = http.createServer(app);

/* =========================
   SOCKET.IO
========================= */



const io = new Server(server, {
  cors: {
    origin: allowedOrigins,
    methods: ["GET", "POST"],
    credentials: true
  }
});

/* =========================
   SOCKET CONNECTION
========================= */

io.on("connection", (socket) => {
  console.log("Socket connected:", socket.id);

  socket.on("join_user", (userId) => {
    if (!userId) return;

    const normalizedUserId = String(userId);

    socket.userId = normalizedUserId;

    socket.join(`user:${normalizedUserId}`);

    onlineUsers.set(
      normalizedUserId,
      socket.id
    );

    console.log(
      `User online: ${normalizedUserId}`
    );

    // Newly connected user ko already-online users bhejo
    socket.emit("online_users", {
      userIds: Array.from(
        onlineUsers.keys()
      ),
    });

    // Baaki connected users ko notify karo
    socket.broadcast.emit("user_online", {
      userId: normalizedUserId,
    });
  });

  socket.on("join_conversation", (conversationId) => {
    if (!conversationId) return;

    socket.join(
      `conversation:${conversationId}`
    );

    console.log(
      `Socket ${socket.id} joined conversation:${conversationId}`
    );
  });

  socket.on(
    "message_delivered",
    async ({
      messageId,
      conversationId,
      senderId
    }) => {
      console.log(
        "DELIVERY ACK RECEIVED:",
        {
          messageId,
          conversationId,
          senderId,
          deliveredBy: socket.userId
        }
      )

      if (
        !messageId ||
        !senderId ||
        !socket.userId
      ) {
        console.log(
          "DELIVERY ACK MISSING DATA"
        )

        return
      }

      try {
        const message =
          await Message.findOneAndUpdate(
            {
              _id: messageId,
              sender: senderId
            },
            {
              delivered: true
            },
            {
              new: true
            }
          )

        if (!message) {
          console.log(
            "Message not found for delivery:",
            messageId
          )

          return
        }

        io.to(
          `user:${String(senderId)}`
        ).emit(
          "message_delivered",
          {
            messageId:
              String(messageId),

            conversationId:
              String(conversationId),

            deliveredTo:
              String(socket.userId)
          }
        )

        console.log(
          `Message delivered: ${messageId} → ${senderId}`
        )

      } catch (error) {
        console.error(
          "Message delivery update error:",
          error.message
        )
      }
    }
  )

  socket.on("typing_start", ({ conversationId, userId }) => {
    if (!conversationId || !userId) return;

    socket
      .to(`conversation:${conversationId}`)
      .emit("user_typing", {
        conversationId,
        userId: String(userId),
      });
  });

  socket.on("typing_stop", ({ conversationId, userId }) => {
    if (!conversationId || !userId) return;

    socket
      .to(`conversation:${conversationId}`)
      .emit("user_stopped_typing", {
        conversationId,
        userId: String(userId),
      });
  });

  socket.on("disconnect", () => {
    console.log(
      "Socket disconnected:",
      socket.id
    );

    const userId = socket.userId;

    if (!userId) return;

    const currentSocketId =
      onlineUsers.get(userId);

    // Agar ye user's current socket hai
    if (currentSocketId === socket.id) {
      onlineUsers.delete(userId);

      socket.broadcast.emit("user_offline", {
        userId,
      });

      console.log(
        `User offline: ${userId}`
      );
    }
  });

});

/*
 * Controller ke andar Socket.IO use karne ke liye
 */
app.set("io", io);

/* =========================
   START SERVER
========================= */

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  try {
    await connectDB();

    server.listen(PORT, "0.0.0.0", () => {
      console.log(`Server running on port ${PORT}`);
    });

  } catch (error) {
    console.error("Failed to start server:", error);
    process.exit(1);
  }
};

startServer();