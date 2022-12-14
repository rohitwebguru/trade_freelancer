const express = require("express");
const expressLayouts = require("express-ejs-layouts");
const path = require("path");
const homeRoutes = require("./routes/web");
const cookie = require("cookie-parser");
const bodyParser = require("body-parser");
const dotenv = require("dotenv").config();
const db = require("./routes/db-config");
const app = express();

app.use(express.static(path.join(__dirname, 'public')));
// Set Template Engine
app.use(expressLayouts);
app.set('view engine', 'ejs');
app.set('layout', './layouts/login')
    //app.set('views', './views');
app.set('views', path.join(__dirname, 'views'));

// Set Cookies
app.use(cookie());
app.use(express.json());

app.use(bodyParser.urlencoded({
    extended: true
}));
app.use(bodyParser.json());
// Database Connection

db.connect((err) => {
    if (err) throw err;
    console.log('Database connected');

    // var date_ob = new Date();
    // var day = ("0" + date_ob.getDate()).slice(-2);
    // var month = ("0" + (date_ob.getMonth() + 1)).slice(-2);
    // var year = date_ob.getFullYear();
    // var current_date = Date.parse(year + "-" + month + "-" + day);
    // try {
    //     db.query("SELECT * FROM authenticattion Order by id desc LIMIT 1", function (err, result, fields) {
    //         if (err) throw err;
    //         if (typeof result !== 'undefined' && result.length === 1) {
    //             var data = JSON.parse(result[0].data);
    //             var authenticattion_end = Date.parse(result[0].authenticattion_end);
    //             if(current_date > authenticattion_end){
    //                 console.log('token is expired');
    //             }else{
    //                 console.log('token is not expired');
    //             }
    //         }
    //     });
    // } catch (err) {
    //     if(err) return next()
    // }
})

const date_ob = new Date();
const day = ("0" + date_ob.getDate()).slice(-2);
const month = ("0" + (date_ob.getMonth() + 1)).slice(-2);
const year = date_ob.getFullYear();
const current_date = Date.parse(year + "-" + month + "-" + day);
db.query("SELECT * FROM authenticattion Order by id desc LIMIT 1", function(err, result, fields) {
    if (err) throw err;
    if (typeof result !== 'undefined' && result.length === 1) {
        const data = JSON.parse(result[0].data);
        const authenticattion_end = Date.parse(result[0].authenticattion_end);
        console.log('authenticattion_end: ' + authenticattion_end);
        console.log('current_date: ' + current_date);
        if (current_date > authenticattion_end) {
            console.log('token is expired');
        } else {
            console.log('token is not expired');
        }
    }
});

// Set Routes
app.use(homeRoutes.routes);

app.listen(8000, () => console.log('App is listening on url http://ec2-34-205-63-120.compute-1.amazonaws.com:8000'))