'use strict';
//const e = require("connect-flash");

var baseURL = "http://ec2-34-205-63-120.compute-1.amazonaws.com:8000"
$('#navbar-search__field').on('input', function() {
    var search = $(this).val().toLowerCase();


    var search_result_pane = $('.navbar_search_result');
    $(search_result_pane).html('');
    if (search.length == 0) {
        return;
    }

    // search
    var match = $('.sidebar__menu-wrapper .nav-link').filter(function(idx, elem) {
        return $(elem).text().trim().toLowerCase().indexOf(search) >= 0 ? elem : null;
    }).sort();




    // show search result
    // search not found
    if (match.length == 0) {
        $(search_result_pane).append('<li class="text-muted pl-5">No search result found.</li>');
        return;
    }
    // search found
    match.each(function(idx, elem) {
        var item_url = $(elem).attr('href') || $(elem).data('default-url');
        var item_text = $(elem).text().replace(/(\d+)/g, '').trim();
        $(search_result_pane).append(`<li><a href="${item_url}">${item_text}</a></li>`);
    });


});

let img = $('.bg_img');
img.css('background-image', function() {
    let bg = ('url(' + $(this).data('background') + ')');
    return bg;
});

const navTgg = $('.navbar__expand');
navTgg.on('click', function() {
    $(this).toggleClass('active');
    $('.sidebar').toggleClass('active');
    $('.navbar-wrapper').toggleClass('active');
    $('.body-wrapper').toggleClass('active');
});

$(function() {
    $('[data-toggle="tooltip"]').tooltip()
})

// navbar-search 
$('.navbar-search__btn-open').on('click', function() {
    $('.navbar-search').addClass('active');
});

$('.navbar-search__close').on('click', function() {
    $('.navbar-search').removeClass('active');
});

// responsive sidebar expand js 
$('.res-sidebar-open-btn').on('click', function() {
    $('.sidebar').addClass('open');
});

$('.res-sidebar-close-btn').on('click', function() {
    $('.sidebar').removeClass('open');
});


/* Get the documentElement (<html>) to display the page in fullscreen */
let elem = document.documentElement;

/* View in fullscreen */
function openFullscreen() {
    if (elem.requestFullscreen) {
        elem.requestFullscreen();
    } else if (elem.mozRequestFullScreen) { /* Firefox */
        elem.mozRequestFullScreen();
    } else if (elem.webkitRequestFullscreen) { /* Chrome, Safari and Opera */
        elem.webkitRequestFullscreen();
    } else if (elem.msRequestFullscreen) { /* IE/Edge */
        elem.msRequestFullscreen();
    }
}

/* Close fullscreen */
function closeFullscreen() {
    if (document.exitFullscreen) {
        document.exitFullscreen();
    } else if (document.mozCancelFullScreen) { /* Firefox */
        document.mozCancelFullScreen();
    } else if (document.webkitExitFullscreen) { /* Chrome, Safari and Opera */
        document.webkitExitFullscreen();
    } else if (document.msExitFullscreen) { /* IE/Edge */
        document.msExitFullscreen();
    }
}

$('.fullscreen-btn').on('click', function() {
    $(this).toggleClass('active');
});

$('.sidebar-dropdown > a').on('click', function() {
    if ($(this).parent().find('.sidebar-submenu').length) {
        if ($(this).parent().find('.sidebar-submenu').first().is(':visible')) {
            $(this).find('.side-menu__sub-icon').removeClass('transform rotate-180');
            $(this).removeClass('side-menu--open');
            $(this).parent().find('.sidebar-submenu').first().slideUp({
                done: function done() {
                    $(this).removeClass('sidebar-submenu__open');
                }
            });
        } else {
            $(this).find('.side-menu__sub-icon').addClass('transform rotate-180');
            $(this).addClass('side-menu--open');
            $(this).parent().find('.sidebar-submenu').first().slideDown({
                done: function done() {
                    $(this).addClass('sidebar-submenu__open');
                }
            });
        }
    }
});


$('.dropdown').click(function() {

    $('.dropdown-menu').toggleClass('show');

});

$("#state, .state").on("change", async function() {
    var state = $(this).val();
    var country = $("#country").val();
    var i = 0;
    $.get("http://ec2-34-205-63-120.compute-1.amazonaws.com:8000/assets/worldcities.json", function(data) {
        data.forEach(obj => {
            if (obj.admin_name == state && obj.country == country && i == 0) {
                $("#lat,.lat").val(obj.lat);
                $("#lon,.lon").val(obj.lng);
                i++;
                return;
            }
        });
    });
})

$("#project_type").on("change", function() {
    $("#manage-project-table").html('');
    if ($(this).val() != 0) {
        $.ajax({
            url: "/managingproject/projecttype",
            type: "post",
            data: { type: $(this).val() },
            success: function(data) {
                if (data.result.length == 0) {
                    $("#manage-project-table").empty();
                } else {
                    var design = "";
                    data.result.forEach(function(data, index) {
                        design += "<tr>";
                        design += `<td>${data.title}</td>`;
                        design += `<td>${data.total_bids}</td>`;
                        design += `<td>${data.avg_bid}</td>`;
                        design += `<td>${data.mybid}</td>`;
                        design += `<td></td>`;
                        design += `<td data-label="Action">
                                    <a class="icon-btn btn--primary ml-1 addBtn"  id="updateProject_${data.id}" onclick="updateProject(${data.id})"><i class="la la-pen" style='color:white;'></i></a>
                                    <a href="/managingproject/delete/${data.id}" class="icon-btn btn--danger ml-1 SiteDelete"><i class="las la-trash"></i></a>
                                    <a href="/managingproject/view/${data.id}" href="" class="icon-btn bg--success ml-1"><i class="la la-eye"></i></a>
                                </td>`;
                        design += "</tr>";
                    });
                    $("#manage-project-table").html(design);
                }
            }
        });
    } else {
        window.location.href = "/managingproject";
    }
})

$("#searchInManagingProject").on("keyup", function() {
    $("#manage-project-table").html('');
    $.ajax({
        url: "/managingproject/searchproject",
        type: "post",
        data: { data: $(this).val() },
        success: function(data) {
            if (data.result.length == 0) {
                $("#manage-project-table").empty();
            } else {
                var design = "";
                data.result.forEach(function(data, index) {
                    design += "<tr>";
                    design += `<td>${data.title}</td>`;
                    design += `<td>${data.total_bids}</td>`;
                    design += `<td>${data.avg_bid}</td>`;
                    design += `<td>${data.mybid}</td>`;
                    design += `<td>${data.title}</td>`;
                    design += `<td data-label="Action">
                                    <a class="icon-btn btn--primary ml-1 addBtn"  id="updateProject_${data.id}" onclick="updateProject(${data.id})"><i class="la la-pen" style="color:white;"></i></a>
                                    <a href="/managingproject/delete/${data.id}" class="icon-btn btn--danger ml-1 SiteDelete"><i class="las la-trash"></i></a>
                                    <a href="/managingproject/view/${data.id}" class="icon-btn bg--success ml-1"><i class="la la-eye"></i></a>
                                </td>`;
                    design += "</tr>";
                });
                $("#manage-project-table").html(design);
            }
        }
    });
})

function updateProject(id) {
    $.ajax({
        url: `/managingproject/edit/${id}`,
        type: "post",
        data: { data: id },
        success: function(data) {
            if (data.result.length != 0 && data.result.length == 1) {
                var jhtml = '';
                let jobs_results;
                if (data.jobs_results != undefined) {
                    jobs_results = data.jobs_results;
                    for (var i = 0; i < jobs_results.length; i++) {
                        jhtml += '<option value="' + jobs_results[i].name + '" data-name="' + jobs_results[i].name + '">' + jobs_results[i].name + '</option>';
                    }
                    $("#multiple").html(jhtml);
                }
                var budget = JSON.parse(data.result[0].budget);
                $("#project_title").val(data.result[0].title);
                $("#min_budget").val(budget.minimum);
                $("#max_budget").val(budget.maximum);
                $("#description").val(data.result[0].description);
                let skillset;
                if (data.result[0].jobs != undefined) {
                    skillset = JSON.parse(data.result[0].jobs);
                    var html = '';
                    for (var j = 0; j < skillset.length; j++) {
                        html += '<option value="' + skillset[j].name + '" selected="selected">' + skillset[j].name + '</option>';
                    }
                } else if (data.result[0].skill != undefined) {
                    skillset = JSON.parse(data.result[0].skill);
                    var html = '';
                    for (var j = 0; j < skillset.length; j++) {
                        html += '<option value="' + skillset[j].name + '" selected="selected">' + skillset[j].name + '</option>';
                    }
                }
                $("#multiple").append(html);
                $('#editModal').modal('show');
            } else {
                $('#editModal').modal('show');
            }
        }
    })
}

function updateCreateProject(id) {
    $.ajax({
        url: `/creatingproject/edit/${id}`,
        type: "post",
        data: { data: id },
        success: function(data) {
            if (data.result.length != 0 && data.result.length == 1) {
                var jhtml = '';
                let jobs_results;
                if (data.jobs_results != undefined) {
                    jobs_results = data.jobs_results;
                    for (var i = 0; i < jobs_results.length; i++) {
                        jhtml += '<option value="' + jobs_results[i].name + '" data-name="' + jobs_results[i].name + '">' + jobs_results[i].name + '</option>';
                    }

                    $("#multiple").html(jhtml);
                }
                var budget = JSON.parse(data.result[0].budget);
                $("#project_title").val(data.result[0].title);
                $("#creatingprojectid").val(data.result[0].id);
                $("#min_budget").val(budget.minimum);
                $("#max_budget").val(budget.maximum);
                $("#description").val(data.result[0].description);
                $("#types").val(data.result[0].type);
                let skillset;
                if (data.result[0].skill != undefined) {
                    skillset = JSON.parse(data.result[0].skill);
                    var html = '';
                    for (var j = 0; j < skillset.length; j++) {
                        html += '<option value="' + skillset[j].name + '" selected="selected">' + skillset[j].name + '</option>';
                    }
                }
                $("#multiple").append(html);
                $('#editCreateModal').modal('show');
            } else {
                console.log("result not found");
            }
        }
    })
}

$('#update_project_operation').on('click', function(e) {
    e.preventDefault();
    var form = $("#updateprojectopeation");
    $.ajax({
        url: `/updateprojectopeation/`,
        type: "post",
        data: form.serialize(),
        success: function(response) {
            window.location.href = '/manageoperations';
        }
    });

})

$('#submit_update').on('click', function(e) {
    e.preventDefault();
    var form = $("#creatingprojectupdate");
    $.ajax({
        url: `/creatingproject/update/`,
        type: "post",
        data: form.serialize(),
        success: function(response) {
            $('#editCreateModal').modal('hide');
            window.location.href = '/creatingproject';
        }
    });

})

$('#roles_permission').on('click', function(e) {
    e.preventDefault();
    var form = $("#rolespermissionaction");
    $.ajax({
        url: `/roles_permission/create/`,
        type: "post",
        data: form.serialize(),
        success: function(response) {
            $('#editCreateModal').modal('hide');
            window.location.href = '/creatingproject';
        }
    });

})

$("#all_project_type").on("change", function() {
    $("#all-projects").html('');
    if ($(this).val() != 0) {
        $.ajax({
            url: "/allprojects/projecttype",
            type: "post",
            data: { type: $(this).val() },
            success: function(data) {
                if (data.result.length == 0) {
                    $("#all-projects").empty();
                } else {
                    var design = "";
                    data.result.forEach(function(data, index) {
                        var budget = JSON.parse(data.budget);
                        design += "<tr>";
                        design += `<td>${data.title}</td>`;
                        design += `<td>${data.description.substr(0,40)}</td>`;
                        design += `<td>${budget.minimum}</td>`;
                        var skill, jobs;
                        if (data.skill != undefined) {
                            design += `<td>`;
                            skill = JSON.parse(data.skill);
                            skill.forEach(function(info, iindex) {
                                design += `${info.name} &nbsp;&nbsp;`;
                            })
                            design += `</td>`;
                        }

                        if (data.jobs != undefined) {
                            design += `<td>`;
                            jobs = JSON.parse(data.jobs);
                            jobs.forEach(function(info, iindex) {
                                design += `${info.name} &nbsp;&nbsp;`;
                            })
                            design += `</td>`;
                        }

                        design += `<td>${data.type}</td>`;
                        design += `<td><a href="/messages" class="btn btn-warning" >Messages 🟢</a></td>`;
                        design += "</tr>";
                    });
                    $("#all-projects").html(design);
                }
            }
        });
    } else {
        window.location.href = "/projects";
    }
})

$("#searchInAllProjects, #search-job").on("keyup", function() {
    var search_type = $(this).attr('data-type');
    $("#all-projects, #dashboard-all-projects").html('');
    $.ajax({
        url: "/allprojects/searchproject",
        type: "post",
        data: { data: $(this).val() },
        success: function(data) {
            if (data.result.length == 0) {
                $("#all-projects, #dashboard-all-projects").empty();
            } else {
                var design = "";
                data.result.forEach(function(data, index) {
                    var budget = JSON.parse(data.budget);
                    if (search_type == 'search_job') {
                        var date = data.created_at;
                        var datestring = new Date(Date.parse(date));``
                        design += '<div class="project-box p-4">';
                        design += '<div class="project-title">';
                        design += '<h3>';
                        design += data.title;
                        design += '</h3>';
                        design += '</div><br/>';
                        design += '<div class="project-description my-2">';
                        design += '<div class="project-info mb-2" style="color: #3c3c3c;display: flex;">';
                        design += '<div class="project_type">';
                        design += 'fixed';
                        design += '</div>';
                        design += '<div class="posted_on pl-4">';
                        design += 'posted on: ';
                        design += datestring.toString().substr(4, 12);
                        design += '</div>';
                        design += '</div>';
                        design += '<p>';
                        design += data.description;
                        design += '</p>';
                        design += '</div>';
                        design += '<div class="all-required-skills my-3">';
                        var skill, jobs;
                        if (data.jobs != undefined) {
                            jobs = JSON.parse(data.jobs);

                            jobs.forEach(function(info, iindex) {
                                design += '<div class="required-skill">';
                                design += `${info.name} &nbsp;&nbsp;`;
                                design += '</div> ';
                            })
                        }
                        design += '</div>';
                        design += '</div>';
                    } else {
                        design += "<tr>";
                        design += `<td>${data.title}</td>`;
                        design += `<td>${data.description.substr(0, 40)}</td>`;
                        design += `<td>${budget.minimum}</td>`;
                        var skill, jobs;
                        if (data.skill != undefined) {
                            design += `<td>`;
                            skill = JSON.parse(data.skill);
                            skill.forEach(function(info, iindex) {
                                design += `${info.name} &nbsp;&nbsp;`;
                            })
                            design += `</td>`;
                        }

                        if (data.jobs != undefined) {
                            design += `<td>`;
                            jobs = JSON.parse(data.jobs);
                            jobs.forEach(function(info, iindex) {
                                design += `${info.name} &nbsp;&nbsp;`;
                            })
                            design += `</td>`;
                        }

                        design += `<td>${data.type}</td>`;
                        design += `<td><a href="/messages" class="btn btn-warning">Messages 🟢</a></td>`;
                        design += "</tr>";
                    }
                });
                if (search_type == 'search_job') {
                    $("#dashboard-all-projects").html(design);
                } else {
                    $("#all-projects").html(design);
                }
            }
        }
    });
})


$('#resetFunctionroles').on("submit", function() {
    $('#roles-project-table').html('');
    // 
    var valueempty = $('#filter_role_title').val();
    if (valueempty == '') {
        window.location.href = "/roles";
    }
    $.ajax({
        url: '/roles/searchroles',
        type: "post",
        data: { data: $('#filter_role_title').val() },
        success: function(response) {
            var result = response.result;
            var table = $('#roles-project-table');
            if (response.success == 1) {
                for (var i = 0; i < result.length; i++) {
                    table.append("<tr><td>" + result[i].role_title + "</td><td data-label='Action'><a class='icon-btn btn--primary ml-1 addBtn' id=updateRoles_" + result[i].id + " onclick='updateRoles(" + result[i].id + ")'><i class='la la-pen' style='color: white;'></i></a></td></tr>");
                }
                if (result.length == 0) {
                    table.append("<tr><td>No record Found</td></tr>");
                }
            } else {
                window.location.href = "/roles";
            }
        }
    })
})

jQuery(document).ready(function($) {
    $('.crpto-currency-box').on("click", function() {
        $('.crpto-currency-box').removeClass('active');
        $(this).addClass('active');
    });

    $('#submit_roles').on('click', function() {
        var form = $("#alladdrolestype");
        $.ajax({
            url: "/addroles/addrolestype",
            type: "post",
            data: form.serialize(),
            success: function(response) {
                window.location.href = '/roles';
            }
        });
    });

    $('#update_addusers').on('click', function() {
        var form = $("#manage_users");
        $.ajax({
            url: "/addusers/insert/",
            type: "post",
            data: form.serialize(),
            success: function(data) {
                if (data.status == 'error') {
                    success.style.display = 'none'
                    error.style.display = 'block'
                    error.innerText = data.error
                } else {
                    error.style.display = 'none'
                    success.style.display = 'block'
                    success.innerText = data.success
                    setTimeout(function() {
                        window.location.href = redirect
                    }, 2000);
                }
            }
        });
    });
    var current_path = window.location.pathname;
    $("a.nav-link").each(function() {
        var href = jQuery(this).attr("href");
        if (current_path.includes(href) || (href.includes(current_path) || href == current_path)) {
            $(this).parents(".sidebar-menu-item").addClass('active');
        }
    });
});

function updateRoles(id) {
    $.ajax({
        url: `/addroles/edit/${id}`,
        type: "post",
        data: { data: id },
        success: function(data) {
            if (data.result.length != 0 && data.result.length == 1) {
                $("#roles_id").val(data.result[0].id);
                $("#roles_title").val(data.result[0].role_title);
                var permission = JSON.parse(data.result[0].permissions);
                $("#project_id_add").removeAttr("checked");
                $("#project_id_edit").removeAttr("checked");
                $("#project_id_delete").removeAttr("checked");
                $("#project_id_view").removeAttr("checked");
                $("#payment_id_add").removeAttr("checked");
                $("#payment_id_edit").removeAttr("checked");
                $("#payment_id_delete").removeAttr("checked");
                $("#payment_id_view").removeAttr("checked");
                $("#report_id_add").removeAttr("checked");
                $("#report_id_edit").removeAttr("checked");
                $("#report_id_delete").removeAttr("checked");

                $("#report_id_view").removeAttr("checked");
                if (permission != null) {
                    if (permission.project_id.includes("1")) {
                        $("#project_id_add").attr({ "checked": "checked" });
                    }
                    if (permission.project_id.includes("2")) {
                        $("#project_id_edit").attr({ "checked": "checked" });
                    }
                    if (permission.project_id.includes("3")) {
                        $("#project_id_delete").attr({ "checked": "checked" });
                    }
                    if (permission.project_id.includes("4")) {
                        $("#project_id_view").attr({ "checked": "checked" });
                    }

                    if (permission.payment_id.includes("1")) {
                        $("#payment_id_add").attr({ "checked": "checked" });
                    }
                    if (permission.payment_id.includes("2")) {
                        $("#payment_id_edit").attr({ "checked": "checked" });
                    }
                    if (permission.payment_id.includes("3")) {
                        $("#payment_id_delete").attr({ "checked": "checked" });
                    }
                    if (permission.payment_id.includes("4")) {
                        $("#payment_id_view").attr({ "checked": "checked" });
                    }

                    if (permission.report_id.includes("1")) {
                        $("#report_id_add").attr({ "checked": "checked" });
                    }
                    if (permission.report_id.includes("2")) {
                        $("#report_id_edit").attr({ "checked": "checked" });
                    }
                    if (permission.report_id.includes("3")) {
                        $("#report_id_delete").attr({ "checked": "checked" });
                    }
                    if (permission.report_id.includes("4")) {
                        $("#report_id_view").attr({ "checked": "checked" });
                    }
                } else {
                    $("#project_id_add").removeAttr("checked");
                    $("#project_id_edit").removeAttr("checked");
                    $("#project_id_delete").removeAttr("checked");
                    $("#project_id_view").removeAttr("checked");
                    $("#payment_id_add").removeAttr("checked");
                    $("#payment_id_edit").removeAttr("checked");
                    $("#payment_id_delete").removeAttr("checked");
                    $("#payment_id_view").removeAttr("checked");
                    $("#report_id_add").removeAttr("checked");
                    $("#report_id_edit").removeAttr("checked");
                    $("#report_id_delete").removeAttr("checked");
                    $("#report_id_view").removeAttr("checked");
                }
                $('#editRolesModal').modal('show');
            } else {
                console.log("result not found");
            }
        }
    })
}

function updateAllUsers(id) {
    $.ajax({
        url: `/allusers/edit/${id}`,
        type: "post",
        data: { data: id },
        success: function(data) {
            if (data.result.length != 0 && data.result.length == 1) {
                if (data.resultAllUser.length != 0) {
                    var jhtml = '';
                    var jhtmlselected = '';
                    for (var i = 0; i < data.resultAllUser.length; i++) {
                        if (data.result[0].role_id == data.resultAllUser[i].id) {
                            jhtmlselected += 'selected="selected"';
                            jhtml += '<option value="' + data.resultAllUser[i].id + '" data-name="' + data.resultAllUser[i].role_title + '" ' + jhtmlselected + ' >' + data.resultAllUser[i].role_title + '</option>';
                        } else {
                            jhtml += '<option value="' + data.resultAllUser[i].id + '" data-name="' + data.resultAllUser[i].role_title + '" >' + data.resultAllUser[i].role_title + '</option>';
                        }
                    }
                    $("#role_id").html(jhtml);
                }
                $("#alluserid").val(data.result[0].id);
                $("#username").val(data.result[0].username);
                $("#email").val(data.result[0].email);
                $('#editAllUserModal').modal('show');
            } else {
                console.log("result not found");
            }
        }
    })
}

function deleteRoles(id) {
    $('#deleteRolesModalButton').attr('data-attr', id);
    $('#deleteRolesModal').modal('show');
}

function deleteAllUser(id) {
    $('#deleteAllUserModalButton').attr('data-attr', id);
    $('#deleteAllUserModal').modal('show');
}
jQuery(document).ready(function($) {

    $('#updatedRolesType').on('submit', function(e) {
        e.preventDefault();
        var form = $("#updatedRolesType");
        $.ajax({
            url: `/addroles/update/`,
            type: "post",
            data: form.serialize(),
            success: function(response) {
                $('#editRolesModal').modal('hide');
                window.location.href = '/roles';
            }
        });
    });
    $('#deleteRolesModalButton').on('click', function() {
        var id = $(this).attr('data-attr');
        $.ajax({
            url: `/addroles/delete/${id}`,
            type: "get",
            data: { data: id },
            success: function(data) {

                $('#deleteRolesModal').modal('hide');
                window.location.href = '/roles';
            }
        })
    });

    // $('.freelancers-projects .project-box').on('click', function() {
    //     error.style.display = 'none';
    //     success.style.display = 'none';
    //     $('#project_id').val('');
    //     var pid = $(this).attr('data-pid');
    //     $('#project_id').val(pid);
    //     $('#biddingmodal').modal('show');
    // });

    $('#placebid').on('submit', function(e) {
        e.preventDefault();
        $.ajax({
            url: `/dashboard/createabid/`,
            type: "post",
            data: $(this).serialize(),
            success: function(data) {
                if (data.status == 'error') {
                    success.style.display = 'none'
                    error.style.display = 'block'
                    error.innerText = data.msg
                } else {
                    error.style.display = 'none'
                    success.style.display = 'block'
                    success.innerText = data.msg
                    setTimeout(function() {
                        //window.location.href = '/users';
                    }, 2000);
                }
            }
        })
    });

    $('#deleteAllUserModalButton').on('click', function() {
        var id = $(this).attr('data-attr');
        $.ajax({
            url: `/alluser/delete/${id}`,
            type: "get",
            data: { data: id },
            success: function(data) {
                $('#deleteAllUserModal').modal('hide');
                window.location.href = '/users';
            }
        })
    });
    $('#submit_update_all_user').on('click', function() {
        var form = $("#updatedAllUserType");
        $.ajax({
            url: `/adduserall/update/`,
            type: "post",
            data: form.serialize(),
            success: function(data) {
                if (data.status == 'error') {
                    success.style.display = 'none'
                    error.style.display = 'block'
                    error.innerText = data.error
                } else {
                    error.style.display = 'none'
                    success.style.display = 'block'
                    success.innerText = data.success
                    $('#editAllUserModal').modal('hide')
                    setTimeout(function() {
                        window.location.href = '/users';
                    }, 2000);
                }
            }
        })
    });

    $("#manage_logs").click(function() {
        $("#manage_logs_content").toggle(1000);
    });
    $("#manage_users").click(function() {
        $("#manage_users_content").toggle(1000);
    });
    $("#manage_permission").click(function() {
        $("#manage_permission_content").toggle(1000);
    });
    $("#manage_sites").click(function() {
        $("#manage_sites_content").toggle(1000);
    });
    $("#manage_games").click(function() {
        $("#manage_games_content").toggle(1000);
    });
    $("#manage_draws").click(function() {
        $("#manage_draws_content").toggle(1000);
    });

    // // $('ul.sidebar__menu li').on('click',function(e){
    //     var path = window.location.pathname;
    //     var str = path.split("/");
    //     var length = str.length-1;
    //     //console.log(length);
    //     $("a").each(function() {
    //         console.log(this.href);
    //         if (this.href == path) {
    //             $(this).addClass("active");
    //         }
    //     });
    // //})
})

function OpenProject(id) {
    window.location.href = `/project/${id}`;
}

function openProjectToManageProposal(id, pid) {
    window.location.href = `/manageprojectproposal/${id}/${pid}`;
}

function ResetFunction() {
    window.location.href = '/roles';
}

if ($("#userrole_id").length) {
    var userrole_id = document.getElementById('userrole_id').value;
    setInterval(function() {
        if (userrole_id == 1) {
            $.ajax({
                url: `${baseURL}/totalproject`,
                type: "get",
                success: function(response) {
                }
            });
        }
    }, 1000);
}


$(function() {
    var userrole_id = document.getElementById('dashboard_role_id').value;
    if (userrole_id == 1) {
        setInterval(function() {
            $.ajax({
                url: `${baseURL}/totalproject`,
                type: "get",
                success: function(response) {
                }
            });
        }, 1000);
    }

});

$(function() {
    var userrole_id = document.getElementById('dashboard_role_id').value;
    var ctx = document.getElementById('myChart').getContext('2d');
    if (userrole_id == 1) {
        $.ajax({
            url: '/getAllDataLastF',
            type: 'get',
            success: function(response) {
                var data = response.data;
                var dataClient = response.dataClient;
                var values = [];
                var valuesClients = [];
                for (var i = 0; i < data.length; i++) {
                    var value = data[i].id;
                    values.push(value);
                }
                for (var i = 0; i < dataClient.length; i++) {
                    var valuesClient = dataClient[i].id;
                    valuesClients.push(valuesClient);
                }
                if (response.success == 1) {
                    var myChart = new Chart(ctx, {
                        type: 'line',
                        data: {
                            labels: ['March', 'April', 'May', 'June', 'July'],
                            datasets: [{
                                    label: 'Total Freelancers',
                                    data: values,
                                    backgroundColor: [
                                        'rgba(255, 99, 132, 0.2)',
                                        'rgba(54, 162, 235, 0.2)',
                                        'rgba(255, 206, 86, 0.2)',
                                        'rgba(75, 192, 192, 0.2)',
                                        'rgba(153, 102, 255, 0.2)'
                                    ],
                                    borderColor: [
                                        'rgba(255, 99, 132, 1)',
                                        'rgba(54, 162, 235, 1)',
                                        'rgba(255, 206, 86, 1)',
                                        'rgba(75, 192, 192, 1)',
                                        'rgba(153, 102, 255, 1)'
                                    ],
                                },
                                {
                                    label: 'Total Clients',
                                    data: valuesClients,
                                    backgroundColor: [
                                        'rgba(66, 73, 162, 0.2)',
                                        'rgba(66, 73, 162, 0.2)',
                                        'rgba(66, 73, 162, 0.2)',
                                        'rgba(66, 73, 162, 0.2)',
                                        'rgba(66, 73, 162, 0.2)',
                                    ],
                                    borderColor: [
                                        'rgba(66, 73, 162, 1)',
                                        'rgba(66, 73, 162, 1)',
                                        'rgba(66, 73, 162, 1)',
                                        'rgba(66, 73, 162, 1)',
                                        'rgba(66, 73, 162, 1)',
                                    ],
                                },

                            ]
                        },
                        options: {
                            scales: {
                                yAxes: [{
                                    ticks: {
                                        min: 0,
                                        max: 100,
                                        callback: function(value) { return value + "%" }
                                    },
                                    scaleLabel: {
                                        display: true,
                                        labelString: "Percentage"
                                    }
                                }]
                            }
                        }
                    });
                }
            }
        })
    }

    var totalprojectsChart = document.getElementById('totalprojectsChart').value;
    var ctxContainer = document.getElementById('chartContainer').getContext('2d');
    var chartContainer = new Chart(ctxContainer, {
        type: 'bar',
        data: {
            labels: ['Total Projects'],
            datasets: [{
                label: 'Charts',
                data: [totalprojectsChart],
                backgroundColor: [
                    'rgba(66, 73, 162, 0.9)',
                ],
                borderColor: [
                    'rgba(66, 73, 162, 1)',
                ]
            }]
        },
        options: {
            scales: {
                yAxes: [{
                    ticks: {
                        min: 0,
                        max: 100,
                        callback: function(value) { return value + "%" }
                    },
                    scaleLabel: {
                        display: true,
                        labelString: "Percentage"
                    }
                }]
            }
        }
    });
});


$(document).ready(function() {
    $(".save-freelancer-btn").on("click", function() {
        var uid = $(this).data('uid');
        $.ajax({
            url: "/savefreelancer",
            type: "post",
            data: { fid: uid },
            success: function(data) {
                if (data.saved) {
                    $(".save-freelancer-btn_" + uid).removeClass("far");
                    $(".save-freelancer-btn_" + uid).addClass("fas");
                } else {
                    $(".save-freelancer-btn_" + uid).removeClass("fas");
                    $(".save-freelancer-btn_" + uid).addClass("far");
                }
            }
        })
    })
})

$(document).ready(function() {
    $(document).on("change", ".search_skill", function() {
        $('.spinner-border').removeClass('d-none');
        var value = $('.search_skill').val();
        if (value == '') {
            $('.spinner-border').addClass('d-none');
        }
        $('#search_skills').val(value);
        $('#search_skills').select2().trigger('change');
        if ($(this).val() != "") {
            $("#freelancers-list").empty();
            $.ajax({
                url: "/search_freelancer_with_specified_skill",
                type: "post",
                data: {
                    info: $(this).val()
                },
                success: function(data) {
                    $('.spinner-border').addClass('d-none');
                    $(".jobs-found b").html(data.totalfreelancers);
                    var detail = '';
                    if (data.freelancers.length > 0) {
                        data.freelancers.forEach((val, i) => {
                            detail += `<div class="freelancer-card">
                                    <div class="freelancer-card-header">
                                        <div class="freelancer-profile">
                                            <div class="freelancer-profile-img">`;
                            if (val.image == null || val.image == '') {
                                detail += `       <img src="${baseURL}/assets/images/avatar.png" alt="" class="freelancer-profile-img">`;
                            } else {
                                detail += `       <img src="${baseURL}/avatars/ ${val.image} " alt="" class="freelancer-profile-img">`;
                            }
                            detail += `         </div>
                                            <div class="freelancer-profile-info pl-2">
                                                <h5>
                                                     ${val.username}
                                                </h5>
                                                <p>
                                                     ${val.display_name}
                                                </p>
                                                <p>
                                                     ${val.location.country.name}
                                                </p>
                                            </div>
                                        </div>
                                        <div class="saved-and-post-job-section">
                                            <div class="save-freelancer-btn" data-uid=" ${val.id} ">
                                                <i class="far fa-heart save-freelancer-btn_ ${val.id} "></i>
                                            </div>
                                            <div class="invite-to-job-btn pl-2">
                                                <a href="/inviteforjob">Invite to job</a>
                                            </div>
                                        </div>
                                    </div>
                                </div>`;
                        })
                    } else {
                        detail += `no freelancers found with this skillset`;
                    }
                    $("#freelancers-list").html(detail);
                }
            })
        }

    })
    $("input[name='rating']").change(function() {
        var rating = $(this).val();
        $('.spinner-border').removeClass('d-none');
        $("#freelancers-list").empty();
        $.ajax({
            url: "/fliterwithrating",
            type: "post",
            data: rating,
            success: function(data) {
                $('.spinner-border').addClass('d-none');
                $(".jobs-found b").html(data.totalfreelancers);
                var detail = '';
                if (data.freelancers.length > 0) {
                    data.freelancers.forEach((val, i) => {
                        detail += `<div class="freelancer-card">
                            <div class="freelancer-card-header">
                                <div class="freelancer-profile">
                                    <div class="freelancer-profile-img">`;
                        if (val.image == null || val.image == '') {
                            detail += `       <img src="${baseURL}/assets/images/avatar.png" alt="" class="freelancer-profile-img">`;
                        } else {
                            detail += `       <img src="${baseURL}/avatars/ ${val.image} " alt="" class="freelancer-profile-img">`;
                        }
                        detail += `         </div>
                                    <div class="freelancer-profile-info pl-2">
                                        <h5>
                                             ${val.username}
                                        </h5>
                                        <p>
                                             ${val.display_name}
                                        </p>
                                        <p>
                                             ${val.location.country.name}
                                        </p>
                                    </div>
                                </div>
                                <div class="saved-and-post-job-section">
                                    <div class="save-freelancer-btn" data-uid=" ${val.id} ">
                                        <i class="far fa-heart save-freelancer-btn_ ${val.id} "></i>
                                    </div>
                                    <div class="invite-to-job-btn pl-2">
                                        <a href="/inviteforjob">Invite to job</a>
                                    </div>
                                </div>
                            </div>
                        </div>`;
                    })
                } else {
                    detail += `no freelancers found with this skillset`;
                }
                $("#freelancers-list").html(detail);
            }
        })
    });

    $(document).on("change", ".search_freelancer_with_search_skills", function() {
        $('.spinner-border').removeClass('d-none');
        var freelancer_searchskill = $('.search_freelancer_with_search_skills').val();
        if (freelancer_searchskill == '') {
            $('.spinner-border').addClass('d-none');
        }
        if (freelancer_searchskill != "") {
            $("#freelancers-list").empty();
            $.ajax({
                url: "/search_freelancer_with_specified_skill",
                type: "post",
                data: {
                    "info": freelancer_searchskill
                },
                success: function(data) {
                    $('.spinner-border').addClass('d-none');
                    $(".jobs-found b").html(data.totalfreelancers);
                    var detail = '';
                    if (data.freelancers.length > 0) {
                        data.freelancers.forEach((val, i) => {
                            detail += `<div class="freelancer-card">
                                    <div class="freelancer-card-header">
                                        <div class="freelancer-profile">
                                            <div class="freelancer-profile-img">`;
                            if (val.image == null || val.image == '') {
                                detail += `       <img src="${baseURL}/assets/images/avatar.png" alt="" class="freelancer-profile-img">`;
                            } else {
                                detail += `       <img src="${baseURL}/avatars/ ${val.image} " alt="" class="freelancer-profile-img">`;
                            }
                            detail += `         </div>
                                            <div class="freelancer-profile-info pl-2">
                                                <h5>
                                                     ${val.username}
                                                </h5>
                                                <p>
                                                     ${val.display_name}
                                                </p>
                                                <p>
                                                     ${val.location.country.name}
                                                </p>
                                            </div>
                                        </div>
                                        <div class="saved-and-post-job-section">
                                            <div class="save-freelancer-btn" data-uid=" ${val.id} ">
                                                <i class="far fa-heart save-freelancer-btn_ ${val.id} "></i>
                                            </div>
                                            <div class="invite-to-job-btn pl-2">
                                                <a href="/inviteforjob">Invite to job</a>
                                            </div>
                                        </div>
                                    </div>
                                </div>`;
                        })
                    } else {
                        detail += `no freelancers found with this skillset`;
                    }
                    $("#freelancers-list").html(detail);
                }
            })
        }
    })
    $(document).on("change", ".search_freelancer_with_search_skills_projects", function() {
        var freelancer_searchskill = $('.search_freelancer_with_search_skills_projects').val();
        if (freelancer_searchskill != "") {
            $(".freelancers-projects").html('');
            $.ajax({
                url: "/search_freelancer_with_specified_skill_projects",
                type: "post",
                data: {
                    "info": freelancer_searchskill
                },
                success: function(data) {
                    $(".jobs-found b").html(data.totalprojects);
                    var detail = '';
                    if (data.projects.length > 0) {
                        data.projects.forEach((val, i) => {
                            detail += `<div class="project-box p-4" data-pid="${val.id}">
                            <div class="row">
                                <div class="col-sm-7" onclick="OpenProject(${val.id })">
                                    <div class="project-title">
                                        <h3>
                                            ${val.title}
                                        </h3>
                                    </div>
                                </div>
                                <div class="col-sm-2">
                                    <i class="far fa-heart saved-freelancer_${val.id }" onclick="SavedProject(${val.id })" style="font-size: 25px;"></i>
                                </div>
                                <div class="col-sm-3">
                                    <div class="bid-stats">
                                        <div class="total-bids">
                                            <h5>
                                                ${ val.bid_stats.bid_count } bids
                                            </h5>
                                        </div>
                                        <div class="avg-bids ml-4">
                                            <h5>
                                                ${ Math.floor(val.bid_stats.bid_avg) } (avg bid amount)
                                            </h5>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div class="project-description d-flex flex-column mt-2">
                                <div class="project-info mb-2" style="color: #3c3c3c;display: flex;">
                                    <h5>Budget: $
                                        ${ val.budget.minimum } -
                                            ${ val.budget.maximum } USD
                                    </h5>
                                </div>
                                <p>
                                    ${ val.preview_description }
                                </p>
                            </div>
                            <div class="all-required-skills my-3">`;
                            if (val.skill != undefined) {
                                var skillset = JSON.parse(val.skill)
                                for (var j = 0; j < skillset.length; j++) {
                                    `<div class="required-skill">
                                            ${ val.name }
                                        </div>`;
                                }
                            }
                            if (val.jobs != undefined) {
                                var skillset = JSON.parse(val.jobs)
                                for (var j = 0; j < skillset.length; j++) {
                                    `<div class="required-skill">
                                            ${ val.name }
                                        </div>`;
                                }
                            }
                            detail += `</div>
                        </div>`;
                        })
                    } else {
                        detail += `no freelancers found with this skillset`;
                    }
                    $(".freelancers-projects").html(detail);
                }
            })
        }
    })
})

$(document).on("click",".invite-to-job-btn a",function() {
    $("#chooseproject").html("");
    $("#message_for_freelancer").val("");
    var fid = $(this).data('fid');
    var name = $(this).data('fname');
    var pic = $(this).data('fpic');
    var avatar = $(this).data('avatar');
    if (pic != undefined || pic != null) {
        avatar = pic;
    }
    $.ajax({
        url: "/loadclientporjects",
        type: "post",
        success: function(data) {
            console.log(data);
            $(".fname").html(name);
            $("#fid").val(fid);
            $("#send-invitation-form #post-a-job-profile-section").attr('src', avatar);
            data.clientprojects.forEach((val, i) => {
                $("#chooseproject").append(`<option value="${val.id}" data-owner_id="${val.owner_id}">${val.title}</option>`);
            })
            $(".move-to-create-project-invite").attr('href', `/post-job?uid=${data.user.id}&invite=${fid}`);
            // success.style.display = 'none';
            // success.style.display = 'none';
            $("#inviteforproject").modal('show');
        }
    })
})
$(document).ready(function() {
    $("#send-invitation-form").on("submit", function(e) {
        e.preventDefault();
        var owner_id = $('#chooseproject').find(':selected').data('owner_id');
        $.ajax({
            url: "/sendprojectinvitation",
            type: "post",
            data: $(this).serialize() + '&owner_id=' + owner_id,
            success: function(response) {
                $('#send-invitation-form')[0].reset();
                //console.log(response.response.message);return;
                if (response.status == 'error') {
                    alert(response.message)
                    success.style.display = 'none'
                    error.style.display = 'block'
                    error.innerText = response.response.message;
                } else {
                    alert(response.message)
                    error.style.display = 'none'
                    success.style.display = 'block'
                    success.innerText = response.message
                    setTimeout(function() {
                        $('#inviteforproject').modal('hide');
                        window.href.location = redirect;
                    }, 3000);
                }
            }
        })
    })
})

$(document).ready(function() {
    $('.search_freelancer_with_specific_countries').select2();
});

$(document).ready(function() {
    /* Client Invitation Status Action*/
    $(".interview_invitation_Action").on("change", function() {
        console.log($(this).val());
        if ($(this).val() != "") {
            $.ajax({
                url: "/invitationstatusaction",
                type: "post",
                data: {
                    invitation_id: $(this).data('invite_id'),
                    invitation_status_id: $(this).val()
                },
                success: function(data) {
                    console.log(data);
                    if (data.success == 1) {
                        var text;
                        if (data.invitation_status_id == 1) {
                            text = 'Deny';
                        } else {
                            text = 'Allow';
                        }
                        $('#invite_status' + data.invitation_id).html(text);
                        $('#dashboard').before('<div class="alert alert-success invitationstatusmsg" style="position: fixed;right: 0;z-index: 999;top: 150px;">Status has been updated.</div>');
                        setTimeout(function() {
                            $('.invitationstatusmsg').remove();;
                        }, 4000);
                    }
                }
            })
        }
    });

    $(".myjobs_project_status").on("change", function() {
        if ($(this).val() != "") {
            $.ajax({
                url: "/myjobsprojectstatus",
                type: "post",
                data: {
                    pid: $(this).data('pid'),
                    status: $(this).val()
                },
                success: function(data) {
                    if (data.success == 1) {
                        $('.bodywrapper__inner').before('<div class="alert alert-success myjobsprojectstatus" style="position: fixed;right: 0;z-index: 999;top: 200px;">' + data.message + '</div>');
                        setTimeout(function() {
                            $('.myjobsprojectstatus').remove();;
                        }, 4000);
                    } else {
                        $('.bodywrapper__inner').before('<div class="alert alert-danger myjobsprojectstatus" style="position: fixed;right: 0;z-index: 999;top: 200px;">' + data.message + '</div>');
                        setTimeout(function() {
                            $('.myjobsprojectstatus').remove();;
                        }, 4000);
                    }
                }
            })
        }
    });

    $(".search_freelancer_with_specific_countries").on("change", function() {
        if ($(".search_freelancer_with_specific_countries").val() != "") {
            $("#freelancers-list").empty();
            $.ajax({
                url: "/searchfreelancerwithspicificcountries",
                type: "post",
                data: { info: $(this).val() },
                success: function(data) {
                    $(".jobs-found b").html(data.totalfreelancers);
                    var detail = '';
                    if (data.freelancers.length > 0) {
                        data.freelancers.forEach((val, i) => {
                            detail += `<div class="freelancer-card">
                                    <div class="freelancer-card-header">
                                        <div class="freelancer-profile">
                                            <div class="freelancer-profile-img">`;
                            if (val.image == null || val.image == '') {
                                detail += `       <img src="${baseURL}/assets/images/avatar.png" alt="" class="freelancer-profile-img">`;
                            } else {
                                detail += `       <img src="${baseURL}/avatars/ ${val.image} " alt="" class="freelancer-profile-img">`;
                            }
                            detail += `         </div>
                                            <div class="freelancer-profile-info pl-2">
                                                <h5>
                                                     ${val.username}
                                                </h5>
                                                <p>
                                                     ${val.display_name}
                                                </p>
                                                <p>
                                                     ${val.location.country.name}
                                                </p>
                                            </div>
                                        </div>
                                        <div class="saved-and-post-job-section">
                                            <div class="save-freelancer-btn" data-uid=" ${val.id} ">
                                                <i class="far fa-heart save-freelancer-btn_ ${val.id} "></i>
                                            </div>
                                            <div class="invite-to-job-btn pl-2">
                                                <a href="/inviteforjob">Invite to job</a>
                                            </div>
                                        </div>
                                    </div>
                                </div>`;
                        })
                    } else {
                        detail += `no freelancers found with this skillset`;
                    }
                    $("#freelancers-list").html(detail);
                }
            })
        }
    });

    $("#onlinefreelancers").on("change", function() {
        if ($(this).is(':checked')) {
            $("#freelancers-list").empty();
            $.ajax({
                url: "/searchonlinefreelancers",
                type: "post",
                success: function(data) {
                    $(".jobs-found b").html(data.totalfreelancers);
                    var detail = '';
                    if (data.freelancers.length > 0) {
                        data.freelancers.forEach((val, i) => {
                            detail += `<div class="freelancer-card">
                                    <div class="freelancer-card-header">
                                        <div class="freelancer-profile">
                                            <div class="freelancer-profile-img">`;
                            if (val.image == null || val.image == '') {
                                detail += `       <img src="${baseURL}/assets/images/avatar.png" alt="" class="freelancer-profile-img">`;
                            } else {
                                detail += `       <img src="${baseURL}/avatars/ ${val.image} " alt="" class="freelancer-profile-img">`;
                            }
                            detail += `         </div>
                                            <div class="freelancer-profile-info pl-2">
                                                <h5>
                                                     ${val.username}
                                                </h5>
                                                <p>
                                                     ${val.display_name}
                                                </p>
                                                <p>
                                                     ${val.location.country.name}
                                                </p>
                                            </div>
                                        </div>
                                        <div class="saved-and-post-job-section">
                                            <div class="save-freelancer-btn" data-uid=" ${val.id} ">
                                                <i class="far fa-heart save-freelancer-btn_ ${val.id} "></i>
                                            </div>
                                            <div class="invite-to-job-btn pl-2">
                                                <a href="/inviteforjob">Invite to job</a>
                                            </div>
                                        </div>
                                    </div>
                                </div>`;
                        })
                    } else {
                        detail += `no freelancers found with this skillset`;
                    }
                    $("#freelancers-list").html(detail);
                }
            })
        }
    })

    $(".min-hourly-rate, .max-hourly-rate").on("focusout", function() {
        var max = 0,
            min = 0;
        if ($(".min-hourly-rate").val() != "" || $(".max-hourly-rate").val() != "") {
            $('.spinner-border').removeClass('d-none');
            $("#freelancers-list").empty();
            if ($(".min-hourly-rate").val() != "") {
                min = $(".min-hourly-rate").val();
            }
            if ($(".max-hourly-rate").val() != "") {
                max = $(".max-hourly-rate").val();
            }
            $.ajax({
                url: "/loadfreelancerwithmaxmin",
                type: "post",
                data: { min: min, max: max },
                success: function(data) {
                    $('.spinner-border').addClass('d-none');
                    $(".jobs-found b").html(data.totalfreelancers);
                    var detail = '';
                    if (data.freelancers.length > 0) {
                        data.freelancers.forEach((val, i) => {
                            detail += `<div class="freelancer-card">
                                    <div class="freelancer-card-header">
                                        <div class="freelancer-profile">
                                            <div class="freelancer-profile-img">`;
                            if (val.avatar == null || val.avatar == '') {
                                detail += `       <img src="${baseURL}/assets/images/avatar.png" alt="" class="freelancer-profile-img">`;
                            } else {
                                detail += `       <img src="${val.avatar_cdn}" alt="" class="freelancer-profile-img">`;
                            }
                            detail += `         </div>
                                            <div class="freelancer-profile-info pl-2">
                                                <h5>
                                                     ${val.username}
                                                </h5>
                                                <p>
                                                     ${val.display_name}
                                                </p>
                                                <p>
                                                     ${val.location.country.name}
                                                </p>
                                            </div>
                                        </div>
                                        <div class="saved-and-post-job-section">
                                            <div class="save-freelancer-btn" data-uid=" ${val.id} ">
                                                <i class="far fa-heart save-freelancer-btn_ ${val.id} "></i>
                                            </div>
                                            <div class="invite-to-job-btn pl-2">
                                                <a href="/inviteforjob">Invite to job</a>
                                            </div>
                                        </div>
                                    </div>
                                </div>`;
                        })
                    } else {
                        detail += `no freelancers found with this skillset`;
                    }
                    $("#freelancers-list").html(detail);
                }
            })
        }
    })
})

$(document).ready(function() {
    $('input[name="p_type"]').on("change", function() {
        var type = $('input[name="p_type"]:checked').val();
        if (type == "fixed") {
            $(".hourly-section").hide();
        } else {
            $(".hourly-section").show();
        }
    })
})

$(document).ready(function() {
    $("#post-and-invite").on("submit", function(e) {
        e.preventDefault();
        $.ajax({
            url: "/job-post",
            type: "post",
            data: $(this).serialize(),
            success: function(data) {
                if (data.response.status == 'error') {
                    success.style.display = 'none'
                    error.style.display = 'block'
                    error.innerText = data.response.message;
                } else {
                    error.style.display = 'none'
                    success.style.display = 'block'
                    success.innerText = data.message;
                }
            }
        })
    })
})

$(document).ready(function() {
    $("#see-all-client-posting").on("click", function() {
        $("#clients-all-projects").empty();
        $.ajax({
            url: "/see-all-client-posting",
            type: "post",
            success: function(data) {
                var action = "";
                data.clientprojects.forEach((val) => {
                    action += `<div class="project-box p-4" onclick="OpenProject(${val.id})" style="cursor: pointer;">
                                                <div class="project-title mb-3">
                                                    <h3>
                                                        ${val.title}
                                                    </h3>
                                                </div>
                                                <div class="project-description">
                                                    <div class="project-info" style="color: #3c3c3c;display: flex;flex-direction: column;">
                                                        <div class="project_type">
                                                            ${val.type} - price
                                                        </div>
                                                        <div class="posted_on">
                                                            Posted on:`;
                    var date = val.created_at
                    action += `${date.toString().substr(4,12)}
                                                        </div>
                                                    </div>
                                                    <div class="project-proposal-info">
                                                        <div class="project-proposal">
                                                            <h5>3</h5>
                                                            <p>Proposals</p>
                                                        </div>
                                                        <div class="messages">
                                                            <h5>3</h5>
                                                            <p>Messaged</p>
                                                        </div>
                                                        <div class="hired">
                                                            <h5>0</h5>
                                                            <p>Hired</p>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>`;
                })
                $("#clients-all-projects").html(action);
            }
        })
    });

    $(".min-review, .max-review").on("keyup", function() {
        var min_review = $('.min-review').val();
        var max_review = $('.max-review').val();
        if (min_review != "" || max_review != "") {
            $('.spinner-border').removeClass('d-none');
            $("#freelancers-list").empty();
            setTimeout(function() {
                $.ajax({
                    url: "/loadfreelancerwithmaxminreview",
                    type: "post",
                    data: {
                        "min": min_review,
                        "max": max_review
                    },
                    success: function(data) {
                        $('.spinner-border').addClass('d-none');
                        $(".jobs-found b").html(data.totalfreelancers);
                        var detail = '';
                        if (data.freelancers.length > 0) {
                            data.freelancers.forEach((val, i) => {
                                detail += `<div class="freelancer-card">
                                    <div class="freelancer-card-header">
                                        <div class="freelancer-profile">
                                            <div class="freelancer-profile-img">`;
                                if (val.avatar == null || val.avatar == '') {
                                    detail += `       <img src="${baseURL}/assets/images/avatar.png" alt="" class="freelancer-profile-img">`;
                                } else {
                                    detail += `       <img src="${val.avatar_cdn}" alt="" class="freelancer-profile-img">`;
                                }
                                detail += `         </div>
                                            <div class="freelancer-profile-info pl-2">
                                                <h5>
                                                     ${val.username}
                                                </h5>
                                                <p>
                                                     ${val.display_name}
                                                </p>
                                                <p>
                                                     ${val.location.country.name}
                                                </p>
                                            </div>
                                        </div>
                                        <div class="saved-and-post-job-section">
                                            <div class="save-freelancer-btn" data-uid=" ${val.id} ">
                                                <i class="far fa-heart save-freelancer-btn_ ${val.id} "></i>
                                            </div>
                                            <div class="invite-to-job-btn pl-2">
                                                <a href="/inviteforjob">Invite to job</a>
                                            </div>
                                        </div>
                                    </div>
                                </div>`;
                            })
                        } else {
                            detail += `no freelancers found with this skillset`;
                        }
                        $("#freelancers-list").html(detail);
                    }
                })
            }, 3000);
        }
    });

    $('#message-send-chat').on('click', function() {
        var textAreaChat = $('textarea#textAreaExample2').val();
        $.ajax({
            url: '/all-chat-posting',
            type: 'post',
            data: {
                "chatinfo": textAreaChat
            },
            success: function(response) {
                console.log(response);
            }
        });
    });


    if (window.location.pathname == '/messages') {
        $.ajax({
            url: '/all-chat-thread',
            type: 'get',
            success: function(response) {
                console.log(response);
                var info = ``;
                var arr = Object.keys(response.users).map((key) => [Number(key), response.users[key]])
                response.threads.forEach((res, i) => {
                    for (var j = 0; j < arr.length; j++) {
                        if (response.type == 2) {
                            if (arr[j][0] == res.thread.members[1]) {
                                info += `<li class="p-2 border-bottom pick-thread" style="background-color: #eee;cursor:pointer;" data-thread_id="${res.thread.id}" data-user_id="${arr[j][0]}">`;
                                info += `<a class="d-flex justify-content-between">`;
                                info += `<div class="d-flex flex-row">`;
                                info += `<img src="https://www.freelancer.com/${arr[j][1].avatar}" alt="avatar"class="rounded-circle d-flex align-self-center me-3 shadow-1-strong" width="50">`;
                                info += `<div class="pt-1">`;
                                info += `<p class="fw-bold mb-0">${arr[j][1].public_name}</p>`;
                                if (res.thread.message != null && res.thread.message != '') {
                                    info += `<p class="small text-muted">${res.thread.message.message}</p>`;
                                }
                                info += `</div>`;
                                info += `</div>`;
                                if (res.thread.message != null && res.thread.message != '' && res.is_read == false) {
                                    info += `<div style='display:flex;flex-direction:column;align-items:flex-end;width:30%;margin-left:10px'>`;
                                    info += `<p class="small text-muted mb-1">Just now</p>`;
                                    info += `<span class="badge bg-danger float-end" style='height:fit-content;width:fit-content;'>1</span>`;
                                    info += `</div>`;
                                } else {}
                                info += `</div>`;
                                info += `</a>`;
                                info += `</li>`;
                            }
                        } else {
                            if (arr[j][0] == res.thread.members[0]) {
                                info += `<li class="p-2 border-bottom pick-thread" style="background-color: #eee;cursor:pointer;" data-thread_id="${res.thread.id}" data-user_id="${arr[j][0]}">`;
                                info += `<a class="d-flex justify-content-between">`;
                                info += `<div class="d-flex flex-row">`;
                                info += `<img src="https://www.freelancer.com/${arr[j][1].avatar}" alt="avatar"class="rounded-circle d-flex align-self-center me-3 shadow-1-strong" width="50">`;
                                info += `<div class="pt-1">`;
                                info += `<p class="fw-bold mb-0">${arr[j][1].public_name}</p>`;
                                if (res.thread.message != null && res.thread.message != '') {
                                    info += `<p class="small text-muted">${res.thread.message.message}</p>`;
                                }
                                info += `</div>`;
                                info += `</div>`;
                                if (res.thread.message != null && res.thread.message != '' && res.is_read == false) {
                                    info += `<div style='display:flex;flex-direction:column;align-items:flex-end;width:30%;margin-left:10px'>`;
                                    info += `<p class="small text-muted mb-1">Just now</p>`;
                                    info += `<span class="badge bg-danger float-end" style='height:fit-content;width:fit-content;'>1</span>`;
                                    info += `</div>`;
                                } else {}
                                info += `</div>`;
                                info += `</a>`;
                                info += `</li>`;
                            }
                        }
                    }
                });
                $("#thread-list").empty();
                $("#thread-list").html(info);
                $('#thread-list li:first').trigger('click');
                $('#thread-list li:first').addClass('activethread');
            }
        })
    }

    $("input:radio[name=contract_type]").on('click', function() {
        var contract_type = $('input:radio[name=contract_type]:checked').val();
        $.ajax({
            url: "/freelancerjobsearch",
            type: "post",
            data: { contract_type: contract_type },
            success: function(response) {
                var html = '';
                if (response.success == 1) {
                    response.result.forEach((res, i) => {
                        var date = res.updated_at
                        html += `<div class="project-box p-4">`;
                        html += `<div class="project-title mb-3">`;
                        html += `<h3>${res.title}</h3>`;
                        html += `</div>`;

                        html += `<div class="project-description">`;
                        html += `<div class="project-info" style="color: #3c3c3c;display: flex;flex-direction: column;">`;
                        html += `<div class="project_type">${res.type} - price</div>`;
                        html += `<div class="posted_on">Posted on:${date.toString().substr(0,10)} </div>`;
                        html += `<div class="project-proposal-info">`;
                        html += `<div class="project-proposal">`;
                        html += `<a href="/messages" class="btn btn-primary">Send Message</a>`;
                        html += `</div>`;
                        html += `</div>`;
                        html += `</div>`;
                        html += `</div>`;
                        html += `</div>`;
                    });
                }
                $("#clients-all-projects").empty();
                $("#clients-all-projects").html(html);
            }
        })
    });

    $("input:checkbox[name=contract_status]").on('change', function() {
        var contract_status = $('input:checkbox[name=contract_status]:checked').map(function() {
            return this.value;
        }).get().join(',');
        var contract_type = $('input:radio[name=contract_type]:checked').val();
    });

    $(document).on("click", ".pick-thread", function() {
        var temp_user_id = $(this).data('user_id');
        $('#thread-list .pick-thread').removeClass('activethread');
        $(this).addClass('activethread');
        $.ajax({
            url: "/loadthread",
            type: "post",
            data: { thread_id: $(this).data('thread_id') },
            success: function(data) {
                console.log(data);
                var info = ``;
                var username = [];
                var avatar_cdn = [];
                var usernamekey = [];
                if (data.message.length > 0) {
                    var msg = data.message.reverse();
                    var userarr = Object.keys(data.users).map((key) => [Number(key), data.users[key]]);
                    userarr.forEach((val, i) => {
                        username[val[1].id] = val[1].public_name;
                        usernamekey[i] = val[1].usernamekey;
                        avatar_cdn[val[1].id] = val[1].avatar_cdn;
                    });
                    msg.forEach((val, i) => {
                        var user_name = username[val.from_user]; //https://www.freelancer.com//ppic/194879459/logo/63112105/profile_logo_63112105.jpg
                        var profile = avatar_cdn[val.from_user]; //https://www.freelancer.com//ppic/194879459/logo/63112105/profile_logo_63112105.jpg
                        if (val.from_user == temp_user_id) {
                            info += `<li class="d-flex justify-content-between mb-4">
                                    <div class="card w-100 active-bg-color">
                                        <div class="card-header d-flex justify-content-between p-3">
                                            <p class="fw-bold mb-0">${user_name}</p>
                                        </div>
                                        <div class="card-body">
                                            <p class="mb-0">
                                                ${val.message}
                                            </p>
                                        </div>
                                    </div>
                                    <img src="${profile}" alt="avatar" class="rounded-circle d-flex align-self-start ms-3 shadow-1-strong" width="60">
                                </li>`;
                        } else {
                            info += `<li class="d-flex justify-content-between mb-4">
                                    <img src="${profile}" alt="avatar" class="rounded-circle d-flex align-self-start me-3 shadow-1-strong" width="60">
                                    <div class="card w-100">
                                        <div class="card-header d-flex justify-content-between p-3">
                                            <p class="fw-bold mb-0">${user_name}</p>
                                        </div>
                                        <div class="card-body">
                                            <p class="mb-0">
                                                ${val.message}
                                            </p>
                                        </div>
                                    </div>
                                </li>`;
                        }

                    });

                }

                info += `<li class='mt-auto'>
                            <form action="return false">
                                <div class="form-outline mb-3 bg-white">
                                    <input type="hidden" name="thread_id" id="thread_id" required>
                                    <input type="hidden" name="user_id" id="user_id" required>
                                    <textarea class="form-control" id="user_msg" rows="4" placeholder="Message" required></textarea>
                                </div>
                                <button type="button" id="" class="btn btn-info btn-rounded float-end message_send_chat_temp">Send</button>
                            </form>
                        </li>`;
                $(".chat-list").html(info);
                $("#thread_id").val(data.message[0].thread_id);
                $("#user_id").val(temp_user_id);
                $(".chat-list").animate({ scrollTop: $('.chat-list').prop("scrollHeight") }, 300);


            }
        })
    })

    $(document).on("click", ".admin-pick-thread", function() {
        var temp_user_id = $(this).data('user_id');
        $.ajax({
            url: "/loadthread",
            type: "post",
            data: { thread_id: $(this).data('thread_id') },
            success: function(data) {
                var info = ``;
                var username = [];
                var avatar_cdn = [];
                var usernamekey = [];
                if (data.message.length > 0) {
                    var msg = data.message.reverse();
                    var userarr = Object.keys(data.users).map((key) => [Number(key), data.users[key]]);
                    userarr.forEach((val, i) => {
                        username[val[1].id] = val[1].username;
                        usernamekey[i] = val[1].usernamekey;
                        avatar_cdn[val[1].id] = val[1].avatar_cdn;
                    });
                    msg.forEach((val, i) => {
                        var user_name = username[val.from_user]; //https://www.freelancer.com//ppic/194879459/logo/63112105/profile_logo_63112105.jpg
                        var profile = avatar_cdn[val.from_user]; //https://www.freelancer.com//ppic/194879459/logo/63112105/profile_logo_63112105.jpg
                        if (val.from_user == temp_user_id) {
                            info += `<li class="d-flex justify-content-between mb-4">
                                    <div class="card w-100 active-bg-color">
                                        <div class="card-header d-flex justify-content-between p-3">
                                            <p class="fw-bold mb-0">${user_name}</p>
                                        </div>
                                        <div class="card-body">
                                            <p class="mb-0">
                                                ${val.message}
                                            </p>
                                        </div>
                                    </div>
                                    <img src="${profile}" alt="avatar" class="rounded-circle d-flex align-self-start ms-3 shadow-1-strong" width="60">
                                </li>`;
                        } else {
                            info += `<li class="d-flex justify-content-between mb-4">
                                    <img src="${profile}" alt="avatar" class="rounded-circle d-flex align-self-start me-3 shadow-1-strong" width="60">
                                    <div class="card">
                                        <div class="card-header d-flex justify-content-between p-3">
                                            <p class="fw-bold mb-0">${user_name}</p>
                                        </div>
                                        <div class="card-body">
                                            <p class="mb-0">
                                                ${val.message}
                                            </p>
                                        </div>
                                    </div>
                                </li>`;
                        }

                    });

                }

                info += `<li class='mt-auto'>
                            <form action="return false">
                                <div class="form-outline mb-3 bg-white">
                                    <input type="hidden" name="thread_id" id="thread_id" required>
                                    <input type="hidden" name="user_id" id="user_id" required>
                                    <textarea class="form-control" id="user_msg" rows="4" placeholder="Message" required></textarea>
                                </div>
                                <button type="button" id="" class="btn btn-info btn-rounded float-end message_send_chat_temp">Send</button>
                            </form>
                        </li>`;
                $(".admin-chat-list").html(info);
                $("#thread_id").val(data.message[0].thread_id);
                $("#user_id").val(temp_user_id);
                $(".admin-chat-list").animate({ scrollTop: $('.admin-chat-list').prop("scrollHeight") }, 300);


            }
        })
    })

});

// $(document).ready(function() {
$(document).on("click", ".message_send_chat_temp", function(e) {
        e.preventDefault();
        if ($("#user_msg").val() != "" && $("#thread_id").val() != "") {
            $.ajax({
                url: "/sendmsginchat",
                type: "post",
                data: { msg: $("#user_msg").val(), thread_id: $("#thread_id").val() },
                success: function(data) {
                    getChat($("#thread_id").val(), $("#user_id").val());
                }
            });
        } else {
            $("#user_msg").focus();
        }
    })
    // })


function getChat(thread_id, user_id) {
    $.ajax({
        url: "/loadthread",
        type: "post",
        data: { thread_id: thread_id },
        success: function(data) {
            var info = ``;
            var username = [];
            var avatar_cdn = [];
            if (data.message.length > 0) {
                var msg = data.message.reverse();
                var userarr = Object.keys(data.users).map((key) => [Number(key), data.users[key]]);
                userarr.forEach((val, i) => {
                    username[val[1].id] = val[1].username;
                    avatar_cdn[val[1].id] = val[1].avatar_cdn;
                });
                msg.forEach((val, i) => {
                    var user_name = username[val.from_user];
                    var profile = avatar_cdn[val.from_user]; //https://www.freelancer.com//ppic/194879459/logo/63112105/profile_logo_63112105.jpg
                    if (val.from_user == user_id) {
                        info += `<li class="d-flex justify-content-between mb-4">
                            <div class="card w-100 active-bg-color">
                                <div class="card-header d-flex justify-content-between p-3">
                                    <p class="fw-bold mb-0">${user_name}</p>
                                </div>
                                <div class="card-body">
                                    <p class="mb-0">
                                        ${val.message}
                                    </p>
                                </div>
                            </div>
                            <img src="${profile}" alt="avatar" class="rounded-circle d-flex align-self-start ms-3 shadow-1-strong" width="60">
                        </li>`;
                    } else {
                        info += `<li class="d-flex justify-content-between mb-4">
                            <img src="${profile}" alt="avatar" class="rounded-circle d-flex align-self-start me-3 shadow-1-strong" width="60">
                            <div class="card w-100">
                                <div class="card-header d-flex justify-content-between p-3">
                                    <p class="fw-bold mb-0">${user_name}</p>
                                </div>
                                <div class="card-body">
                                    <p class="mb-0">
                                        ${val.message}
                                    </p>
                                </div>
                            </div>
                        </li>`;
                    }

                });

            }

            info += `<li class='mt-auto'>
                            <form action="return false">
                                <div class="form-outline mb-3 bg-white">
                                    <input type="hidden" name="thread_id" id="thread_id" required>
                                    <input type="hidden" name="user_id" id="user_id" required>
                                    <textarea class="form-control" id="user_msg" rows="4" placeholder="Message" required></textarea>
                                </div>
                                <button type="button" id="" class="btn btn-info btn-rounded float-end message_send_chat_temp">Send</button>
                            </form>
                        </li>`;
            $(".chat-list").html(info);
            $("#thread_id").val(data.message[0].thread_id);
            $("#user_id").val(user_id);
            $(".chat-list").animate({ scrollTop: $('.chat-list').prop("scrollHeight") }, 300);
        }
    })
}

$(document).ready(function() {
    $(".chat-list").animate({ scrollTop: $('.chat-list').prop("scrollHeight") }, 1000);
})

function showBidsList(id) {
    $.ajax({
        url: "/showBidsList",
        type: "post",
        data: { id: id },
        success: function(data) {
            console.log(data);
        }
    })
}

// code for job detail page
const tabBtns = document.querySelectorAll(".tabs__btn");
const tabPanes = document.getElementsByClassName("tabs__pane");

let fadeTime = 200;

function fadeOut(target) {
    target.style.opacity = 1;
    target.style.transition = `opacity ${fadeTime}ms`;
    target.style.opacity = 0;
    setTimeout(() => {
        target.style.display = "none";
    }, fadeTime);
}

function fadeIn(target) {
    target.style.opacity = 0;
    target.style.transition = `opacity ${fadeTime}ms`;
    target.style.opacity = 1;
    setTimeout(() => {
        target.style.display = "block";
    }, fadeTime);
}

function triggerTab(elt) {
    elt.preventDefault();

    tabBtns.forEach((btn) => {
        btn.classList.remove("is-active");
        btn.setAttribute("aria-selected", false);
    });

    [].forEach.call(tabPanes, (pane) => {
        fadeOut(pane);
    });

    elt.target.classList.add("is-active");
    elt.target.setAttribute("aria-selected", true);
    let clickedTab = elt.target.dataset.tabTarget;
    fadeIn(document.querySelector(`#${clickedTab}`));
}

tabBtns.forEach((tab) => {
    tab.addEventListener("click", triggerTab);
});

$('.job-detail ul.border-as-triangle li').click(function() {
    var tabid = $(this).data('tab-target');
    $('.job-detail ul.border-as-triangle li').removeClass('active');
    $('.job-detail .tabs__content .tabs__pane').removeClass('is-visible');
    if (!$(this).hasClass('active')) {
        $(this).addClass('active');
        $('#' + tabid).addClass('is-visible');
    }

});

if (window.location.pathname == '/jobdetail') {
    var url_string = window.location;
    var url = new URL(url_string);
    var project_id = url.searchParams.get("project_id");
    $('.spinner-border').removeClass('d-none');
    $.ajax({
        url: "/getJobDetailForClient",
        type: "post",
        data: { id: project_id },
        success: function(data) {
            console.log(data);
            if (data.success == 1) {
                var info = '';
                //tab 2
                $("#proposals-table").empty();
                $('.spinner-border').addClass('d-none');
                data.proposals.forEach((val, i) => {
                    var date = new Date(val.time_submitted * 1000)
                    info += `<tr>
                                    <td>${val.bidder_id}</td>
                                    <td>${val.description.substr(0,35)}</td>
                                    <td>${val.amount}</td>
                                    <td>${val.period}</td>
                                    <td>${date.toDateString().substr(4)}</td>
                                    <td>${val.milestone_percentage}</td>
                                    <td style="width:110px!important">
                                        <button class='btn btn-success success_hire' data-project_owner_id="${data.projectinfo.owner_id}" data-bidder_id="${val.bidder_id}" data-bid_id="${val.id}">Hire 🤝</button>
                                        <button class='btn btn-warning' data-bidder_id="${val.bidder_id}" data-project_owner_id="${data.projectinfo.owner_id}" data-project_id="${data.projectinfo.id}" id="makechat">Chat 🟢</button>
                                       
                                        <button class='btn btn-danger'>Reject <i class='fas fa-trash' style='color:white;'></i></button>
                                    </td>
                                </tr>`;
                })
                $("#proposals-table").html(info);

                // tab 1
                $(".job-detail-project-title_desc").html("");
                $("#project-title-for-job-detail-page").html("");
                $(".choose-project").hide();
                $(".job-detail-project-title").html(data.projectinfo.title);
                $("#project-title-for-job-detail-page").html(data.projectinfo.title);

                //$("#owner_id_jobproject").val(owner_id); // not coming
                $("#hireme_id_jobproject").val(data.projectinfo.id);
                $("#project_name").val(data.projectinfo.title);
                $("#project_name_description").val(data.projectinfo.description);
                $(".project-desc").html(data.projectinfo.description);
                var date = new Date(data.projectinfo.time_submitted * 1000)
                $(".project-submitted-on").html("Posted-on: " + date.toDateString().substr(4));
                $(".card-budget").html("Budget: $ " + data.projectinfo.budget.minimum + " - " + data.projectinfo.budget.maximum + " USD");
                $(".project-detail").show();

                
                if (data.allhiredfreelancers != "" && data.allhiredfreelancers != undefined) {
                    //tab 3
                    
                   
                    var hiredfreelancers = data.hiredfreelancers.result.users;
                    var hiredfreelancersarr = Object.keys(hiredfreelancers).map((key) => [Number(key), hiredfreelancers[key]]);
                    var invite_freelancers_design = '';
                    if(hiredfreelancersarr.length > 0){

                        hiredfreelancersarr.forEach((val, i) => {
                            invite_freelancers_design += `  <li class='list-group-item d-flex justify-content-between'>
                                                                <div class='profile d-flex'>
                                                                    <div><img src='${val[1].avatar_cdn}' height='60px' width='60px' /></div>
                                                                    <div class='ml-2'>
                                                                        <div class='ml-2'>${val[1].username}</div>
                                                                        <div class='ml-2'>${val[1].display_name}</div>
                                                                        <div class='ml-2'>${val[1].location.country.name}</div>
                                                                    </div>
                                                                </div>
                                                                <div class='invite-freelancer-section'>
                                                                    <button class='btn-to-invite-freelancer' data-project_id='${data.projectinfo.id}' data-freelancer_id='${val[0]}' data-freelancer_avatar='${val[1].avatar_cdn}' data-freelancer_name='${val[1].display_name}'>Invite Freelancer</button>
                                                                </div>
                                                            </li>`;
                        })
    
                        $(".invite_freelancers").html(invite_freelancers_design);
                    }
                    
                }else{
                    var invite_freelancers_design = '';
                    if (data.freelancers.length > 0 && data.freelancers.length !=undefined) {
                        
                        data.freelancers.forEach((val, i) => {
                            invite_freelancers_design += `<div class="freelancer-card">
                                    <div class="freelancer-card-header">
                                        <div class="freelancer-profile">
                                            <div class="freelancer-profile-img">`;
                            if (val.avatar_cdn == null || val.avatar_cdn == '') {
                                invite_freelancers_design += `       <img src="${baseURL}/assets/images/avatar.png" alt="" class="freelancer-profile-img">`;
                            } else {
                                invite_freelancers_design += `       <img src="${val.avatar_cdn} " alt="" class="freelancer-profile-img">`;
                            }
                            invite_freelancers_design += `         </div>
                                            <div class="freelancer-profile-info pl-2">
                                                <h5>
                                                     ${val.username}
                                                </h5>
                                                <p>
                                                     ${val.display_name}
                                                </p>
                                                <p>
                                                     ${val.location.country.name}
                                                </p>
                                            </div>
                                        </div>
                                        <div class="saved-and-post-job-section">
                                            <div class="save-freelancer-btn" data-uid=" ${val.id} ">
                                                <i class="far fa-heart save-freelancer-btn_ ${val.id} "></i>
                                            </div>
                                            <div class="invite-to-job-btn pl-2">
                                                <a data-fid =${val.id} data-fname = ${val.username} data-avatar = "${baseURL}/assets/images/avatar.png" data-fpic = ${val.avatar_cdn}>Invite to job</a>
                                            </div>
                                        </div>
                                    </div>
                                </div>`;
                        })
                    } else {
                        invite_freelancers_design += `no freelancers found with this skillset`;
                    }


                    $(".invite_freelancers").html(invite_freelancers_design);
                }
                if (data.hiredfreelancers.status === "success") {
                    // tab 4
                    var hiredfreelancers = data.hiredfreelancers.result.users;
                    var hiredfreelancersarr = Object.keys(hiredfreelancers).map((key) => [Number(key), hiredfreelancers[key]]);

                    var design = '';
                    hiredfreelancersarr.forEach((val, i) => {
                        design += `<li class='d-flex list-group-item'>
                                        <div><img src='${val[1].avatar_cdn}' height='60px' width='60px' /></div>
                                        <div>
                                            <div class='ml-2'>${val[1].username}</div>
                                            <div class='ml-2'>${val[1].display_name}</div>
                                            <div class='ml-2'>${val[1].location.country.name}</div>
                                        </div>
                                    </li>`;
                    })
                    $(".allHiredFreelancers").html(design);
                }
                if (data.hiredfreelancers != "") {

                    // tab 4
                    var hiredfreelancers = data.hiredfreelancers.result.users;
                    var hiredfreelancersarr = Object.keys(hiredfreelancers).map((key) => [Number(key), hiredfreelancers[key]]);

                    var design = '';
                    hiredfreelancersarr.forEach((val, i) => {
                        design += `<li class='d-flex list-group-item'>
                                        <div><img src='${val[1].avatar_cdn}' height='60px' width='60px' /></div>
                                        <div>
                                            <div class='ml-2'>${val[1].username}</div>
                                            <div class='ml-2'>${val[1].display_name}</div>
                                            <div class='ml-2'>${val[1].location.country.name}</div>
                                        </div>
                                    </li>`;
                    })
                    $(".allHiredFreelancers").html(design);
                }
            }
        }
    })
}

$(document).on("click", ".btn-to-invite-freelancer", function() {
    var fid = $(this).data('freelancer_id');
    var pid = $(this).data('project_id');
    var avatar = $(this).data('freelancer_avatar');
    var name = $(this).data('freelancer_name');
    $("#job-detail-page-fid").val('');
    $("#job-detail-page-fid").val(fid);
    $("#job-detail-page-pid").val('');
    $("#job-detail-page-pid").val(pid);
    $("#job-detail-freelancer-avatar").attr("src", avatar);
    $(".job-detail-page-fname").html(name);
    $("#invitetoalreadyhiredFreelancer").modal("show");
})

$(document).ready(function() {
    $("#job-detail-send-invitation-form").on("submit", function(e) {
        e.preventDefault();
        var message_for_freelancer, fid, chooseproject, owner_id;
        fid = $("#job-detail-page-fid").val();
        chooseproject = $("#job-detail-page-pid").val();
        message_for_freelancer = $("#job_detail_page_message_for_freelancer").val();
        chooseproject = $("#job-detail-page-pid").val();
        $.ajax({
            url: "/sendprojectinvitation",
            type: "post",
            data: { fid: fid, chooseproject: chooseproject, message_for_freelancer: message_for_freelancer },
            success: function(data) {

            }
        })
    })
})

jQuery(document).ready(function() {
    $(".project-detail").hide();
    $(".select-project-for-job-detail").on("change", function() {
        var owner_id = $(this).find(':selected').data('owner_id');
        $.ajax({
            url: "/getJobDetailForClient",
            type: "post",
            data: { id: $(this).val() },
            success: function(data) {
                if (data.success == 1) {
                    var info = '';
                    //tab 2
                    $("#proposals-table").empty();
                    data.proposals.forEach((val, i) => {
                        var date = new Date(val.time_submitted * 1000)
                        info += `<tr>
                                    <td>${val.bidder_id}</td>
                                    <td>${val.description.substr(0,35)}</td>
                                    <td>${val.amount}</td>
                                    <td>${val.period}</td>
                                    <td>${date.toDateString().substr(4)}</td>
                                    <td>${val.milestone_percentage}</td>
                                    <td style="width:110px!important">
                                        <button class='btn btn-success success_hire' data-project_owner_id="${data.projectinfo.owner_id}" data-bidder_id="${val.bidder_id}">Hire 🤝</button>
                                        <button class='btn btn-warning' data-bidder_id="${val.bidder_id}" data-project_owner_id="${data.projectinfo.owner_id}" data-project_id="${data.projectinfo.id}" id="makechat">Chat 🟢</button>
                                       
                                        <button class='btn btn-danger'>Reject <i class='fas fa-trash' style='color:white;'></i></button>
                                    </td>
                                </tr>`;
                    })
                    $("#proposals-table").html(info);

                    // tab 1
                    $(".job-detail-project-title_desc").html("");
                    $(".choose-project").hide();
                    $(".job-detail-project-title").html(data.projectinfo.title);

                    $("#owner_id_jobproject").val(owner_id);
                    $("#hireme_id_jobproject").val(data.projectinfo.id);
                    $("#project_name").val(data.projectinfo.title);
                    $("#project_name_description").val(data.projectinfo.description);
                    $(".project-desc").html(data.projectinfo.description);
                    var date = new Date(data.projectinfo.time_submitted * 1000)
                    $(".project-submitted-on").html("Posted-on: " + date.toDateString().substr(4));
                    $(".card-budget").html("Budget: $ " + data.projectinfo.budget.minimum + " - " + data.projectinfo.budget.maximum + " USD");
                    $(".project-detail").show();
                    if (data.allhiredfreelancers != "") {
                        //tab 3
                        var hiredfreelancers = data.hiredfreelancers.result.users;
                        var hiredfreelancersarr = Object.keys(hiredfreelancers).map((key) => [Number(key), hiredfreelancers[key]]);
                        var invite_freelancers_design = '';
                        hiredfreelancersarr.forEach((val, i) => {
                            invite_freelancers_design += `  <li class='list-group-item d-flex justify-content-between'>
                                                            <div class='profile d-flex'>
                                                                <div><img src='${val[1].avatar_cdn}' height='60px' width='60px' /></div>
                                                                <div class='ml-2'>
                                                                    <div class='ml-2'>${val[1].username}</div>
                                                                    <div class='ml-2'>${val[1].display_name}</div>
                                                                    <div class='ml-2'>${val[1].location.country.name}</div>
                                                                </div>
                                                            </div>
                                                            <div class='invite-freelancer-section'>
                                                                <button class='btn-to-invite-freelancer' data-toggle='modal' data-target="#invitetoalreadyhiredFreelancer" data-project_id='${data.projectinfo.id}'>Invite Freelancer</button>
                                                            </div>
                                                        </li>`;
                        })
                        $(".invite_freelancers").html(invite_freelancers_design);
                    }
                    if (data.hiredfreelancers != "") {
                        // tab 4
                        var hiredfreelancers = data.hiredfreelancers.result.users;
                        var hiredfreelancersarr = Object.keys(hiredfreelancers).map((key) => [Number(key), hiredfreelancers[key]]);
                        var design = '';
                        hiredfreelancersarr.forEach((val, i) => {
                            design += `<li class='d-flex list-group-item'>
                                        <div><img src='${val[1].avatar_cdn}' height='60px' width='60px' /></div>
                                        <div>
                                            <div class='ml-2'>${val[1].username}</div>
                                            <div class='ml-2'>${val[1].display_name}</div>
                                            <div class='ml-2'>${val[1].location.country.name}</div>
                                        </div>
                                    </li>`;
                        })
                        $(".allHiredFreelancers").html(design);
                    }
                }
            }
        })
    });

    $('#pills-saved-tab').on('click', function() {
        $.ajax({
            url: "/saved_freelancer_with_projects",
            type: "post",
            success: function(data) {
                var detail = ``;
                var usersavedarr = Object.keys(data.savedresult.users).map((key) => [Number(key), data.savedresult.users[key]]);
                usersavedarr.forEach((val, i) => {
                    detail +=
                        `<div class="freelancer-card">
                        <div class="freelancer-card-header">
                            <div class="freelancer-profile">
                                <div class="freelancer-profile-img">`;
                    detail += `       <img src="${val[1].avatar_cdn }" alt="" class="freelancer-profile-img">`;
                    detail += `         </div>
                                <div class="freelancer-profile-info pl-2">
                                    <h5>
                                            ${val[1].username}
                                    </h5>
                                    <p>
                                            ${val[1].display_name}
                                    </p>
                                    <p>
                                            ${val[1].location.country.name}
                                    </p>
                                </div>
                            </div>
                            <div class="saved-and-post-job-section">
                                <div class="save-freelancer-btn" data-uid=" ${val[1].id} ">
                                    <i class="fas fa-heart save-freelancer-btn_ ${val[1].id} "></i>
                                </div>
                                <div class="invite-to-job-btn pl-2">
                                    <a href="/inviteforjob">Invite to job</a>
                                </div>
                            </div>
                        </div>
                    </div>`;
                })
                $("#pills-saved").html(detail);
            }
        })
    });
})

$(document).on("click", ".success_hire", function() {
    var bidder_id = $(this).data('bidder_id');
    var bid_id = $(this).data('bid_id');
    var project_owner_id = $(this).data('project_owner_id');
    $.ajax({
        url: '/getProjectDetailForOwnerHire',
        type: 'post',
        data: { owner_id: project_owner_id, project_id: $('#hireme_id_jobproject').val(), bidder_id:bidder_id, bid_id:bid_id },
        success: function(response) {
            if(response.status === 'success'){
                alert("We have awarded a bid to this freelancer & if the freelancer accepts this bid means he is hired successfully");
            }else{
                alert("bid award failed");
            }
        }
    })
})


//saved projects client
function SavedProject(id) {
    $.ajax({
        url: '/savedprojects',
        type: 'post',
        data: { project_id: id },
        success: function(response) {
            //alert('Project Successfully Saved');
            if (response.success == 1) {
                $(".saved-freelancer_" + id).removeClass("far");
                $(".saved-freelancer_" + id).addClass("fas");
            }
            setTimeout(function() {
                window.location.href = '/dashboard?tab=saved'
            }, 2500)

        }
    })
}

// removed saved project
function RemovedSavedProject(id) {
    $.ajax({
        url: '/removedsavedprojects',
        type: 'post',
        data: { project_id: id },
        success: function(response) {
            if (response.success == 1) {
                $(".saved-freelancer_" + id).removeClass("fas");
                $(".saved-freelancer_" + id).addClass("far");
            }
            setTimeout(function() {
                window.location.href = '/dashboard?tab=saved'
            }, 2500)

        }
    })
}



$(document).on('click', "#send-invitation-msg-hire", function(e) {
    e.preventDefault();
    var title = $('.project_for_hireme').val();
    var description = $('.message_for_freelancer_hireme').val();
    var currency = $('.project_for_hireme_budget_sign').val();
    var budget = $('.project_for_hireme_budget').val();
    var currencyId = $('.project_for_hireme_budget_sign').val();
    var type = $('.existingproject_hireme').val();
    var bidder_id = $("#hireme_bidder_id").val();
    var project_id = $("#hireme_id_jobproject").val();
    $.ajax({
        url: '/finalhiremefreelancer',
        type: 'post',
        data: {
            "title": title,
            "description": description,
            "currency": currency,
            "budget": budget,
            "currencyId": currencyId,
            "type": type,
            "bidder_id": bidder_id,
            "project_id": project_id,
        },
        success: function(response) {
            if (response.status == 'error') {
                error.style.display = 'none'
                success.style.display = 'block';
                if (response.message.indexOf('AutomaticPayment:') !== -1) {
                    $('#send-hireme-form .modal-body').html('');
                    $('#send-hireme-form .modal-footer').html('');
                    // $('#send-hireme-form .modal-footer').html('<a href="https://www.freelancer.com/verify?ref=hireme&next=%2Fsearch%2Fusers%3FbidCreated%3Dtrue" class="btn btn-primary">Verify Now </button>');
                    //error.innerText = response.message;
                    success.innerText = 'You have successfully hired this freelancer.'; //response.message;
                    setTimeout(function() {
                        window.location.href = "/myjob"
                    }, 3000)
                } else {
                    error.innerText = response.message;
                }
            } else {
                error.style.display = 'none'
                success.style.display = 'block'
                success.innerText = 'Success';
            }
        }
    });


})

$(document).on("click", "#makechat", function() {
    $.ajax({
        url: "/createthread",
        type: "post",
        data: { bidder_id: $(this).data("bidder_id"), project_owner_id: $(this).data("project_owner_id"), project_id: $(this).data("project_id") },
        success: function(data) {
            if (data.success == 'error') {
                if (data.message == 'A thread already exists with this hash') {
                    window.location.href = "/messages";
                } else {
                    alert(data.message);
                }
            } else {
                window.location.href = "/messages";
            }
        }
    })
})

function freelancer_project_detail(bi, pi) {
    window.location.href = '/freelancerprojectdetail/' + bi + '/' + pi;
}

function filterstoggleclients() {
    if ($('#clientfilters').hasClass('clientfilters')) {
        $('#clientfilters').removeClass('clientfilters');
        $('#clientfilters-add').hide();
    } else {
        $('#clientfilters').addClass('clientfilters');
        $('#clientfilters-add').show();
    }
}

function filterstogglefreelancer() {
    var element = document.getElementById("freelancerfilters");
    element.classList.toggle("freelancerfilters");
}

$(document).ready(function() {
    if (window.location.pathname == '/myjob') {
        $('#clientfilters-add').hide();
    }
    var tmp = ["All"];
    var radio = [];
    var radio1 = [];
    tmp.forEach((val, i) => {
        $('#clientfilters-add').append("<div id='filter-value-cli'>" + val + "<i class='fas fa-times'></i></div>")
    })
    $("input[name='checkbox']").change(function() {
        var checked = $(this).val();
        if ($(this).is(':checked')) {
            $('#clientfilters-add').empty();
            tmp.push(checked);
            radio1.forEach((val, i) => {
                $('#clientfilters-add').append("<div id='filter-value-cli'>" + val + "<i class='fas fa-times'></i></div>")
            })
            radio.forEach((val, i) => {
                $('#clientfilters-add').append("<div id='filter-value-cli'>" + val + "<i class='fas fa-times'></i></div>")
            })
            tmp.forEach((val, i) => {
                $('#clientfilters-add').append("<div id='filter-value-cli'>" + val + "<i class='fas fa-times'></i></div>")
            })
        } else {
            tmp.splice($.inArray(checked, tmp), 1);
            $('#clientfilters-add').empty();
            radio1.forEach((val, i) => {
                $('#clientfilters-add').append("<div id='filter-value-cli'>" + val + "<i class='fas fa-times'></i></div>")
            })
            radio.forEach((val, i) => {
                $('#clientfilters-add').append("<div id='filter-value-cli'>" + val + "<i class='fas fa-times'></i></div>")
            })
            tmp.forEach((val, i) => {
                $('#clientfilters-add').append("<div id='filter-value-cli'>" + val + "<i class='fas fa-times'></i></div>")
            })
        }
    });
    $(document).on('click', '#filter-value-cli', function() {
        let data = $(this).html();
        let index = data.indexOf("<i class='fas fa-times'>");
        let result = data.slice(0, index);
        tmp.splice($.inArray(result, tmp), 1);
        $('#clientfilters-add').empty();
        tmp.forEach((val, i) => {
            $('#clientfilters-add').append("<div id='filter-value-cli'>" + val + "<i class='fas fa-times'></i></div>")
        })
    });

    $("input[name='flexRadioDefault']").change(function() {
        $('#clientfilters-add').empty();
        var flexRadioDefault = $(this).val();
        if (flexRadioDefault) {
            radio = [];
            radio.push(flexRadioDefault);
            radio1.forEach((val, i) => {
                $('#clientfilters-add').append("<div id='filter-value-cli'>" + val + "<i class='fas fa-times'></i></div>")
            })
            radio.forEach((val, i) => {
                $('#clientfilters-add').append("<div id='filter-value-cli'>" + val + "<i class='fas fa-times'></i></div>")
            })
            tmp.forEach((val, i) => {
                $('#clientfilters-add').append("<div id='filter-value-cli'>" + val + "<i class='fas fa-times'></i></div>")
            })
        } else {
            radio = [];
            radio1.forEach((val, i) => {
                $('#clientfilters-add').append("<div id='filter-value-cli'>" + val + "<i class='fas fa-times'></i></div>")
            })
            radio.forEach((val, i) => {
                $('#clientfilters-add').append("<div id='filter-value-cli'>" + val + "<i class='fas fa-times'></i></div>")
            })
            tmp.forEach((val, i) => {
                $('#clientfilters-add').append("<div id='filter-value-cli'>" + val + "<i class='fas fa-times'></i></div>")
            })
        }
    })
    $("input[name='flexRadioDefault1']").change(function() {
        $('#clientfilters-add').empty();
        var flexRadioDefault1 = $(this).val();
        if (flexRadioDefault1) {
            radio1 = [];
            radio1.push(flexRadioDefault1);
            radio1.forEach((val, i) => {
                $('#clientfilters-add').append("<div id='filter-value-cli'>" + val + "<i class='fas fa-times'></i></div>")
            })
            radio.forEach((val, i) => {
                $('#clientfilters-add').append("<div id='filter-value-cli'>" + val + "<i class='fas fa-times'></i></div>")
            })
            tmp.forEach((val, i) => {
                $('#clientfilters-add').append("<div id='filter-value-cli'>" + val + "<i class='fas fa-times'></i></div>")
            })
        } else {
            radio1 = [];
            radio1.forEach((val, i) => {
                $('#clientfilters-add').append("<div id='filter-value-cli'>" + val + "<i class='fas fa-times'></i></div>")
            })
            radio.forEach((val, i) => {
                $('#clientfilters-add').append("<div id='filter-value-cli'>" + val + "<i class='fas fa-times'></i></div>")
            })
            tmp.forEach((val, i) => {
                $('#clientfilters-add').append("<div id='filter-value-cli'>" + val + "<i class='fas fa-times'></i></div>")
            })
        }
    })
});

$(document).ready(function() {
    $("#sendinvitetonewmembers").on("submit", function(e) {
        e.preventDefault();
        if ($("#newmemberemail").val() != '') {
            $.ajax({
                url: "/sendInviteToNewMembers",
                type: "post",
                data: $(this).serialize(),
                success: function(data) {
                    $(".scs-msg").html(data.msg);
                    setTimeout(function() {
                        $("#addnewteammember").modal('hide');
                    }, 2000);
                }
            })
        }
    })
})

$(document).ready(function() {
    $(".team-join-status-btn").on("click", function() {
        $.ajax({
            url: "/updateTeamJoiningStatus",
            type: "post",
            data: { action: $(this).html(), token: $(".tokentoacceptorreject").val() },
            success: function(data) {
                $('.updateTeamJoiningStatus').remove();
                if (data.success == 1) {
                    window.location.href = '/dashboard';
                } else {
                    $('.bodywrapper__inner').before('<div class="alert alert-success updateTeamJoiningStatus">' + data.msg + '</div>');
                }
                setTimeout(function() {
                    $('.updateTeamJoiningStatus').remove();
                }, 2000);
            }
        })
    })
    $(".project-approval-status-btn").on("click", function(e) {
        e.preventDefault();
        $.ajax({
            url: "/updateprojectapprovalstatus",
            type: "post",
            data: { status: $(this).data('status'), pid: $(this).data('pid'), pstatus: $(this).data('pstatus') },
            success: function(data) {
                $('.updateprojectapproval').remove();
                if (data.success == 1) {
                    $('.body-wrapper').after('<div class="alert alert-success updateprojectapproval" style="position: fixed;right: 34%;z-index: 999;top: 150px;">' + data.msg + '</div>');
                } else {
                    $('.body-wrapper').after('<div class="alert alert-success updateprojectapproval" style="position: fixed;right: 34%;z-index: 999;top: 150px;">' + data.msg + '</div>');
                }
                $('#row_id_' + data.pid).remove();
                $('#operation_row_id_' + data.pid).remove();
                setTimeout(function() {
                    $('.updateprojectapproval').remove();
                }, 2000);
            }
        })
    })
})


function freelancer_project_detail(bi, pi) {
    window.location.href = '/freelancerprojectdetail/' + bi + '/' + pi;
}

$(document).ready(function() {
    $(".accept-bid-of-team-member").on("click", function() {
        $.ajax({
            url: "/placebidbyteamleader",
            type: "post",
            data: $("#placebidbyteamleader").serialize(),
            success: function(data) {
                if (data.status == 'error') {
                    success.style.display = 'none'
                    error.style.display = 'block'
                    error.innerText = data.msg
                } else {
                    error.style.display = 'none'
                    success.style.display = 'block'
                    success.innerText = data.msg
                    setTimeout(function() {
                        //window.location.href = '/users';
                    }, 2000);
                }
            }
        })
    })
})

$(document).on("click", ".reject-bid-of-team-member", function() {
    $.ajax({
        url: "/rejectBidOfTeamMember",
        type: "post",
        data: { proposal_id: $(this).data('proposal_id') },
        success: function(data) {
            if (data.success == 1) {
                $(".reject-bid-error-msg").html(data.msg);
            }
            setTimeout(function() {
                window.location.href = "/manageoperations";
            }, 2000);
        }
    })
})

$(document).ready(function() {
    // if (window.location.pathname == '/dashboard') {
    $.ajax({
            url: "/getAllNotifications",
            type: "post",
            success: function(data) {
                console.log(data)
                if (data.status == 1) {

                    var info = ``;
                    var info2 = ``;
                    var info3 = ``;
                    

                    if (data.bidnotifications != null) {
                        data.bidnotifications.forEach((val, i) => {
                            if (val.status == 1) {
                                info += `<p class='p-2'>Your proposal have been <b>approved</b> by the manager</p>`;
                            } else if (val.status == 2) {
                                info += `<p class='p-2'>Your proposal have been <b>rejected</b> by the manager</p>`;
                            }
                        })
                        $(".dropdown-for-notification").html('');
                        $(".dropdown-for-notification").html(info);
                    } else {
                        $(".dropdown-for-notification").html('');
                        $(".dropdown-for-notification").html("<p class='p-2'>No new notifications</p>");
                    }

                    if (data.ProjectNotifications != null) {
                        data.ProjectNotifications.forEach((val, i) => {
                            if (val.status == 1) {
                                info2 += `<p class='p-2'><strong>${val.title}-- </strong>Your project have been <b>approved</b> by the manager</p>`;
                            } else if (val.status == 2) {
                                info2 += `<p class='p-2'><strong>${val.title}-- </strong>Your project have been <b>rejected</b> by the manager</p>`;
                            }
                        })
                        $(".dropdown-for-notification").html('');
                        $(".dropdown-for-notification").html(info2);
                    } else {
                        $(".dropdown-for-notification").html('');
                        $(".dropdown-for-notification").html("<p class='p-2'>No new notifications</p>");
                    }


                    if (data.AwardBidNotifications != null) {
                        data.AwardBidNotifications.forEach((val, i) => {
                        console.log(val)
                            info3 += `<div><p class='p-2'>You have been awarded with a bid. kindly accept it</p><button class='btn btn-success text-dark mx-3 accept-award' data-bid_id='${val.bid_id}' data-project_id='${val.project_id}'>Accept</button><button class='btn btn-danger text-dark reject-award' data-project_id='${val.project_id}' data-bid_id='${val.bid_id}'>Reject</button></div>`;
                        })
                        $(".dropdown-for-notification").html('');
                        $(".dropdown-for-notification").html(info3);

                        launch_toast();
                    } else {
                        $(".dropdown-for-notification").html('');
                        $(".dropdown-for-notification").html("<p class='p-2'>No new notifications</p>");
                    }
                }
            }
        })
        // }
})

$(document).ready(function(){
    $(document).on("click",".accept-award", function(){
        var bidid = $(this).data('bid_id');
        var project_id = $(this).data('project_id');
        $.ajax({
            url: "/acceptaward",
            type: "post",
            data: {bidid: bidid,project_id:project_id},
            success: function(data){
                console.log(data);
            }
        })
    })
})

$(document).ready(function() {
    $("#changeProjectStatusAtFreelancerside").on("change", function() {
        if ($(this).val() != 0) {
            $.ajax({
                url: "/updateProjectStatus",
                type: "post",
                data: { action: $(this).val(), pid: $(this).data('project_id') },
                success: function(data) {
                    console.log(data);
                }
            })
        }
    });

    var checktype = null;
    $(".p_type").on("change", function() {
        if($(".p_htype").is(':checked') && ($(".p_ftype").is(':checked') )){
            checktype = null;
        }
        else if($(".p_htype").is(':checked')){
            checktype = $(this).val();
        }else if($(".p_ftype").is(':checked')){
            checktype = $(this).val();
        }
        $(".freelancers-projects").html("");
        $.ajax({
            url: "/showprojectwithspecificprojecttype",
            type: "post",
            data: { p_type: checktype},
            success: function(data) {
                var detail = '';
                if (data.projects.projects.length > 0) {
                    data.projects.projects.forEach((val, i) => {
                        detail += `<div class="project-box p-4" data-pid="${val.id}">
                            <div class="row">
                                <div class="col-sm-7" onclick="OpenProject(${val.id })">
                                    <div class="project-title">
                                        <h3>
                                            ${val.title}
                                        </h3>
                                    </div>
                                </div>
                                <div class="col-sm-2">
                                    <i class="far fa-heart saved-freelancer_${val.id }" onclick="SavedProject(${val.id })" style="font-size: 25px;"></i>
                                </div>
                                <div class="col-sm-3">
                                    <div class="bid-stats">
                                        <div class="total-bids">
                                            <h5>
                                                ${ val.bid_stats.bid_count } bids
                                            </h5>
                                        </div>
                                        <div class="avg-bids ml-4">
                                            <h5>
                                                ${ Math.floor(val.bid_stats.bid_avg) } (avg bid amount)
                                            </h5>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div class="project-description d-flex flex-column mt-2">
                                <div class="project-info mb-2" style="color: #3c3c3c;display: flex;">
                                    <h5>Budget: $
                                        ${ val.budget.minimum } -
                                            ${ val.budget.maximum } USD
                                    </h5>
                                </div>
                                <p>
                                    ${ val.preview_description }
                                </p>
                            </div>
                        </div>`;
                    })
                } else {
                    detail += `no projects found`;
                }
                $(".freelancers-projects").html(detail);
            }
        })
    });

    $("#fp_min, #fp_max").on("focusout", function() {
        var max = 0,
            min = 0;
        if ($("#fp_min").val() != "" || $("#fp_max").val() != "") {
            $('.spinner-border').removeClass('d-none');
            $(".freelancers-projects").html('');
            if ($("#fp_min").val() != "") {
                min = $("#fp_min").val();
            }
            if ($("#fp_max").val() != "") {
                max = $("#fp_max").val();
            }
            $.ajax({
                url: "/showprojectwithspecificprojectfixedprice",
                type: "post",
                data: { min: min, max: max },
                success: function(data) {
                    var detail = '';
                    if (data.projects.projects.length > 0) {
                        data.projects.projects.forEach((val, i) => {
                            detail += `<div class="project-box p-4" data-pid="${val.id}">
                            <div class="row">
                                <div class="col-sm-7" onclick="OpenProject(${val.id })">
                                    <div class="project-title">
                                        <h3>
                                            ${val.title}
                                        </h3>
                                    </div>
                                </div>
                                <div class="col-sm-2">
                                    <i class="far fa-heart saved-freelancer_${val.id }" onclick="SavedProject(${val.id })" style="font-size: 25px;"></i>
                                </div>
                                <div class="col-sm-3">
                                    <div class="bid-stats">
                                        <div class="total-bids">
                                            <h5>
                                                ${ val.bid_stats.bid_count } bids
                                            </h5>
                                        </div>
                                        <div class="avg-bids ml-4">
                                            <h5>
                                                ${ Math.floor(val.bid_stats.bid_avg) } (avg bid amount)
                                            </h5>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div class="project-description d-flex flex-column mt-2">
                                <div class="project-info mb-2" style="color: #3c3c3c;display: flex;">
                                    <h5>Budget: $
                                        ${ val.budget.minimum } -
                                            ${ val.budget.maximum } USD
                                    </h5>
                                </div>
                                <p>
                                    ${ val.preview_description }
                                </p>
                            </div>
                        </div>`;
                        })
                    } else {
                        detail += `no projects found`;
                    }
                    $(".freelancers-projects").html(detail);
                }
            })
        }
    })

    $("#hourly_min, #hourly_max").on("focusout", function() {
        var max = 0,
            min = 0;
        if ($("#hourly_min").val() != "" || $("#hourly_max").val() != "") {
            $('.spinner-border').removeClass('d-none');
            $(".freelancers-projects").html('');
            if ($("#hourly_min").val() != "") {
                min = $("#hourly_min").val();
            }
            if ($("#hourly_max").val() != "") {
                max = $("#hourly_max").val();
            }
            $.ajax({
                url: "/showprojectwithspecificprojecthourlyprice",
                type: "post",
                data: { min: min, max: max },
                success: function(data) {
                    var detail = '';
                    if (data.projects.projects.length > 0) {
                        data.projects.projects.forEach((val, i) => {
                            detail += `<div class="project-box p-4" data-pid="${val.id}">
                            <div class="row">
                                <div class="col-sm-7" onclick="OpenProject(${val.id })">
                                    <div class="project-title">
                                        <h3>
                                            ${val.title}
                                        </h3>
                                    </div>
                                </div>
                                <div class="col-sm-2">
                                    <i class="far fa-heart saved-freelancer_${val.id }" onclick="SavedProject(${val.id })" style="font-size: 25px;"></i>
                                </div>
                                <div class="col-sm-3">
                                    <div class="bid-stats">
                                        <div class="total-bids">
                                            <h5>
                                                ${ val.bid_stats.bid_count } bids
                                            </h5>
                                        </div>
                                        <div class="avg-bids ml-4">
                                            <h5>
                                                ${ Math.floor(val.bid_stats.bid_avg) } (avg bid amount)
                                            </h5>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div class="project-description d-flex flex-column mt-2">
                                <div class="project-info mb-2" style="color: #3c3c3c;display: flex;">
                                    <h5>Budget: $
                                        ${ val.budget.minimum } -
                                            ${ val.budget.maximum } USD
                                    </h5>
                                </div>
                                <p>
                                    ${ val.preview_description }
                                </p>
                            </div>
                        </div>`;
                        })
                    } else {
                        detail += `no projects found`;
                    }
                    $(".freelancers-projects").html(detail);
                }
            })
        }
    })

    $(".listtype").on("change", function() {
        $(".freelancers-projects").html("");
        $.ajax({
            url: "/showprojectwithspecificlistingtype",
            type: "post",
            data: { l_type: $(this).val() },
            success: function(data) {
                var detail = '';
                if (data.projects.projects.length > 0) {
                    data.projects.projects.forEach((val, i) => {
                        detail += `<div class="project-box p-4" data-pid="${val.id}">
                            <div class="row">
                                <div class="col-sm-7" onclick="OpenProject(${val.id })">
                                    <div class="project-title">
                                        <h3>
                                            ${val.title}
                                        </h3>
                                    </div>
                                </div>
                                <div class="col-sm-2">
                                    <i class="far fa-heart saved-freelancer_${val.id }" onclick="SavedProject(${val.id })" style="font-size: 25px;"></i>
                                </div>
                                <div class="col-sm-3">
                                    <div class="bid-stats">
                                        <div class="total-bids">
                                            <h5>
                                                ${ val.bid_stats.bid_count } bids
                                            </h5>
                                        </div>
                                        <div class="avg-bids ml-4">
                                            <h5>
                                                ${ Math.floor(val.bid_stats.bid_avg) } (avg bid amount)
                                            </h5>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div class="project-description d-flex flex-column mt-2">
                                <div class="project-info mb-2" style="color: #3c3c3c;display: flex;">
                                    <h5>Budget: $
                                        ${ val.budget.minimum } -
                                            ${ val.budget.maximum } USD
                                    </h5>
                                </div>
                                <p>
                                    ${ val.preview_description }
                                </p>
                            </div>
                        </div>`;
                    })
                } else {
                    detail += `no projects found`;
                }
                $(".freelancers-projects").html(detail);
            }
        })
    });


    $(".search_freelancer_with_project_countries").on("change", function() {
        $(".freelancers-projects").html("");
        $.ajax({
            url: "/showprojectwithspecificprojectcountrieslistingtype",
            type: "post",
            data: { l_type: $(this).val() },
            success: function(data) {
                var detail = '';
                if (data.projects.projects.length > 0) {
                    data.projects.projects.forEach((val, i) => {
                        detail += `<div class="project-box p-4" data-pid="${val.id}">
                            <div class="row">
                                <div class="col-sm-7" onclick="OpenProject(${val.id })">
                                    <div class="project-title">
                                        <h3>
                                            ${val.title}
                                        </h3>
                                    </div>
                                </div>
                                <div class="col-sm-2">
                                    <i class="far fa-heart saved-freelancer_${val.id }" onclick="SavedProject(${val.id })" style="font-size: 25px;"></i>
                                </div>
                                <div class="col-sm-3">
                                    <div class="bid-stats">
                                        <div class="total-bids">
                                            <h5>
                                                ${ val.bid_stats.bid_count } bids
                                            </h5>
                                        </div>
                                        <div class="avg-bids ml-4">
                                            <h5>
                                                ${ Math.floor(val.bid_stats.bid_avg) } (avg bid amount)
                                            </h5>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div class="project-description d-flex flex-column mt-2">
                                <div class="project-info mb-2" style="color: #3c3c3c;display: flex;">
                                    <h5>Budget: $
                                        ${ val.budget.minimum } -
                                            ${ val.budget.maximum } USD
                                    </h5>
                                </div>
                                <p>
                                    ${ val.preview_description }
                                </p>
                            </div>
                        </div>`;
                    })
                } else {
                    detail += `no projects found`;
                }
                $(".freelancers-projects").html(detail);
            }
        })
    });
})


var languages = {
    "EN"            : "English (United States)",
    "AF"            : "Afrikaans",
    "AR"            : "المتابعة",
    "ARY"           : "المتابعةاvc لعربية",
    "AS"            : "অসমীয়া",
    "AZB"           : "گؤنئی آذربایجان",
    "AZ"            : "Azərbaycan dili",
    "BEL"           : "Беларуская мова",
    "BG_BE"         : "Български",
    "BN_BD"         : "এগিয়ে চল.",
    "BO"            : "མུ་མཐུད་དུ།",
    "BS_BA"         : "Bosanski",
    "CA"            : "Català",
    "CEB"           : "Cebuano",
    "CS_CZ"         : "Čeština",
    "CY"            : "Cymraeg",
    "DA_DK"         : "Dansk", 
    "DE_DE_FORMAL"  : "Deutsch (Sie)",
    "DE_DE"         : "Deutsch",
    "DE_CH"         : "Deutsch (Schweiz)",
    "DE_CH_FORMAL"  : "Deutsch (Schweiz, Du)",
    "de_AT"         : "Deutsch (Österreich)",
    "DSB"           : "Dolnoserbšćina",
    "DZO"           : "རྫོང་ཁ",
    "EL"            : "Ελληνικά",
    "EN_GB"         : "English (UK)",
    "EN_ZA"         : "English (South Africa)",
    "EN_AU"         : "English (Australia)",
    "EN_CA"         : "English (Canada)",
    "EN_NZ"         : "English (New Zealand)",
    "EO"            : "Esperanto",
    "ES_MX"         : "Español de México",
    "ES_PE"         : "Español de Perú",
    "ES_EC"         : "Español de Ecuador",
    "ES_ES"         : "Español",
    "ES_CO"         : "Español de Colombia",
    "ES_VE"         : "Español de Venezuela",
    "ES_AR"         : "Español de Argentina",
    "ES_CR"         : "Español de Costa Rica",
    "ES_UY"         : "Español de Uruguay",
    "ES_CL"         : "Español de Chile",
    "ES_PR"         : "Español de Puerto Rico",
    "ES_DO"         : "Español de República Dominicana",
    "ES_GT"         : "Español de Guatemala",
    "ET"            : "Eesti",
    "Eu"            : "Euskara",
    "FA_IR"         : "ادامه",
    "FA_AF"         : "ادامه(فارسی (اف",
    "FI"            : "Suomi",
    "FR_FR"         : "Français",
    "FR_BE"         : "Français de Belgique",
    "FR_CA"         : "Français du Canada",
    "FUR"           : "Friulian",
    "GD"            : "Gàidhlig",
    "GL_ES"         : "Galego",
    "GU"            : "ગુજરાતી",
    "HAZ"           : "ادامه",
    "HE_IL"         : "המשך",
    "HI_IN"         : "Hindi",
    "HR"            : "Hrvatski",
    "HSB"           : "Hornjoserbšćina",
    "HU_HU"         : "Magyar",
    "HY"            : "Հայերեն",
    "ID_ID"         : "Bahasa Indonesia",
    "IS_IS"         : "Íslenska",
    "IT_IT"         : "Italiano",
    "JA"            : "日本語",
    "JV_ID"         : "Basa Jawa",
    "KA_GE"         : "ქართული",
    "KAB"           : "Taqbaylit",
    "KK"            : "Қазақ тілі",
    "KM"            : "ភាសាខ្មែរ",
    "KN"            : "ಕನ್ನಡ",
    "KO_KR"         : "한국어",
    "CKB"           : "كوردی&lrm",
    "LO"            : "ພາສາລາວ",
    "LT_LT"         : "Lietuvių kalba",
    "LV"            : "Latviešu valoda",
    "MK_MK"         : "Македонски јазик",
    "ML_IN"         : "മലയാളം",
    "MN"            : "Монгол",
    "mr"            : "मराठी",
    "MS_MY"         : "Bahasa Melayu",
    "MY_MM"         : "ဗမာစာ",
    "NB_NO"         : "Norsk bokmål",
    "NE_NP"         : "नेपाली",
    "NL_NL_FORMAL"  : "Nederlands (Formeel)",
    "NL_BE"         : "Nederlands (België)",
    "NL_NL"         : "Nederlands",
    "NN_NO"         : "Norsk nynorsk",
    "OCI"           : "Occitan",
    "PA_IN"         : "Punjabi",
    "PL_PL"         : "Polski",
    "PS"            : "دوام",
    "PT_PT_AO90"    : "Português (AO90)",
    "PT_PT"         : "Português",
    "PT_AO"         : "Português de Angola",
    "PT_BR"         : "Português do Brasil",
    "RHG"           : "Ruáinga",
    "RO_RO"         : "Română",
    "RU_RU"         : "Русский",
    "SAH"           : "Сахалыы",
    "SND"           : "سنڌي",
    "SI_LK"         : "සිංහල",
    "SK_SK"         : "Slovenčina",
    "SKR"           : "جاری رک",
    "SI_SI"         : "Slovenščina",
    "SQ"            : "Shqip",
    "SR_RS"         : "Српски језик",
    "SV_SE"         : "Svenska",
    "SW"            : "Kiswahili",
    "SZL"           : "Ślōnskŏ gŏdka",
    "TA_IN"         : "தமிழ்",
    "TA_LK"         : "தமிழ்",
    "TE"            : "తెలుగు",
    "TH"            : "ไทย",
    "TL"            : "Tagalog",
    "TR_TR"         : "Türkçe",
    "TT_RU"         : "Татар теле",
    "TAH"           : "Reo Tahiti",
    "UG_CN"         : "داۋاملاشت",
    "UK"            : "Українська",
    "UR"            : "جاری",
    "UZ_UZ"         : "O‘zbekcha",
    "VI"            : "Tiếng Việt",
    "ZH_HK"         : "香港中文版",
    "ZH_TW"         : "繁體中文",
    "ZHh_CN"        : "简体中文"
}

var languagesArray = $.map(languages, function (value, key) { return { value: value, data: key }; });

$('#languages-freelancer-dashboard-native_element').autocomplete({
    lookup: languagesArray,
    lookupFilter: function(suggestion, originalQuery, queryLowerCase) {
        var re = new RegExp('\\b' + $.Autocomplete.utils.escapeRegExChars(queryLowerCase), 'gi');
        return re.test(suggestion.value);
    },
    onSelect: function(suggestion) {
        $('#selction-ajax').html('You selected: ' + suggestion.value + ', ' + suggestion.data);
        $.ajax({
            url: "/showprojectwithspecificlistingtypelanguages",
            type: "post",
            data: { l_type: suggestion.value },
            success: function(data) {
                var detail = '';
                if (data.projects.projects.length > 0) {
                    data.projects.projects.forEach((val, i) => {
                        detail += `<div class="project-box p-4" data-pid="${val.id}">
                            <div class="row">
                                <div class="col-sm-7" onclick="OpenProject(${val.id })">
                                    <div class="project-title">
                                        <h3>
                                            ${val.title}
                                        </h3>
                                    </div>
                                </div>
                                <div class="col-sm-2">
                                    <i class="far fa-heart saved-freelancer_${val.id }" onclick="SavedProject(${val.id })" style="font-size: 25px;"></i>
                                </div>
                                <div class="col-sm-3">
                                    <div class="bid-stats">
                                        <div class="total-bids">
                                            <h5>
                                                ${ val.bid_stats.bid_count } bids
                                            </h5>
                                        </div>
                                        <div class="avg-bids ml-4">
                                            <h5>
                                                ${ Math.floor(val.bid_stats.bid_avg) } (avg bid amount)
                                            </h5>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div class="project-description d-flex flex-column mt-2">
                                <div class="project-info mb-2" style="color: #3c3c3c;display: flex;">
                                    <h5>Budget: $
                                        ${ val.budget.minimum } -
                                            ${ val.budget.maximum } USD
                                    </h5>
                                </div>
                                <p>
                                    ${ val.preview_description }
                                </p>
                            </div>
                        </div>`;
                    })
                } else {
                    detail += `no projects found`;
                }
                $(".freelancers-projects").html(detail);
            }
        })
    },
    onHint: function (hint) {
        $('#autocomplete-ajax-x').val(hint);
    },
    onInvalidateSelection: function() {
        $('#selction-ajax').html('You selected: none');
    }
});



