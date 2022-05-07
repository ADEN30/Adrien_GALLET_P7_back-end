const express = require('express');

require('dotenv').config({path: './config/.env'});

const RoutesUsers = require('./routes/users');
const RoutesPosts = require('./routes/posts');
const RoutesChats = require('./routes/chats');
const path = require("path");

const cookieParser = require('cookie-parser');
const csurf = require("csurf");

const crsfProtect = csurf({cookie: true})


const sql = require("mysql");
const app = express();

app.use(cookieParser());
app.use(express.json()); 


app.use((req, res, next)=>{
    res.setHeader("Access-Control-Allow-Origin", 'http://localhost:8080');
    res.setHeader("Access-Control-Allow-Credentials", true);
    res.setHeader("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content, Accept, Content-Type, Authorization, x-xsrf-token");
    res.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, PATCH, OPTIONS");
    next();
});

app.use("/images/users", express.static(path.join(__dirname, "images/users")));
app.use("/images/posts", express.static(path.join(__dirname, "images/posts")));
app.use('/api/auth', RoutesUsers);
app.use('/api/posts', RoutesPosts);
app.use('/api/salon', RoutesChats);

module.exports = app;