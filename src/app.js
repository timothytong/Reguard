import * as http from 'http';
import Api from './api';

const api = new Api();
const port = process.env.PORT || 3000;
const server = http.createServer(api.express);

const io = require('socket.io')(http);

io.on('connection', (socket) => {
  console.log('New user connected');
  socket.on('disconnect', () => {
    console.log('user disconnected');
  });
  socket.on('device-online', (data) => {
    console.log(`device ${data.uuid} connected`);
  });
});

server.listen(port, () => {
  console.log(`server is running on port ${port}`);
});
