const express = require('express');
const bodyParser = require('body-parser');
const db = require('./database.js');
const path = require('path');

const app = express();
app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, 'public')));


app.get('/', (req, res) => {
  res.sendFile('public/index.html', { root: __dirname });
});

app.get('/search', (req, res) => {
  const searchTerm = req.query.searchTerm;
  db.getRecipesByTerm(searchTerm, (results) => {
    res.send(results.map((result) => result.name));
  });
});


app.post('/login', (req, res) => {
  const username = req.body.name;
  const id = req.body.id;
  console.log(username, id);
});

app.listen("3000", () => {
  console.log("Server is running on port 3000");
});


