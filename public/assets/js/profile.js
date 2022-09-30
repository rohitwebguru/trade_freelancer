// profileform.addEventListener("submit", () => {
//     event.preventDefault()

//     const profile  = {
//         username: username.value,
//         email: email.value,
//         password: password.value,
//         confirm_password: confirm_password.value,
//         hidden_image: hidden_image.value,
//         image: image.value
//     }
//     fetch("/api/profile", {
//         method: "POST",
//         body: JSON.stringify(profile),
//         headers: {
//             "Content-type": "application/json"
//         }
//     }).then(res => res.json())
//         .then(data => {
//             if(data.status == 'error'){
//                 success.style.display = 'none'
//                 error.style.display = 'block'
//                 error.innerText = data.error
//             }else{
//                 error.style.display = 'none'
//                 success.style.display = 'block'
//                 success.innerText = data.success
//             }
//         })
// })