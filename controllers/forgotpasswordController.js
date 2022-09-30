var randtoken = require('rand-token');
var jwt = require('jsonwebtoken');
const db = require("../routes/db-config");
const axios = require('axios');
var nodemailer = require('nodemailer');
const qs = require('qs');
const bcrypt = require('bcryptjs');

function sendEmail(email, token) {
    var email = email;
    var token = token;
    var mail = nodemailer.createTransport({
        host: 'smtp.gmail.com',
        port: 587,
        secure: false,
        auth: {
            user: 'develop.kvell@gmail.com', // Your email id
            pass: 'hxfwdysnmirbxvmy' // Your password
        }
    });
    var mailOptions = {
        from: mail.options.auth.user,
        to: email,
        subject: 'Reset Password Link - Freelancer Marketing',
        html   : '<p>You requested for reset password, kindly use this <a href="http://localhost:8000/reset-password/' + token + '">link</a> to reset your password</p>'
    }
    mail.sendMail(mailOptions, function(error, info) {
        if (error) {
            console.log('1');
        } else {
            console.log(0)
        }
    });
}

function passwordUpdated(email) {
    var email = email;
    var mail = nodemailer.createTransport({
        host: 'smtp.gmail.com',
        port: 587,
        secure: false,
        auth: {
            user: 'develop.kvell@gmail.com', // Your email id
            pass: 'hxfwdysnmirbxvmy' // Your password
        }
    });
    var mailOptions = {
        from    : mail.options.auth.user,
        to      : email,
        subject : 'Password Updated Successfully! - Freelancer Marketing',
        html    : '<p>Your password has been updated successfully</p>'
    }
    mail.sendMail(mailOptions, function(error, info) {
        if (error) {
            console.log('1');
        } else {
            console.log(0)
        }
    });
}


class ForgotPasswordController {
    static forgot_password = async(req, res) => {
        const { email } = req.body;
        if (!email) {
            return res.json({ status: "error", error: "please enter email required credentials" });
        } else {
             db.query("select * from users where email = ?",[email], async(err, result) => {
                if (err) throw err;
                if (result.length == 0) {
                    return res.json({ status: "error", error: "This email doesn't exists" });
                } else {
                    const secret = randtoken.generate(20) + result[0].password;
                    const payload = {
                        email: result[0].email,
                        id: result[0].id
                    }
                    const token = jwt.sign(payload,secret,{expiresIn:'1m'});
                    const link = `http://localhost:8000/reset-password/${token}`;
                    const obj = {
                        "email": email,
                        "token": token
                    }
                    db.query("INSERT into password_reset set ?", obj, async(err, data) => {
                        if (err) {
                            console.log(err);
                        } else {
                            var sent = sendEmail(email, token);
                            if (sent != '0') {
                                var data = {
                                    email: email,
                                    token: token
                                }
                            }
                            return res.send({ status: 'status', success: 'Your password link has been sent to your email', redirect: '/' })
                        }
                    })

                }
            })
        }
    }

    static reset_password = async(req, res) => {
        const { email, token, password } = req.body;

        if (!email || !token || !password) {
            return res.json({ status: "error", error: "please enter all required credentials" });
        }else{
            db.query("select * from password_reset where email = ? AND token = ? Order By created_at DESC Limit 1",[email,token], async(err, result) => {
                if (err) throw err;
                if (result.length == 1) {
                    let hashpassword = await bcrypt.hash(password, 8);
                    const obj = {
                        "password": hashpassword
                    }
                    db.query("update users set ?", obj, async(err, data) => {
                        if (err) {
                            console.log(err);
                        } else {
                            console.log(data);
                            passwordUpdated(email);
                            return res.json({ status: 'status', success: 'User Has been Updated Successfully', redirect: '/' })
                        }
                    })
                }
            })
        }
    }

}

module.exports = {
    ForgotPasswordController
}