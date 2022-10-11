const jwt = require('jsonwebtoken');
const db = require("../routes/db-config");
const bcrypt = require('bcryptjs');
const axios = require('axios');
const qs = require('qs');

function addMonths(date, months) {
    var d = date.getDate();
    date.setMonth(date.getMonth() + +months);
    if (date.getDate() != d) {
        date.setDate(0);
    }
    return date;
}

class LoginController {
    static loginauth = async(req, res) => {
        const { email, password, token } = req.body;
        if (!email || !password) return res.json({ status: "error", error: "Please Enter your email and password" })
        else {
            db.query('Select * FROM users WHERE email = ?', [email], async(Err, result) => {
                if (Err) throw Err;
                if (!result.length || !await bcrypt.compare(password, result[0].password)) return res.json({
                    status: 'error',
                    error: 'Incorrect Email or Password'
                })
                else {
                    const regtoken = jwt.sign({ id: result[0].id }, process.env.JWT_SECRET, {
                        expiresIn: process.env.JWT_EXPIRES,
                        // httpOnly: true
                    })
                    const cookiesOptions = {
                        expiresIn: new Date(Date.now() + process.env.COOKIES_EXPIRES * 24 * 60 * 60 * 1000),
                        // httpOnly: true
                    }
                    res.cookie('userRegistered', regtoken, cookiesOptions);
                    if (token != '' && token != null && token != undefined) {
                        return res.json({ status: 'status', success: 'User Has been Logged In', redirect: `/joinlink/${token}` })
                    } else {
                        return res.json({ status: 'status', success: 'User Has been Logged In', redirect: '/dashboard' })
                    }
                }
            })
        }
    }

    static profileauth = async(req, res) => {
        const { username, email, password, confirm_password, hidden_image, user_id, skill } = req.body;

        if (req.file == undefined) {
            var filename = hidden_image;
        } else {
            var filename = req.file.filename;
        }
        if (req.fileError) {
            return res.json({ status: "error", error: "Please Enter your Image" })
        } else if (!username) {
            return res.json({ status: "error", error: "Please Enter your name" })
        } else if (!email) {
            return res.json({ status: "error", error: "Please Enter your email" })
        } else if (password != confirm_password) {
            return res.json({ status: "error", error: "Your password and confirm password does not match" })
        } else {
            const hashed = await bcrypt.hash(password, 8);
            const query = `UPDATE users SET username = "${username}", email = "${email}", password = "${hashed}", image = "${filename}", skills = '${JSON.stringify(skill)}' WHERE id = ${user_id}`;
            db.query(query, function(error, data) {
                if (error) console.log(error);
                res.redirect('/profile');
            })
        }
    }

    static settingauth = async(req, res) => {
        var data = qs.stringify({
            'grant_type': 'authorization_code',
            'code': '9ABlGK4JTgizqnY5EiAmuA',
            'client_id': '51adab80-6ff7-4e0a-8b59-9bb84b3f4316',
            'client_secret': 'bdb314aef3e963834abead317ff5758f42cbd6c212ed7e32492038b54f2e1f4eb6ed85f00a4b1edb5d2e51f744b6bcb05cc1ee4eb9c5c83f7bc27e023ad0c4a6',
            'redirect_uri': 'http://ec2-34-205-63-120.compute-1.amazonaws.com:8000/auth'
        });
        var config = {
            method: 'post',
            url: 'https://accounts.freelancer.com/oauth/token',
            headers: {
                'content-type': 'application/x-www-form-urlencoded'
            },
            data: data
        };

        var next_month = addMonths(new Date(), 1);
        var authenticattion_end = ((next_month.getFullYear() + '-' + ((next_month.getMonth() > 8) ? (next_month.getMonth() + 1) : ('0' + (next_month.getMonth() + 1))) + '-' + ((next_month.getDate() > 9) ? next_month.getDate() : ('0' + next_month.getDate()))));

        axios(config).then(function(response) {
            var response = JSON.stringify(response.data)
            const query =
                `INSERT INTO authenticattion 
                (data,authenticattion_end,user_id) 
                VALUES ('${response}', '${authenticattion_end}')
                `;
            db.query(query, function(error, data) {
                if (error) throw error;
            })
        }).catch(function(error) {
            console.log(error.response.data);
        });
    }
}

module.exports = {
    LoginController
}