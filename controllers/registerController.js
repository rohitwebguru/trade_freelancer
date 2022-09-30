const jwt = require('jsonwebtoken');
const db = require("../routes/db-config");
const bcrypt = require('bcryptjs');
const axios = require('axios');
const qs = require('qs');

class RegisterController {
    static register = async(req, res) => {
        const { username, email, password, token, cpassword, role_id } = req.body;
        if (!role_id || !username || !email || !password || !cpassword) {
            return res.json({ status: "error", error: "please enter all required credentials" });
        } else {
            db.query("select * from users where email = ? OR username = ?", [email, username], async(err, result) => {
                if (err) throw err;
                if (result.length >= 1) {
                    res.json({ status: "error", error: "user with this email already exists" });
                } else {
                    let hashpassword = await bcrypt.hash(password, 8);
                    const obj = {
                        "username": username,
                        "email": email,
                        "password": hashpassword,
                        "role_id": role_id,
                    }

                    db.query("insert into users set ?", obj, async(err, data) => {
                        if (err) {
                            console.log(err);
                        } else {
                            if(token){
                                return res.json({ status: 'status', success: 'User Has been Registered Successfully', redirect: `/login/${token}` })
                            }else{
                                return res.json({ status: 'status', success: 'User Has been Registered Successfully', redirect: `/` })
                            }
                        }
                    })

                }
            })
        }
    }

    static checkusername = async(req, res) => {
        const { info } = req.body;
        db.query(`select * from users where username = ?`, [info], async(err, result) => {
            if (err) throw err;
            if (result.length > 0) {
                res.json({ status: "success", error: "username already exists" });
            } else {
                res.json({ status: "success", error: "username available" });
            }
        })
    }

}

module.exports = {
    RegisterController
}