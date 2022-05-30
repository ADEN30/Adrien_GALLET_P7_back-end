const http = require("http");
const app = require('./app');

require('dotenv').config({path: './config/.env'});

app.set('port', process.env.PORT);
const server = http.createServer(app);
const io = require("socket.io")(server, {cors: {
    origin: "*"}
  });
io.on("connect", (socket)=>{
    console.log("vous êtes connecté");
});



server.listen(process.env.PORT);