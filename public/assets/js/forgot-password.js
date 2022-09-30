form.addEventListener("submit", () => {
    const forgotpassword  = {
        email: email.value
    }
    fetch("/api/forgotpassword", {
        method: "POST",
        body: JSON.stringify(forgotpassword),
        headers: {
            "Content-type": "application/json"
        }
    }).then(res => res.json())
        .then(data => {
            if(data.status == 'error'){
                success.style.display = 'none'
                error.style.display = 'block'
                error.innerText = data.error
            }else{
                error.style.display = 'none'
                success.style.display = 'block'
                success.innerText = data.success
                setTimeout(function () {
                    window.location.href = data.redirect
                }, 2000);
            }
        })
})