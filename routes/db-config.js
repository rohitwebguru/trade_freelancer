const mysql = require("mysql");

const db = mysql.createConnection({
    host: 'localhost',//process.env.DATABASE_HOST,
    user: 'root',//process.env.DATABASE_USER,
    password: '',//process.env.DATABASE_PASSWORD,
    database: 'freelancer_marketing',//process.env.DATABASE,
});

module.exports = db