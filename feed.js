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
    console.log(getCookie('img'));
    var postBut = document.getElementById('postbutton').onclick = submitpost;
	
	var username = getCookie('username');

	showImg('public/img/' + getCookie('img'));
    showImg2('public/img/' + getCookie('img'));
    readAllPost();
}

function getData(){
	var msg = document.getElementById("textmsg").value;
	document.getElementById("textmsg").value = "";
	writePost(msg);
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

const submitpost = (async() => {
    console.log("Click post Button");
    if (document.getElementById("postinput").value != "" && document.getElementById("username").value != "") {
        await fetch("/submitpost", {
            method: "POST",
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                username: document.getElementById("username").innerHTML,
                post: document.getElementById("postinput").value,
                likecount: "0",
            })
        }).then((response) => {
            //console.log(response);
            response.json().then((data) => {
                document.getElementById("postinput").value = ""
                postfeed(data);
            });
        }).catch((err) => {
            console.log("ERROR = " + err);
        });
    } else {
        alert("Write something to post!")
    }
})

const readAllPost = (async() => {
    await fetch("/readallpost").then((response) => {
        response.json().then((data) => {
            //console.log(data);
            if (data == "No post found") {
                posterror(0);
            } else {
                postfeed(data);
            }

        }).catch((err) => {
            posterror(err)
        })
    })
})

async function postfeed(data) {
    console.log(data);
    var postkeys = Object.keys(data);
    //console.log(postkeys.length);
    var feedcontainer = document.getElementById("feed-container");

    while (feedcontainer.firstChild) {
        feedcontainer.removeChild(feedcontainer.lastChild);
    }

    for (var i = postkeys.length - 1; i >= 0; i--) {
        var allpostbox = document.createElement("div");
        var gridallpost = document.createElement("div");
        var gridallpostbox = document.createElement("div");
        var poster = document.createElement("div");
   
        var posterbox = document.createElement("div");
        var posterimg = document.createElement("img");

        var postername = document.createElement("div");
        var username = document.createElement("span");

        var posttime = document.createElement("div");
        var postdate = document.createElement("small");

        var contentall = document.createElement("div");
        var contentbox = document.createElement("div");
        var content = document.createElement("p");

        var Reactbutton = document.createElement("div");
        var gridReactButton = document.createElement("div");
        var likeimg = document.createElement("img");
        var likecount = document.createElement("a");
        var likebut = document.createElement("button");

        var newline = document.createElement("br");

        allpostbox.className = "allpost-box";
        gridallpost.className = "grid-container-post";
        gridallpostbox.className = "grid-container-postbox";
        poster.id = "poster";
        posterbox.className = "poster-box";
        posterimg.className = "profileposterimg";
        gridReactButton.className = "gridReactButton";

        await getPosterImg(posterimg, data[postkeys[i]].username);
        console.log(data[postkeys[i]].username);

        allpostbox.appendChild(gridallpost);
        gridallpost.appendChild(gridallpostbox);
        gridallpostbox.appendChild(poster);
        poster.appendChild(posterbox);
        posterbox.appendChild(posterimg);

        username.innerHTML = data[postkeys[i]].username;
        postername.className = "post-by";
        poster.appendChild(postername);
        postername.appendChild(username);

        postdate.innerHTML = data[postkeys[i]].post_date;
        posttime.className = "post-time";
        poster.appendChild(posttime);
        posttime.appendChild(postdate);

        content.innerHTML = data[postkeys[i]].post;
        contentall.id = "content";
        contentbox.className = "content-box";
        gridallpostbox.appendChild(contentall);
        contentall.appendChild(contentbox);
        contentbox.appendChild(content);

        likeimg.src = "public/img/like.png";
        likebut.className = "likebutton";
        likecount.innerHTML = data[postkeys[i]].like_count;
        Reactbutton.className = "Reactbutton";

        var like_uid = data[i].like_user;
        var like_sid = like_uid.split(", ");

        for (var j = 0; j < like_sid.length; j++) {

            if (like_sid[j] == getCookie('user_id')) {
                likeimg.src = "public/img/liked.png";
                likebut.setAttribute("disabled", "true");
                likebut.setAttribute("onclick", "");
            } else {
                likebut.setAttribute("onclick", "likepost(this)");
            }
        }
        gridallpost.appendChild(Reactbutton);
        Reactbutton.appendChild(likebut);
        likebut.appendChild(gridReactButton);
        gridReactButton.appendChild(likeimg);
        gridReactButton.appendChild(likecount);

        allpostbox.id = data[postkeys[i]].id;

        feedcontainer.appendChild(allpostbox);
        feedcontainer.appendChild(newline);
    }
}

const getPosterImg = (async(obj, username) => {
    await fetch("/getposterimg", {
        method: "POST",
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            username: username,
        })
    }).then((response) => {
        response.json().then((data) => {
            obj.src = 'public/img/' + data;
            console.log(data);
        });
    }).catch((err) => {
        console.log("ERROR = " + err);
    });
})

function likepost(post_id) {
    console.log("Click like button");
    console.log(post_id.lastChild.innerHTML);
    post_id.setAttribute("disabled", "true");
    post_id.setAttribute("onclick", "");
    console.log("like_click! = " + post_id.parentNode.parentNode.parentNode.id);
    sendlikepost(post_id);
}

const sendlikepost = (async(post_id) => {
    await fetch("/likepost", {
        method: "POST",
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            postid: post_id.parentNode.parentNode.parentNode.id,
        })
    }).then((response) => {
        console.log(response);
        response.json().then((data) => {
            post_id.lastChild.firstChild.src = "public/img/liked.png";
            post_id.lastChild.lastChild.innerHTML = JSON.parse(data);
            console.log(data);
        });
    }).catch((err) => {
        console.log("ERROR = " + err);
    });
})

function posterror(errlist) {
    console.log(errlist);

    var feedcontainer = document.getElementById("feedcontainer");
    while (feedcontainer.firstChild) {
        feedcontainer.removeChild(feedcontainer.lastChild);
    }

    var post = document.createElement("div");
    var content = document.createElement("p");
    var username = document.createElement("h3");
    var endcontent = document.createElement("hr");

    if (errlist == 0) {
        content.innerHTML = "No post found ;(";
        username.innerHTML = "[System]";
    } else {
        content.innerHTML = errlist;
        username.innerHTML = "[System]";
    }

    post.appendChild(username);
    post.appendChild(content);
    post.appendChild(endcontent);
    feedcontainer.appendChild(post);
}
