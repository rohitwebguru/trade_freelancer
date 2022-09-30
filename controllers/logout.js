class LogOut {
    static logout = (res, req) => {
        res.clearCookie('userRegistered');
        res.redirect('/login');
    }
}

module.exports = {
    LogOut
}