const mysql = require('mysql');
const secrets = require('./secrets.json');


const connection = mysql.createConnection({
    host: 'localhost',
    user: secrets.DB_USERNAME,
    password: secrets.DB_PASSWORD,
});

connection.connect((err) => {
    if (err) throw err;
    console.log('Connected!');

});

