const express = require('express');
const app = express();
const hostname = 'localhost';
const port = 3000;
var cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');
const multer = require('multer');
const mysql = require('mysql');
const path = require('path');

app.use(express.static(__dirname));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());

const con = mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "",
    database: "login_db"
})

const storage = multer.diskStorage({
    destination: (req, file, callback) => {
      callback(null, 'public/img/');
    },

    filename: (req, file, cb) => {
        cb(null, file.fieldname + '-' + Date.now() + path.extname(file.originalname));
    }
  });
const imageFilter = (req, file, cb) => {
    // Accept images only
    if (!file.originalname.match(/\.(jpg|JPG|jpeg|JPEG|png|PNG|gif|GIF)$/)) {
        req.fileValidationError = 'Only image files are allowed!';
        return cb(new Error('Only image files are allowed!'), false);
    }
    cb(null, true);
};

con.connect(err => {
    if (err) throw (err);
    else {
        console.log("Mysql connected");
    }
})
const queryDB = (sql) => {
    return new Promise((resolve, reject) => {
        con.query(sql, (err, result, fields) => {
            if (err) reject(err);
            else resolve(result)
        })
    })
}

app.post('/login',async (req,res) => {
    var username = req.body.username;
    var password = req.body.password;
    let sql = `SELECT * FROM users WHERE username = '${username}' AND password = '${password}'`
    let result = await queryDB(sql);
    if(result.length == 0){
        console.log("False")
        return res.redirect('index.html?error=4')
    }
    else if(username == result[0].username && password == result[0].password){
        res.cookie('username', username)
        res.cookie('img', result[0].img)
        res.cookie('user_id', result[0].id)
        console.log("Now, You are Log in")
        return res.redirect('profile.html');
    }
    console.log(result)
})

app.post("/register", async (req, res) => {
    console.log(req.body);
    let sql = "CREATE TABLE IF NOT EXISTS users (id int(10) NOT NULL PRIMARY KEY AUTO_INCREMENT,firstname varchar(50), lastname varchar(50),gender varchar(50),birthday DATE,email  varchar(50),username varchar(50),phone int(10),password varchar(255),img varchar(300))";
    let result = await queryDB(sql);
    let sqlemail = `SELECT email FROM users WHERE email = '${req.body.email}'`;
    let resultdata = await queryDB(sqlemail);
    let sqlusername = `SELECT username FROM users WHERE username = '${req.body.username}'`;
    let resultdata2 = await queryDB(sqlusername);
    const { password, re_password } = req.body;
    if (resultdata != "") {
        console.log("This email is already registered!");
        return res.redirect("register.html?error=1");
    }
    else if (resultdata2 != "") {
        console.log("This username is already registered!");
        return res.redirect("register.html?error=2")
    }
    else if (password != re_password) {
        console.log("Password not match!");
        return res.redirect("register.html?error=3");
    }
    else {
        sql = `INSERT INTO users (firstname,lastname,gender,birthday,username,email,phone,password,img) VALUES ("${req.body.firstname}","${req.body.lastname}","${req.body.gender}","${req.body.birthday}","${req.body.username}","${req.body.email}","${req.body.tel}","${req.body.password}", "avatar.png")`;
        result = await queryDB(sql);
        console.log("Register Success!");
        return res.redirect("index.html");
    }

})
//ทำให้สมบูรณ์
app.post('/profilepic', (req,res) => {
    let upload = multer({ storage: storage, fileFilter: imageFilter }).single('avatar');
    let user = req.cookies.username

    upload(req, res, (err) => {
        if (req.fileValidationError) {
            return res.send(req.fileValidationError);
        }
        else if (!req.file) {
            return res.send('Please select an image to upload');
        }
        else if (err instanceof multer.MulterError) {
            return res.send(err);
        }
        else if (err) {
            return res.send(err);
        }
        let filename = req.file.filename
        updateImg(user, filename).then(()=>{
            console.log(filename)
            res.cookie('img', filename)
            console.log('Change Complete')
            return res.redirect('profile.html')
        })
    })
})

app.get('/logout', (req,res) => {
    res.clearCookie('username')
    res.clearCookie('img')
    res.clearCookie('user_id')
    console.log("Log out")
    return res.redirect('index.html');
})

const updateImg = async (username, filen) => {
    let sql = `UPDATE users SET img = '${filen}' WHERE username = '${username}'`;
    let result = await queryDB(sql);
}

app.get("/readallprofile", async(req, res) => {
    console.log(req.header.referer);
    let sql = `SELECT DATE_FORMAT(birthday,"%Y-%m-%d")AS birthday,username,email,Phone FROM users WHERE username = '${req.cookies.username}'`;
    let result = await queryDB(sql);
    res.end(JSON.stringify(result));
})

let postdata = null;

app.post("/submitpost", async(req, res) => {
    //console.log(req.body);
    writePost(req);
    postdata = await readPost();
    console.log("Send data to client!")
    res.end(postdata);
})

app.get("/readallpost", async(req, res) => {
    postdata = await readPost();
    console.log("Send data to client!")
    res.end(postdata);
})

const writePost = async(data) => {
    return new Promise((resolve, rejects) => {
        //console.log(data);
        let sql = "CREATE TABLE IF NOT EXISTS postInfo (id INT AUTO_INCREMENT PRIMARY KEY, post_date DATETIME DEFAULT CURRENT_TIMESTAMP, username VARCHAR(255), email VARCHAR(255), post VARCHAR(255),like_count VARCHAR(100),like_user LONGTEXT)";
        let result = queryDB(sql);
        sql = `INSERT INTO postInfo (username, email, post, like_count,like_user) VALUES ("${data.cookies.username}","${data.cookies.email}", "${data.body.post}", "${data.body.likecount}","0")`;
        result = queryDB(sql);
        console.log("Post Success!");
        resolve("Post Success!");
    })
}

const readPost = async() => {
    return new Promise((resolve, reject) => {
        con.query(`SELECT id,DATE_FORMAT(post_date,"%Y-%m-%d %H:%i")AS post_date,username,email,post,like_count,like_user FROM postInfo`, async function(err, result, fields) {
            if (err) {
                //console.log(err);
                resolve(JSON.stringify("No post found", null, "\t"));
                reject(err);
            } else {
                console.log("Read Success!");
                resolve(JSON.stringify(result, null, "\t"));
            }
        })
    })
}
app.post("/getposterimg", async(req, res) => {
    //console.log(req.body.posterEmail);
    let sqldata = `SELECT img FROM users WHERE username = '${req.body.username}'`;
    let resultdata = await queryDB(sqldata);
    //console.log(resultdata[0].profilepic);
    res.end(JSON.stringify(resultdata[0].img));
})

app.post("/likepost", async(req, res) => {
    //console.log(req.body.postid);
    postres = await updateLikePost(req);
    res.end(postres);
})

const updateLikePost = async(postid) => {
    let likedata = `SELECT like_count,like_user FROM postInfo WHERE id = '${postid.body.postid}'`;
    let resultlikedata = await queryDB(likedata);
    //console.log(resultlikedata[0]);
    var x = parseInt(resultlikedata[0].like_count);
    x++;
    var y = resultlikedata[0].like_user;
    y += ", " + postid.cookies.user_id;
    //console.log(x);
    let sql = `UPDATE postInfo SET like_count = '${x}' WHERE id = '${postid.body.postid}'`;
    let result = await queryDB(sql);
    let sqlid = `UPDATE postInfo SET like_user = '${y}' WHERE id = '${postid.body.postid}'`;
    let resultid = await queryDB(sqlid);
    return JSON.stringify(x);
}

app.post("/Reset", async (req, res) => {
    var email = req.body.email;
    var Currentpassword = req.body.Currentpassword;
    var Newpassword = req.body.Newpassword;
    if (email && Currentpassword) {
        con.query('SELECT * FROM users WHERE email = ? AND password = ?', [email, Currentpassword], async function (error, results, fields) {
            if (results.length > 0) {
                let sql = `UPDATE users SET password = '${Newpassword}' WHERE email = '${email}'`;
                let result = await queryDB(sql);
                return res.redirect("index.html?error=6");
            } else {
                console.log("Incorrect Email or Password!");
                return res.redirect("Reset.html?error=5");
            }
        });
    }
    else {
        console.log(err);
    }
})

app.listen(port, hostname, () => {
    console.log(`Server running at	http://${hostname}:${port}/`)
});

