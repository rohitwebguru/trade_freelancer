const express = require("express");
const router = express.Router();
const db = require("../routes/db-config");
const multer = require("multer");
const path = require("path");
const { LoginController } = require('../controllers/loginController');
const { RegisterController } = require('../controllers/registerController');
const { ForgotPasswordController } = require('../controllers/forgotpasswordController');
const { ApiController } = require('../controllers/apiController');
const { WorkerController } = require("../controllers/workerController");
const { LoggedIn } = require('../controllers/loggedin');
const { Authenticattion, AuthenticattionJob, AuthenticattionCurrency, getAllTeamMembers, TotalProjects, TotalClients, TotalFreelancers, TotalApprovalPosts, getCompleteUser, AuthenticattionFreelancerList, getBiddingnotifications, getProjectnotifications, AuthenticattionFreelancerHireList, listAllCountries, listAllHiredFreelancers, getAllPendingOperationsForFreelancerManager, getTeamName, getAwardBidnotifications } = require('../controllers/loggedin');
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

router.get('/', (req, res) => {
    res.render('login', { token: null, layout: './layouts/login' });
})

router.get('/login/:token', (req, res) => {
    res.render('login', { token: req.params.token, layout: './layouts/login' });
})

router.get('/register', (req, res) => {
    res.render('register', { token: null, layout: './layouts/register' });
})

router.get('/register/:token', (req, res) => {
    res.render('register', { token: req.params.token, layout: './layouts/register' });
})

router.get('/joinlink/:token', LoggedIn, Authenticattion, (req, res) => {
    if (res.user != undefined && res.isAuthenticattion == 1) {
        ApiController.joinLinkData(req, res, req.params.token);
    } else {
        res.clearCookie('userRegistered');
        res.redirect(`/login/${req.params.token}`);
    }
})

router.post('/updateTeamJoiningStatus', LoggedIn, Authenticattion, (req, res) => {
    if (res.user != undefined && res.isAuthenticattion == 1) {
        ApiController.acceptorrejectteam(req, res);
    } else {
        res.clearCookie('userRegistered');
        res.redirect('/');
    }
})

router.post('/updateprojectapprovalstatus', LoggedIn, Authenticattion, (req, res) => {
    if (res.user != undefined && res.isAuthenticattion == 1) {
        ApiController.acceptorrejectstatus(req, res);
    } else {
        res.clearCookie('userRegistered');
        res.redirect('/');
    }
})

router.get('/forgot-password', (req, res) => {
    res.render('forgot-password', { layout: './layouts/forgot-password' });
})

router.get('/reset-password/:token', (req, res) => {
    const { id, token } = req.params;
    res.render('reset-password', { token: token, layout: './layouts/reset-password' });
})

router.get('/dashboard', LoggedIn, Authenticattion, AuthenticattionJob, TotalProjects, TotalClients, TotalFreelancers, TotalApprovalPosts, listAllCountries, getCompleteUser,(req, res) => {
    if (res.user != undefined && res.isAuthenticattion == 1) {
    //if (res.user != undefined) {
        if (res.user.role_id == 1) {
            res.render('dashboard', { status: 'loggedIn', user: res.user, totalprojects: res.totalprojects, totalclients: res.totalclients, totalfreelancers: res.totalfreelancers, layout: './layouts/dashboard', project: res.project, clients: res.clients, freelancer: res.freelancer });
        } else if (res.user.role_id == 2) {
            WorkerController.showProjectsToClientDashboard(req, res);
        } else if (res.user.role_id == 3) {
            let jobs = typeof res.jobs !== "undefined" ? res.jobs : '';
            var jobsdatas;
            if (jobs != undefined) {
                jobsdatas = JSON.parse(jobs);
                var jobs_results;
                if (jobsdatas.status == 'success') {
                    jobs_results = jobsdatas.result;
                }
            } else {
                jobs_results = [];
            }

            var activeclass;
            var activeclass2;
            if (req.query.tab != undefined && req.query.tab == 'saved') {
                activeclass = 'active'
            } else {
                activeclass2 = 'active'
            }
            let countries = typeof req.countries !== "undefined" ? req.countries : '';
            WorkerController.showProjectsToFreelancerDashboard(req, res, res.totalprojects, jobs_results, activeclass, activeclass2,countries);
        }
    } else {
        res.clearCookie('userRegistered');
        res.redirect('/');
    }
})

router.post('/getAllNotifications', LoggedIn, Authenticattion, getBiddingnotifications, getProjectnotifications, getAwardBidnotifications, (req, res) => {
    if (res.user != undefined && res.isAuthenticattion == 1) {
        let bidnotifications = typeof req.biddingNotifications !== "undefined" ? req.biddingNotifications : '';
        let AwardBidNotifications = typeof req.AwardBidNotifications !== "undefined" ? req.AwardBidNotifications : '';
        console.log(AwardBidNotifications)
        res.json({ status: 1, bidnotifications: bidnotifications, ProjectNotifications: req.ProjectNotifications, AwardBidNotifications: AwardBidNotifications })
    } else {
        res.clearCookie('userRegistered');
        res.redirect('/');
    }
})

router.get('/auth', LoggedIn, Authenticattion, (req, res) => {
console.log("check")
    if (req.query.code != undefined) {
        var code = req.query.code;
        var data = qs.stringify({
            'grant_type': 'authorization_code',
            'code': code,
            'client_id': '40119df1-9f69-4e0b-83e2-0ef77d2be0b6',//'51adab80-6ff7-4e0a-8b59-9bb84b3f4316',
            'client_secret': 'c78ac2d2010c7f4c00d2f0eb0f9ba01174aa1e4b15449eeca058cd887c29fb0d9e08b4f8d355f5e5d0828c14217c4a7c43d407301699c8a896a2e62e9f2568b6',//'bdb314aef3e963834abead317ff5758f42cbd6c212ed7e32492038b54f2e1f4eb6ed85f00a4b1edb5d2e51f744b6bcb05cc1ee4eb9c5c83f7bc27e023ad0c4a6',
            'redirect_uri': 'http://localhost:8000/auth'
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
            var result = JSON.stringify(response.data);
            if ((response.data.error != 'invalid_grant') && (response.data.error != 'unauthorized_client')) {
                db.query(`Select * from authenticattion where user_id = ('${res.user.id}')`, async(err, dbresult) => {
                    if (typeof dbresult !== 'undefined' && dbresult.length === 1) {
                        const info = {
                            "data": result,
                            "authenticattion_end": authenticattion_end,
                        }
                        console.log(info)
                        db.query('update authenticattion SET ? where ? ', [info,{"user_id":res.user.id}], async(err,result) => {
                            if(err) console.log(err);
                        })
                    } else {
                        const query =
                        `INSERT INTO authenticattion 
                        (data,authenticattion_end,user_id)
                        VALUES ('${result}', '${authenticattion_end}', ${res.user.id})
                        `;
                        db.query(query, function(error, data) {
                            if(error) console.log(error);
                        })
                    }
                });
                errormessage = '';
                errormessagedesc = '';
            } else {
                errormessage = response.data.error
                errormessagedesc = response.data.error_description
            }
            res.render('auth_token', { status: 'loggedIn', user: res.user, code: req.query.code, errormsg: errormessage, errormsgdesc: errormessagedesc, layout: './layouts/auth_token' });
        }).catch(function(error) {
            errorcode = typeof error.response !== "undefined" ? error.response.data.status_code : '';
            errormessage = typeof error.response !== "undefined" ? error.response.data.message : '';
            res.render('auth_token', { status: 'loggedIn', user: res.user, code: '', errormsg: errorcode, errormsgdesc: errormessage, layout: './layouts/auth_token' });
        });
    } else {
        res.redirect('/setting');
    }
})

router.get('/profile', LoggedIn, Authenticattion, AuthenticattionJob, getTeamName, (req, res) => {
    if (res.user != undefined && res.isAuthenticattion == 1) {
        let access_token = typeof res.authenticattion !== "undefined" ? res.authenticattion.access_token : '';
        let team_name = typeof req.name !== "undefined" ? req.name : '';
        let jobs = typeof res.jobs !== "undefined" ? res.jobs : '';
        var jobsdatas;
        if (jobs != undefined) {
            jobsdatas = JSON.parse(jobs);
            var jobs_results;
            if (jobsdatas.status == 'success') {
                jobs_results = jobsdatas.result;
            }
        } else {
            jobs_results = [];
        }

        if (res.user.skills != '') {
            isskillsstatus = true;
        } else {
            isskillsstatus = false;
        }
        res.render('profile', { status: 'loggedIn', user: res.user, isskillsstatus: isskillsstatus, jobs_results: jobs_results, team_name: team_name, layout: './layouts/profile' });
    } else {
        res.clearCookie('userRegistered');
        res.redirect('/');
    }
})

router.get('/setting', LoggedIn, Authenticattion, (req, res) => {
    if (res.user != undefined && res.isAuthenticattion == 1) {
        res.render('setting', { status: 'loggedIn', user: res.user, authenticattion: res.authenticattion, authenticattion_end: res.authenticattion_end, layout: './layouts/setting' });
    } else {
        res.clearCookie('userRegistered');
        res.redirect('/');
    }
})

/* Lalit Code */
router.get('/jobid', LoggedIn, Authenticattion, (req, res) => {
    if (res.user != undefined && res.isAuthenticattion == 1) {
        res.render('jobid', { status: 'loggedIn', user: res.user, layout: './layouts/jobid' });
    } else {
        res.clearCookie('userRegistered');
        res.redirect('/');
    }
})

router.get('/currencyid', LoggedIn, Authenticattion, (req, res) => {
    if (res.user != undefined && res.isAuthenticattion == 1) {
        res.render('currencyid', { status: 'loggedIn', user: res.user, layout: './layouts/currencyid' });
    } else {
        res.clearCookie('userRegistered');
        res.redirect('/');
    }
})
router.get('/managingproject', LoggedIn, Authenticattion, (req, res) => {
    if (res.user != undefined && res.isAuthenticattion == 1) {
        ApiController.showManageProjectData(req, res);
    } else {
        res.clearCookie('userRegistered');
        res.redirect('/');
    }
});

router.post('/see-all-client-posting', LoggedIn, Authenticattion, (req, res) => {
    if (res.user != undefined && res.isAuthenticattion == 1) {
        WorkerController.seeAllClientPosting(req, res);
    } else {
        res.clearCookie('userRegistered');
        res.redirect('/');
    }
});

router.get('/browsefreelancers', LoggedIn, Authenticattion, AuthenticattionJob, AuthenticattionFreelancerHireList, listAllCountries, (req, res) => {
    if (res.user != undefined && res.isAuthenticattion == 1) {
        let jobs = typeof res.jobs !== "undefined" ? res.jobs : '';
        var jobsdatas;
        if (jobs != undefined) {
            jobsdatas = JSON.parse(jobs);
            var jobs_results;
            if (jobsdatas.status == 'success') {
                jobs_results = jobsdatas.result;
            }
        }
        let token = typeof res.authenticattion !== "undefined" ? res.authenticattion.access_token : '';
        let resultlisthire = typeof req.resultlisthire !== "undefined" ? req.resultlisthire : '';
        let countries = typeof req.countries !== "undefined" ? req.countries : '';
        ApiController.browseFreelancers(req, res, jobs_results, token, resultlisthire, countries);
    } else {
        res.clearCookie('userRegistered');
        res.redirect('/');
    }
});

router.post('/search_freelancer_with_specified_skill', LoggedIn, Authenticattion, (req, res) => {
    if (res.user != undefined && res.isAuthenticattion == 1) {
        let token = typeof res.authenticattion !== "undefined" ? res.authenticattion.access_token : '';
        ApiController.showFreelancerWithSpecificSkills(req, res, token);
    } else {
        res.clearCookie('userRegistered');
        res.redirect('/');
    }
});
router.post('/search_freelancer_with_specified_skill_projects', LoggedIn, Authenticattion, (req, res) => {
    if (res.user != undefined && res.isAuthenticattion == 1) {
        let token = typeof res.authenticattion !== "undefined" ? res.authenticattion.access_token : '';
        ApiController.showFreelancerWithSpecificSkillsProject(req, res, token);
    } else {
        res.clearCookie('userRegistered');
        res.redirect('/');
    }
});
router.post('/saved_freelancer_with_projects', LoggedIn, Authenticattion, (req, res) => {
    if (res.user != undefined && res.isAuthenticattion == 1) {
        ApiController.showSavedFreelancers(req, res);
    } else {
        res.clearCookie('userRegistered');
        res.redirect('/');
    }
});

router.post('/searchfreelancerwithspicificcountries', LoggedIn, Authenticattion, (req, res) => {
    if (res.user != undefined && res.isAuthenticattion == 1) {
        let token = typeof res.authenticattion !== "undefined" ? res.authenticattion.access_token : '';
        ApiController.showFreelancerWithSpecificCountries(req, res, token);
    } else {
        res.clearCookie('userRegistered');
        res.redirect('/');
    }
});

router.post('/searchonlinefreelancers', LoggedIn, Authenticattion, (req, res) => {
    if (res.user != undefined && res.isAuthenticattion == 1) {
        let token = typeof res.authenticattion !== "undefined" ? res.authenticattion.access_token : '';
        ApiController.showOnlineFreelancers(req, res, token);
    } else {
        res.clearCookie('userRegistered');
        res.redirect('/');
    }
});

router.post('/loadfreelancerwithmaxmin', LoggedIn, Authenticattion, (req, res) => {
    if (res.user != undefined && res.isAuthenticattion == 1) {
        let token = typeof res.authenticattion !== "undefined" ? res.authenticattion.access_token : '';
        ApiController.showFreelancerswithHourlyRate(req, res, token);
    } else {
        res.clearCookie('userRegistered');
        res.redirect('/');
    }
});
router.post('/loadfreelancerwithmaxminreview', LoggedIn, Authenticattion, (req, res) => {
    if (res.user != undefined && res.isAuthenticattion == 1) {
        let token = typeof res.authenticattion !== "undefined" ? res.authenticattion.access_token : '';
        ApiController.showFreelancerswithReviewRate(req, res, token);
    } else {
        res.clearCookie('userRegistered');
        res.redirect('/');
    }
});

router.post('/savefreelancer', LoggedIn, Authenticattion, (req, res) => {
    if (res.user != undefined && res.isAuthenticattion == 1) {
        ApiController.savefreelancer(req, res);
    } else {
        res.clearCookie('userRegistered');
        res.redirect('/');
    }
});

router.post('/loadclientporjects', LoggedIn, Authenticattion, (req, res) => {
    if (res.user != undefined && res.isAuthenticattion == 1) {
        WorkerController.showProjectsToChooseProjectToInviteFreelncer(req, res);
    } else {
        res.clearCookie('userRegistered');
        res.redirect('/');
    }
});

router.post('/sendprojectinvitation', LoggedIn, Authenticattion, (req, res) => {
    if (res.user != undefined && res.isAuthenticattion == 1) {
        let token = typeof res.authenticattion !== "undefined" ? res.authenticattion.access_token : '';
        WorkerController.sendInvitation(req, res, token);
    } else {
        res.clearCookie('userRegistered');
        res.redirect('/');
    }
});

router.post('/invitationstatusaction', LoggedIn, Authenticattion, (req, res) => {
    if (res.user != undefined && res.isAuthenticattion == 1) {
        let token = typeof res.authenticattion !== "undefined" ? res.authenticattion.access_token : '';
        ApiController.invitationstatusaction(req, res, token);
    } else {
        res.clearCookie('userRegistered');
        res.redirect('/');
    }
});

router.post('/myjobsprojectstatus', LoggedIn, Authenticattion, (req, res) => {
    if (res.user != undefined && res.isAuthenticattion == 1) {
        let token = typeof res.authenticattion !== "undefined" ? res.authenticattion.access_token : '';
        ApiController.myjobsprojectstatus(req, res, token);
    } else {
        res.clearCookie('userRegistered');
        res.redirect('/');
    }
});

router.get('/post-job', LoggedIn, Authenticattion, AuthenticattionJob, AuthenticattionCurrency, (req, res) => {
    if (res.user != undefined && res.isAuthenticattion == 1) {
        let jobs = typeof res.jobs !== "undefined" ? res.jobs : '';
        var jobsdatas;
        if (jobs != undefined) {
            jobsdatas = JSON.parse(jobs);
            var jobs_results;
            if (jobsdatas.status == 'success') {
                jobs_results = jobsdatas.result;
            }
        }
        let currency = typeof res.currency !== "undefined" ? res.currency : '';
        if (currency != undefined) {
            currencydatas = JSON.parse(currency);
            var currency_results;
            if (currencydatas.status = 'success') {
                currency_results = currencydatas.result;
            }
        }
        let token = typeof res.authenticattion !== "undefined" ? res.authenticattion.access_token : '';
        const { uid, invite } = req.query;
        res.render('postajob', { user: res.user, token: token, jobs_results: jobs_results, currency_results: currency_results, uid: uid, invite: invite, layout: './layouts/postajob' });
    } else {
        res.clearCookie('userRegistered');
        res.redirect('/');
    }
});

router.post('/job-post', LoggedIn, Authenticattion, (req, res) => {
    if (res.user != undefined && res.isAuthenticattion == 1) {
        ApiController.addProjectAndSendInvite(req, res);
    } else {
        res.clearCookie('userRegistered');
        res.redirect('/');
    }
});

router.get('/addusers', LoggedIn, Authenticattion, (req, res) => {
    if (res.user != undefined && res.isAuthenticattion == 1) {
        ApiController.addUserData(req, res);
    } else {
        res.clearCookie('userRegistered');
        res.redirect('/');
    }
});

router.get('/temp', LoggedIn, Authenticattion, (req, res) => {
    if (res.user != undefined && res.isAuthenticattion == 1) {
        ApiController.loadAllThreads(req, res);
    } else {
        res.clearCookie('userRegistered');
        res.redirect('/');
    }
});

router.post('/addusers/insert/', LoggedIn, Authenticattion, (req, res) => {
    if (res.user != undefined && res.isAuthenticattion == 1) {
        ApiController.addUserInsertData(req, res)
    } else {
        res.clearCookie('userRegistered');
        res.redirect('/');
    }
})

router.post('/managingproject/projecttype', LoggedIn, Authenticattion, (req, res) => {
    if (res.user != undefined && res.isAuthenticattion == 1) {
        ApiController.showProjectsWithSpecificProjectType(req, res);
    } else {
        res.clearCookie('userRegistered');
        res.redirect('/');
    }
});

router.post('/managingproject/searchproject', LoggedIn, Authenticattion, (req, res) => {
    if (res.user != undefined && res.isAuthenticattion == 1) {
        ApiController.showProjectsWithSpecificTitle(req, res);
    } else {
        res.clearCookie('userRegistered');
        res.redirect('/');
    }
});

router.post('/managingproject/edit/:id', LoggedIn, Authenticattion, AuthenticattionJob, (req, res) => {
    if (res.user != undefined && res.isAuthenticattion == 1) {
        let jobs = typeof res.jobs !== "undefined" ? res.jobs : '';
        var jobsdatas;
        if (jobs != undefined) {
            jobsdatas = JSON.parse(jobs);
            var jobs_results;
            if (jobsdatas.status == 'success') {
                jobs_results = jobsdatas.result;
            }
        }
        ApiController.editProject(req, res, jobs_results);
    } else {
        res.clearCookie('userRegistered');
        res.redirect('/');
    }
});

router.post('/managingproject/update/', LoggedIn, Authenticattion, (req, res) => {
    if (res.user != undefined && res.isAuthenticattion == 1) {
        ApiController.updateProject(req, res);
    } else {
        res.clearCookie('userRegistered');
        res.redirect('/');
    }
});

router.get('/managingproject/delete/:id', LoggedIn, Authenticattion, (req, res) => {
    if (res.user != undefined && res.isAuthenticattion == 1) {
        ApiController.deleteProject(req, res);
    } else {
        res.clearCookie('userRegistered');
        res.redirect('/');
    }
});

router.post('/dashboard/createabid', LoggedIn, Authenticattion, (req, res) => {
    if (res.user != undefined && res.isAuthenticattion == 1) {
        ApiController.createaBidding(req, res);
    } else {
        res.clearCookie('userRegistered');
        res.redirect('/');
    }
});

// router.get('/managingproject/view/:id', LoggedIn, Authenticattion, (req, res) => {
//     if (res.user != undefined && res.isAuthenticattion == 1) {
//         
//         ApiController.viewProject(req, res);
//     } else {
//         res.clearCookie('userRegistered');
//         res.redirect('/');
//     }
// });

router.get('/creatingproject', LoggedIn, Authenticattion, (req, res) => {
    if (res.user != undefined && res.isAuthenticattion == 1) {
        ApiController.showCreatingProjectData(req, res);
    } else {
        res.clearCookie('userRegistered');
        res.redirect('/');
    }
});

router.get('/addproject/:id', LoggedIn, Authenticattion, AuthenticattionJob, AuthenticattionCurrency, (req, res) => {
    if (res.user != undefined && res.isAuthenticattion == 1) {
        let currency = typeof res.currency !== "undefined" ? res.currency : undefined;
        let currency_results;
        if (currency != undefined) {
            currencydatas = JSON.parse(currency);
            if (currencydatas.status = 'success') {
                currency_results = currencydatas.result;
            }
        }
        let jobs = typeof res.jobs !== "undefined" ? res.jobs : '';
        var jobsdatas;
        if (jobs != undefined) {
            jobsdatas = JSON.parse(jobs);
            var jobs_results;
            if (jobsdatas.status == 'success') {
                jobs_results = jobsdatas.result;
            } else {
                jobs_results = undefined;
            }
        } else {
            jobs_results = [];
        }
        var config = {
            method: 'get',
            url: 'http://localhost:8000/assets/worldcities.json'
        };
        axios(config).then(function(response) {
            ApiController.editmanageoperationsProject(req, res, currency_results, jobs_results, req.params.id, response);
        }).catch(function(error) {
            ApiController.editmanageoperationsProject(req, res, currency_results, jobs_results, req.params.id, null);
        });
    } else {
        res.clearCookie('userRegistered');
        res.redirect('/');
    }
});

router.post('/creatingproject/edit/:id', LoggedIn, Authenticattion, AuthenticattionJob, (req, res) => {
    let jobs = typeof res.jobs !== "undefined" ? res.jobs : '';
    var jobsdatas;
    if (jobs != undefined) {
        jobsdatas = JSON.parse(jobs);
        var jobs_results;
        if (jobsdatas.status == 'success') {
            jobs_results = jobsdatas.result;
        }
    }
    if (res.user != undefined && res.isAuthenticattion == 1) {
        ApiController.editcreateProject(req, res, jobs_results);
    } else {
        res.clearCookie('userRegistered');
        res.redirect('/');
    }
});

router.post('/creatingproject/update/', LoggedIn, Authenticattion, (req, res) => {
    console.log('update');
    if (res.user != undefined && res.isAuthenticattion == 1) {
        
        ApiController.updatecreateProject(req, res);
    } else {
        res.clearCookie('userRegistered');
        res.redirect('/');
    }
});

router.post('/updateprojectopeation', LoggedIn, Authenticattion, (req, res) => {
    console.log('update');
    if (res.user != undefined && res.isAuthenticattion == 1) {
        
        ApiController.updateprojectopeation(req, res);
    } else {
        res.clearCookie('userRegistered');
        res.redirect('/');
    }
});


router.get('/creatingproject/delete/:id', LoggedIn, Authenticattion, (req, res) => {
    if (res.user != undefined && res.isAuthenticattion == 1) {
        
        ApiController.deletecreatingProject(req, res);
    } else {
        res.clearCookie('userRegistered');
        res.redirect('/');
    }
});
router.get('/addproject', LoggedIn, Authenticattion, AuthenticattionJob, AuthenticattionCurrency, (req, res) => {

    if (res.user != undefined && res.isAuthenticattion == 1) {
        let access_token = typeof res.authenticattion !== "undefined" ? res.authenticattion.access_token : '';
        let jobs = typeof res.jobs !== "undefined" ? res.jobs : '';
        var jobsdatas;
        if (jobs != undefined) {
            jobsdatas = JSON.parse(jobs);
            var jobs_results;
            if (jobsdatas.status == 'success') {
                jobs_results = jobsdatas.result;
            }
        } else {
            jobs_results = [];
        }
        let currency = typeof res.currency !== "undefined" ? res.currency : '';
        if (currency != undefined) {
            currencydatas = JSON.parse(currency);
            var currency_results;
            if (currencydatas.status = 'success') {
                currency_results = currencydatas.result;
            }
        }
        res.render('addproject', { status: 'loggedIn', user: res.user, access_token: access_token, jobs_results: jobs_results, currency_results: currency_results, layout: './layouts/addproject' });
    } else {
        res.clearCookie('userRegistered');
        res.redirect('/');
    }
});


router.get('/hourlyproject', LoggedIn, Authenticattion, (req, res) => {
    if (res.user != undefined && res.isAuthenticattion == 1) {
        res.render('hourlyproject', { status: 'loggedIn', user: res.user, layout: './layouts/hourlyproject' });
    } else {
        res.clearCookie('userRegistered');
        res.redirect('/');
    }
})
router.get('/hiremeproject', LoggedIn, Authenticattion, AuthenticattionCurrency, AuthenticattionJob, listAllHiredFreelancers, (req, res) => {
    if (res.user != undefined && res.isAuthenticattion == 1 && req.freelancers != undefined) {
        let jobs = typeof res.jobs !== "undefined" ? res.jobs : '';
        var jobsdatas;
        if (jobs != undefined) {
            jobsdatas = JSON.parse(jobs);
            var jobs_results;
            if (jobsdatas.status == 'success') {
                jobs_results = jobsdatas.result;
            }
        } else {
            jobs_results = [];
        }
        let currency = typeof res.currency !== "undefined" ? res.currency : '';
        if (currency != undefined) {
            currencydatas = JSON.parse(currency);
            var currency_results;
            if (currencydatas.status = 'success') {
                currency_results = currencydatas.result;
            }
        }
        res.render('hiremeproject', { status: 'loggedIn', user: res.user, freelancers: req.freelancers, currency_results: currency_results, jobs_results: jobs_results, layout: './layouts/hiremeproject' });
    } else {
        res.clearCookie('userRegistered');
        res.redirect('/');
    }
})
router.post('/hiremeproject', LoggedIn, Authenticattion, (req, res) => {
    if (res.user != undefined && res.isAuthenticattion) {
        ApiController.hiremeproject(req, res);
    } else {
        res.clearCookie('userRegistered');
        res.redirect('/');
    }
})
router.get('/localjobproject', LoggedIn, Authenticattion, AuthenticattionJob, AuthenticattionCurrency, (req, res) => {
    if (res.user != undefined && res.isAuthenticattion == 1) {
        let access_token = typeof res.authenticattion !== "undefined" ? res.authenticattion.access_token : '';
        let jobs = typeof res.jobs !== "undefined" ? res.jobs : '';
        var jobsdatas;
        if (jobs != undefined) {
            jobsdatas = JSON.parse(jobs);
            var jobs_results;
            if (jobsdatas.status == 'success') {
                jobs_results = jobsdatas.result;
            }
            // console.log(jobs_results);
        } else {
            jobs_results = [];
        }
        let currency = typeof res.currency !== "undefined" ? res.currency : '';
        if (currency != undefined) {
            currencydatas = JSON.parse(currency);
            var currency_results;
            if (currencydatas.status = 'success') {
                currency_results = currencydatas.result;
                //currency_results = parseInt(currencydatas.result.currencies[0].id);
            }
        }
        res.render('localjobproject', { status: 'loggedIn', user: res.user, access_token: access_token, jobs_results: jobs_results, currency_results: currency_results, layout: './layouts/localjobproject' });
    } else {
        res.clearCookie('userRegistered');
        res.redirect('/');
    }
})
router.post("/localjobproject", LoggedIn, Authenticattion, (req, res) => {
    if (res.user != undefined && res.isAuthenticattion == 1) {
        //res.render('creatingproject', { status: 'loggedIn', user: res.user, layout: './layouts/creatingproject' });
        ApiController.localJob(req, res);
    } else {
        res.clearCookie('userRegistered');
        res.redirect('/');
    }
});

router.get('/logout', (req, res) => {
    console.log('User has been logout');
    res.clearCookie('userRegistered');
    res.redirect('/');
})

router.get('/roles_permission', LoggedIn, Authenticattion, (req, res) => {
    if (res.user != undefined && res.isAuthenticattion == 1) {
        //let access_token = typeof res.authenticattion !== "undefined" ? res.authenticattion.access_token : '';
        //res.render('roles_permission', { status: 'loggedIn', user: res.user, access_token: access_token, layout: './layouts/roles_permission' });
        ApiController.rolesPermissionProject(req, res);
    } else {
        res.clearCookie('userRegistered');
        res.redirect('/');
    }
})


router.get('/user_permission', LoggedIn, Authenticattion, (req, res) => {
    if (res.user != undefined && res.isAuthenticattion == 1) {
        let access_token = typeof res.authenticattion !== "undefined" ? res.authenticattion.access_token : '';
        //res.render('user_permission', { status: 'loggedIn', user: res.user, access_token: access_token, layout: './layouts/user_permission' });

    } else {
        res.clearCookie('userRegistered');
        res.redirect('/');
    }
})


const storage = multer.diskStorage({
    destination: function(req, file, cb) {
        cb(null, './public/avatars')
    },
    filename: function(req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9)
        cb(null, file.originalname + '-' + uniqueSuffix);
        //   cb(null, file.fieldname + '-' + Date.now() + path.extname(file.originalname));
    }
})

const uploadAvatar = multer({
    storage: storage,
    fileFilter: (req, file, cb) => {
        if (file.mimetype === 'image/jpeg' || file.mimetype === 'image/jpg' || file.mimetype === 'image/png' || file.mimetype === 'image/gif') {
            cb(null, true);
        } else {
            cb(null, false);
            req.fileError = 'File format is not valid';
        }
    }
});

router.post('/api/profile', uploadAvatar.single('image'), LoginController.profileauth)

router.post('/api/setting', LoginController.settingauth)

router.post('/api/addproject', uploadAvatar.single('image'), LoggedIn, Authenticattion, (req, res) => {
    if (res.user != undefined && res.isAuthenticattion == 1) {
        //res.render('creatingproject', { status: 'loggedIn', user: res.user, layout: './layouts/creatingproject' });
        ApiController.managingproject(req, res);
    } else {
        res.clearCookie('userRegistered');
        res.redirect('/');
    }

})

router.post('/api/login', LoginController.loginauth)

router.post('/api/register', RegisterController.register)

router.post('/api/forgotpassword', ForgotPasswordController.forgot_password)

router.post('/api/resetpassword', ForgotPasswordController.reset_password)

router.post('/register/checkusername', RegisterController.checkusername)

// routes for worker / who will work on project

router.get('/projects', LoggedIn, Authenticattion, WorkerController.showAllProjects)

router.get('/project/:id', LoggedIn, Authenticattion, (req, res) => {
    if (res.user != undefined && res.isAuthenticattion == 1) {
        WorkerController.showProjectInfo(req, res);
    } else {
        res.clearCookie('userRegistered');
        res.redirect('/');
    }
})

router.post("/allprojects/projecttype", LoggedIn, Authenticattion, ApiController.showProjectsWithSpecificProjectType)

router.post("/allprojects/searchproject", LoggedIn, Authenticattion, ApiController.showProjectsWithSpecificTitle)


// routes for admin

router.get("/users", LoggedIn, Authenticattion, ApiController.showAllUsers)

router.post("/allusers/searchuser", LoggedIn, Authenticattion, ApiController.searchUserWithUsername)

router.post("/allusers/userWithSpecificType", LoggedIn, Authenticattion, ApiController.userWithSpecificType)

router.post("/allusers/showUserFromParticularDate", LoggedIn, Authenticattion, ApiController.showUserFromParticularDate)

router.post("/allusers/recentlyAddedUsers", LoggedIn, Authenticattion, ApiController.recentlyAddedUsers)

// routes for roles

router.post("/roles/searchroles", LoggedIn, Authenticattion, ApiController.showRolesWithSpecificTitle)

router.get("/roles", LoggedIn, Authenticattion, ApiController.manageAllRoles);

router.get("/addroles", LoggedIn, Authenticattion, ApiController.manageAddRoles);

router.post("/addroles/addrolestype", LoggedIn, Authenticattion, (req, res) => {
    if (res.user != undefined && res.isAuthenticattion == 1) {
        ApiController.manageAddRolesWithSpecificRolesType(req, res);
    } else {
        res.clearCookie('userRegistered');
        res.redirect('/addroles')
    }
});

router.post('/addroles/edit/:id', LoggedIn, Authenticattion, (req, res) => {
    if (res.user != undefined && res.isAuthenticattion == 1) {
        
        ApiController.editRoles(req, res);
    } else {
        res.clearCookie('userRegistered');
        res.redirect('/');
    }
});
router.post('/allusers/edit/:id', LoggedIn, Authenticattion, (req, res) => {
    if (res.user != undefined && res.isAuthenticattion == 1) {
        
        ApiController.editAllUsersData(req, res);
    } else {
        res.clearCookie('userRegistered');
        res.redirect('/');
    }
});



router.post('/addroles/update/', LoggedIn, Authenticattion, (req, res) => {
    //console.log('update');
    if (res.user != undefined && res.isAuthenticattion == 1) {
        
        ApiController.updatecreateProjectRoles(req, res);
    } else {
        res.clearCookie('userRegistered');
        res.redirect('/');
    }
});
router.get('/addroles/delete/:id', LoggedIn, Authenticattion, (req, res) => {
    if (res.user != undefined && res.isAuthenticattion == 1) {
        
        ApiController.deleterolesProject(req, res);
    } else {
        res.clearCookie('userRegistered');
        res.redirect('/');
    }
});
router.get('/alluser/delete/:id', LoggedIn, Authenticattion, (req, res) => {
    if (res.user != undefined && res.isAuthenticattion == 1) {
        
        ApiController.deleteallUserProject(req, res);
    } else {
        res.clearCookie('userRegistered');
        res.redirect('/');
    }
});

router.post('/adduserall/update/', LoggedIn, Authenticattion, (req, res) => {
    if (res.user != undefined && res.isAuthenticattion == 1) {
        
        ApiController.updatecreateProjectUserAll(req, res);
    } else {
        res.clearCookie('userRegistered');
        res.redirect('/');
    }
})
router.get('/totalproject', LoggedIn, Authenticattion, (req, res) => {
    if (res.user != undefined && res.isAuthenticattion == 1) {
        
        ApiController.totalprojectAll(req, res);
    } else {
        res.clearCookie('userRegistered');
        res.redirect('/');
    }
})
router.post('/freelancerjobsearch', LoggedIn, Authenticattion, (req, res) => {
    if (res.user != undefined && res.isAuthenticattion == 1) {
        
        ApiController.freelancerjobsearch(req, res);
    } else {
        res.clearCookie('userRegistered');
        res.redirect('/');
    }
})
router.get('/getAllDataLastF', LoggedIn, Authenticattion, (req, res) => {
    if (res.user != undefined && res.isAuthenticattion == 1) {
        
        ApiController.totalgetAllDataLastRecords(req, res);
    } else {
        res.clearCookie('userRegistered');
        res.redirect('/');
    }
})

router.get('/reports', LoggedIn, Authenticattion, (req, res) => {
    if (res.user != undefined && res.isAuthenticattion == 1) {
        
        ApiController.reportData(req, res);
    } else {
        res.clearCookie('userRegistered');
        res.redirect('/');
    }
});
router.get('/messages', LoggedIn, Authenticattion, (req, res) => {
    if (res.user != undefined && res.isAuthenticattion == 1) {
        
        ApiController.messagesData(req, res);
    } else {
        res.clearCookie('userRegistered');
        res.redirect('/');
    }
});

router.get('/messages/:id', LoggedIn, Authenticattion, (req, res) => {
    if (res.user != undefined && res.isAuthenticattion == 1) {
        
        ApiController.loadThreadsForAdmin(req, res);
    } else {
        res.clearCookie('userRegistered');
        res.redirect('/');
    }
});
router.post('/fliterwithrating', LoggedIn, Authenticattion, (req, res) => {
    if (res.user != undefined && res.isAuthenticattion == 1) {
        let token = typeof res.authenticattion !== "undefined" ? res.authenticattion.access_token : '';
        ApiController.fliterwithratingData(req, res, token);
    } else {
        res.clearCookie('userRegistered');
        res.redirect('/');
    }
});

router.get('/myjob', LoggedIn, Authenticattion, AuthenticattionFreelancerList, (req, res) => {
    if (res.user != undefined && res.isAuthenticattion == 1) {
        res.render('myjob', { status: 'loggedIn', user: res.user, layout: './layouts/myjob', result: res.result, is_member: res.user.is_member });
    } else {
        res.clearCookie('userRegistered');
        res.redirect('/');
    }
});

router.get('/freelancerprojectdetail/:bi/:pi', LoggedIn, Authenticattion, (req, res) => {
    if (res.user != undefined && res.isAuthenticattion == 1) {
        //let token = typeof res.authenticattion !== "undefined" ? res.authenticattion.access_token : '';
        ApiController.freelancerprojectdescritioninfo(req, res);
    } else {
        res.clearCookie('userRegistered');
        res.redirect('/');
    }
    //res.render('freelancerprojectdetail', { status: 'loggedIn', user: res.user, layout: './layouts/freelancerprojectdetail' });
});

// router.post('/freelancerprojectdetail', LoggedIn, Authenticattion, (req, res) => {
//     if (res.user != undefined && res.isAuthenticattion == 1) {
//         //let token = typeof res.authenticattion !== "undefined" ? res.authenticattion.access_token : '';
//         ApiController.freelancerprojectdescritioninfo(req, res);
//     } else {
//         res.clearCookie('userRegistered');
//         res.redirect('/');
//     }
// });

router.get('/jobdetail', LoggedIn, Authenticattion, (req, res) => {
    if (res.user != undefined && res.isAuthenticattion == 1) {
        let token = typeof res.authenticattion !== "undefined" ? res.authenticattion.access_token : '';
        ApiController.jobdetail(req, res, token);
    } else {
        res.clearCookie('userRegistered');
        res.redirect('/');
    }
});

router.post('/getJobDetailForClient', LoggedIn, Authenticattion, (req, res) => {
    if (res.user != undefined && res.isAuthenticattion == 1) {
        let token = typeof res.authenticattion !== "undefined" ? res.authenticattion.access_token : '';
        
        ApiController.getJobDetailForClient(req, res, token);
    } else {
        res.clearCookie('userRegistered');
        res.redirect('/');
    }
});

router.post('/dashboard/createabid/', LoggedIn, Authenticattion, (req, res) => {
    if (res.user != undefined && res.isAuthenticattion == 1) {
        //let token = typeof res.authenticattion !== "undefined" ? res.authenticattion.access_token : '';
        ApiController.createaBidding(req, res);
    } else {
        res.clearCookie('userRegistered');
        res.redirect('/');
    }
});
router.post('/all-chat-posting', LoggedIn, Authenticattion, (req, res) => {
    if (res.user != undefined && res.isAuthenticattion == 1) {
        let token = typeof res.authenticattion !== "undefined" ? res.authenticattion.access_token : '';
        ApiController.createChattingPosting(req, res, token);
    } else {
        res.clearCookie('userRegistered');
        res.redirect('/');
    }
});

// router.post('/showBidsList', LoggedIn, Authenticattion, (req, res) => {
//     //console.log(res);return;
//     if (res.user != undefined && res.isAuthenticattion == 1) {
//         //let token = typeof res.authenticattion !== "undefined" ? res.authenticattion.access_token : '';
//        // ApiController.showBidsList(req, res);
//        res.render('myjob', { status: 'loggedIn', user: res.user, layout: './layouts/myjob'});
//     } else {
//         res.clearCookie('userRegistered');
//         res.redirect('/');
//     }
// });

// router.get('/myjob', LoggedIn, Authenticattion, AuthenticattionFreelancerList, (req, res) => {
//     //console.log(res);return;
//     if (res.user != undefined && res.isAuthenticattion == 1) {
//         //let token = typeof res.authenticattion !== "undefined" ? res.authenticattion.access_token : '';
//        // ApiController.showBidsList(req, res);
//        res.render('myjob', { status: 'loggedIn', user: res.user, layout: './layouts/myjob' , result : res.result});
//     } else {
//         res.clearCookie('userRegistered');
//         res.redirect('/');
//     }
// });

router.get('/myproposals', LoggedIn, Authenticattion, (req, res) => {
    if (res.user != undefined && res.isAuthenticattion == 1) {
        //let token = typeof res.authenticattion !== "undefined" ? res.authenticattion.access_token : '';
        ApiController.myproposals(req, res);
    } else {
        res.clearCookie('userRegistered');
        res.redirect('/');
    }
});
router.get('/mybids', LoggedIn, Authenticattion, (req, res) => {
    if (res.user != undefined && res.isAuthenticattion == 1) {
        ApiController.mybids(req, res);
    } else {
        res.clearCookie('userRegistered');
        res.redirect('/');
    }
});
router.get('/all-chat-thread', LoggedIn, Authenticattion, (req, res) => {
    if (res.user != undefined && res.isAuthenticattion == 1) {
        let token = typeof res.authenticattion !== "undefined" ? res.authenticattion.access_token : '';
        ApiController.allchatthreadlist(req, res, token);
    } else {
        res.clearCookie('userRegistered');
        res.redirect('/');
    }
});

router.post('/createthread', LoggedIn, Authenticattion, (req, res) => {
    if (res.user != undefined && res.isAuthenticattion == 1) {
        let token = typeof res.authenticattion !== "undefined" ? res.authenticattion.access_token : '';
        ApiController.createThread(req, res, token);
    } else {
        res.clearCookie('userRegistered');
        res.redirect('/');
    }
});

router.post('/loadthread', LoggedIn, Authenticattion, (req, res) => {
    if (res.user != undefined && res.isAuthenticattion == 1) {
        let token = typeof res.authenticattion !== "undefined" ? res.authenticattion.access_token : '';
        ApiController.loadthread(req, res, token);
    } else {
        res.clearCookie('userRegistered');
        res.redirect('/');
    }
});

router.post('/sendmsginchat', LoggedIn, Authenticattion, (req, res) => {
    //console.log("here");return false;
    if (res.user != undefined && res.isAuthenticattion == 1) {
        let token = typeof res.authenticattion !== "undefined" ? res.authenticattion.access_token : '';
        ApiController.sendMsgInChat(req, res, token);
    } else {
        res.clearCookie('userRegistered');
        res.redirect('/');
    }
});

router.post('/savedprojects', LoggedIn, Authenticattion, (req, res) => {
    if (res.user != undefined && res.isAuthenticattion == 1) {
        let token = typeof res.authenticattion !== "undefined" ? res.authenticattion.access_token : '';
        ApiController.savedprojects(req, res, token);
    } else {
        res.clearCookie('userRegistered');
        res.redirect('/');
    }
});
router.post('/removedsavedprojects', LoggedIn, Authenticattion, (req, res) => {
    if (res.user != undefined && res.isAuthenticattion == 1) {
        let token = typeof res.authenticattion !== "undefined" ? res.authenticattion.access_token : '';
        ApiController.removedsavedprojects(req, res, token);
    } else {
        res.clearCookie('userRegistered');
        res.redirect('/');
    }
});
router.post('/getProjectDetailForOwnerHire', LoggedIn, Authenticattion, AuthenticattionCurrency, (req, res) => {
    if (res.user != undefined && res.isAuthenticattion == 1) {
        let currency = typeof res.currency !== "undefined" ? res.currency : '';
        if (currency != undefined) {
            currencydatas = JSON.parse(currency);
            var currency_results;
            if (currencydatas.status = 'success') {
                currency_results = currencydatas.result;
                //currency_results = parseInt(currencydatas.result.currencies[0].id);
            }
        }
        let token = typeof res.authenticattion !== "undefined" ? res.authenticattion.access_token : '';
        ApiController.getProjectDetailForOwnerHirelist(req, res, token, currency_results);
    } else {
        res.clearCookie('userRegistered');
        res.redirect('/');
    }
});

router.post('/finalhiremefreelancer', LoggedIn, Authenticattion, (req, res) => {
    if (res.user != undefined && res.isAuthenticattion == 1) {
        let token = typeof res.authenticattion !== "undefined" ? res.authenticattion.access_token : '';
        ApiController.getProjectDetailForFinalHirelist(req, res, token);
    } else {
        res.clearCookie('userRegistered');
        res.redirect('/');
    }
})


router.get('/manageteam', LoggedIn, Authenticattion, AuthenticattionJob, AuthenticattionCurrency, getAllTeamMembers, (req, res) => {
    if (res.user != undefined && res.isAuthenticattion == 1) {
        let access_token = typeof res.authenticattion !== "undefined" ? res.authenticattion.access_token : '';
        let jobs = typeof res.jobs !== "undefined" ? res.jobs : '';
        var jobsdatas;
        if (jobs != undefined) {
            jobsdatas = JSON.parse(jobs);
            var jobs_results;
            if (jobsdatas.status == 'success') {
                jobs_results = jobsdatas.result;
            }
            // console.log(jobs_results);
        } else {
            jobs_results = [];
        }
        let currency = typeof res.currency !== "undefined" ? res.currency : '';
        if (currency != undefined) {
            currencydatas = JSON.parse(currency);
            var currency_results;
            if (currencydatas.status = 'success') {
                currency_results = currencydatas.result;
                //currency_results = parseInt(currencydatas.result.currencies[0].id);
            }
        }
        res.render('manageteam', { status: 'loggedIn', user: res.user, result: req.res.getAllTeamMembers, access_token: access_token, jobs_results: jobs_results, currency_results: currency_results, layout: './layouts/manageteam' });
    } else {
        res.clearCookie('userRegistered');
        res.redirect('/');
    }
})

router.get('/manageoperations', LoggedIn, Authenticattion, getAllPendingOperationsForFreelancerManager, TotalApprovalPosts, (req, res) => {
    if (res.user != undefined && res.isAuthenticattion == 1) {
        if (res.user.role_id == 2) {
            res.render('manageoperations', { status: 'loggedIn', user: res.user, project_approval: res.project_approval, project_approval_length2: res.project_approval_length2, project_approval_length: res.project_approval_length, currentpage: req.query.page, layout: './layouts/manageoperations' });
        } else {
            res.render('manageoperations', { status: 'loggedIn', project_approval: res.project_approval, project_approval_length2: res.project_approval_length2, project_approval_length: res.project_approval_length, currentpage: req.query.page, user: res.user, pendingProposalList: req.pendingProposalList, layout: './layouts/manageoperations' });
        }
    } else {
        res.clearCookie('userRegistered');
        res.redirect('/');
    }
})

router.get('/manageprojectproposal/:id/:pid', LoggedIn, Authenticattion, (req, res) => {
    if (res.user != undefined && res.isAuthenticattion == 1) {
        WorkerController.manageprojectproposal(req, res);
    } else {
        res.clearCookie('userRegistered');
        res.redirect('/');
    }
})

router.get('/manageteam/delete/:id/', LoggedIn, Authenticattion, (req, res) => {
    if (res.user != undefined && res.isAuthenticattion == 1) {
        console.log(req.params);
        db.query(`delete from team where team_id = '${req.params.id}'`, async(err, result) => {
            if (err) {
                throw err;
            } else {
                res.redirect('/manageteam');
            }
        })
    } else {
        res.clearCookie('userRegistered');
        res.redirect('/');
    }
})

router.post('/placebidbyteamleader', LoggedIn, Authenticattion, (req, res) => {
    if (res.user != undefined && res.isAuthenticattion == 1) {
        WorkerController.placeBidByTeamLeader(req, res);
    } else {
        res.clearCookie('userRegistered');
        res.redirect('/');
    }
})

router.post('/rejectBidOfTeamMember', LoggedIn, Authenticattion, (req, res) => {
    if (res.user != undefined && res.isAuthenticattion == 1) {
        WorkerController.rejectBidOfTeamMember(req, res);
    } else {
        res.clearCookie('userRegistered');
        res.redirect('/');
    }
})

router.post('/sendInviteToNewMembers', LoggedIn, Authenticattion, (req, res) => {
    if (res.user != undefined && res.isAuthenticattion == 1) {
        ApiController.sendInviteToNewMembers(req, res);
    } else {
        res.clearCookie('userRegistered');
        res.redirect('/');
    }
})

router.post('/updateProjectStatus', LoggedIn, Authenticattion, (req, res) => {
    if (res.user != undefined && res.isAuthenticattion == 1) {
        ApiController.updateProjectStatus(req, res);
    } else {
        res.clearCookie('userRegistered');
        res.redirect('/');
    }
})

router.post('/showprojectwithspecificprojecttype', LoggedIn, Authenticattion, (req, res) => {
    if (res.user != undefined && res.isAuthenticattion == 1) {
        ApiController.showProjectWithSpecificProjectType(req, res);
    } else {
        res.clearCookie('userRegistered');
        res.redirect('/');
    }
})

router.post('/showprojectwithspecificprojectfixedprice', LoggedIn, Authenticattion, (req, res) => {
    if (res.user != undefined && res.isAuthenticattion == 1) {
        ApiController.showprojectwithspecificprojectfixedprice(req, res);
    } else {
        res.clearCookie('userRegistered');
        res.redirect('/');
    }
})

router.post('/showprojectwithspecificprojecthourlyprice', LoggedIn, Authenticattion, (req, res) => {
    if (res.user != undefined && res.isAuthenticattion == 1) {
        ApiController.showprojectwithspecificprojecthourlyprice(req, res);
    } else {
        res.clearCookie('userRegistered');
        res.redirect('/');
    }
})

router.post('/showprojectwithspecificlistingtype', LoggedIn, Authenticattion, (req, res) => {
    if (res.user != undefined && res.isAuthenticattion == 1) {
        ApiController.showprojectwithspecificlistingtype(req, res);
    } else {
        res.clearCookie('userRegistered');
        res.redirect('/');
    }
})
router.post('/showprojectwithspecificprojectcountrieslistingtype', LoggedIn, Authenticattion, (req, res) => {
    if (res.user != undefined && res.isAuthenticattion == 1) {
        ApiController.showprojectwithspecificprojectcountrieslistingtype(req, res);
    } else {
        res.clearCookie('userRegistered');
        res.redirect('/');
    }
})
router.post('/showprojectwithspecificlistingtypelanguages', LoggedIn, Authenticattion, (req, res) => {
    if (res.user != undefined && res.isAuthenticattion == 1) {
        ApiController.showprojectwithspecificlistingtypelanguages(req, res);
    } else {
        res.clearCookie('userRegistered');
        res.redirect('/');
    }
})
router.post('/acceptaward', LoggedIn, Authenticattion, (req, res) => {
    if (res.user != undefined && res.isAuthenticattion == 1) {
        let access_token = typeof res.authenticattion !== "undefined" ? res.authenticattion.access_token : '';
        ApiController.AcceptAward(req, res, access_token);
    } else {
        res.clearCookie('userRegistered');
        res.redirect('/');
    }
})

module.exports = {
    routes: router,
    mode: 'development'
}