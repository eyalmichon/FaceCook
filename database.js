const mysql = require('mysql');
const secrets = require('./secrets.json');
const bcrypt = require("bcrypt")

// create a connection to the database
const dbConnection = mysql.createConnection({
    host: 'localhost',
    user: secrets.DB_USERNAME,
    password: secrets.DB_PASSWORD,
    database: 'recipesdb'
});
// User & Password Database connection.
const upConnection = mysql.createConnection({
    host: 'localhost',
    user: secrets.DB_USERNAME,
    password: secrets.DB_PASSWORD,
    database: 'userdb'
});

dbConnection.connect((err) => {
    if (err) throw err;
    console.log('Connected to recipesdb!');

});
upConnection.connect((err) => {
    if (err) throw err;
    console.log('Connected to userdb!');

});


function getUsersWithRecipe(callback) {
    const query = 'SELECT nickname, cnt (SELECT users.nickname, count(recipe_id) as cnt \
    FROM recipes \
    INNER JOIN users ON users.user_id = recipes.contributor_id \
    GROUP BY nickname) \
    WHERE cnt > 3 \
    ORDER BY cnt DESC';

    dbConnection.query(query, (error, results) => {
        if (error) throw error;
        callback(results);
    });
}


function getRecipesResults(callback) {
    const query = 'SELECT * FROM recipes';

    dbConnection.query(query, (error, results) => {
        if (error) throw error;
        callback(results);
    });
}


/**
 * Get all recipes from the database that match the given search term or part of a search term.
 * @param {string} searchTerm The search term to match against the recipes.
 * @returns {Array} An array of recipes that match the search term.
*/
function getRecipesByTerm(searchTerm, callback) {
    const query = `SELECT * FROM recipes WHERE name LIKE '%${searchTerm}%'`;
    dbConnection.query(query, (error, results) => {
        if (error) throw error;
        callback(results);
    });

}
// Create a table with the following columns

//userId: INTEGER — Primary Key (PK), Not Null (NN), AutoIncrement (AI)
//user: VARCHAR(45) — Not Null (NN)
//password: VARCHAR (100) — Not Null (NN)
function createUserTable() {
    const query = 'CREATE TABLE IF NOT EXISTS users (userId INTEGER PRIMARY KEY AUTO_INCREMENT, user VARCHAR(45) NOT NULL, password VARCHAR(100) NOT NULL)';
    upConnection.query(query, (error, results) => {
        if (error) throw error;
        console.log(results);
    });
}

async function login(user, password, res) {

    const sqlSearch = "Select * from users where user = ?"
    const search_query = mysql.format(sqlSearch, [user])
    upConnection.query(search_query, async (err, result) => {

        if (err) throw (err)
        if (result.length == 0) {
            console.log("--------> User does not exist")
            res.sendStatus(404)
        }
        else {
            const hashedPassword = result[0].password
            //get the hashedPassword from result
            if (await bcrypt.compare(password, hashedPassword)) {
                console.log("---------> Login Successful")
                res.send(`${user} is logged in!`)
            }
            else {
                console.log("---------> Password Incorrect")
                res.send("Password incorrect!")
            }
        }
    })
}

// create a test async function to test the bcrypt.hash() function
const b = (async () => {
    login("eyal", "password", () => { })
    register("moshe", "123", () => { })
})


async function register(user, password, res) {
    const hashedPassword = await bcrypt.hash(password, 10);
    const sqlSearch = "SELECT * FROM users WHERE user = ?"
    const search_query = mysql.format(sqlSearch, [user])
    const sqlInsert = "INSERT INTO users VALUES (0,?,?)"
    // ? will be replaced by values
    // ?? will be replaced by string
    const insert_query = mysql.format(sqlInsert, [user, hashedPassword])
    upConnection.query(search_query, async (err, result) => {
        if (err) throw (err)
        console.log("------> Search Results")
        console.log(result.length)
        if (result.length != 0) {
            console.log("------> User already exists")
            res.sendStatus(409)
        }
        else {
            upConnection.query(insert_query, (err, result) => {
                if (err) throw (err)
                console.log("--------> Created new User")
                console.log(result.insertId)
                res.sendStatus(201)
            })
        }
    })
}

module.exports = {
    getRecipesResults,
    getRecipesByTerm,
    login,
    register
};