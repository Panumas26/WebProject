window.onload = pageLoad;
function pageLoad() {
    const queryString = window.location.search;
    const urlParams = new URLSearchParams(queryString);
    if (urlParams.get("error") == 1) {
            alert("This email is already used!");
    }
    else if(urlParams.get("error") == 2) {
            alert("This username is already used!");
    }
    else if(urlParams.get("error") == 3) {
        alert("Password not match!");      
    }
    else if(urlParams.get("error") == 4) {
        alert("Incorrect Username or Password!");      
    }
}