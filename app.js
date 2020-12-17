var express = require('express');
var app = express();
var http = require('http').createServer(app);
var io = require('socket.io')(http);
let port = process.env.PORT || 3000

app.set('view engine', 'ejs')
app.use(express.static('public'))
app.get('/', (req, res)=> {
    res.render('index')
})

io.on('connection', socket => {
    console.log("New user connected")
    socket.on('disconnect', () => {
        console.log('user disconnected');
    });
    socket.on('device-online', (data) => {
        console.log(`device ${data.uuid} connected`);
    });
})

http.listen(port, () => {
    console.log(`server is running on port ${port}`)
})

