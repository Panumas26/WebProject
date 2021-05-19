function checkCookie(){
	var username = "";
	if(getCookie("username")==false){
		window.location = "login.html";
	}
}

checkCookie();
window.onload = pageLoad;

function getCookie(name){
	var value = "";
	try{
		value = document.cookie.split("; ").find(row => row.startsWith(name)).split('=')[1]
		return value
	}catch(err){
		return false
	} 
}

function pageLoad(){
    getprofileInfo();
	document.getElementById('displayPic').onclick = fileUpload;
	document.getElementById('fileField').onchange = fileSubmit;
	
	var username = getCookie('username');


	document.getElementById("username").innerHTML = username;

	console.log(getCookie('img'));
	showImg('public/img/' + getCookie('img'));
    showImg2('public/img/' + getCookie('img'));
}

function getData(){
	var msg = document.getElementById("textmsg").value;
	document.getElementById("textmsg").value = "";
	writePost(msg);
}

function fileUpload(){
	document.getElementById('fileField').click();
}

function fileSubmit(){
	document.getElementById('formId').submit();
}

// แสดงรูปในพื้นที่ที่กำหนด
function showImg(filename){
	if (filename !==""){
		var showpic = document.getElementById('displayPic');
		showpic.innerHTML = "";
		var temp = document.createElement("img");
		temp.src = filename;
		showpic.appendChild(temp);
	}
}

function showImg2(filename){
	if (filename !==""){
		var showpic = document.getElementById('profileimgnav');
		showpic.innerHTML = "";
		var temp = document.createElement("img");
		temp.src = filename;
		showpic.appendChild(temp);
	}
}

const getprofileInfo = (async() => {
    await fetch("/readallprofile").then((response) => {
        response.json().then((data) => {
            console.log(data);
            document.getElementById("birthdate").innerHTML = data[0].birthday;
            document.getElementById("email").innerHTML = data[0].email;
            document.getElementById("tel").innerHTML = data[0].Phone;

        }).catch((err) => {
            console.log(err);
        })
    })
})