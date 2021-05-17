const express = require('express');
const app = express();
const hostname = 'localhost';
const port = 3000;
var cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');
const mysql = require('mysql');

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
app.post('/login', function (req,res) {
    var username = req.body.username;
    var password = req.body.password;
    if (username && password) {
        con.query('SELECT * FROM users WHERE username = ? AND password = ?', [username, password], function (error, results, fields) {
            if (results.length > 0) {
                res.cookie('username', username);
                return res.redirect("home.html");
            } else {
                console.log("Incorrect Username or Password!");
                return res.redirect("index.html?error=4");
            }
        });
    } 
    else{
        console.log(err);
    }
});
app.post("/register", async (req, res) => {
    console.log(req.body);
    let sql = "CREATE TABLE IF NOT EXISTS users (id int(10) NOT NULL PRIMARY KEY AUTO_INCREMENT,firstname varchar(50), lastname varchar(50),gender varchar(50),birthday DATE,email  varchar(50),username varchar(50),phone int(10),password varchar(255))";
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
        sql = `INSERT INTO users (firstname,lastname,gender,birthday,username,email,phone,password) VALUES ("${req.body.firstname}","${req.body.lastname}","${req.body.gender}","${req.body.birthday}","${req.body.username}","${req.body.email}","${req.body.tel}","${req.body.password}")`;
        result = await queryDB(sql);
        console.log("Register Success!");
        return res.redirect("index.html");
    }

})
app.listen(port, hostname, () => {
    console.log(`Server running at	http://${hostname}:${port}/`)
});

