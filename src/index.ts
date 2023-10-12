import {configDotenv} from 'dotenv';
import * as express from 'express';
import {createServer} from 'http';
import {Server, Socket} from 'socket.io';

// Create a custom interface that extends Socket
interface CustomSocket extends Socket {
  username?: string; // Define the 'username' property
}

const app = express();
configDotenv();
const server = createServer(app);
const io = new Server(server);
const port = process.env.PORT || 3000;

app.get('/', (req, res) => {
  res.sendFile('index.html', {root: __dirname});
});

io.on('connection', (socket: CustomSocket) => {
  console.log('a user connect');
  socket.on('join-room', async (room: string) => {
    await leaveRoom(socket);
    void socket.join(room);
    socket.emit('set-room', room);
    socket.emit('set-name');
    await broadcastInRoom(socket, room, socket.id);
  });

  socket.on('message', (room, message, sender) => {
    console.log(`room:${room} message:${message} sender:${sender}`);
    io.to(room).emit('message', message, sender);
  });

  socket.on('disconnect', async () => {
    console.log('A user disconnected');
    // const room: Array<string> = [];
    // for (const data of socket.rooms) {
    //   room.push(data);
    // }
    // await broadcastInRoom(socket, room[0], socket.id);
  });
});

server.listen(port, () => {
  console.log(`server running at ${port}`);
});

const leaveRoom = async (socket: CustomSocket) => {
  const room_all = socket.rooms;
  console.log(room_all);
  for (const data of room_all) {
    void socket.leave(data);
  }
  return socket;
};

const broadcastInRoom = async (
  socket: CustomSocket,
  room: string,
  sender: string
) => {
  socket.broadcast
    .to(room)
    .emit('broadcast', `User_${sender} joined room:${room}`);
  return socket;
};
