const jet = require('jsonwebtoken');
const db = require('../routes/db-config');
const bcrypt = require('bcryptjs');

class HomeController {
    static indexView = (req, res, next) => {
        res.render('home');
    }
    static loginView = (req, res, next) => {
        res.render('login');
    }
}


module.exports = {
    HomeController
}