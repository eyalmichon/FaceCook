const mysql = require('mysql');
const secrets = require('./secrets.json');
const express = require('express');

const app = express();

app.get('/', (req, res) => {
  res.sendFile('public/index.html' , { root : __dirname});
});

app.listen("3000", () => {
  console.log("Server is running on port 3000");
});




// sql queries should ne in a separate file

const connection = mysql.createConnection({
    host: 'localhost',
    user: secrets.DB_USERNAME,
    password: secrets.DB_PASSWORD,
    database: 'recipesdb'
});

connection.connect((err) => {
    if (err) throw err;
    console.log('Connected!');

});

async function handleSearchSubmit(event) {
    event.preventDefault();
  
    const searchTerm = document.getElementById('search-input').value;
    const query = `SELECT * FROM recipes WHERE name LIKE '%${searchTerm}%' OR ingredients LIKE '%${searchTerm}%'`;
  
    try {
      const result = await mysql.query(query);
      // process the search results here
    } catch (error) {
      console.error(error);
    }
  }




function getResults() {
    const sql = 'SELECT * FROM users';
    params = [];

    connection.query(sql, params, (error, results) => {
    if (error) throw error;
    console.log(results);
    });
}

// console.log(getResults())
// console.log('done');
// connection.end();
