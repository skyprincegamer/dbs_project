
// importing mysql module
const mysql = require('mysql2');

// configurations for creating mysql connection
const connection = mysql.createConnection({
    host: 'localhost',     // host for connection
    port: 3306,            // default port for mysql is 3306
    database: 'paperpedia',      // database from which we want to connect our node application
    user: 'root',          // username of the mysql connection
    password: ''       // password of the mysql connection
});

// executing connection
connection.connect(function(err) {
    if (err) {
        console.log(err)
        console.log("error occurred while connecting");
    } else {
        console.log("connection created with mysql successfully");
    }
});

module.exports = connection;