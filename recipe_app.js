const express = require('express');
const bodyParser = require('body-parser');
const db = require('./database.js');
const path = require('path');

const app = express();
app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, 'public')));


app.get('/', (req, res) => {

  // send login.html with path
  res.sendFile('login.html', { root: path.join(__dirname, 'public') });


});

app.get('/search', (req, res) => {
  const searchTerm = req.query.searchTerm;
  db.getRecipesByTerm(searchTerm, (results) => {
    res.send(results.map((result) => result.name));
  });
});

// login
app.post('/login', (req, res) => {
  const user = req.body.name;
  const password = req.body.password;

  db.login(user, password, res);
});

//CREATE USER
app.post("/createUser", async (req, res) => {
  const user = req.body.name;
  const password = req.body.password;

  db.register(user, password, res);
});

app.listen("3000", () => {
  console.log("Server is running on port 3000");
});


