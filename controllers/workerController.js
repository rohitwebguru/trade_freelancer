const axios = require('axios');
const { json } = require('express');
const db = require("../routes/db-config");
const qs = require('qs');
var SqlString = require('sqlstring');

class WorkerController {

    static showAllProjects = async(req, res) => {
        let data;
        db.query("Select * from localjob_project where live = 1", async(err, result) => {
            if (err) {
                throw err;
            } else {
                data = result;
                res.render("allprojects", { status: 'loggedIn', user: res.user, layout: './layouts/allprojects', "result": data });
            }
        })
    }

    static showProjectsToClientDashboard = async(req, res) => {
        let data;
        db.query(`select * from localjob_project where posted_by = ${res.user.id} order by id desc limit 1`, async(err, result) => {
            if (err) {
                throw err;
            } else {
                data = result;
                if(data.length > 0){
                    var config = {
                        method: 'get',
                        url: `https://www.freelancer.com/api/projects/0.1/projects?owners[]=${data[0].owner_id}&selected_bids=true&limit=3`,
                        headers: {}
                    };
    
                    axios(config)
                        .then(function(response) {
                            var limit = 3;
                            var offset = 0;
                            if (req.query.page != undefined && req.query.page != 1) {
                                offset = (req.query.page - 1) * limit;
                            }
                            var config = {
                                method: 'get',
                                url: `https://www.freelancer.com/api/projects/0.1/projects?owners[]=${data[0].owner_id}&selected_bids=true&limit=${limit}&offset=${offset}`,
                            };
                            let projectcounts;
                            let projectcounts2;
                            let projects;
                            let saveddata;
                            let total_pages2;
                            let project_total_pages2;
                            let projectsids = [];;
                            axios(config).then(function(response) {
                                var config = {
                                    method: 'get',
                                    url: `https://www.freelancer.com/api/projects/0.1/projects?owners[]=${data[0].owner_id}`,
                                };
                                axios(config).then(function(result) {
                                    projectcounts2 = result.data.result.projects.length;
                                    total_pages2 = Math.ceil(projectcounts2 / limit);
                                    projectcounts = response.data.result.projects.length;
                                    projects = response.data.result.projects;
                                    let project_approval_length;
                                    let project_approval;
                                    db.query(`Select * from project_approval Where leader_id = ${res.user.id} and status = 0 Order by id desc LIMIT 3`, async(err, result2) => {
                                        if (err) {
                                            console.log(err);
                                        } else {
                                            project_approval_length = result2.length;
                                            project_approval = result2;
                                            project_total_pages2 = Math.ceil(project_approval_length / limit);
                                        }
                                        res.render("dashboard", {
                                            clientprojects: response.data.result.projects,
                                            user: res.user,
                                            totalprojects: projectcounts,
                                            total_pages2: total_pages2,
                                            project_total_pages2: project_total_pages2,
                                            currentpage: req.query.page,
                                            project_approval: project_approval,
                                            layout: './layouts/dashboard'
                                        });
                                    })
                                });
    
                            }).catch(function(error) {
                                console.log(error);
                            });
                        })
                        .catch(function(error) {
                            res.render("dashboard", {
                                clientprojects: [],
                                user: res.user,
                                totalprojects: [],
                                total_pages2: [],
                                project_total_pages2: [],
                                currentpage: [],
                                project_approval: [],
                                layout: './layouts/dashboard'
                            });
                        });
                }else{
                    res.render("dashboard", {
                        clientprojects: [],
                        user: res.user,
                        totalprojects: [],
                        total_pages2: [],
                        project_total_pages2: [],
                        currentpage: [],
                        project_approval: [],
                        layout: './layouts/dashboard'
                    });
                }
            }
        })


    }
    static seeAllClientPosting = async(req, res) => {
        let data;
        db.query(`Select * from localjob_project where posted_by = '${res.user.id}' and live=1 order by id desc`, async(err, result) => {
            if (err) {
                throw err;
            } else {
                data = result;
                res.json({ success: 1, "clientprojects": data, user: res.user });
            }
        })
    }

    static showProjectsToFreelancerDashboard = async(req, res, temp, jobs_results, activeclass, activeclass2,countries) => {
        let data;
        let page;
        let start_from;
        if (res.authenticattion.access_token != undefined) {
            var limit = 20;
            var offset = 0;
            if (req.query.page != undefined && req.query.page != 1) {
                offset = (req.query.page - 1) * limit;
            }
            var config = {
                method: 'get',
                url: `https://www.freelancer.com/api/projects/0.1/projects/all?limit=${limit}&offset=${offset}`,
            };
            let projectcounts;
            let projectcounts2;
            let projects;
            let saveddata;
            let total_pages;
            let projectsids = [];;
            axios(config).then(function(response) {
                var config = {
                    method: 'get',
                    url: 'https://www.freelancer.com/api/projects/0.1/projects/all',
                };
                axios(config).then(function(result) {
                    projectcounts2 = result.data.result.projects.length;
                    total_pages = Math.ceil(projectcounts2 / limit);
                    projectcounts = response.data.result.projects.length;
                    projects = response.data.result.projects;
                    db.query("Select * from saved_projects Where flag = 1 order by id desc", async(err, result) => {
                        if (err) {
                            console.log(err);
                        } else {
                            saveddata = result;
                            var condition = '';
                            result.forEach((obj, i) => {
                                if (i == result.length - 1) {
                                    condition += `projects[]=${obj.project_id}`;
                                } else {
                                    condition += `projects[]=${obj.project_id}&`;
                                }
                            });
                            var config = {
                                method: 'get',
                                url: `https://www.freelancer.com/api/projects/0.1/projects?${condition}`,
                                headers: {
                                    'freelancer-auth-v2': '64177304;xq6xGDB5iNSmIcVMP+hCN7SSxbpXASLLnGN9Sy5cCH0='
                                }
                            };
                            var savedprojects = '';
                            axios(config).then(function(response) {
                                if (response.data.result.projects.length > 0) {
                                    savedprojects = response.data.result.projects;
                                }
                                res.render("dashboard", { result: projects, user: res.user, jobs_results: jobs_results, totalprojects: projectcounts, savedresult: savedprojects, activeclass: activeclass, activeclass2: activeclass2, total_pages: total_pages, currentpage: req.query.page, layout: './layouts/dashboard',countries:countries });
                            }).catch(function(error) {
                                console.log(error);
                            });
                        }
                    })
                });

            }).catch(function(error) {
                console.log(error);
            });
        }
    }

    
    static showProjectInfo = async(req, res) => {
        const { id } = req.params;
        var config = {
            method: 'get',
            url: `https://www.freelancer.com/api/projects/0.1/projects/${id}?full_description=true&&job_details=true`,
            headers: {
                'freelancer-auth-v2': '64177304;xq6xGDB5iNSmIcVMP+hCN7SSxbpXASLLnGN9Sy5cCH0='
            }
        };

        axios(config)
            .then(function(response) {
                var recentjobs;
                var config = {
                    method: 'get',
                    url: `https://www.freelancer.com/api/projects/0.1/projects?owners[]=${response.data.result.owner_id}`,
                    headers: {
                        'freelancer-auth-v2': '64177304;xq6xGDB5iNSmIcVMP+hCN7SSxbpXASLLnGN9Sy5cCH0='
                    }
                };

                axios(config)
                    .then(function(recentpro) {
                        recentjobs = recentpro.data.result.projects;
                        var userconfig = {
                            method: 'get',
                            url: `https://www.freelancer.com/api/users/0.1/users/${response.data.result.owner_id}`,
                            headers: {}
                        };

                        axios(userconfig)
                            .then(function(resp) {
                                res.render("project", { status: 'loggedIn', user: res.user, layout: './layouts/project', "result": response.data.result, "recentjobs": recentjobs, "postedby": resp.data.result });
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

    static manageprojectproposal = async(req, res) => {
        const { id, pid } = req.params;
        var config = {
            method: 'get',
            url: `https://www.freelancer.com/api/projects/0.1/projects/${id}?full_description=true&&job_details=true`,
            headers: {
                'freelancer-auth-v2': '64215283;4S9GLn79Dny4fyWHlmorMxTHOkzIislP1jlX4YPOHTI='
            }
        };

        axios(config)
            .then(function(response) {
                var recentjobs;

                db.query(`select * from proposal_pending where proposal_id='${pid}'`, async(erro, respon) => {
                    if (erro) { throw erro } else {
                        if (respon.length > 0) {
                            var config = {
                                method: 'get',
                                url: `https://www.freelancer.com/api/projects/0.1/projects?owners[]=${response.data.result.owner_id}`,
                                headers: {
                                    'freelancer-auth-v2': '64177304;xq6xGDB5iNSmIcVMP+hCN7SSxbpXASLLnGN9Sy5cCH0='
                                }
                            };

                            axios(config)
                                .then(function(recentpro) {
                                    recentjobs = recentpro.data.result.projects;
                                    var userconfig = {
                                        method: 'get',
                                        url: `https://www.freelancer.com/api/users/0.1/users/${response.data.result.owner_id}`,
                                        headers: {}
                                    };

                                    axios(userconfig)
                                        .then(function(resp) {
                                            res.render("manageprojectproposal", { status: 'loggedIn', user: res.user, proposal: respon, layout: './layouts/manageprojectproposal', "result": response.data.result, "recentjobs": recentjobs, "postedby": resp.data.result });
                                        })
                                        .catch(function(error) {
                                            console.log(error);
                                        });
                                })
                                .catch(function(error) {
                                    console.log(error);
                                });
                        }
                    }
                })
            })
            .catch(function(error) {
                console.log(error);
            });
    }

    static placeBidByTeamLeader = async(req, res) => {
        const { project_id, proposal_id, bid_amount, numberOfDays, proposal } = req.body;
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
                db.query(`update proposal_pending set status=1 where proposal_id=${proposal_id}`, async(errorinfo, resultinfo) => {
                    if (errorinfo) { throw errorinfo }
                })
                res.json({ 'status': 'success', "msg": "you have successfully made a bid on this project" });
            })
            .catch(function(error) {
                db.query(`update proposal_pending set status=0 where proposal_id=${proposal_id}`, async(errorinfo, resultinfo) => {
                        if (errorinfo) { throw errorinfo }
                    })
                res.json({ 'status': 'error', "msg": error.response.data.message });
            });
    }

    static rejectBidOfTeamMember = async(req, res) => {
        const { proposal_id } = req.body;
        db.query(`update proposal_pending set status=2 where proposal_id='${proposal_id}'`, async(err, resp) => {
            if (err) { throw err } else {
                res.json({ success: 1, msg: "The Bid have been rejected" });
            }
        })
    }

    static showProjectsToChooseProjectToInviteFreelncer = async(req, res) => {
        let data;
        db.query(`Select * from localjob_project where posted_by = '${res.user.id}' and live = 1 order by id desc`, async(err, result) => {
            if (err) {
                throw err;
            } else {
                data = result;
                res.json({ "clientprojects": data, user: res.user });
            }
        })
    }

    static sendInvitation = async(req, res, token) => {
        const { message_for_freelancer, fid, chooseproject, owner_id } = req.body;
        var data = JSON.stringify({
            "freelancer_id": parseInt(fid),
            "message": message_for_freelancer
        });

        var config = {
            method: 'post',
            url: `https://www.freelancer.com/api/projects/0.1/projects/${chooseproject}/invite/`,
            headers: {
                'freelancer-oauth-v1': token,//'64177304;DaSK659EJfHMH7fDoi81iKJ1yPPIn4cWdIv6s1ndT1c=',
                'Content-Type': 'application/json'
            },
            data: data
        };

        axios(config)
            .then(function(response) {
                const query = `INSERT INTO invite_freelancer (project_id, freelancer_id, message, invited_by, status)  VALUES ('${chooseproject}','${parseInt(fid)}', '${message_for_freelancer}', '${res.user.id}', '0')`;
                db.query(query, function(error, data) {
                        if (error) {
                            res.json({ "response": error.response.data, "redirect": '/browsefreelancers' });
                        } else {
                            res.json({ success: response.data.status, message: response.data.message });
                        }
                    })
            })
            .catch(function(error) { console.log(error);res.json({ success: "error", message: error.response.data.message }); });
    }

}

module.exports = {
    WorkerController
}