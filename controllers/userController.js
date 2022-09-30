class UserController {
    static home = (req, res) => {
        res.render('index');
    }
    static login = (req, res) => {
        res.render('login');
    }
}

module.exports = {
    UserController
}
