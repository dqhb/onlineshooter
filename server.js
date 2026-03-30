const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const path = require('path');
const app = express();
const server = http.createServer(app);
const io = new Server(server);

let active_rooms = {}; 

io.on('connection', (socket) => {
    socket.on('host_level', (level_data) => {
        const code = Math.floor(100000 + Math.random() * 900000).toString();
        active_rooms[code] = level_data;
        socket.emit('level_code', code);
    });

    socket.on('join_room', (code) => {
        if (active_rooms[code]) {
            socket.emit('load_level', active_rooms[code]);
        } else {
            socket.emit('error_msg', 'level not found');
        }
    });
});

app.use(express.static(path.join(__dirname, 'public')));
server.listen(process.env.PORT || 3000);
