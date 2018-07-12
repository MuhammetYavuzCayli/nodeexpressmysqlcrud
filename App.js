
//indirilen ve kullanacağımız js de tanımlanan kütüphaneler
var express = require("express");
var mysql = require("mysql");
//

//Mysql bağlantısı için gerekli config ve pool kısmı
var pool = mysql.createPool({
    connectionLimit: 1000, //Ne kadar cevap vermesi gerektiğini belirttiğimiz Limit değeri bu ÖNEMLİ!!
    host: 'localhost', //lokalde çalışıyorsanız
    user: 'root', //varsayılan olarak root der sanıyorum mysqlciler
    password: 'password', //burası veritabanı şifren
    database: 'databasename' //bağlandığın veritabanı adı
});
var app = express();
//Uygulamanın çalışacağı localhost portu
//uygulama http://localhost:8080 de çalışacak
app.listen(8080);
//veritabanın da değişiklikler yapmak için gerekli izinler
app.use(function (req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Methods", "GET,HEAD,OPTIONS,POST,PUT");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, contentType,Content-Type, Accept, Authorization");
    next();
});
//query leri çalıştıracak fonksiyon
function queryExecuter(req, res, query) {
//query için mysqle bağlanma fonksiyonu getConnection()
    pool.getConnection(function (err, connection) {
        if (err) res.send({ "code": 100, "status": "Error in connection database", "Error": err.message });
        console.log('connected as id ' + connection.threadId);
        //queryi çalıştıracak ve response edecek kısım
        connection.query(query, function (err, recordset) {
            connection.release();
            res.send(recordset);
        });
        //Bağlantı sırasında oluşacak hatalar için hata dinleyici
        connection.on('error', function (err) {
            res.send({ "code": 100, "status": "Error in connection database" });
            return;
        });
    });
}
//Users tablosundan select sorgusu ve http://localhost:8080/user adresindeki görüntüsü 
app.get("/user", function (req, res) {
    var query = "select * from users";
    queryExecuter(req, res, query);
});
//Users tablosundan 3 tane satır döndürmesi için gerekli select sorgusu ve http://localhost:8080/top3 adresindeki görüntüsü 
app.get("/top3", function (req, res) {
    var query = "select * from users LIMIT 3";
    queryExecuter(req, res, query);
});
