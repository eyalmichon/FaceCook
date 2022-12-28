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


dbConnection.connect((err) => {
    if (err) throw err;
    console.log('Connected to recipesdb!');

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
    dbConnection.query(query, (error, results) => {
        if (error) throw error;
        console.log(results);
    });
}

async function login(user, password, callback) {

    const sqlSearch = "Select * from users where username = ?"
    const search_query = mysql.format(sqlSearch, [user])
    dbConnection.query(search_query, async (err, result) => {

        if (err) throw (err)
        if (result.length == 0) {
            console.log("--------> User does not exist")
            callback({ message: "User does not exist", status: 404 })
        }
        else {
            const hashedPassword = result[0].password;
            //get the hashedPassword from result
            if (await bcrypt.compare(password, hashedPassword)) {
                console.log("---------> Login Successful")
                callback({ message: `${user} is logged in!`, status: 200 })
            }
            else {
                console.log("---------> Password Incorrect")
                callback({ message: `Password incorrect for user: ${user}!`, status: 401 })
            }
        }
    })
}

// create a test async function to test the bcrypt.hash() function
const b = (async () => {

})


async function register(user, password, callback) {
    const hashedPassword = await bcrypt.hash(password, 10);
    const sqlSearch = "SELECT * FROM users WHERE username = ?"
    const search_query = mysql.format(sqlSearch, [user])
    const sqlInsert = "INSERT INTO users VALUES (0,?,?)"
    // ? will be replaced by values
    // ?? will be replaced by string
    const insert_query = mysql.format(sqlInsert, [user, hashedPassword])
    dbConnection.query(search_query, async (err, result) => {
        if (err) throw (err)
        console.log("------> Search Results")
        console.log(`Result: ${result}`)
        if (result.length != 0) {
            console.log("------> User already exists")
            callback({ message: `User: ${user} already exists!`, status: 409 })
        }
        else {
            dbConnection.query(insert_query, (err, result) => {
                if (err) throw (err)
                console.log("--------> Created new User")
                callback({ message: `Created new user with id: ${result.insertId}`, status: 201 })
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