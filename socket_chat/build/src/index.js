"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const dotenv_1 = require("dotenv");
const express = require("express");
const node_http_1 = require("node:http");
const socket_io_1 = require("socket.io");
const app = express();
(0, dotenv_1.configDotenv)();
const server = (0, node_http_1.createServer)(app);
const io = new socket_io_1.Server(server);
const port = process.env.PORT || 3000;
app.get('/', (req, res) => {
    res.sendFile('index.html', { root: __dirname });
});
io.on('connection', (socket) => {
    socket.on('join-room', async (room) => {
        await leaveRoom(socket);
        void socket.join(room);
        socket.emit('set-room', room);
        await broadcastInRoom(socket, room, socket.id);
    });
    socket.on('message', (room, message, sender) => {
        console.log(`room:${room} message:${message} sender:${sender}`);
        io.to(room).emit('message', message, sender);
    });
    socket.on('disconnect', async () => {
        console.log('A user disconnected');
    });
});
server.listen(port, () => {
    console.log(`server running at ${port}`);
});
const leaveRoom = async (socket) => {
    const room_all = socket.rooms;
    console.log(room_all);
    for (const data of room_all) {
        void socket.leave(data);
    }
    return socket;
};
const broadcastInRoom = async (socket, room, sender) => {
    socket.broadcast
        .to(room)
        .emit('broadcast', `User_${sender} joined room:${room}`);
    return socket;
};
//# sourceMappingURL=index.js.map