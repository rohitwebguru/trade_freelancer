form.addEventListener("submit", () => {
    const login = {
        email: email.value,
        password: password.value,
        token: null
    }

    if (token != undefined || token != null) {
        login.token = token.value;
    }

    console.log(login)
    fetch("/api/login", {
            method: "POST",
            body: JSON.stringify(login),
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