const express = require('express');
const app = express();
const hostname = 'localhost';
const port = 3001;
const bodyParser = require('body-parser');
const mysql = require('mysql');

app.use(express.static(__dirname));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}));

const con = mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "",
    database: "datalog"
})

con.connect(err => {
    if(err) throw(err);
    else{
        console.log("MySQL connected");
    }
})

let tablename = "userInfo";

const queryDB = (sql) => {
    return new Promise((resolve,reject) => {
        con.query(sql, (err,result, fields) => {
            if (err) reject(err);
            else
                resolve(result)
        })
    })
}

app.post("/addData",async (req,res) => {
    // let sql = "CREATE TABLE IF NOT EXISTS userInfo (id INT AUTO_INCREMENT PRIMARY KEY, reg_date TIMESTAMP, user VARCHAR(255),password VARCHAR(100))";
    // let result = await queryDB(sql);
    // sql = `INSERT INTO userInfo (user, password) VALUES ("${req.body.user}", "${req.body.password}")`;
    // result = await queryDB(sql);
    console.log("New record created successfullyone");
    res.end("New record created successfully");
})

app.post("/updateData",async (req,res) => {
    // let sql = `UPDATE ${tablename} SET password = '${req.body.password}' WHERE user = '${req.body.user}'`;
    // let result = await queryDB(sql);
    console.log(result);
    res.end("Record updated successfully");
})

app.listen(port, hostname, () => {
    console.log(`Server running at   http://${hostname}:${port}/`);
});