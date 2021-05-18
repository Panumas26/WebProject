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
        console.log("Now, You are Log in")
        return res.redirect('profile.html');
    }
    console.log(result)
})

// app.post('/login', function (req,res) {
//     var username = req.body.username;
//     var password = req.body.password;
//     if (username && password) {
//         con.query('SELECT * FROM users WHERE username = ? AND password = ?', [username, password], function (error, results, fields) {
//             let result = await queryDB(sql);
//             if (results.length > 0) {
//                 res.cookie('username', username);
//                 res.cookie('img', result[0].img)
//                 return res.redirect("profile.html");
//             } else {
//                 console.log("Incorrect Username or Password!");
//                 return res.redirect("index.html?error=4");
//             }
//         });
//     } 
//     else{
//         console.log(err);
//     }
// });
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

const updateImg = async (username, filen) => {
    let sql = `UPDATE users SET img = '${filen}' WHERE username = '${username}'`;
    let result = await queryDB(sql);
}

//ทำให้สมบูรณ์
app.get('/readPost', async (req,res) => {
    let sql = `SELECT username, post FROM postDB`;
    let result = await queryDB(sql);
    result = Object.assign({},result);
    res.json(result);
})

//ทำให้สมบูรณ์
app.post('/writePost',async (req,res) => {
    let getPost = req.body.post
    let sql = `INSERT INTO postDB (username, post) VALUES ("${req.cookies.username}", "${getPost}")`;
    let result = await queryDB(sql);
    sql = `SELECT username, post FROM postDB`;
    result = await queryDB(sql);
    result = Object.assign({},result);
    res.json(result);
})

app.listen(port, hostname, () => {
    console.log(`Server running at	http://${hostname}:${port}/`)
});

