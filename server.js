import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: "*", // allow any origin for local dev
    methods: ["GET", "POST"]
  }
});

// A simple in-memory store for the scoreboard state
// so new clients get the current state immediately upon connecting
let currentState = {
  redName: 'RED',
  redUnit: '',
  redScore: 0,
  redGam: 0,
  blueName: 'BLUE',
  blueUnit: '',
  blueScore: 0,
  blueGam: 0,
  matchNumber: '1',
  roundTimeConfig: 30,
  timeRemaining: 30,
  isTimerRunning: false,
  currentRound: 1,
  winnerMessage: '',
  winnerReason: '',
  winnerColor: '#ffd700',
  redRoundScores: [0, 0, 0],
  blueRoundScores: [0, 0, 0]
};

io.on('connection', (socket) => {
  console.log(`Client connected: ${socket.id}`);

  // Send the current state to the newly connected client immediately
  socket.emit('stateUpdate', currentState);

  // When a control panel updates the state
  socket.on('updateState', (newState) => {
    // Update the in-memory state
    currentState = { ...currentState, ...newState };
    // Broadcast the new state to all OTHER connected clients (scoreboards)
    socket.broadcast.emit('stateUpdate', currentState);
  });

  socket.on('disconnect', () => {
    console.log(`Client disconnected: ${socket.id}`);
  });
});

const PORT = 3001; // Run backend on 3001
httpServer.listen(PORT, '0.0.0.0', () => {
  console.log(`Socket.IO Server running on http://0.0.0.0:${PORT}`);
});
