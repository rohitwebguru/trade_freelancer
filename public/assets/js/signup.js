$(document).ready(function() {
    $("#username").on("keyup", function() {
        var username = $(this).val();
        if (username != "" && username.length > 4) {
            $("#username-error").html("");
            $.ajax({
                url: "/register/checkusername",
                type: "post",
                data: { info: username },
                success: function(data) {
                    if (data.error == "username available") {
                        $("#username-error").css({ "color": "green" });
                    } else {
                        $("#username-error").css({ "color": "red" });
                    }
                    $("#username-error").html("* " + data.error + "*");
                }
            })
        } else {
            $("#username-error").css({ "color": "red" });
            $("#username-error").html("please enter username with atleast 5 characters");
        }
    });

})

form.addEventListener("submit", () => {
    var radios = document.getElementsByName('role');
    var role_id = Array.from(radios).find(radio => radio.checked);
    const register = {
        username: username.value,
        email: email.value,
        password: password.value,
        cpassword: cpassword.value,
        role_id: role_id.value,
        token: null
    }

    if (token != undefined || token != null) {
        register.token = token.value;
    }

    fetch("/api/register", {
            method: "POST",
            body: JSON.stringify(register),
            headers: {
                "Content-type": "application/json"
            }
        }).then(res => res.json())
        .then(data => {
            if (data.status == 'error') {
                success.style.display = 'none'
                error.style.display = 'block'
                error.innerText = data.error
            } else {
                error.style.display = 'none'
                success.style.display = 'block'
                success.innerText = data.success
                setTimeout(function() {
                    window.location.href = data.redirect
                }, 2000);
            }
        })
})

// form.addEventListener("submit", function() {
//     const info = {
//         role: $('input[name="role"]:checked').val(),
//         username: username.value,
//         email: email.value,
//         password: password.value,
//         cpassword: cpassword.value
//     }

//     console.log(info);

//     if (info.password != info.cpassword) {
//         $("#error").html("Your confirm password doesn't match the password ");
//         $("#error").css({ "display": "block" });
//     } else {
//         fetch("/api/register", {
//                 method: "POST",
//                 data: JSON.stringify(info),
//                 headers: {
//                     "Content-type": "application/json"
//                 }
//             }).then(res => res.json())
//             .then(data => {
//                 if (data.status == 'error') {} else {
//                     setTimeout(function() {
//                         window.location.href = data.redirect
//                     }, 2000);
//                 }
//             })
//     }
// })