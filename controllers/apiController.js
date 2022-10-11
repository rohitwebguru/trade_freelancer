const axios = require('axios');
const { json, response } = require('express');
const db = require("../routes/db-config");
const qs = require('qs');
var SqlString = require('sqlstring');
const e = require('connect-flash');
const bcrypt = require('bcryptjs');
const { TokenExpiredError } = require('jsonwebtoken');
var randtoken = require('rand-token');
var jwt = require('jsonwebtoken');
var nodemailer = require('nodemailer');
const { LogarithmicScale } = require('chart.js');
class ApiController {
    static managingproject = async(req, res) => {
        const { access_token, input_currency, input_title, skill_fixed, input_budget_min, input_budget_max, input_description } = req.body;
        const filter_site_project = req.body.filter_site_project;
        var arrayskills = [];
        if (!Array.isArray(skill_fixed)) {
            arrayskills.push({ "id": parseInt(skill_fixed) });
        } else {
            skill_fixed.forEach(function(info, iindex) {
                var objskills = {};
                objskills.id = parseInt(info);
                arrayskills.push(objskills);
            })
        }
        var jobs = JSON.stringify(arrayskills);
        // return;
        var data = "";
        if (res.user.is_member == 1) {
            db.query(`select * from team where member_id = '${res.user.id}' LIMIT 1`, async(err, resu) => {
                if (err) {
                    throw err;
                } else {
                    if (resu.length != 0 || resu.length > 0) {
                        var team_leader_id = resu[0].team_leader_id;
                        if (access_token != undefined && filter_site_project == "fixed") {
                            data = {
                                "title": input_title,
                                "leader_id": team_leader_id,
                                "team_member_id": res.user.id,
                                "description": input_description,
                                "currency": JSON.stringify({
                                    "id": parseInt(input_currency)
                                }),
                                "jobs": jobs,
                                "type": "fixed",
                                "budget": JSON.stringify({
                                    "minimum": parseInt(input_budget_min),
                                    "maximum": parseInt(input_budget_max)
                                }),
                                "hourly_project_info": null
                            };
                            db.query('INSERT INTO project_approval SET ?', data, async(Err, result) => {
                                if (Err) {
                                    throw Err;
                                } else {
                                    res.redirect('/dashboard');
                                }
                            });
                        } else {
                            var hours = req.body.hoursPerWeek;
                            var data = [
                                `${input_title}`,
                                `${team_leader_id}`,
                                `${res.user.id}`,
                                `${input_description}`,
                                `${JSON.stringify({
                                    "id": parseInt(input_currency)
                                })}`,
                                `${jobs}`,
                                `hourly`,
                                `${JSON.stringify({
                                    "minimum": parseInt(input_budget_min),
                                    "maximum": parseInt(input_budget_max)
                                })}`,
                                `${JSON.stringify({
                                    "commitment": {
                                        "hours": parseInt(hours),
                                        "interval": "WEEK"
                                    }
                                })}`,
                            ];
                            db.query("INSERT INTO project_approval (title,leader_id,team_member_id,description,currency,jobs,type,budget,hourly_project_info) values (?,?,?,?,?,?,?,?,?)", data, async(error, resu) => {
                                res.redirect('/dashboard');
                            })
                        }

                    }
                }
            })
        } else {
            if (access_token != undefined && filter_site_project == "fixed") {
                data = JSON.stringify({
                    "title": input_title,
                    "description": input_description,
                    "currency": {
                        "id": parseInt(input_currency)
                    },
                    "budget": {
                        "minimum": parseInt(input_budget_min),
                        "maximum": parseInt(input_budget_max)
                    },
                    "jobs": arrayskills
                });

            } else {
                var hours = req.body.hoursPerWeek;
                // if (hours > 100) {
                //     res.render('addproject', { 'result': { 'msg': "number of hours should not be greater than 100" } });
                //     return;
                // }
                data = JSON.stringify({
                    "title": input_title,
                    "description": input_description,
                    "currency": {
                        "id": parseInt(input_currency)
                    },
                    "budget": {
                        "minimum": parseInt(input_budget_min),
                        "maximum": parseInt(input_budget_max)
                    },
                    "jobs": arrayskills,
                    "type": "HOURLY",
                    "hourly_project_info": {
                        "commitment": {
                            "hours": parseInt(hours),
                            "interval": "WEEK"
                        }
                    }
                });
            }
            var config = {
                method: 'post',
                url: 'https://www.freelancer.com/api/projects/0.1/projects/',
                headers: {
                    'freelancer-oauth-v1': access_token,//"64177304;0FgM2taKR8avz4fRx0aieNgYbjvNwUhipGkzjPOOQL4=",
                    'content-type': 'application/json'
                },
                data: data
            };

            axios(config).then(function(response) {
                const info = {
                    "id": response.data.result.id,
                    "owner_id": response.data.result.owner_id,
                    "posted_by": res.user.id,
                    "title": response.data.result.title,
                    "seo_url": response.data.result.seo_url,
                    "currency": JSON.stringify(response.data.result.currency),
                    "description": response.data.result.description,
                    "jobs": JSON.stringify(response.data.result.jobs),
                    "type": filter_site_project,
                    "live": 1,
                    "budget": JSON.stringify(response.data.result.budget),
                    "upgrades": JSON.stringify(response.data.result.upgrades),
                    "language": JSON.stringify(response.data.result.language),
                    "local": JSON.stringify(response.data.result.local),
                    "pool_ids": JSON.stringify(response.data.result.pool_ids),
                    "is_escrow_project": JSON.stringify(response.data.result.is_escrow_project),
                }
                db.query('INSERT INTO localjob_project SET ?', info, async(Err, result) => {
                    if (Err) {
                        throw Err;
                    }
                });
            }).catch(function(error) {
                console.log(error);
            });
            res.redirect('/creatingproject');
        }

    }

    static localJob = async(req, res) => {
        const { access_token, input_currency, title, minbudget, maxbudget, description, country, state, lat, lon } = req.body;
        var arr = req.body.skill;

        var arrayskills = [];
        if (!Array.isArray(arr)) {
            arrayskills.push({ "id": parseInt(arr) });
        } else {
            arr.forEach(function(info, iindex) {
                var objskills = {};
                objskills.id = parseInt(info);
                arrayskills.push(objskills);
            })
        }
        if (res.user.is_member == 1) {
            db.query(`select * from team where member_id = '${res.user.id}' LIMIT 1`, async(err, resu) => {
                if (err) {
                    throw err;
                } else {
                    if (resu.length != 0 || resu.length > 0) {
                        var team_leader_id = resu[0].team_leader_id;
                        const data = {
                            "title": title,
                            "leader_id": team_leader_id,
                            "team_member_id": res.user.id,
                            "description": description,
                            "currency": JSON.stringify({
                                "id": parseInt(input_currency)
                            }),
                            "budget": JSON.stringify({
                                "minimum": parseInt(minbudget),
                                "maximum": parseInt(maxbudget)
                            }),
                            "type": "local",
                            "location": JSON.stringify({
                                "city": state,
                                "country": {
                                    "name": country
                                },
                                "latitude": parseFloat(lat),
                                "longitude": parseFloat(lon)
                            })
                        };

                        data.jobs = JSON.stringify(arrayskills);
                        db.query('INSERT INTO project_approval SET ?', data, async(Err, result) => {
                            if (Err) {
                                throw Err;
                            } else {
                                res.redirect('/dashboard');
                            }
                        });
                    }
                }
            })
        } else {
            var data = JSON.stringify({
                "title": title,
                "description": description,
                "currency": {
                    "id": parseInt(input_currency)
                },
                "budget": {
                    "minimum": parseInt(minbudget),
                    "maximum": parseInt(maxbudget)
                },
                "jobs": arrayskills,
                "location": {
                    "city": state,
                    "country": {
                        "name": country
                    },
                    "latitude": parseFloat(lat),
                    "longitude": parseFloat(lon)
                }
            });

            var config = {
                method: 'post',
                url: 'https://www.freelancer.com/api/projects/0.1/projects/?compact=',
                headers: {
                    'freelancer-oauth-v1': access_token,//"64177304;0FgM2taKR8avz4fRx0aieNgYbjvNwUhipGkzjPOOQL4=",
                    'content-type': 'application/json'
                },
                data: data
            };

            axios(config)
                .then(function(response) {
                    response.data.result.type = "local";
                    response.data.result.live = 1;
                    response.data.result.currency = JSON.stringify(response.data.result.currency);
                    response.data.result.jobs = JSON.stringify(response.data.result.jobs);
                    response.data.result.budget = JSON.stringify(response.data.result.budget);
                    response.data.result.posted_by = res.user.id,
                        response.data.result.upgrades = JSON.stringify(response.data.result.upgrades);
                    if (res.user.is_member == 1) {
                        db.query('INSERT INTO project_approval SET ?', response.data.result, async(Err, result) => {
                            if (Err) {
                                throw Err;
                            } else {
                                res.redirect('/managingproject');
                            }
                        });
                    } else {
                        db.query('INSERT INTO localjob_project SET ?', response.data.result, async(Err, result) => {
                            if (Err) {
                                throw Err;
                            } else {
                                res.redirect('/managingproject');
                            }
                        });
                    }
                })
                .catch(function(error) {
                    console.log(error);
                });
        }
    }

    static hiremeproject = async(req, res) => {
        const { input_currency, input_hireme_title, minbudget, maxbudget, input_hireme_description, bidder_id, filter_hireme_site_project, input_bidder_amount, input_bidder_period } = req.body;
        var hireme = filter_hireme_site_project.split("-");
        hireme = (hireme[1] === 'true');
        var skill_fixed = req.body.skill_fixed;
        var arrayskills = [];
        if (!Array.isArray(skill_fixed)) {
            arrayskills.push({ "id": parseInt(skill_fixed) });
        } else {
            skill_fixed.forEach(function(info, iindex) {
                var objskills = {};
                objskills.id = parseInt(info);
                arrayskills.push(objskills);
            })
        }

        var data = JSON.stringify({
            "title": input_hireme_title,
            "description": input_hireme_description,
            "currency": {
                "id": parseInt(input_currency)
            },
            "budget": {
                "minimum": parseInt(minbudget),
                "maximum": parseInt(maxbudget)
            },
            "jobs": arrayskills,
            "hireme": hireme,
            "hireme_initial_bid": {
                "bidder_id": parseInt(bidder_id),
                "amount": parseInt(input_bidder_amount),
                "period": parseInt(input_bidder_period)
            }
        });
        var config = {
            method: 'post',
            url: 'https://www.freelancer.com/api/projects/0.1/projects/?compact=',
            headers: {
                'freelancer-auth-v2': "64177304;DaSK659EJfHMH7fDoi81iKJ1yPPIn4cWdIv6s1ndT1c=",
                'content-type': 'application/json'
            },
            data: data
        };

        axios(config)
            .then(function(response) {
                var obj = {
                    "id": response.data.result.id,
                    "owner_id": response.data.result.owner_id,
                    "posted_by": res.user.id,
                    "title": response.data.result.title,
                    "seo_url": response.data.result.seo_url,
                    "currency": JSON.stringify(response.data.result.currency),
                    "description": response.data.result.description,
                    "jobs": JSON.stringify(response.data.result.jobs),
                    "type": "hireme",
                    "hireme_initial_bid": JSON.stringify(response.data.result.hireme_initial_bid),
                    "live": "1",
                    "budget": JSON.stringify(response.data.result.budget),
                    "upgrades": JSON.stringify(response.data.result.upgrades),
                    "language": response.data.result.language,
                    "local": response.data.result.local,
                    "pool_ids": JSON.stringify(response.data.result.pool_ids),
                    "is_escrow_project": response.data.result.is_escrow_project
                }
                db.query('INSERT INTO localjob_project SET ?', obj, async(Err, result) => {
                    if (Err) {
                        throw Err;
                    } else {
                        res.redirect('/managingproject');
                    }
                });
            })
            .catch(function(error) {
                console.log(error);
            });
    }

    static createaBidding = async(req, res) => {
        const { project_id, bid_amount, numberOfDays, proposal } = req.body;
        if (res.user != undefined && res.user.is_member == 1) {
            db.query(`select * from team where member_id = '${res.user.id}'`, async(err, result) => {
                if (err) { throw err; } else {
                    if (result.length != 0 && result.length > 0) {
                        var data = [
                            `${result[0].team_leader_id}`,
                            `${res.user.id}`,
                            `${parseInt(project_id)}`,
                            `64215283`,
                            `${parseFloat(bid_amount)}`,
                            `${parseInt(numberOfDays)}`,
                            `20`,
                            `${proposal}`,
                            "0",
                        ];
                        db.query("insert into proposal_pending (team_leader_id,member_id,project_id,bidder_id,amount,period,milestone_percentage,description,status) values (?,?,?,?,?,?,?,?,?)", data, async(error, resu) => {
                            if (error) { throw error } else {
                                res.json({ 'status': 'success', "msg": "your proposal is sent to team leader for approval" });
                            }
                        })
                    }
                }
            })
        } else {
            var data = JSON.stringify({
                "project_id": parseInt(project_id),
                "bidder_id": 64215283,
                "amount": parseFloat(bid_amount),
                "period": parseInt(numberOfDays),
                "milestone_percentage": 20,
                "description": proposal
            });

            var config = {
                method: 'post',
                url: 'https://www.freelancer.com/api/projects/0.1/bids/?compact=true&new_errors=true&new_pools=true',
                headers: {
                    'freelancer-auth-v2': '64215283;IZDoMVKfZYkx5epDXt7QDV+O9iYXm9CBWGX7IOhKc78=',
                    'Content-Type': 'application/json'
                },
                data: data
            };

            axios(config)
                .then(function(response) {
                    console.log(JSON.stringify(response.data));
                    res.json({ 'status': 'success', "msg": "you have successfully made a bid on this project" });
                })
                .catch(function(error) {
                    res.json({ 'status': 'error', "msg": error.response.data.message });
                });
        }
    }

    static myproposals = async(req, res) => {
        var config = {
            method: 'get',
            url: 'https://www.freelancer.com/api/projects/0.1/bids?bidders[]=64177304&user_details=tue&project_details=true&frontend_bid_statuses[]=active',
            headers: {
                'freelancer-auth-v2': '64177304;nr1P7b1E7KYzIC2/VkXpNnXAIZOvoHJzuLcuZwQcQ5U='
            }
        };

        axios(config)
            .then(function(response) {
                res.render("myproposals", { status: 'loggedIn', user: res.user, layout: './layouts/myproposals', "bids": response.data.result.bids, "users": response.data.result.users, "projects": response.data.result.projects });
            })
            .catch(function(error) {
                console.log(error);
            });
    }

    static mybids = async(req, res) => {
        var config = {
            method: 'get',
            url: 'https://www.freelancer.com/api/projects/0.1/projects/?bidders[]=63514799',
            headers: {
                'freelancer-auth-v2': '63514799;HrEz7r580VBM7DShq6rh6ZhuE10uVpbuk8ydtMGrDo0=', //'64177304;nr1P7b1E7KYzIC2/VkXpNnXAIZOvoHJzuLcuZwQcQ5U='
            }
        };

        axios(config).then(function(response) {
            var config = {
                method: 'get',
                url: 'https://www.freelancer.com/ajax-api/manage/bids.php?limit=100&type=active&filter=All&query=&compact=true&new_errors=true&new_pools=true',
                headers: {
                    'freelancer-auth-v2': '63514799;HrEz7r580VBM7DShq6rh6ZhuE10uVpbuk8ydtMGrDo0=', //'63514799;HrEz7r580VBM7DShq6rh6ZhuE10uVpbuk8ydtMGrDo0='
                }
            };

            let invitationresults;
            axios(config).then(function(result) {
                db.query("Select i.*,u.username from invite_freelancer i LEFT JOIN users u ON (i.invited_by = u.id) where i.freelancer_id=63514799 order by i.invite_id desc", async(err, dbresult) => {
                    if (err) {
                        res.render("mybids", { status: 'loggedIn', user: res.user, layout: './layouts/mybids', bid_status: response.data.status, bid_projects: response.data.result.projects, active_bid_status: result.data.status, active_bid_result: result.data.result, invitationdata: '' });
                    } else {
                        invitationresults = dbresult;
                        res.render("mybids", { status: 'loggedIn', user: res.user, layout: './layouts/mybids', bid_status: response.data.status, bid_projects: response.data.result.projects, active_bid_status: result.data.status, active_bid_result: result.data.result, invitationdata: invitationresults });
                    }
                })
            }).catch(function(error) {
                console.log(error);
            });
        }).catch(function(error) {
            console.log(error);
        });
    }

    static showManageProjectData = async(req, res) => {
        let data;
        db.query(`Select * from localjob_project where live=1 and posted_by='${res.user.id}'`, async(err, result) => {
            if (err) {
                throw err;
            } else {
                if(result.length > 0 ){
                    var config = {
                        method: 'get',
                        url: `https://www.freelancer.com/api/projects/0.1/projects?owners[]=${result[0].owner_id}&selected_bids=true`,
                        headers: {}
                    };
                    axios(config)
                        .then(function(response) {
                            data = response.data.result.projects;
                            res.render("managingproject", { status: 'loggedIn', user: res.user, layout: './layouts/managingproject', "result": data });
                        })
                        .catch(function(error) {
                            console.log(error);
                        });
                }else{
                    res.render("managingproject", { status: 'loggedIn', user: res.user, layout: './layouts/managingproject', "result": [] });
                }
            }
        })
    }
    static showSavedFreelancers = async(req, res) => {
        let userid = res.user.id;
        let saveddata;
        db.query(`Select * from saved_freelancer Where client_id = ${userid} AND action = 1 order by save_id desc`, async(err, result) => {
            if (err) {
                console.log(err);
            } else {
                saveddata = result;
                var condition = '';
                result.forEach((obj, i) => {
                    if (i == result.length - 1) {
                        condition += `users[]=${obj.freelancer_id}`;
                    } else {
                        condition += `users[]=${obj.freelancer_id}&`;
                    }
                });
                var config = {
                    method: 'get',
                    url: `https://www.freelancer.com/api/users/0.1/users?${condition}&avatar=true`,
                    headers: {
                        'freelancer-auth-v2': '64177304;xq6xGDB5iNSmIcVMP+hCN7SSxbpXASLLnGN9Sy5cCH0='
                    }
                };
                var savedprojects = '';
                axios(config).then(function(response) {
                    res.json({ user: res.user, savedresult: response.data.result });
                }).catch(function(error) {
                    console.log(error);
                });
            }
        })
    }

    static showCreatingProjectData = async(req, res) => {
        db.query("Select * from localjob_project where live=1 order by id desc", async(err, result) => {
            if (err) {
                throw err;
            } else {
                res.render("creatingproject", { status: 'loggedIn', user: res.user, layout: './layouts/creatingproject', "result": result });
            }
        })
    }

    static editmanageoperationsProject = async(req, res, currency_results, jobs_results, project_id, countries) => {
        db.query(`Select * from project_approval where id = ${req.params.id} order by id desc`, async(err, result) => {
            if (err) {
                throw err;
            } else {
                res.render("manageoperationsedit", { status: 'loggedIn', project_id: project_id, countries: countries, jobs_results: jobs_results, currency_results: currency_results, access_token: res.access_token, user: res.user, layout: './layouts/manageoperationsedit', "result": result[0] });
            }
        })
    }

    static joinLinkData = async(req, res, token) => {
        db.query(`select * from team_token where token = '${token}' order by team_token_id desc limit 1`, async(err, result) => {
            console.log(result)
            if (err) {
                res.render('joinlink', { user: res.user, token: token, name: null, layout: './layouts/joinlink' });
                throw err;
            } else {
                const name = result[0].leader_name;
                res.render('joinlink', { user: res.user, token: token, name: name, layout: './layouts/joinlink' });
            }
        })
    }


    static showProjectsWithSpecificProjectType = async(req, res) => {
        const { type } = req.body;
        let info;
        db.query(`Select * from localjob_project where type = '${type}' and live = 1`, async(err, result) => {
            if (err) {
                throw err;
            } else {
                info = result;
                res.json({ result: info });
            }
        });
    }

    static showProjectsWithSpecificTitle = async(req, res) => {
        const { data } = req.body;
        let info;
        let jobs;
        let condition = '';
        db.query(`Select * from localjob_project where (title like '%${data}%') & live = 1  Order By id Desc`, async(err, result) => {
            if (err) {
                throw err;
            } else {
                info = result;
                res.json({ result: info });
            }
        })
    }

    static editProject = async(req, res, jobs_results) => {
        const { id } = req.params;
        var data = [];
        db.query(`Select * from localjob_project where id = '${id}'`, async(err, result) => {
            if (err) {
                throw err;
            } else {
                if (result.length == 0) {
                    db.query(`Select * from projects where id = '${id}'`, async(err, newresult) => {
                        if (err) {
                            throw err;
                        } else {
                            data = newresult;
                            res.json({ result: data, jobs_results: jobs_results });
                        }
                    })
                } else {
                    res.json({ result: result, jobs_results: jobs_results });
                }
            }
        })
    }

    static editcreateProject = async(req, res, jobs_results) => {
        const { id } = req.params;
        db.query(`select * from localjob_project where id = '${id}'`, async(err, result) => {
            if (err) {
                throw err;
            } else {
                res.json({ result: result, jobs_results: jobs_results });
            }
        })
    }
    static updatecreateProject = async(req, res) => {
        const budget = {
            "minimum": req.body.min_budget,
            "maximum": req.body.max_budget,
        }
        var skills = [];
        req.body.skill_fixed.forEach(function(entry) {
            var singleObj = {};
            singleObj = entry;
            skills.push("'" + singleObj + "'");
        });
        var skill_results;
        db.query(`Select * from jobs where name IN (${skills})`, async(err, result) => {
            if (err) {
                throw err;
            } else {
                skill_results = JSON.stringify(result);
                const info = {
                    "title": req.body.project_title,
                    "description": req.body.description,
                    "budget": JSON.stringify(budget),
                    "skill": skill_results,
                    "type": req.body.types,
                }
                db.query('update projects SET ? where ? ', [info, { "id": req.body.creatingprojectid }], async(err, result) => {
                    if (err) {
                        res.json({ result: "", success: false });
                    } else {
                        res.json({ result: result, success: true });
                    }
                })
            }
        });
    }
    static updateprojectopeation = async(req, res) => {
        const budget = {
            "minimum": req.body.input_budget_min,
            "maximum": req.body.input_budget_max,
        }
        const currency = {
            "id": req.body.input_currency
        }
        let hourly_project_info;
        let location;
        if (req.body.type == 'hourly') {
            hourly_project_info = {
                "commitment": {
                    "hours": req.body.hoursPerWeek,
                    "interval": "WEEK"
                }
            }
        } else {
            hourly_project_info = null;
        }
        if (req.body.type == 'local') {
            location = {
                "city": req.body.state,
                "country": { "name": req.body.country },
                "latitude": req.body.lat,
                "longitude": req.body.lon
            }
        } else {
            location = '';
        }
        var arrayskills = [];
        if (!Array.isArray(req.body.skill_fixed)) {
            arrayskills.push({ "id": parseInt(req.body.skill_fixed) });
        } else {
            req.body.skill_fixed.forEach(function(info, iindex) {
                var objskills = {};
                objskills.id = parseInt(info);
                arrayskills.push(objskills);
            })
        }
        var skill_results = JSON.stringify(arrayskills);
        const info = {
            "title": req.body.input_title,
            "description": req.body.input_description,
            "budget": JSON.stringify(budget),
            "jobs": skill_results,
            "type": req.body.type,
            "currency": JSON.stringify(currency),
            "hourly_project_info": JSON.stringify(hourly_project_info),
            "location": JSON.stringify(location),
            "status": 1,
        }
        db.query('update project_approval SET ? where ? ', [info, { "id": req.body.project_id }], async(err, result) => {
            if (err) {
                res.json({ result: err, success: false });
            } else {
                res.json({ result: result, success: true });
            }
        })
    }

    static updateProject = async(req, res) => {
        res.redirect("/managingproject");
    }

    static deleteProject = async(req, res) => {
        const { id } = req.params;
        db.query(`delete from localjob_project where id = '${id}'`, async(err, result) => {
            if (err) {
                throw err;
            }
        })
        res.redirect("/managingproject");
    }

    static deletecreatingProject = async(req, res) => {
        const { id } = req.params;
        db.query(`delete from projects where id = '${id}'`, async(err, result) => {
            if (err) {
                throw err;
            }
        })
        res.redirect("/creatingproject");
    }

    static viewProject = async(req, res) => {
        // const { data } = req.body;
        // db.query(`Select * from localjob_project where title like '%${data}%'`, async(err, result) => {
        //     if (err) {
        //         throw err;
        //     } else {
        //         res.json({ result: result });
        //     }
        // })
    }

    static showAllUsers = async(req, res) => {
        db.query("select * from users", async(err, result) => {
            if (err) {
                throw err;
            } else {
                db.query('select * from roles', async(err, resultRoles) => {
                    res.render("allusers", { status: 'loggedIn', user: res.user, layout: './layouts/allusers', "result": result, "resultRoles": resultRoles });
                })
            }
        });
    }

    static searchUserWithUsername = async(req, res) => {
        const { data } = req.body;
        db.query(`select * from users where username like '%${data}%'`, async(err, result) => {
            if (err) throw err;
            else {
                res.json({ result: result });
            }
        });
    }

    static userWithSpecificType = async(req, res) => {
        const { data } = req.body;
        db.query(`select * from users where role_id = '${data}'`, async(err, result) => {
            if (err) throw err;
            else {
                res.json({ result: result });
            }
        });
    }

    static showUserFromParticularDate = async(req, res) => {
        const { startdate, endDate } = req.body;
        db.query(`select * from users where created_at between '${startdate}T00:00:00.00' and '${endDate}T23:59:59.999'`, async(err, result) => {
            if (err) throw err;
            else {
                res.json({ result: result });
            }
        });
    }

    static recentlyAddedUsers = async(req, res) => {
        db.query(`select * from users order by created_at desc limit 10`, async(err, result) => {
            if (err) throw err;
            else {
                res.json({ result: result });
            }
        });
    }

    static addUserData = async(req, res) => {
        db.query('select * from users', async(err, result) => {
            if (err) {
                throw err;
            } else {
                db.query('select * from roles', async(err, resultRoles) => {
                    res.render('addusers', { status: 'loggedIn', user: res.user, layout: './layouts/addusers', "result": result, "resultRoles": resultRoles });
                })
            }
        })
    }

    static manageAllRoles = async(req, res) => {
        db.query('select * from roles', async(err, result) => {
            if (err) {
                throw err;
            } else {
                res.render('roles', { status: 'loggedIn', user: res.user, layout: './layouts/roles', "result": result });
            }
        });

    }
    static manageAddRoles = async(req, res) => {
        res.render('addroles', { status: 'loggedIn', user: res.user, layout: './layouts/addroles' });
    }

    static manageAddRolesWithSpecificRolesType = async(req, res) => {
        var permissions = {
            "project_id": [],
            "payment_id": [],
            "report_id": []
        };

        if (('project_id' in req.body)) {
            permissions.project_id = req.body.project_id[0].project_module;
        }

        if (('payment_id' in req.body)) {
            permissions.payment_id = req.body.payment_id[0].payment_module;
        }

        if (('report_id' in req.body)) {
            permissions.report_id = req.body.report_id[0].report_module;
        }

        permissions = JSON.stringify(permissions);
        const { role_title } = req.body;
        db.query(`Select * from roles where role_title IN ('${role_title}')`, async(err, result) => {
            if (err) { throw err; }
            if (typeof result !== 'undefined' && result.length === 1) {
                const query = `UPDATE roles SET role_title =('${role_title}')`;
                db.query(query, function(error, data) {
                    if (error) throw error;
                })
            } else {
                const query = `INSERT INTO roles (role_title, permissions)  VALUES ('${role_title}','${permissions}')`;
                db.query(query, function(error, data) {
                    if (error) throw error;
                })
                res.redirect("/addroles");
            }

        });
    }

    static savedprojects = async(req, res) => {
        const { project_id } = req.body;
        db.query(`Select * from saved_projects where project_id = ('${project_id}') and user_id = ('${res.user.id}')`, async(err, result) => {
            if (err) { throw err; }
            if (typeof result !== 'undefined' && result.length === 1) {
                let flag;
                if (result[0].flag == 1) {
                    flag = 0;
                } else {
                    flag = 1;
                }
                const query = `UPDATE saved_projects SET project_id = "${project_id}", user_id = "${res.user.id}", flag = "${flag}" WHERE id = ${result[0].id}`;
                db.query(query, function(error, data) {
                    if (err) {
                        res.json({ success: 0, result: '' });
                    } else {
                        res.json({ success: 1, result: result });
                    }
                })
            } else {
                const query = `INSERT INTO saved_projects (project_id, user_id, flag)  VALUES ('${project_id}','${res.user.id}', '1')`;
                db.query(query, function(error, data) {
                    if (err) {
                        res.json({ success: 0, result: '' });
                    } else {
                        res.json({ success: 1, result: data });
                    }
                })
            }
        });
    }

    static removedsavedprojects = async(req, res) => {
        const { project_id } = req.body;
        db.query(`Select * from saved_projects where project_id = ('${project_id}') and user_id = ('${res.user.id}')`, async(err, result) => {
            if (err) { throw err; }
            if (typeof result !== 'undefined' && result.length === 1) {
                let flag;
                if (result[0].flag == 1) {
                    flag = 0;
                } else {
                    flag = 1;
                }
                const query = `UPDATE saved_projects SET project_id = "${project_id}", user_id = "${res.user.id}", flag = "${flag}" WHERE id = ${result[0].id}`;
                db.query(query, function(error, data) {
                    if (err) {
                        res.json({ success: 0, result: '' });
                    } else {
                        res.json({ success: 1, result: result });
                    }
                })
            }
        })
    }

    static invitationstatusaction = async(req, res) => {
        const { invitation_status_id, invitation_id } = req.body;
        const query = `UPDATE invite_freelancer SET status = "${invitation_status_id}" WHERE invite_id = ${invitation_id}`;
        db.query(query, function(error, result) {
            if (error) {
                res.json({ success: 0, result: error, invitation_id: invitation_id, invitation_status_id: invitation_status_id });
            } else {
                res.json({ success: 1, result: result, invitation_id: invitation_id, invitation_status_id: invitation_status_id });
            }
        })
    }

    static myjobsprojectstatus = async(req, res) => {
        const { pid, status } = req.body;
        let data;
        if (status == 'close') {
            data = JSON.stringify({
                "action": 'close'
            });
        } else {
            data = JSON.stringify({
                "action": 'end',
                "bid_id": 63514799,
                "status": "complete"
            });
        }
        var config = {
            method: 'put',
            url: `https://www.freelancer.com/api/projects/0.1/projects/${pid}`,
            headers: {
                'freelancer-auth-v2': '63514799;UzyqtZCA4lW+q1wfuCWWFZ02PuklR6/TCS0GLYBNiJE=',
                'Content-Type': 'application/json'
            },
            data: data
        };
        axios(config).then(function(response) {
            res.json({ success: 1, message: 'Success', result: response.data });
        }).catch(function(error) {
            let response = typeof error.response !== "undefined" ? error.response : '';
            res.json({ success: 0, message: response.data.message, result: '' });
        });
    }

    static editRoles = async(req, res) => {
        const { id } = req.params;
        db.query(`Select * from roles where id = '${id}'`, async(err, result) => {
            if (err) {
                throw err;
            } else {
                res.json({ result: result });
            }
        })
    }

    static updatecreateProjectRoles = async(req, res) => {
        const { roles_id, roles_title } = req.body;

        var permissions = {
            "project_id": [],
            "payment_id": [],
            "report_id": []
        };

        if (('project_id' in req.body)) {
            permissions.project_id = req.body.project_id[0].project_module;
        }

        if (('payment_id' in req.body)) {
            permissions.payment_id = req.body.payment_id[0].payment_module;
        }

        if (('report_id' in req.body)) {
            permissions.report_id = req.body.report_id[0].report_module;
        }

        permissions = JSON.stringify(permissions);

        db.query(`Select * from roles where id = '${roles_id}'`, async(err, result) => {
            if (err) { throw err; }
            if (typeof result !== 'undefined' && result.length === 1) {
                console.log("roles_id: " + roles_id + "   " + "roles_title: " + roles_title);
                const obj = {
                    "role_title": roles_title,
                    "permissions": permissions
                }
                db.query("update roles set ? where ?", [obj, { "id": roles_id }], async(err, data) => {
                    if (err) {
                        res.json({ success: 0, result: '' });
                    } else {
                        res.json({ success: 1, result: result });
                    }
                })
            } else {
                res.json({ success: 0, result: '' });
            }
        });
    }

    static deleterolesProject = async(req, res) => {
        const { id } = req.params;
        db.query(`delete from roles where id = '${id}'`, async(err, result) => {
            if (err) {
                res.json({ success: 0, result: '' });
            } else { res.json({ success: 1, result: result }) }
        })
    }

    static deleteallUserProject = async(req, res) => {
        const { id } = req.params;
        db.query(`delete from users where id = '${id}'`, async(err, result) => {
            if (err) {
                res.json({ success: 0, result: '' });
            } else { res.json({ success: 1, result: result }) }
        });
    }

    static addUserInsertData = async(req, res) => {
        const { username, email, password, confirm_password, role_id } = req.body;
        if (!role_id || !username || !email || !password || !confirm_password) {
            res.json({ status: "error", error: "please enter all required credentials" });
        } else if (password != confirm_password) {
            res.json({ status: "error", error: "password and confirm password doesnot match.." });
        } else {
            db.query("Select * from users where username = ? OR email = ?", [username, email], async(err, result) => {
                if (err) { res.json({ success: 0, result: '' }); }
                if (result.length >= 1) {
                    res.json({ status: "error", error: "username with this email already exists" });
                } else {
                    const hashed = await bcrypt.hash(password, 8);
                    const obj = {
                        "username": username,
                        "email": email,
                        "password": hashed,
                        "role_id": role_id,
                    }
                    db.query("insert into users set ?", obj, async(err, data) => {
                        if (err) {
                            res.json({ success: 0, data: '' });
                        } else {
                            res.json({ success: 1, data: 'User Has been Registered Successfully', redirect: '/users' })
                        }
                    })
                }
            })
        }
    }

    static updatecreateProjectUserAll = async(req, res) => {
        const { alluserid, username, email, password, confirm_password, role_id } = req.body;
        if (!password || !confirm_password) {
            res.json({ status: "error", error: "confirm password is empty" });
        } else if (password != confirm_password) {
            res.json({ status: "error", error: "password and confirm password doesnot match.." });
        } else {
            db.query("Select * from users where username = ? OR email = ?", [username, email], async(err, result) => {
                if (err) {
                    res.json({ success: 0, result: '' });
                } else {
                    const hashpassword = await bcrypt.hash(password, 8);
                    const query = `UPDATE users SET username = "${username}", email = "${email}", password = "${hashpassword}", role_id = "${role_id}" WHERE id = ${alluserid}`;
                    db.query(query, function(err, data) {
                        if (err) {
                            res.json({ success: 0, data: '' });
                        } else {
                            res.json({ success: 1, data: 'User Has been Updated Successfully', redirect: '/users' })
                        }
                    })
                }
            })
        }
    }

    static editAllUsersData = async(req, res) => {
        const { id } = req.params;
        db.query(`select * from users where id ='${id}'`, async(err, result) => {
            if (err) {
                res.json({ success: 0, result: '' });
            } else {
                db.query('select * from roles', async(err, resultAllUser) => {
                    res.json({ success: 1, "result": result, "resultAllUser": resultAllUser });
                })

            }
        })
    }

    static rolesPermissionProject = async(req, res) => {
        
    }

    static totalprojectAll = async(req, res) => {
        try {
            let data;
            let project;
            let clients;
            let freelancer;
            let totalprojects;
            let totalclients;
            let totalfreelancers;
            db.query("Select * from localjob_project", async(err, result) => {
                if (err) {
                    console.log(err)
                } else {
                    data = result.length;
                    project = result[result.length - 1].created_at;
                }
                db.query("Select * from projects", async(err, result) => {
                    if (err) {
                        console.log(err)
                    } else {
                        if (data.length > 0) {
                            totalprojects = data + result.length;
                            project = data.concat(result);
                        } else {
                            totalprojects = result.length;
                            project = result;
                        }
                    }
                    db.query("Select * from users Where role_id = 2", async(err, result) => {
                        if (err) {
                            res.json({ success: 0, result: '' });
                        } else {
                            totalclients = result.length;
                            clients = result[result.length - 1].created_at;
                        }
                        db.query("Select * from users Where role_id = 3", async(err, result) => {
                            if (err) {
                                console.log(err)
                            } else {
                                totalfreelancers = result.length;
                                freelancer = result[result.length - 1].created_at;
                            }
                            res.render("dashboard", { status: 'loggedIn', user: res.user, layout: './layouts/dashboard', "totalprojects": totalprojects, "totalclients": totalclients, "totalfreelancers": totalfreelancers, "project": project, "clients": clients, "freelancer": freelancer });
                        })
                    })
                })
            })
        } catch (err) {
            if (err) res.json({ success: 0, result: '' });
        }
    }

    static freelancerjobsearch = async(req, res) => {
        const { contract_type } = req.body;
        try {
            let condtion = '';
            if (contract_type != undefined && contract_type != 'all') {
                condtion += `AND localjob_project.type = '${contract_type}'`;
            }
            db.query(`SELECT localjob_project.*, freelancer_jobs.* FROM localjob_project, freelancer_jobs where freelancer_jobs.project_id = localjob_project.id ${condtion}`, async(err, result) => {
                if (err) {
                    res.json({ success: 0, result: err });
                } else {
                    res.json({ success: 1, result: result });
                }
            })
        } catch (err) {
            if (err) res.json({ success: 0, result: err });
        }
    }

    static totalgetAllDataLastRecords = async(req, res) => {
        let data;
        let dataClient;
        db.query("select * from users where created_at > date_sub(now(),Interval 5 month) AND role_id = 3", async(err, result) => {
            if (err) {
                res.json({ success: 0, result: '' });
            } else {
                data = result;
                db.query("select * from users where created_at > date_sub(now(),Interval 5 month) AND role_id = 2", async(err, resultClient) => {
                    if (err) {
                        res.json({ success: 0, resultClient: '' });
                    } else {
                        dataClient = resultClient;
                        res.json({ success: 1, "data": result, "dataClient": resultClient });
                    }
                })
            }
        })
    }

    static browseFreelancers = async(req, res, jobs_results, token, resultlisthire, countries) => {
        var arr = [];
        var conditionarr = '';
        resultlisthire.forEach((val, i) => {
            arr[i] = val.bidder_id;
        })
        arr.forEach((element, i) => {
            if (i == arr.length - 1) {
                conditionarr += `users[]=${element}`;
            } else {
                conditionarr += `users[]=${element}&`;
            }
        });

        let data, totalfreelancers, skills = [],
            jobs = [],
            temp_jobs = [],
            condition = "";
        db.query(`select * from localjob_project where posted_by = ${res.user.id}`, async(err, information) => {
            if (err) {
                throw err;
            } else {
                data = information;
                data.forEach((info) => {
                    skills.push(info.jobs);
                })
                for (var i = 0; i < skills.length; i++) {
                    for (var j = 0; j < JSON.parse(skills[i]).length; j++) {
                        var temp = JSON.parse(skills[i]);
                        var id = temp[j].id;
                        temp_jobs.push(id);
                    }
                }
                temp_jobs.forEach((val, i) => {
                    if (!jobs.includes(val)) {
                        jobs.push(val);
                        if (i == temp_jobs.length - 1) {
                            condition += `skills[${i}]=${val}`;
                        } else {
                            condition += `skills[${i}]=${val}&`;
                        }
                    }
                })
                var config = {
                    method: 'get',
                    url: `https://www.freelancer.com/api/users/0.1/users/directory?${condition}&avatar=true&limit=100`,
                    headers: {
                        'freelancer-auth-v2': '63514799;HrEz7r580VBM7DShq6rh6ZhuE10uVpbuk8ydtMGrDo0='
                    },
                    data: JSON.stringify({})
                };

                axios(config)
                    .then(function(response) {
                        var config = {
                            method: 'get',
                            url: `https://www.freelancer.com/api/users/0.1/users?${conditionarr}&avatar=true`,
                            headers: {
                                'freelancer-oauth-v1': token
                            }
                        };

                        axios(config)
                            .then(function(result) {
                                var hirelistconfig = {
                                    method: 'get',
                                    url: `https://www.freelancer.com/api/users/0.1/users?${conditionarr}&avatar=true`,
                                    headers: {
                                        'freelancer-auth-v2': '63514799;HrEz7r580VBM7DShq6rh6ZhuE10uVpbuk8ydtMGrDo0='
                                    },
                                    data: JSON.stringify({})
                                };
                                axios(hirelistconfig)
                                    .then(function(hirelist) {
                                        res.render("browsefreelancers", { status: 'loggedIn', user: res.user, layout: './layouts/browsefreelancers', "freelancers": response.data.result.users, "countries": countries, "totalfreelancers": response.data.result.users.length, "jobs_results": jobs_results, "hire_results": hirelist.data.result });
                                    })
                                    .catch(function(error) {
                                        console.log(error);
                                    });
                            })
                            .catch(function(error) {
                                console.log(error);
                            });
                    })
                    .catch(function(error) {
                        console.log(error);
                    });
            }
        })
    }

    static showFreelancerWithSpecificSkills = async(req, res, token) => {
        const { info } = req.body;
        var condition = "";
        info.forEach((val, i) => {
            if (i == info.length - 1) {
                condition += `skills[${i}]=${val}`;
            } else {
                condition += `skills[${i}]=${val}&`;
            }
        })
        var config = {
            method: 'get',
            url: `https://www.freelancer-sandbox.com/api/users/0.1/users/directory?${condition}&limit=100`,
            headers: {
                'freelancer-oauth-v1': token
            },
            data: JSON.stringify({})
        };

        axios(config)
            .then(function(response) {
                res.json({ status: 'loggedIn', user: res.user, "freelancers": response.data.result.users, "totalfreelancers": response.data.result.users.length });
            })
            .catch(function(error) {
                console.log(error);
            });
    }

    static showFreelancerWithSpecificSkillsProject = async(req, res, token) => {
        const { info } = req.body;
        var condition = "";
        info.forEach((val, i) => {
            if (i == info.length - 1) {
                condition += `skills[${i}]=${val}`;
            } else {
                condition += `skills[${i}]=${val}&`;
            }
        })
        var config = {
            method: 'get',
            url: `https://www.freelancer.com/api/projects/0.1/projects/active?jobs${condition}&limit=100`,
            headers: {
                'freelancer-oauth-v1': token
            },
            data: JSON.stringify({})
        };

        axios(config)
            .then(function(response) {
                res.json({ status: 'loggedIn', user: res.user, "projects": response.data.result.projects, "totalprojects": response.data.result.projects.length });
            })
            .catch(function(error) {
                console.log(error);
            });
    }

    static showFreelancerWithSpecificCountries = async(req, res, token) => {
        const { info } = req.body;
        var condition = "";
        info.forEach((val, i) => {
            if (i == info.length - 1) {
                condition += `countries[${i}]=${val}`;
            } else {
                condition += `countries[${i}]=${val}&`;
            }
        })
        var config = {
            method: 'get',
            url: `https://www.freelancer-sandbox.com/api/users/0.1/users/directory?${condition}&limit=100`,
            headers: {
                'freelancer-oauth-v1': token
            },
            data: JSON.stringify({})
        };

        axios(config)
            .then(function(response) {
                res.json({ status: 'loggedIn', user: res.user, "freelancers": response.data.result.users, "totalfreelancers": response.data.result.users.length });
            })
            .catch(function(error) {
                console.log(error);
            });
    }

    static showOnlineFreelancers = async(req, res, token) => {
        var config = {
            method: 'get',
            url: `https://www.freelancer.com/api/users/0.1/users/directory?online_only=true&limit=100`,
            headers: {
                'freelancer-oauth-v1': token
            },
            data: JSON.stringify({})
        };

        axios(config)
            .then(function(response) {
                res.json({ status: 'loggedIn', user: res.user, "freelancers": response.data.result.users, "totalfreelancers": response.data.result.users.length });
            })
            .catch(function(error) {
                console.log(error);
            });
    }

    static fliterwithratingData = async(req, res, token) => {
        let { rating } = req.body;
        rating = parseFloat(rating);
        var config = {
            method: 'get',
            url: `https://www.freelancer.com/api/users/0.1/users/directory?ratings=${rating}&limit=100`,
            headers: {
                'freelancer-oauth-v1': token
            },
            data: JSON.stringify({})
        };

        axios(config)
            .then(function(response) {
                res.json({ status: 'loggedIn', user: res.user, "freelancers": response.data.result.users, "totalfreelancers": response.data.result.users.length });
            })
            .catch(function(error) {
                console.log(error);
            });
    }

    static showFreelancerswithHourlyRate = async(req, res, token) => {
        const { min, max } = req.body;
        var config = {
            method: 'get',
            url: `https://www.freelancer.com/api/users/0.1/users/directory?hourly_rate_min=${min}&hourly_rate_max=${max}&limit=100&avatar=true`,
            headers: {
                'freelancer-oauth-v1': token
            },
            data: JSON.stringify({})
        };

        axios(config)
            .then(function(response) {
                // return;
                res.json({ status: 'loggedIn', user: res.user, "freelancers": response.data.result.users, "totalfreelancers": response.data.result.users.length });
            })
            .catch(function(error) {
                console.log(error);
            });
    }
    static freelancerprojectdescritioninfo = async(req, res) => {
        const { bi, pi } = req.params;
        var config = {
            method: 'get',
            url: `https://www.freelancer.com/api/projects/0.1/projects?projects[]=${pi}&bidders[]=${bi}&full_description=true&user_details=true&user_avatar=true`,
            headers: {
                'freelancer-oauth-v1': '63130725;5N2ABspMbebCP5lffa6/c/oF67Fm+7GhFwlcpdpgdvU='
            },
            data: JSON.stringify({})
        };

        axios(config)
            .then(function(response) {
                console.log(response.data.result);
                if (response.data.status == 'success') {
                    db.query(`select * from freelancer_jobs where project_id=${pi}`, async(err, resultamount) => {
                        if (err) {
                            throw err;
                        } else {
                            res.render("freelancerprojectdetail", { status: 'loggedIn', user: res.user, "resultamount": resultamount, "probifreelancersusers": response.data.result.users, "probifreelancers": response.data.result.projects, layout: './layouts/freelancerprojectdetail' });
                        }
                    })
                } else {
                    res.render("freelancerprojectdetail", { status: 'loggedIn', user: '', "probifreelancersusers": '', "probifreelancers": '', layout: './layouts/freelancerprojectdetail' });
                }
            })
            .catch(function(error) {
                console.log(error);
            });
    }

    static showFreelancerswithReviewRate = async(req, res, token) => {
        const { min, max } = req.body;
        var config = {
            method: 'get',
            url: `https://www.freelancer.com/api/users/0.1/users/directory?review_count_min=${min}&review_count_max=${max}&limit=100&avatar=true`,
            headers: {
                'freelancer-oauth-v1': token
            },
            data: JSON.stringify({})
        };

        axios(config)
            .then(function(response) {
                res.json({ status: 'loggedIn', user: res.user, "freelancers": response.data.result.users, "totalfreelancers": response.data.result.users.length });
            })
            .catch(function(error) {
                console.log(error);
            });
    }

    static savefreelancer = async(req, res) => {
        const { fid } = req.body;
        const cid = res.user.id;
        db.query(`Select * from saved_freelancer where client_id = '${cid}' and freelancer_id = '${fid}'`, async(err, result) => {
                if (err) {
                    throw err;
                } else {
                    if (result.length == 0) {
                        db.query(`insert into saved_freelancer (client_id, freelancer_id, action) values ('${cid}','${fid}','1')`, async(err, result) => {
                            if (err) {
                                throw err;
                            } else {
                                res.json({ success: 1, "saved": true });
                            }
                        })
                    } else {
                        if (result[0].action == 1) {
                            db.query(`update saved_freelancer set action = '0' where save_id='${result[0].save_id}'`, async(err, result) => {
                                if (err) {
                                    throw err;
                                } else {
                                    res.json({ success: 1, "saved": false });
                                }
                            })
                        } else {
                            db.query(`update saved_freelancer set action = '1' where save_id='${result[0].save_id}'`, async(err, result) => {
                                if (err) {
                                    throw err;
                                } else {
                                    res.json({ success: 1, "saved": true });
                                }
                            })
                        }
                    }
                }
            })
    }

    static postajobforspecificfreelancer = async(req, res) => {
    }

    static showRolesWithSpecificTitle = async(req, res) => {
        const { data } = req.body;
        db.query(`Select * from roles where role_title LIKE ('%${data}%')`, async(err, result) => {
            if (err) {
                res.json({ success: 0, result: '' });
            } else { res.json({ success: 1, result: result }) }
        })
    }

    static reportData = async(req, res) => {
        res.render("reports", { status: 'loggedIn', user: res.user, layout: './layouts/reports' });
    }

    static messagesData = async(req, res) => {
        res.render("messages", { status: 'loggedIn', user: res.user, layout: './layouts/messages' });
    }

    static myjobData = async(req, res) => {
        db.query(`Select * from localjob_project where posted_by=${res.user.id} and live=1`, async(err, result) => {
            if (err) {
                res.json({ success: 0, result: '' });
            } else {
                res.render("myjob", { status: 'loggedIn', user: res.user, result: result, layout: './layouts/myjob' });
            }
        })

    }

    static showBidsList = async(req, res) => {
        const { id } = req.body;
        var config = {
            method: 'get',
            url: `https://www.freelancer.com/api/projects/0.1/projects/${id}/bids/`,
            headers: {}
        };

        axios(config)
            .then(function(response) {
                res.json({ status: 'loggedIn', user: res.user, bids: response.data.result.bids });
            })
            .catch(function(error) {
                console.log(error);
            });
    }

    static addProjectAndSendInvite = async(req, res) => {
        const { access_token, input_currency, input_title, skill_fixed, input_budget_min, input_budget_max, input_description, invite } = req.body;
        const filter_site_project = req.body.filter_site_project;
        var arrayskills = [];
        if (!Array.isArray(skill_fixed)) {
            arrayskills.push({ "id": parseInt(skill_fixed) });
        } else {
            skill_fixed.forEach(function(info, iindex) {
                var objskills = {};
                objskills.id = parseInt(info);
                arrayskills.push(objskills);
            })
        }
        // }
        var data = "";
        if (access_token != undefined && filter_site_project == "fixed") {
            data = JSON.stringify({
                "title": input_title,
                "description": input_description,
                "currency": {
                    "id": parseInt(input_currency)
                },
                "budget": {
                    "minimum": parseInt(input_budget_min),
                    "maximum": parseInt(input_budget_max)
                },
                "jobs": arrayskills
            });

        } else {
            var hours = req.body.hoursPerWeek;
            data = JSON.stringify({
                "title": input_title,
                "description": input_description,
                "currency": {
                    "id": parseInt(input_currency)
                },
                "budget": {
                    "minimum": parseInt(input_budget_min),
                    "maximum": parseInt(input_budget_max)
                },
                "jobs": arrayskills,
                "type": "HOURLY",
                "hourly_project_info": {
                    "commitment": {
                        "hours": parseInt(hours),
                        "interval": "WEEK"
                    }
                }
            });
        }

        var config = {
            method: 'post',
            url: 'https://www.freelancer-sandbox.com/api/projects/0.1/projects/',
            headers: {
                'freelancer-oauth-v1': access_token,
                'content-type': 'application/json'
            },
            data: data
        };

        axios(config).then(function(response) {
            console.log(JSON.stringify(response.data));
            const p_id = response.data.result.id;
            const info = {
                "id": response.data.result.id,
                "owner_id": response.data.result.owner_id,
                "posted_by": res.user.id,
                "title": response.data.result.title,
                "seo_url": response.data.result.seo_url,
                "currency": JSON.stringify(response.data.result.currency),
                "description": response.data.result.description,
                "jobs": JSON.stringify(response.data.result.jobs),
                "type": response.data.result.type,
                "live": 1,
                "budget": JSON.stringify(response.data.result.budget),
                "upgrades": JSON.stringify(response.data.result.upgrades),
                "language": JSON.stringify(response.data.result.language),
                "local": JSON.stringify(response.data.result.local),
                "pool_ids": JSON.stringify(response.data.result.pool_ids),
                "is_escrow_project": JSON.stringify(response.data.result.is_escrow_project),
            }
            db.query('INSERT INTO localjob_project SET ?', info, async(Err, result) => {
                if (Err) {
                    throw Err;
                } else {
                    const fid = invite;
                    var data = JSON.stringify({
                        "freelancer_id": parseInt(fid)
                    });

                    var config = {
                        method: 'post',
                        url: `https://www.freelancer-sandbox.com/api/projects/0.1/projects/${p_id}/invite/`,
                        headers: {
                            'freelancer-oauth-v1': access_token,
                            'Content-Type': 'application/json'
                        },
                        data: data
                    };
                    axios(config)
                        .then(function(response) {
                            res.json({ "message": 'User Invited Successfully', "response": response.data, "redirect": '/browsefreelancers' });
                        })
                        .catch(function(error) {
                            console.log(error);
                            res.json({ "response": error.response.data, "redirect": '/browsefreelancers' });
                        });
                }
            });
        }).catch(function(error) {
            console.log(error);
        });
    }

    static createChattingPosting = async(req, res, token) => {
        const { chatinfo } = req.body;
        var config = {
            method: 'get',
            url: `https://www.freelancer.com/api/messages/0.1/messages?${chatinfo}`,
            headers: {
                'freelancer-auth-v2': '64177304;0FgM2taKR8avz4fRx0aieNgYbjvNwUhipGkzjPOOQL4='
            },
            data: JSON.stringify({})
        };
        axios(config)
            .then(function(response) {
                res.json({ "message": 'User Invited Successfully', "response": response.data, "redirect": '/browsefreelancers' });
            })
    }

    static allchatthreadlist = async(req, res, token) => {
        //var access_token = "";
        var type = 1;
        // if (res.user.role_id == 2 || res.user.role_id == 1) {
        //     access_token = "64177304;0FgM2taKR8avz4fRx0aieNgYbjvNwUhipGkzjPOOQL4=";
        //     type = 2;
        // } else if (res.user.role_id == 3) {
        //     access_token = "64215283;HfqeX22Kr31fctbt7XhSMU9OTbUORTuQ2ec5hCtb6S8=";
        //     type = 3;
        // }
        if(res.authenticattion != undefined && res.authenticattion.access_token != ''){
            var config = {
                method: 'get',
                url: 'https://www.freelancer.com/api/messages/0.1/threads/?user_details=true&last_message=true',
                headers: {
                    'freelancer-oauth-v1': res.authenticattion.access_token
                }
            }
            axios(config)
                .then(function(response) {
                    if (response.data.status == 'success') {
                        res.json({
                            "threads": response.data.result.threads,
                            "unread_thread_count": response.data.result.unread_thread_count,
                            "users": response.data.result.users,
                            "context_details": response.data.result.context_details,
                            "end_reached": response.data.result.end_reached,
                            "type": type
                        })
                    } else {
                        res.json({ "threads": '', "unread_thread_count": '', "users": '', "context_details": '', "end_reached": '' });
                    }
                })
        }
    }

    static loadThreadsForAdmin = async(req, res, token) => {
        var { id } = req.params;
        var access_token = "";
        var type = 1;
        if (res.user.role_id == 2 || res.user.role_id == 1) {
            access_token = "64177304;0FgM2taKR8avz4fRx0aieNgYbjvNwUhipGkzjPOOQL4=";
            type = 2;
        } else if (res.user.role_id == 3) {
            access_token = "64215283;HfqeX22Kr31fctbt7XhSMU9OTbUORTuQ2ec5hCtb6S8=";
            type = 3;
        }
        var config = {
            method: 'get',
            url: `https://www.freelancer.com/api/messages/0.1/threads?context=${id}&context_type=project&user_details=true&last_message=true`,
            headers: {
                'freelancer-auth-v2': access_token
            }
        }
        axios(config)
            .then(function(response) {
                if (response.data.status == 'success') {
                    res.render("adminmessages", {
                        "threads": response.data.result.threads,
                        "unread_thread_count": response.data.result.unread_thread_count,
                        "users": response.data.result.users,
                        "context_details": response.data.result.context_details,
                        "end_reached": response.data.result.end_reached,
                        "type": type,
                        layout: "./layouts/adminmessages",
                        user: res.user
                    })
                } else {
                    res.json({ "threads": '', "unread_thread_count": '', "users": '', "context_details": '', "end_reached": '' });
                }
            })
    }

    static jobdetail = async(req, res, token) => {

        db.query(`select * from localjob_project where posted_by = '${res.user.id}' and live=1 order by id desc limit 1`, async(err, result) => {
            if (err) {
                throw err;
            } else {
                if(result.length > 0 ){
                    var config = {
                        method: 'get',
                        url: `https://www.freelancer.com/api/projects/0.1/projects?owners[]=${result[0].owner_id}`,
                        headers: {
                            'freelancer-oauth-v1': token,//'64177304;0FgM2taKR8avz4fRx0aieNgYbjvNwUhipGkzjPOOQL4='
                        }
                    };
                    axios(config)
                    .then(function(response) {
                            res.render("jobdetail", { status: 'loggedIn', user: res.user, layout: './layouts/jobdetail', projects: response.data.result.projects });
                        })
                        .catch(function(error) {
                            // console.log(error.response.data);
                            // return;
                            res.render("jobdetail", { status: 'loggedIn', user: res.user, layout: './layouts/jobdetail', projects: [] });
                        });
                }else{
                    res.render("jobdetail", { status: 'loggedIn', user: res.user, layout: './layouts/jobdetail', projects: [] });
                }
            }
        })

    }

    static getJobDetailForClient = async(req, res, token) => {
        const { id } = req.body;
        var config = {
            method: 'get',
            url: `https://www.freelancer.com/api/projects/0.1/projects/${id}?full_description=true`,
            headers: {
                'freelancer-oauth-v1': token,//'64177304;0FgM2taKR8avz4fRx0aieNgYbjvNwUhipGkzjPOOQL4='
            }
        };

        axios(config)
            .then(function(response) {
                var newconfig = {
                    method: 'get',
                    url: `https://www.freelancer.com/api/projects/0.1/projects/${id}/bids/`,
                    headers: {
                        'freelancer-oauth-v1': token,//'64177304;0FgM2taKR8avz4fRx0aieNgYbjvNwUhipGkzjPOOQL4='
                    }
                };

                axios(newconfig)
                    .then(function(result) {
                        db.query(`select * from freelancer_jobs where project_id=${id}`, async(err, resp) => {
                                if (err) {
                                    throw err;
                                } else {
                                    if (resp.length > 0) {
                                        var arr = [];
                                        var temparr = [];
                                        var conditionarr = '';
                                        resp.forEach((val, i) => {
                                            arr[i] = val.bidder_id;
                                        })
                                        arr.forEach((element, i) => {
                                            if (i == arr.length - 1) {
                                                conditionarr += `users[]=${element}`;
                                            } else {
                                                conditionarr += `users[]=${element}&`;
                                            }
                                        });
                                        var tmp_config = {
                                            method: 'get',
                                            url: `https://www.freelancer.com/api/users/0.1/users?${conditionarr}&avatar=true`,
                                            headers: {
                                                'freelancer-oauth-v1': token,//'64177304;0FgM2taKR8avz4fRx0aieNgYbjvNwUhipGkzjPOOQL4='
                                            }
                                        };
                                        axios(tmp_config)
                                            .then(function(hiref_freelancers) {
                                                db.query(`select * from freelancer_jobs`, async(err, resp) => {
                                                    if (err) {
                                                        throw err;
                                                    } else {
                                                        if (resp.length > 0) {
                                                            var arr = [];
                                                            var conditionarr = '';
                                                            resp.forEach((val, i) => {
                                                                arr[i] = val.bidder_id;
                                                            })
                                                            arr.forEach((element, i) => {
                                                                if (i == arr.length - 1) {
                                                                    conditionarr += `users[]=${element}`;
                                                                } else {
                                                                    conditionarr += `users[]=${element}&`;
                                                                }
                                                            });
                                                            var tmp_config = {
                                                                method: 'get',
                                                                url: `https://www.freelancer.com/api/users/0.1/users?${conditionarr}&avatar=true`,
                                                                headers: {
                                                                    'freelancer-oauth-v1': token,//'64177304;0FgM2taKR8avz4fRx0aieNgYbjvNwUhipGkzjPOOQL4='
                                                                }
                                                            };
                                                            axios(tmp_config)
                                                                .then(function(hiref_freelancers) {
                                                                    temparr = hiref_freelancers.data;
                                                                    res.json({ success: 1, proposals: result.data.result.bids, projectinfo: response.data.result, hiredfreelancers: hiref_freelancers.data, allhiredfreelancers: temparr });
                                                                }).catch(function(err) {
                                                                    res.json({ success: 1, proposals: result.data.result.bids, projectinfo: response.data.result, hiredfreelancers: hiref_freelancers.data, allhiredfreelancers: "" });
                                                                })
                                                        } else {}
                                                    }
                                                })
                                            }).catch(function(err) {
                                                console.log(err.response.data)
                                                res.json({ success: 1, proposals: result.data.result.bids, projectinfo: response.data.result, hiredfreelancers: "", allhiredfreelancers: "" });
                                            })
                                    } else {
                                        res.json({ success: 1, proposals: result.data.result.bids, projectinfo: response.data.result, hiredfreelancers: "", allhiredfreelancers: "" });
                                    }
                                }
                            })
                    })
                    .catch(function(error) {
                        console.log(error.response.data);
                    });
            })
            .catch(function(error) {
                console.log(error.response.data);
            });
    }



    static getProjectDetailForOwnerHirelist = async(req, res, token, currency_results) => {
        const { owner_id,project_id,bidder_id,bid_id } = req.body;
        var config = {
            method: 'get',
            url: `https://www.freelancer.com/api/projects/0.1/bids/${bid_id}/?action=award`,
            headers: {
                'freelancer-oauth-v1': token
            }   
        }
        console.log(config);
        axios(config)
        .then(function(response) {
            console.log(response.data)
            if (response.data.status == 'success') {
                db.query(`INSERT INTO bid_award(bid_id,awarded_by, awarded_whom, project_id, award_status, notify_status) VALUES ('${response.data.result.id}','${owner_id}','${bidder_id}','${project_id}','0','0')`, async(err, result)=>{
                    if(err){    
                        console.log(err)
                        res.json({ "status": 'error', "msg": 'bid award sent'});
                    }else{
                        res.json({
                            "status": "success",
                            "msg": "hired successfully",
                        })
                    }
                })
            } else {
                res.json({ "status": 'success', "msg": 'bid award sent'});
            }
            })
            .catch(function(error) {
                console.log(error);
                res.json({ "status": 'error', "msg": 'exception occured'});
            });
    }

    static getProjectDetailForFinalHirelist = async(req, res, token) => {
        const { title, description, currency, budget, currencyId, type, bidder_id, project_id } = req.body;

        var data = JSON.stringify({
            "title": title,
            "description": description,
            "language": "",
            "currency": {
                "id": parseInt(currency)
            },
            "budget": {
                "minimum": parseFloat(budget),
                "currencyId": parseInt(currencyId),
                "currency_id": parseInt(currencyId)
            },
            "jobs": [{
                "id": parseInt(project_id)
            }],
            "type": type,
            "hireme": true,
            "is_quotation_project": false,
            "upgrades": {
                "assisted": false,
                "featured": false,
                "NDA": false,
                "urgent": false,
                "nonpublic": false,
                "fulltime": false,
                "ipContract": false,
                "listed": false,
                "projectManagement": false,
                "qualified": false,
                "sealed": false,
                "extend": false,
                "recruiter": false,
                "project_management": false,
                "ip_contract": false
            },
            "nda_details": {},
            "files": [],
            "hireme_initial_bid": {
                "bidder_id": parseInt(bidder_id),
                "amount": parseFloat(budget),
                "period": 7
            },
            "enterprise_metadata_values": []
        });

        var config = {
            method: 'post',
            url: 'https://www.freelancer.com/api/projects/0.1/projects/?compact=true&new_errors=true&new_pools=true',
            headers: {
                'freelancer-oauth-v1': token,//'63130725;5N2ABspMbebCP5lffa6/c/oF67Fm+7GhFwlcpdpgdvU=',
                'content-type': 'application/json'
            },
            data: data
        };
        const obj = {
            "project_id": parseInt(project_id),
            "bidder_id": parseInt(bidder_id),
            "status": 1,
            "period": 7,
            "amount": parseFloat(budget),
        }
        // db.query("insert into freelancer_jobs set ?", obj, async(err, data) => {
        //     if (err) {
        //         console.log(err);
        //     } else {
        //         console.log(data);
        //     }
        // })
        axios(config)
            .then(function(response) {
                res.json({ status: response.data.status, message: '' });
            })
            .catch(function(error) {
                res.json({ status: error.response.data.status, message: error.response.data.message });
            });
    }

    static createThread = async(req, res) => {
        const { bidder_id, project_owner_id, project_id } = req.body;
        if(res.authenticattion != undefined && res.authenticattion.access_token != ''){
            var config = {
                method: 'post',
                url: `https://www.freelancer.com/api/messages/0.1/threads/?members[]=${project_owner_id}&members[]=${bidder_id}&context_type=project&context=${project_id}&type=private_chat`,
                headers: {
                    'freelancer-oauth-v1': res.authenticattion.access_token
                }
            };
            axios(config)
                .then(function(response) {
                    //console.log(response);
                    var thread_id = response.data.result.thread.id;
                    var members = JSON.stringify(response.data.result.thread.members);
                    var context_type = response.data.result.thread.context.type;
                    var context = response.data.result.thread.context.id;
                    var time = new Date(response.data.result.thread.time_created * 1000);
                    time = time.toString().substr(0, 24);
                    db.query(`INSERT INTO threads(thread_id, members, context_type, context, created_at, updated_at) VALUES ('${thread_id}','${members}','${context_type}','${context}','${time}','${time}')`, async(err, result) => {
                        if (err) {
                            res.json({ success: response.data.status, message: response.data.message });
                        }
                    });
                    res.json({ success: response.data.status, message: response.data.message });
                })
                .catch(function(error) {
                    res.json({ success: error.response.data.status, message: error.response.data.message });
                });
        }else{
            res.json({ success: 0, message: '' });
        }
    }
    
    static loadthread = async(req, res, token) => {
        const { thread_id } = req.body;
        //var access_token = "";
        // if (res.user.role_id == 2 || res.user.role_id == 1) {
        //     access_token = "64177304;0FgM2taKR8avz4fRx0aieNgYbjvNwUhipGkzjPOOQL4=";
        // } else if (res.user.role_id == 3) {
        //     access_token = "64215283;JBkAvah0Ru4Y3jLANIYlDZGoAKGtDdBFtTsRIzrL22k=";
        // }
        if(res.authenticattion != undefined && res.authenticattion.access_token != ''){
            var config = {
                method: 'get',
                url: `https://www.freelancer.com/api/messages/0.1/messages/?threads[]=${thread_id}&thread_details=true&user_details=true&last_message=true`,
                headers: {
                    'freelancer-oauth-v1': res.authenticattion.access_token
                }
            };
            axios(config)
                .then(function(response) {
                    console.log(response);
                    res.json({ success: response.data.status, message: response.data.result.messages, users: response.data.result.users });
                })
                .catch(function(error) {
                    res.json({ success: error, message: error });
                });
        }

    }

    static sendMsgInChat = async(req, res, token) => {
        const { msg, thread_id } = req.body;
        // var access_token = "";
        // if (res.user.role_id == 2) {
        //     access_token = "64177304;Y6aci12Z9zfXj3BqDnL50qaX9r7AWq/JNA5D5k0cV3I=";
        // } else if (res.user.role_id == 3) {
        //     access_token = "64215283;JBkAvah0Ru4Y3jLANIYlDZGoAKGtDdBFtTsRIzrL22k=";
        // }
        if(res.authenticattion != undefined && res.authenticattion.access_token != ''){
            var config = {
                method: 'post',
                url: `https://www.freelancer.com/api/messages/0.1/threads/${thread_id}/messages/?message=${msg}&client_message_id=${thread_id}`,
                headers: {
                    'freelancer-oauth-v1': res.authenticattion.access_token
                }
            };
            axios(config)
                .then(function(response) {
                    var time = new Date(response.data.result.time_created * 1000);
                    time = time.toString().substr(0, 24);
                    db.query(`INSERT INTO messages(message_id , thread_id , msg_sent_by , message , role_id , created_at ) VALUES ('${response.data.result.id}','${response.data.result.thread_id}','${response.data.result.from_user}','${response.data.result.message}','${res.user.role_id}','${time}')`, async(err, res) => {
                        if (err) {
                            throw err;
                        }
                    })
                    res.json({ success: response.data.status, message: response.data.result.message });
                })
                .catch(function(error) {
                    res.json({ success: '', message: '' });
                });
        }

    }

    static sendInviteToNewMembers = async(req, res) => {
        const { newmemberemail } = req.body;

        var emailerr = false;
        if (newmemberemail != '' || newmemberemail != null || newmemberemail != undefined) {
            var emailarr = [];
            var emailList = newmemberemail.split(',');
            for (var i = 0; i < emailList.length; i++) {
                var regex = /^([a-zA-Z0-9_.+-])+\@(([a-zA-Z0-9-])+\.)+([a-zA-Z0-9]{2,4})+$/;
                var result = regex.test(emailList[i]);
                if (!result) {
                    emailerr = true;
                } else {
                    emailarr.push(emailList[i]);
                }
            }
            // }
            if (emailerr) {
                //send error for invalid email
                res.json({ success: 0, msg: "invalid email address" })
            } else {
                emailarr.forEach((val, i) => {
                    db.query(`select * from users where email = '${val}'`, async(err, result) => {
                        if (err) {
                            throw err;
                        }
                        if (result.length < 1 || result.length == 0) {
                            const secret = randtoken.generate(20);
                            const payload = {
                                invited_by_email: res.user.email,
                                invited_by_username: res.user.username,
                                invited_by_id: res.user.id
                            }
                            const token = jwt.sign(payload, secret, { expiresIn: '30m' });
                            var subject = `Invite to join the team at freelance marketing`;
                            var body = `<p><b style='text-transform:capitalize;'>${res.user.username}</b> has invited you to join their team at freelance marketing.</p>
                                        <p>Click the link now to join freelance trade marketing platform : 
                                            <b>
                                                <a href="http://ec2-34-205-63-120.compute-1.amazonaws.com:8000/register/${token}">Register link</a>
                                            </b>
                                        </p>`;
                            var emailstatus = sendEmail(val, token, subject, body);
                            if (emailstatus == 0 || emailstatus == '0') {
                                res.json({ success: 0, msg: "Error occured. Please try again later." });
                            } else {
                                db.query(`INSERT INTO team_token(team_leader_id, leader_name, token) VALUES ('${res.user.id}','${res.user.username}','${token}')`, async(error_msg, response) => {
                                    if (error_msg) { throw error_msg };
                                })
                                res.json({ success: 1, msg: `the user with ${val} email is not the member of our community. We have sent a invitation email to this user from your side.` });
                            }
                        } else {
                            db.query(`select users.*, team.* from users,team where users.email='${val}' and team.member_id=users.id`, async(error, resp) => {
                                if (error) { throw error }
                                if (resp.length < 1 || resp.length == 0) {
                                    const secret = randtoken.generate(20) + result[0].password;
                                    const payload = {
                                        invited_by_email: res.user.email,
                                        invited_by_username: res.user.username,
                                        invited_by_id: res.user.id,
                                        id: result[0].id
                                    }
                                    const token = jwt.sign(payload, secret, { expiresIn: '30m' });
                                    var subject = `Invite to join the team at freelance marketing`;
                                    var body = `<p>${res.user.username} has invited you to join their team at freelance marketing.</p>
                                        <p>Click the link to join their team : 
                                            <b>
                                                <a href="http://ec2-34-205-63-120.compute-1.amazonaws.com:8000/joinlink/${token}">Join team Link</a>
                                            </b>
                                        </p>`;
                                    var emailstatus = sendEmail(val, token, subject, body);
                                    if (emailstatus == 0 || emailstatus == '0') {
                                        res.json({ success: 0, msg: "Error occured. Please try again later." });
                                    } else {
                                        db.query(`INSERT INTO team_token(team_leader_id, leader_name, token) VALUES ('${res.user.id}','${res.user.username}','${token}')`, async(error_msg, response) => {
                                            if (error_msg) { throw error_msg };
                                        })
                                        res.json({ success: 1, msg: `Invitation email is sent to this ${val} email to join your team at freelance trade marketplace.` });
                                    }
                                } else {
                                    res.json({ success: 0, msg: "user is already the member of the team" });
                                }
                            });
                        }
                    })
                })
            }
        }

    }

    static acceptorrejectteam = (req, res) => {
        const { action, token } = req.body;
        db.query(`select * from team_token where token = '${token}'`, async(err, resu) => {
            if (err) {
                res.json({ success: 0, msg: err })
            } else {
                if (res.length != 0 || res.length > 0) {
                    db.query(`select * from team where member_id = '${res.user.id}'`, async(err, result) => {
                        if (err) {
                            res.json({ success: 0, msg: err })
                        } else {
                            if (result.length == 0) {
                                db.query(`INSERT INTO team(team_leader_id, member_id, joining_status) VALUES ('${resu[0].team_leader_id}','${res.user.id}','1')`, async(error, result) => {
                                    if (error) {
                                        res.json({ success: 0, msg: err })
                                    } else {
                                        db.query(`update users set is_member = '1' where id='${res.user.id}'`, async(err, result) => {
                                            if (err) { console.log(err); } else { console.log(result); }
                                        })
                                        res.json({ success: 1, msg: "done" })
                                    }
                                })
                            } else {
                                res.json({ success: 0, msg: "Already join" })
                            }
                        }
                    })

                }
            }
        })

    }

    static acceptorrejectstatus = (req, res) => {
        const { status, pid, pstatus } = req.body;
        if (status == 2) {
            db.query(`update project_approval set status = '2' where id='${pid}'`, async(err, result) => {
                if (err) {
                    res.json({ success: 0, msg: err, pid: '' })
                } else {
                    res.json({ success: 1, msg: "Project has been rejected", pid: pid })
                }
            })
        } else {
            db.query(`select * from project_approval where id='${pid}'`, async(err, resu) => {
                if (err) { console.log(err); }
                var title = resu[0].title;
                var description = resu[0].description;
                var input_currency = resu[0].currency;
                var budget = resu[0].budget;
                var location = resu[0].location;
                var arrayskills = JSON.parse(resu[0].jobs);

                if (pstatus == 'local') {
                    var data = JSON.stringify({
                        "title": title,
                        "description": description,
                        "currency": {
                            "id": parseInt(JSON.parse(input_currency).id)
                        },
                        "budget": {
                            "minimum": parseInt(JSON.parse(budget).minimum),
                            "maximum": parseInt(JSON.parse(budget).maximum)
                        },
                        "jobs": arrayskills,
                        "location": {
                            "city": JSON.parse(location).city,
                            "country": {
                                "name": JSON.parse(location).country.name
                            },
                            "latitude": parseFloat(JSON.parse(location).latitude),
                            "longitude": parseFloat(JSON.parse(location).longitude)
                        }
                    });
                } else if (pstatus == "fixed") {
                    data = JSON.stringify({
                        "title": title,
                        "description": description,
                        "currency": {
                            "id": parseInt(JSON.parse(input_currency).id)
                        },
                        "budget": {
                            "minimum": parseInt(JSON.parse(budget).minimum),
                            "maximum": parseInt(JSON.parse(budget).maximum)
                        },
                        "jobs": arrayskills
                    });

                } else {
                    var commitment = JSON.parse(resu[0].hourly_project_info);
                    var hours;
                    if (commitment != null) {
                        hours = parseInt(commitment.commitment.hours);
                    } else {
                        hours = null;
                    }
                    data = JSON.stringify({
                        "title": title,
                        "description": description,
                        "currency": {
                            "id": parseInt(JSON.parse(input_currency).id)
                        },
                        "budget": {
                            "minimum": parseInt(JSON.parse(budget).minimum),
                            "maximum": parseInt(JSON.parse(budget).maximum)
                        },
                        "jobs": arrayskills,
                        "type": "HOURLY",
                        "hourly_project_info": {
                            "commitment": {
                                "hours": hours,
                                "interval": "WEEK"
                            }
                        }
                    });
                }
                var config = {
                    method: 'post',
                    url: 'https://www.freelancer.com/api/projects/0.1/projects/?compact=',
                    headers: {
                        'freelancer-auth-v2': "64215283;IZDoMVKfZYkx5epDXt7QDV+O9iYXm9CBWGX7IOhKc78=",
                        'content-type': 'application/json'
                    },
                    data: data
                };
                axios(config)
                    .then(function(response) {
                        response.data.result.type = pstatus;
                        response.data.result.live = 1;
                        response.data.result.currency = JSON.stringify(response.data.result.currency);
                        response.data.result.jobs = JSON.stringify(response.data.result.jobs);
                        response.data.result.budget = JSON.stringify(response.data.result.budget);
                        response.data.result.posted_by = res.user.id,
                            response.data.result.upgrades = JSON.stringify(response.data.result.upgrades);
                        db.query('INSERT INTO localjob_project SET ?', response.data.result, async(error, result) => {
                            if (error) {
                                res.json({ success: 0, msg: error })
                            } else {
                                db.query(`update project_approval set status = '1' where id='${pid}'`, async(err, result) => {
                                    if (err) { console.log(err); } else { console.log(result); }
                                })
                                res.json({ success: 1, msg: "Project has been Accepted", pid: pid })
                            }
                        });
                    })
                    .catch(function(error) {
                        res.json({ success: 0, msg: error, pid: '' })
                    });
            });
        }

    }

    static showProjectWithSpecificProjectType = async(req, res) => {
        const { p_type } = req.body;
        var config = {
            method: 'get',
            url: `https://www.freelancer.com/api/projects/0.1/projects/active?project_types[]=${p_type}`,
            headers: {

            }
        };
        axios(config)
            .then(function(response) {
                res.json({ success: response.data.status, projects: response.data.result });
            })
            .catch(function(error) {
                res.json({ success: error, projects: error });
            });

    }

    static showprojectwithspecificprojectfixedprice = async(req, res) => {
        let { min, max } = req.body;
        min = parseFloat(min);
        max = parseFloat(max);
        var config = {
            method: 'get',
            url: `https://www.freelancer.com/api/projects/0.1/projects/active?min_price=${min}&max_price=${max}&limit=100&avatar=true`,
            headers: {

            },
            data: JSON.stringify({})
        };
        axios(config)
            .then(function(response) {
                res.json({ success: response.data.status, projects: response.data.result });
            })
            .catch(function(error) {
                res.json({ success: error, projects: error });
            });

    }

    static showprojectwithspecificprojecthourlyprice = async(req, res) => {
        let { min, max } = req.body;
        min = parseFloat(min);
        max = parseFloat(max);
        var config = {
            method: 'get',
            url: `https://www.freelancer.com/api/projects/0.1/projects/active?min_hourly_rate=${min}&max_hourly_rate=${max}&limit=100&avatar=true`,
            headers: {

            },
            data: JSON.stringify({})
        };
        axios(config)
            .then(function(response) {
                res.json({ success: response.data.status, projects: response.data.result });
            })
            .catch(function(error) {
                res.json({ success: error, projects: error });
            });

    }

    static showprojectwithspecificlistingtype = async(req, res) => {
        const { l_type } = req.body;
        var config = {
            method: 'get',
            url: `https://www.freelancer.com/api/projects/0.1/projects/active?project_upgrades[]=${l_type}`,
            headers: {

            }
        };
        axios(config)
            .then(function(response) {
                res.json({ success: response.data.status, projects: response.data.result });
            })
            .catch(function(error) {
                res.json({ success: error, projects: error });
            });

    }

    static updateProjectStatus = async(req, res) => {
        const { p_status } = req.body;
        var config = {
            method: 'get',
            url: `https://www.freelancer.com/api/projects/0.1/projects/active?project_upgrades[]=${p_status}`,
            headers: {

            }
        };
        axios(config)
            .then(function(response) {
                res.json({ success: response.data.status, projects: response.data.result });
            })
            .catch(function(error) {
                res.json({ success: error, projects: error });
            });

    }

    // static loadAllThreads = (req, res) => {
    //     var config = {
    //         method: 'get',
    //         url: 'https://www.freelancer.com/api/messages/0.1/threads/?user_details=true&last_message=true',
    //         headers: {
    //             'freelancer-auth-v2': '64177304;DaSK659EJfHMH7fDoi81iKJ1yPPIn4cWdIv6s1ndT1c='
    //         }
    //     };
    static showprojectwithspecificprojectcountrieslistingtype =async(req,res) =>{
        const {l_type} = req.body;
        var condition  = '';
        l_type.forEach((val,i)=>{
            if(i == l_type.length-1){
                condition +=`countries[${i}]=${val}`;
            }else{
                condition +=`countries[${i}]=${val}&`;
            }
        });
        var config = {
            method: 'get',
            url: `https://www.freelancer.com/api/projects/0.1/projects/active?${condition}`,
            headers: {

            }
        };
        axios(config)
        .then(function(response){
            res.json({ success: response.data.status, projects: response.data.result });
        })
        .catch(function(error){
            res.json({ success:error,projects:error });
        })
    }
    static showprojectwithspecificlistingtypelanguages =async(req,res) =>{
        const {l_type} = req.body;
        var config = {
            method: 'get',
            url: `https://www.freelancer.com/api/projects/0.1/projects/active?languages[]=${l_type}`,
            headers: {

            }
        };
        axios(config)
        .then(function(response){
            res.json({ success: response.data.status, projects: response.data.result });
        })
        .catch(function(error){
            res.json({ success:error,projects:error });
        })
    }

    static AcceptAward = async(req,res,token)=>{
        const {bidid} = req.body;
        var config = {
            method: 'put',
            url: `https://www.freelancer.com/api/projects/0.1/bids/${bidid}/?action=accept`,
            headers: {
                'freelancer-oauth-v1': token,
                'Content-Type': 'application/x-www-form-urlencoded'
            }
        };

        axios(config)
        .then(function(response){
            console.log(response)
            res.json({ success: response.data.status, projects: response.data.result });
        })
        .catch(function(error){
            console.log(error)
            res.json({ success:error,projects:error });
        })
    }
}

function getAllHiredFreelancer(req, res) {
    var arr = [];
    db.query(`select * from freelancer_jobs`, async(err, resp) => {
        if (err) {
            throw err;
        } else {
            if (resp.length > 0) {
                var arr = [];
                var conditionarr = '';
                resp.forEach((val, i) => {
                    arr[i] = val.bidder_id;
                })
                arr.forEach((element, i) => {
                    if (i == arr.length - 1) {
                        conditionarr += `users[]=${element}`;
                    } else {
                        conditionarr += `users[]=${element}&`;
                    }
                });
                var tmp_config = {
                    method: 'get',
                    url: `https://www.freelancer.com/api/users/0.1/users?${conditionarr}&avatar=true`,
                    headers: {
                        'freelancer-auth-v2': '64177304;0FgM2taKR8avz4fRx0aieNgYbjvNwUhipGkzjPOOQL4='
                    }
                };
                axios(tmp_config)
                    .then(function(hiref_freelancers) {
                        arr = hiref_freelancers.data;
                        return arr;
                    }).catch(function(err) {
                        arr = hiref_freelancers.data;
                        return arr;
                    })
            } else {
                return arr;
            }
        }
    })
}

function sendEmail(email, token, subject, body) {
    var email = email;
    var token = token;
    var mail = nodemailer.createTransport({
        host: 'smtp.gmail.com',
        port: 587,
        secure: false,
        auth: {
            user: 'develop.kvell@gmail.com', // Your email id
            pass: 'mlducjbkwetemxxt' // Your password
        }
    });
    var mailOptions = {
            from: mail.options.auth.user,
            to: email,
            subject: subject,
            // html: '<p>You requested for reset password, kindly use this <a href="http://ec2-34-205-63-120.compute-1.amazonaws.com:8000/reset-password/' + token + '">link</a> to reset your password</p>'
            html: body
        }
    mail.sendMail(mailOptions, function(error, info) {
        if (error) {
            console.log(error);
        } else {
            console.log(0)
        }
    });
}

module.exports = {
    ApiController
}