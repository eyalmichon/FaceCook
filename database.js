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

async function addRecipe(user, recipe, ingredients, callback) {
    const sqlSearch = "Select * from users where username = ?"
    const search_query = mysql.format(sqlSearch, [user])
    dbConnection.query(search_query, async (err, result) => {
        if (err) throw (err)
        if (result.length == 0) {
            console.log("--------> User does not exist")
            callback({ message: "User does not exist", status: 404 })
        }
        else {
            const sqlInsert = "INSERT INTO recipes (name, contributor_id) VALUES (?, ?)"
            const insert_query = mysql.format(sqlInsert, [recipe, result[0].user_id])
            dbConnection.query(insert_query, async (err, result) => {
                if (err) throw (err)
                console.log("---------> Recipe added")
                callback({ message: "Recipe added", status: 200 })
            })
        }
    })
}

function getUserRecipes(username, callback) {
    const query = `
    SELECT r.*, 
    JSON_OBJECT(
        'reviews', JSON_ARRAYAGG(
            JSON_OBJECT(
                'user_id', u.user_id, 
                'date_submitted', rv.date_submitted, 
                'date_modified', rv.date_modified, 
                'rating', rv.rating, 
                'review', rv.review
            )
        )
    ) AS reviews,
    ri.description, ri.food_standards, ri.image_url, ri.recipe_yield
    FROM recipesdb.recipes r
    JOIN recipesdb.users u ON r.contributor_id = u.user_id
    LEFT JOIN recipesdb.reviews rv ON r.recipe_id = rv.recipe_id
    LEFT JOIN recipesdb.recipe_info ri ON r.recipe_id = ri.recipe_id
    WHERE u.username = ?
    GROUP BY r.recipe_id
    `;
    const params = [username];

    dbConnection.query(query, params, (error, results) => {
        if (error) throw error;
        callback(results);
    });
}


/**
 * Get all recipes from the database that match the given search term or part of a search term.
 * @param {string} searchTerm The search term to match against the recipes.
 * @returns {Array} An array of recipes that match the search term.
*/
function getRecipesByTermWithFilter(filter, searchTerm, callback) {
    let query = `SELECT * FROM recipesdb.recipes WHERE name LIKE '%${searchTerm}%'`;
    if (filter.rating) {
        query += ` AND recipe_id IN (SELECT recipe_id 
                                     FROM (SELECT recipe_id, AVG(rating) as avg_rating FROM recipesdb.reviews GROUP BY recipe_id) as ratings 
                                     WHERE avg_rating >= ${filter.rating})`;
    }
    // if (filter.maxCalories) {
    //     query += ` AND kcal <= ${filter.maxCalories}`;
    // }
    // if (filter.maxInstructions) {
    //     query += ` AND id IN (SELECT recipe_id FROM instructions WHERE step <= ${filter.maxInstructions})`;
    // }
    // if (filter.ingredient !== "") {
    //     query += ` AND id IN (SELECT recipe_id FROM recipestoingredients WHERE ingredient LIKE '%${filter.ingredient}%')`;
    // }
    console.log(query);
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
    const query = `SELECT * FROM recipes WHERE name LIKE '${searchTerm}'`;
    dbConnection.query(query, (error, results) => {
        if (error) throw error;
        callback(results);
    });
}

/**
 * Get all ingredients from the database that match the given search term or part of a search term.
 * @param {string} searchTerm The search term to match against the ingredients.
 * @returns {Array} An array of ingredients that match the search term.
*/
function getIngredientsByTerm(searchTerm, callback) {
    const query = `SELECT * FROM ingredients WHERE food_name LIKE '%${searchTerm}%'`;
    dbConnection.query(query, (error, results) => {
        if (error) throw error;
        callback(results);
    });
}



/**
 * Attempts to log in a user with the given username and password.
 * @param {string} user - The username of the user.
 * @param {string} password - The password of the user.
 * @param {function} callback - The callback function to be executed after the login attempt.
 * @returns {Object} An object with a message and status property, depending on the result of the login attempt.
 */
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

/**
 * Registers a new user with the given username and password.
 * @param {string} user - The username of the new user.
 * @param {string} password - The password of the new user.
 * @param {function} callback - The callback function to be executed after the registration attempt.
 * @returns {Object} An object with a message and status property, depending on the result of the registration attempt.
 */
async function register(user, password, callback) {

    // hash the password
    const hashedPassword = await bcrypt.hash(password, 10);
    const sqlSearch = "SELECT * FROM users WHERE username = ?"
    const search_query = mysql.format(sqlSearch, [user])
    const sqlInsert = "INSERT INTO users (username, password) VALUES (?,?)"
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

/**
 * Helper function to get the maximum user id from the 'users' table in the database.
 *
 * @returns {Promise<number>} - A promise that resolves to the maximum user id.
 */
function getMaxId() {
    return new Promise((resolve, reject) => {
        const sqlId = "SELECT MAX(user_id) as max_id FROM users";
        dbConnection.query(sqlId, (err, result) => {
            if (err) {
                reject(err);
            } else {
                resolve(result[0].max_id);
            }
        });
    });
}


module.exports = {
    getRecipesResults,
    getRecipesByTerm,
    getRecipesByTermWithFilter,
    getIngredientsByTerm,
    login,
    register,
    getUserRecipes,
    addRecipe
};