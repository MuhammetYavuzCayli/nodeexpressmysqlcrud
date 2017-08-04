var express = require("express");
var mysql = require("mysql");
var pool = mysql.createPool({
    connectionLimit: 1000,
    host: 'localhost',
    user: 'root',
    password: 'admin',
    database: 'denemeDB'
});
var app = express();

app.listen(8080);

app.use(function (req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Methods", "GET,HEAD,OPTIONS,POST,PUT");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, contentType,Content-Type, Accept, Authorization");
    next();
});

function handle_database(req, res, query) {

    pool.getConnection(function (err, connection) {
        if (err) res.send({ "code": 100, "status": "Error in connection database", "Error": err.message });
        console.log('connected as id ' + connection.threadId);

        connection.query(query, function (err, recordset) {
            connection.release();
            res.send(recordset);
        });

        connection.on('error', function (err) {
            res.send({ "code": 100, "status": "Error in connection database" });
            return;
        });
    });
}

app.get("/user", function (req, res) {
    var query = "select * from users";
    handle_database(req, res, query);
});
app.get("/top3", function (req, res) {
    var query = "select * from users LIMIT 3";
    handle_database(req, res, query);
});
app.get("/post", function (req, res) {
    var query = "select * from post";
    handle_database(req, res, query);
});

app.get("/follower", function (req, res) {
    var query = "select * from follower where UID = 1";
    handle_database(req, res, query);
});
app.get("/complexquery", function (req, res) {
    var query = "select FullName,PhotoURL,PostImageURL,PostText,PostType,Timestamp,LikeCount,CommentCount,ShareCount from post as p INNER JOIN users as u ON p.UID = u.UID INNER JOIN follower as f ON p.UID = f.followerID WHERE f.UID = 1  ORDER BY Timestamp asc";
    handle_database(req, res, query);
});