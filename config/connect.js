const sql = require('mysql');

const con = sql.createConnection({
    host: "localhost",
    user: "root",
    password: process.env.DB_MP,
    database: "groupomania"
});

con.connect((err) => {
    if(err) throw err;
    console.log("Connecté");
});

module.exports = con;