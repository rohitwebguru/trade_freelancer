const jwt = require('jsonwebtoken');
const db = require("../routes/db-config");
const axios = require('axios');
const qs = require('qs');

const LoggedIn = (res, req, next) => {

    if (!req.req.cookies.userRegistered) return next();
    try {
        const decode = jwt.verify(req.req.cookies.userRegistered, process.env.JWT_SECRET);
        db.query('Select * FROM users WHERE id = ?', [decode.id], async(err, result) => {
            if (err) return next();
            req.user = result[0];
            return next();
        })
    } catch (err) {
        if (err) return next()
    }
}

const TotalProjects = (res, req, next) => {

    if (!req.req.cookies.userRegistered) return next();
    try {
        let data;
        db.query("Select * from localjob_project", async(err, result) => {
            if (err) {
                throw err;
            } else {
                data = result;

            }
        })
        db.query("Select * from projects", async(err, result) => {
            if (err) {
                throw err;
            } else {
                req.totalprojects = data.concat(result).length;
                finalproject = data.concat(result);
                req.project = finalproject[finalproject.length - 1].created_at;
                return next();
            }
        })
    } catch (err) {
        if (err) return next()
    }
}

const TotalClients = (res, req, next) => {

    if (!req.req.cookies.userRegistered) return next();
    try {
        let data;
        db.query("Select * from users Where role_id = 2", async(err, result) => {
            if (err) {
                throw err;
            } else {
                req.totalclients = result.length;
                req.clients = result[result.length - 1].created_at;
                return next();
            }
        })
    } catch (err) {
        if (err) return next()
    }
}

const TotalFreelancers = (res, req, next) => {

    if (!req.req.cookies.userRegistered) return next();
    try {
        let data;
        db.query("Select * from users Where role_id = 3", async(err, result) => {
            if (err) {
                throw err;
            } else {
                req.totalfreelancers = result.length;
                req.freelancer = result[result.length - 1].created_at;
                return next();
            }
        })
    } catch (err) {
        if (err) return next()
    }
}

const TotalApprovalPosts = (res, req, next) => {
    if (!req.req.cookies.userRegistered) return next();
    try {
        var count_per_page = 10;
        let next_offset;
        if (res.query.page != undefined && res.query.page != 1) {
            next_offset = (res.query.page -1) * count_per_page;
        }else{
            next_offset = 0;
        }
        db.query(`Select project_approval.*, users.username from project_approval left join users on (project_approval.team_member_id=users.id) where status = 0 and project_approval.leader_id = ${req.user.id}`, async(err, result) => {
            if (err) {
                throw err;
            } else {
                db.query(`Select project_approval.*, users.username from project_approval left join users on (project_approval.team_member_id=users.id) where status = 0 and project_approval.leader_id = ${req.user.id} Order by id desc LIMIT ${count_per_page} OFFSET ${next_offset}`, async(err, result2) => {
                    if (err) { throw err; } else {
                        req.project_approval = result2;
                    }
                    req.project_approval_length2 = Math.ceil(result.length / count_per_page);
                    req.project_approval_length = result.length;
                    return next();
                })
            }
        })
    } catch (err) {
        if (err) return next()
    }
}

const Authenticattion = (res, req, next) => {
    try {
        const date_ob = new Date();
        const day = ("0" + date_ob.getDate()).slice(-2);
        const month = ("0" + (date_ob.getMonth() + 1)).slice(-2);
        const year = date_ob.getFullYear();
        const current_date = Date.parse(year + "-" + month + "-" + day);
        db.query(`SELECT * FROM authenticattion Where user_id = ${res.res.user.id} Order by id desc LIMIT 1`, function(err, result, fields) {
            if (err) throw err;
            if (typeof result !== 'undefined' && result.length === 1) {
                const data = JSON.parse(result[0].data);
                const authenticattion_end = Date.parse(result[0].authenticattion_end);
                if (current_date > authenticattion_end) {
                    console.log('token is expired');
                    req.isAuthenticattion = 0;
                    req.authenticattion = '';
                    req.authenticattion_end = '';
                } else {
                    console.log('token is not expired');
                    req.isAuthenticattion = 1;
                    req.authenticattion = data;
                    req.authenticattion_end = result[0].authenticattion_end.toDateString();
                }
                return next()
            }
        });
    } catch (err) {
        if (err) return next()
    }
}

const AuthenticattionJob = (res, req, next) => {
    try {
        const date_ob = new Date();
        const day = ("0" + date_ob.getDate()).slice(-2);
        const month = ("0" + (date_ob.getMonth() + 1)).slice(-2);
        const year = date_ob.getFullYear();
        const current_date = Date.parse(year + "-" + month + "-" + day);
        db.query("SELECT * FROM authenticattion Order by id desc LIMIT 1", function(err, result, fields) {
            if (err) throw err;
            if (typeof result !== 'undefined' && result.length === 1) {
                const data = JSON.parse(result[0].data);
                if (data.access_token != undefined) {
                    var config = {
                        method: 'get',
                        url: 'https://www.freelancer.com/api/projects/0.1/jobs/',
                        headers: {
                            'freelancer-oauth-v1': data.access_token
                        }
                    };

                    axios(config).then(function(response) {
                        req.jobs = JSON.stringify(response.data);
                        db.query("SELECT * FROM jobs", function(err, result, fields) {
                            if (err) throw err;
                            if (typeof result !== 'undefined') {

                                // const query = `UPDATE jobs SET data =('${req.jobs}')`;
                                // db.query(query, function(error, data) {
                                //     if (error) throw error;
                                // })
                                return next()
                            } else {
                                const query = `INSERT INTO jobs (data) VALUES ('${req.jobs}')`;
                                db.query(query, function(error, data) {
                                    if (error) throw error;
                                })
                                return next()
                            }
                        })
                    }).catch(function(error) {
                        if (err) return next()
                        console.log(error);
                        req.jobs = "";
                    });
                }
            }
        });
    } catch (err) {
        if (err) return next()
    }
}



const AuthenticattionCurrency = (res, req, next) => {
    try {
        const date_ob = new Date();
        const day = ("0" + date_ob.getDate()).slice(-2);
        const month = ("0" + (date_ob.getMonth() + 1)).slice(-2);
        const year = date_ob.getFullYear();
        const current_date = Date.parse(year + "-" + month + "-" + day);
        db.query("SELECT * FROM authenticattion Order by id desc LIMIT 1", function(err, result, fields) {
            if (err) throw err;
            if (typeof result !== 'undefined' && result.length === 1) {
                const data = JSON.parse(result[0].data);
                if (data.access_token != undefined) {
                    var config = {
                        method: 'get',
                        url: 'https://www.freelancer-sandbox.com/api/projects/0.1/currencies/',
                        headers: {
                            'freelancer-oauth-v1': data.access_token
                        }
                    };
                    axios(config).then(function(response) {
                        req.currency = JSON.stringify(response.data);
                        db.query("SELECT * FROM currency Order by id desc LIMIT 1", function(err, result, fields) {
                            if (err) throw err;
                            if (typeof result !== 'undefined' && result.length === 1) {
                                // const query = `UPDATE currency SET data =('${req.currency}')`;
                                // db.query(query, function(error, data) {
                                //     if (error) throw error;
                                // })
                                return next()
                            } else {
                                const query = `INSERT INTO currency (data)  VALUES ('${req.currency}')`;
                                db.query(query, function(error, data) {
                                    if (error) throw error;
                                })
                                return next()
                            }

                        });

                    }).catch(function(error) {
                        req.currency = "";
                    });
                    //return next()
                }
            }
        });
    } catch (err) {
        if (err) return next()
    }
}

const AuthenticattionFreelancerList = (res, req, next) => {
    try {
        if(req.user.is_member == 1){
            db.query(`SELECT * FROM project_approval Where team_member_id = ${req.user.id}`, async(err, result) => {
                if (err) {
                    throw err;
                } else {
                    req.result = result;
                    return next();
                }
            })
        }else{
            db.query(`SELECT * FROM localjob_project where posted_by = ${req.user.id} Order by id desc`, async(err, result) => {
                console.log(result);
                if (err) {
                    throw err;
                } else {
                    req.result = result;
                    return next();
                }
            })
        }
    } catch (err) {
        if (err) return next()
    }
}

const getAllTeamMembers = (req, res, next) => {
    try {
        db.query(`select users.*, team.* from users, team where team.team_leader_id=${req.res.user.id} and team.member_id = users.id`, async(err, result) => {
            if (err) {
                throw err;
            } else {
                res.getAllTeamMembers = result;
                return next();
            }
        })
    } catch (err) {
        if (err) return next()
    }
}

const AuthenticattionFreelancerHireList = (req, res, next) => {
    try {
        db.query("Select * from freelancer_jobs order by id ASC", async(err, resultlisthire) => {
            if (err) {
                throw err;
            } else {
                req.resultlisthire = resultlisthire;
                return next();
            }
        })

    } catch (err) {
        if (err) return next()
    }
}

const getAllPendingOperationsForFreelancerManager = (req, res, next) => {
    try {
        db.query(`Select users.*, proposal_pending.* from proposal_pending,users where proposal_pending.team_leader_id = '${res.user.id}' and users.id=proposal_pending.member_id and proposal_pending.status = 0 order by proposal_id DESC`, async(err, pendingProposalList) => {
            if (err) {
                throw err;
            } else {
                req.pendingProposalList = pendingProposalList;
                return next();
            }
        })

    } catch (err) {
        if (err) return next()
    }
}

const listAllCountries = (req, res, next) => {
    var config = {
        method: 'get',
        url: 'https://www.freelancer.com/api/common/0.1/countries',
        headers: {
            'freelancer-oauth-v1': 'JyO3ZwaVjpgxICNwDuOC5Vl7vskdFR'
        }
    };

    axios(config)
        .then(function(response) {
            req.countries = response.data.result.countries;
            return next()
        })
        .catch(function(error) {
            req.countries = [];
            return next()
        });
}

const getBiddingnotifications = (req, res, next) => {
    if (res.user != undefined && res.user.is_member == 1) {
        db.query(`select * from proposal_pending where notify_status = 0 `, async(err, result) => {
            if (err) { throw err } else {
                if (result.length > 0) {
                    req.biddingNotifications = result
                    db.query("update proposal_pending set notify_status = 1", async(err, resu) => {
                        return next()
                    })
                } else {
                    req.biddingNotifications = null
                    return next()
                }
            }
        })
    } else {
        req.biddingNotifications = null
        return next()
    }
}

const getProjectnotifications = (req, res, next) => {
    if (res.user != undefined && res.user.is_member == 1) {
        db.query(`Select * from project_approval Where team_member_id = ${res.user.id} and status != 0 and notify_status = 0`, async(err, result) => {
            if (err) { throw err } else {
                if (result.length > 0) {
                    req.ProjectNotifications = result
                    db.query("update project_approval set notify_status = 1", async(err, resu) => {
                        return next()
                    })
                } else {
                    req.ProjectNotifications = null
                    return next()
                }
            }
        })
    } else {
        req.ProjectNotifications = null
        return next()
    }
}

const getCompleteUser = (req, res, next) => {
    if (res.user != undefined && res.user.is_member != 1) {
    //    console.log(req.res.authenticattion.access_token);
        var config = {
            method: 'get',
            url: 'https://www.freelancer.com/api/users/0.1/self',
            headers: {
                'freelancer-oauth-v1': req.res.authenticattion.access_token
            }
        };

        axios(config)
            .then(function(response) {
                if(response.data.status === 'success'){
                    db.query(`update users set owner_id='${response.data.result.id}' where id='${res.user.id}'`, async(err, resu)=>{
                        if(err){
                            console.log(err)
                        }
                    })
                }
                return next()
            })
            .catch(function(error) {
                console.log(error)
                return next()
            });
        return false;
    } else {
        req.ProjectNotifications = null
        return next()
    }
}

const getAwardBidnotifications = (req, res, next) => {
    if (res.user != undefined && res.user.is_member != 1) {
        db.query(`select * from bid_award where awarded_whom='${res.user.owner_id}' and award_status=0 and notify_status = 0`, async(err, result) => {
            if (err) { throw err } else {
                if (result.length > 0) {
                    req.AwardBidNotifications = result
                    // db.query("update bid_award set notify_status = 1", async(err, resu) => {
                        return next()
                    // })
// return false;
                } else {
                    req.AwardBidNotifications = null
                    return next()
                }
            }
        })
    } else {
        req.AwardBidNotifications = null
        return next()
    }
}


const getTeamName = (req, res, next) => {
    if (res.user.is_member == 1) {
        db.query(`select users.*, team.* from users, team where team.member_id = ${res.user.id} and team.team_leader_id = users.id`, async(err, data) => {
            if (err) {
                req.name = null;
                return next()
            } else {
                req.name = data[0].username;
                return next()
            }
        })
    } else {
        req.name = null;
        return next()
    }
}

const listAllHiredFreelancers = (req, res, next) => {
    db.query(`SELECT localjob_project.*, freelancer_jobs.* from localjob_project, freelancer_jobs where localjob_project.posted_by=${res.user.id} and freelancer_jobs.project_id = localjob_project.id`, async(err, result) => {
        if (err) {
            throw err;
        } else {
            if (result.length > 0) {
                var condition = "";
                var bidder_id = [];
                result.forEach((val, i) => {
                    bidder_id.push(val.bidder_id);
                    if (i == result.length - 1) {
                        condition += `users[]=${val.bidder_id}`;
                    } else {
                        condition += `&users[]=${val.bidder_id}`;
                    }
                })
                var config = {
                    method: 'get',
                    url: `https://www.freelancer.com/api/users/0.1/users?${condition}`,
                    headers: {
                        'freelancer-auth-v2': '64177304;DaSK659EJfHMH7fDoi81iKJ1yPPIn4cWdIv6s1ndT1c='
                    }
                };

                axios(config)
                    .then(function(response) {
                        req.freelancers = response.data.result.users;
                        return next()
                    })
                    .catch(function(error) {
                        return next()
                    });
            }
        }
    })
}

module.exports = {
    LoggedIn,
    TotalProjects,
    TotalClients,
    TotalFreelancers,
    TotalApprovalPosts,
    Authenticattion,
    AuthenticattionJob,
    AuthenticattionCurrency,
    AuthenticattionFreelancerList,
    AuthenticattionFreelancerHireList,
    listAllCountries,
    listAllHiredFreelancers,
    getAllTeamMembers,
    getBiddingnotifications,
    getProjectnotifications,
    getAllPendingOperationsForFreelancerManager,
    getTeamName,
    getAwardBidnotifications,
    getCompleteUser
}