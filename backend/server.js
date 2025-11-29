// server.js - Express + Socket.io Signaling Server
const express = require('express');
const http = require('http');
const socketIO = require('socket.io');
const cors = require('cors');

const app = express();
const server = http.createServer(app);
const io = socketIO(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST']
  }
});

app.use(cors());
app.use(express.json());

// Store active users and their socket connections
const users = new Map();

// Simple route to check server status
app.get('/health', (req, res) => {
  res.json({ status: 'Server is running' });
});

// Socket.io connection handler
io.on('connection', (socket) => {
  console.log(`User connected: ${socket.id}`);

  // User joins with a username
  socket.on('join', (data) => {
    const { username } = data;
    users.set(socket.id, {
      id: socket.id,
      username: username,
      socketId: socket.id
    });

    console.log(`${username} joined. Total users: ${users.size}`);

    // Broadcast updated user list to all clients
    io.emit('users', Array.from(users.values()));
  });

  // Handle call initiation
  socket.on('call', (data) => {
    const { to, offer } = data;
    console.log(`${socket.id} is calling ${to}`);

    // Send offer to the recipient
    io.to(to).emit('incomingCall', {
      from: socket.id,
      fromUsername: users.get(socket.id)?.username,
      offer: offer
    });
  });

  // Handle call acceptance
  socket.on('answer', (data) => {
    const { to, answer } = data;
    console.log(`${socket.id} answered call from ${to}`);

    // Send answer back to the caller
    io.to(to).emit('callAnswered', {
      from: socket.id,
      answer: answer
    });
  });

  // Handle ICE candidates
  socket.on('iceCandidate', (data) => {
    const { to, candidate } = data;
    console.log(`ICE candidate from ${socket.id} to ${to}`);

    // Forward ICE candidate to the other peer
    io.to(to).emit('iceCandidate', {
      from: socket.id,
      candidate: candidate
    });
  });

  // Handle call rejection
  socket.on('rejectCall', (data) => {
    const { to } = data;
    console.log(`${socket.id} rejected call from ${to}`);

    io.to(to).emit('callRejected', {
      from: socket.id
    });
  });

  // Handle call end
  socket.on('endCall', (data) => {
    const { to } = data;
    console.log(`${socket.id} ended call with ${to}`);

    io.to(to).emit('callEnded', {
      from: socket.id
    });
  });

  // Handle disconnection
  socket.on('disconnect', () => {
    const user = users.get(socket.id);
    if (user) {
      console.log(`${user.username} disconnected`);
      users.delete(socket.id);
    }

    // Notify all clients about the updated user list
    io.emit('users', Array.from(users.values()));

    // Notify peers if user was in a call
    socket.broadcast.emit('userDisconnected', {
      userId: socket.id
    });
  });

  // Error handling
  socket.on('error', (error) => {
    console.error(`Socket error from ${socket.id}:`, error);
  });
});

const PORT = process.env.PORT || 3001;
server.listen(PORT, () => {
  console.log(`Signaling server running on http://localhost:${PORT}`);
});