const registerForm = document.getElementById("register-form")
const loginForm = document.getElementById("login-form")

// == BASIC SECURITY INPUT DATA == // 
const hashPassword = async (str) => { 
    const msgUint8 = new TextEncoder().encode(str)
    const hashBuffer = await crypto.subtle.digest('SHA-256', msgUint8)
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
    return hashHex
}

const validateInput = (username, email, password) => {
    let isEmpty = false 
    isEmpty = username === "" || email === "" || password === "" ? true : false 
    return isEmpty
}

const validateEmail = (email) => {
    let isValidEmail = true
    const symEmail = "@"

    const validDomain = ["mail.com", "gmail.com"]
    const inputDomainEmail = email.split("@")[1]
    const checkDomain = validDomain.includes(inputDomainEmail)
    isValidEmail = email.includes(symEmail) && checkDomain ? true : false

    return isValidEmail
}

const validatePass = (password) => {
    const hasUppercase = /[A-Z]/.test(password) 
    const hasNumber = /[0-9]/.test(password)

    if (password.length < 8 || !hasUppercase || !hasNumber) return false

    return true
}

registerForm.addEventListener("submit", async function(event) {
    event.preventDefault()

    let data = JSON.parse(localStorage.getItem('user')) || []

    const username = document.getElementById("username").value
    const email = document.getElementById("email").value
    const password = document.getElementById("password").value

    // 1. Sanitize + Require user to input all data 
    const cleanUsername = username.trim()
    const cleanEmail = email.trim().toLowerCase()
    const checkInput = validateInput(username, email, password)

    if (checkInput) {
        alert("Please fill the form above!")
        return
    }

    // 2. Check email & password quality
    const checkEmail = validateEmail(cleanEmail)
    const checkPass = validatePass(password)

    if (!checkEmail) {
        alert("Invalid email input!")
        return
    }
    if (!checkPass) {
        alert("Weak password, please fill the proper password!")
        return
    }

    // 3. Hashing password(if qualified)
    const hashedPass = await hashPassword(password)

    // 4. Check duplicate email 
    const isExist = data.some(user => user.email === cleanEmail)
    if (isExist) {
        alert("Email already registered!")
        return
    }

    // 5. Assign the data to localstorage
    const newUser = {
        username: cleanUsername,
        email: cleanEmail,
        password: hashedPass
    }
    data.push(newUser)

    localStorage.setItem("user", JSON.stringify(data))

    alert("Successfully create new user!")
    alert(`Welcome, ${cleanUsername}!`)

    window.location.href = "login.html"
})

loginForm.addEventListener("submit", async function(event) {
    event.preventDefault()
    const email = document.getElementById("email").value
    const plainPassword = document.getElementById("password").value

    const userData = JSON.parse(localStorage.getItem('user')) || []

    // 1. Check input email 
    const verifyEmail = userData.some(user => user.email === email)
    if (!verifyEmail) {
        alert("User didn't found!")
        return
    }

    // 2. Check password with hashed pass, storing at db 
    const selectedUser = userData.filter(user => user.email === email)
    const hashedPassFromDb = selectedUser[0].password
    const hashedInputPass = await hashPassword(plainPassword)

    if (hashedPassFromDb !== hashedInputPass) {
        alert("Wrong Password!")
    } else {
        alert("Login Success!")
    }

})