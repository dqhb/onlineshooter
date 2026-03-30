const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const app = express();
const server = http.createServer(app);
const io = new Server(server);

// In-memory storage (Use a database like MongoDB for permanent storage)
let users = {}; 
let activeRooms = {}; 

io.on('connection', (socket) => {
    // Account System
    socket.on('login', (username) => {
        if (!users[username]) users[username] = { levels: [] };
        socket.username = username;
        socket.emit('userData', users[username]);
    });

    // Host Level (6-digit code)
    socket.on('hostLevel', (levelData) => {
        const code = Math.floor(100000 + Math.random() * 900000).toString();
        activeRooms[code] = { data: levelData, players: {} };
        socket.emit('levelCode', code);
    });

    socket.on('joinRoom', (code) => {
        if (activeRooms[code]) {
            socket.join(code);
            socket.emit('loadLevel', activeRooms[code].data);
        }
    });

    socket.on('saveLevel', (level) => {
        if (socket.username) {
            const userLevels = users[socket.username].levels;
            const index = userLevels.findIndex(l => l.name === level.name);
            if (index > -1) userLevels[index] = level;
            else userLevels.push(level);
        }
    });
});

app.use(express.static('public'));
server.listen(process.env.PORT || 3000);
