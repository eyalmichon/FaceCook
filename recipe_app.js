const express = require('express');
const cookieParser = require("cookie-parser");
const sessions = require('express-session');
const bodyParser = require('body-parser');
const db = require('./database.js');
const path = require('path');


// Set up the express app
const app = express();
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json({ limit: '100mb' }));
app.use(express.static(path.join(__dirname, 'public')));
//session middleware
app.use(sessions({
  secret: "thisismysecrctekey",
  saveUninitialized: true,
  cookie: { maxAge: 1000 * 60 * 60 * 24 }, // 24 hours
  resave: false
}));
app.use(cookieParser());


////////////// User Routes //////////////
app.get('/', (req, res) => {
  // console.log("req.session.user", req.session.user);
  if (req.session.user)
    res.sendFile('home.html', { root: path.join(__dirname, 'public') });
  else
    res.sendFile('login.html', { root: path.join(__dirname, 'public') });


});

app.get('/addRecipe', (req, res) => {
  if (req.session.user)
    res.sendFile('addRecipe.html', { root: path.join(__dirname, 'public') });
  else
    res.sendFile('login.html', { root: path.join(__dirname, 'public') });
});

app.get('/searchRecipes', (req, res) => {
  if (req.session.user)
    res.sendFile('searchRecipes.html', { root: path.join(__dirname, 'public') });
  else
    res.sendFile('login.html', { root: path.join(__dirname, 'public') });
});

app.get('/myRecipes', (req, res) => {
  if (req.session.user)
    res.sendFile('myRecipes.html', { root: path.join(__dirname, 'public') });
  else
    res.sendFile('login.html', { root: path.join(__dirname, 'public') });
});

////////////// API ROUTES //////////////
app.get('/search', (req, res) => {
  const type = req.query.type;
  const searchTerm = req.query.searchTerm;
  const toggle = req.query.isFilter;
  const filter = req.query.filter;

  switch (type) {
    case 'recipe':
      db.getRecipesByTerm(searchTerm, toggle, filter, (results) => {
        res.send(results.map((result) => result.name));
      });
      break;
    case 'ingredient':
      db.getIngredientsByTerm(searchTerm, (results) => {
        res.send(results.map((result) => result.food_name));
      });
      break;
    default:
      res.send([]);
  }
});

app.get('/getUserRecipes', (req, res) => {
  const user = req.session.user.username;
  db.getUserRecipes(user, (results) => {
    res.send(results);
  });
});

// FINISH THIS
app.post('/addRecipe', (req, res) => {
  const user = req.session.user.username;
  // console.log("user", user);
  if (!user)
    res.send({ status: 401, message: "You must be logged in to add a recipe." });

  // get the json object from the request body and parse it
  const recipe = req.body;
  
  db.addRecipe(user, recipe, (data) => {
    res.send(data);
  });
});


////////////// LOGIN, SIGN OUT AND REGISTER ROUTES //////////////
/**
 * Logs in the user.
 *
 * @route   POST /login
 * @param   {Object} req - Express request object
 * @param   {Object} res - Express response object
 * @returns {Object} - An object with a message and status code
 */
app.post('/login', (req, res) => {
  const user = req.body.name;
  const password = req.body.password;


  db.login(user, password, (data) => {
    if (data.status == 200) {
      req.session.user = {
        username: user,
        password: password
      };
    }
    res.send(data);
  });
});

/**
 * Logs out the user by destroying the session.
 *
 * @route   GET /logout
 * @param   {Object} req - Express request object
 * @param   {Object} res - Express response object
 * @returns {undefined} - Sends a redirect to the root route '/'
 */
app.get('/logout', (req, res) => {
  req.session.destroy();
  res.redirect('/');
});

/**
 * Creates a new user in the database and logs in the user.
 *
 * @route   POST /createUser
 * @param   {Object} req - Express request object
 * @param   {Object} res - Express response object
 * @returns {Object} - An object with a message and status code
 */
app.post("/createUser", async (req, res) => {
  const user = req.body.name;
  const password = req.body.password;



  db.register(user, password, (data) => {
    if (data.status == 201) {
      req.session.user = {
        username: user,
        password: password
      };
    }
    res.send(data);
  });
});

app.listen("3000", () => {
  console.log("Server is running on port 3000");
});


