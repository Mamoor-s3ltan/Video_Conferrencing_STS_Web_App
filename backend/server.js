// server.js - Express + Socket.io Signaling Server with Meeting Rooms
const express = require('express');
const http = require('http');
const socketIO = require('socket.io');
const cors = require('cors');
const {createClient} = require('@supabase/supabase-js');
const { supabase } = require('../frontend/src/conn');

try {
  const supabasekey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inl5Y2FwZWRzeGx3Y3F3c3hmaXBrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjEwNTI1NjQsImV4cCI6MjA3NjYyODU2NH0.dBp5hHJWHrnNATxnOltKqmLVu47_DH5LqiTAacpTCgI"
  const supabaseUrl ="https://yycapedsxlwcqwsxfipk.supabase.co"
  const supabase = createClient( supabaseUrl,supabasekey)
} catch (error) {
  console.error("Having error connecting to supabase")
}



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
// Store meeting rooms
const meetingRooms = new Map();

// Simple route to check server status
app.get('/health', (req, res) => {
  res.json({ status: 'Server is running' });
});

let meetings;

// API endpoint to create a new meeting room
app.post('/api/meeting/create', (req, res) => {
  const meetingId = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
  
  meetingRooms.set(meetingId, {
    id: meetingId,
    createdAt: new Date(),
    participants: [],
    active: true,
  });

  console.log(meetingRooms)

  
  res.json({
    success: true,
    meetingId: meetingId,
    meetingLink: `${req.protocol}://${req.get('host')}/meeting/${meetingId}`,

  });
});

// API endpoint to get meeting info
app.get('/api/meeting/:meetingId', (req, res) => {
  const { meetingId } = req.params;
  const meeting = meetingRooms.get(meetingId);
  
  

  if (!meeting) {
    return res.status(404).json({
      success: false,
      message: 'Meeting not found'
    });
  }

  res.json({
    success: true,
    meeting: {
      id: meeting.id,
      createdAt: meeting.createdAt,
      participantCount: meeting.participants.length,
      active: meeting.active
    }
  });
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

  // User joins a specific meeting room
  socket.on('joinMeeting', (data) => {
    const { meetingId, username } = data;
    const meeting = meetingRooms.get(meetingId);

    if (!meeting) {
      socket.emit('meetingError', {
        message: 'Meeting not found'
      });
      return;
    }

    // Add user to meeting room
    socket.join(meetingId);
    
    const participant = {
      socketId: socket.id,
      username: username,
      joinedAt: new Date()
    };

    meeting.participants.push(participant);
    users.set(socket.id, {
      ...participant,
      meetingId: meetingId
    });

    console.log(`${username} joined meeting ${meetingId}. Participants: ${meeting.participants.length}`);

    // Notify user of successful join
    socket.emit('meetingJoined', {
      meetingId: meetingId,
      participants: meeting.participants
    });

    // Notify other participants in the room
    socket.to(meetingId).emit('participantJoined', {
      participant: participant,
      totalParticipants: meeting.participants.length
    });

    // Send list of existing participants to the new user
    socket.emit('existingParticipants', {
      participants: meeting.participants.filter(p => p.socketId !== socket.id)
    });
  });

  // Handle call initiation within a meeting room
  socket.on('call', (data) => {
    const { to, offer, meetingId } = data;
    console.log(`${socket.id} is calling ${to} in meeting ${meetingId}`);

    // Send offer to the recipient
    io.to(to).emit('incomingCall', {
      from: socket.id,
      fromUsername: users.get(socket.id)?.username,
      offer: offer,
      meetingId: meetingId
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

  // Handle leaving a meeting
  socket.on('leaveMeeting', (data) => {
    const { meetingId } = data;
    const user = users.get(socket.id);

    if (user && meetingId) {
      const meeting = meetingRooms.get(meetingId);
      
      if (meeting) {
        // Remove participant from meeting
        meeting.participants = meeting.participants.filter(p => p.socketId !== socket.id);
        
        // Leave the socket room
        socket.leave(meetingId);

        console.log(`${user.username} left meeting ${meetingId}. Remaining: ${meeting.participants.length}`);

        // Notify others in the meeting
        socket.to(meetingId).emit('participantLeft', {
          socketId: socket.id,
          username: user.username,
          totalParticipants: meeting.participants.length
        });

        // If no participants left, mark meeting as inactive
        if (meeting.participants.length === 0) {
          meeting.active = false;
          console.log(`Meeting ${meetingId} is now inactive`);
        }
      }
    }
  });

  // Handle disconnection
  socket.on('disconnect', () => {
    const user = users.get(socket.id);
    
    if (user) {
      console.log(`${user.username} disconnected`);
      
      // If user was in a meeting, clean up
      if (user.meetingId) {
        const meeting = meetingRooms.get(user.meetingId);
        
        if (meeting) {
          meeting.participants = meeting.participants.filter(p => p.socketId !== socket.id);
          
          // Notify others in the meeting
          io.to(user.meetingId).emit('participantLeft', {
            socketId: socket.id,
            username: user.username,
            totalParticipants: meeting.participants.length
          });

          // If no participants left, mark meeting as inactive
          if (meeting.participants.length === 0) {
            meeting.active = false;
            console.log(`Meeting ${user.meetingId} is now inactive`);
          }
        }
      }
      
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