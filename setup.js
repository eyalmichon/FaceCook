const mysql = require('mysql');
const secrets = require('./secrets.json');
const bcrypt = require("bcrypt")

const connection = mysql.createConnection({
    host: 'localhost',
    user: secrets.DB_USERNAME,
    password: secrets.DB_PASSWORD,
});



async function createSQLDB() {
    await createSchema();
    connection.changeUser({database: 'recipesdb'}, function(err) {
        if (err) throw err;
    });
    await createTable();
    await batchInsert('users', ['user_id', 'username', 'password'], users, true);
    await batchInsert('recipes', ['recipe_id', 'name', 'contributor_id', 'date_submitted', 'minutes', 'kcal', 'total_fat', 'protein', 'sodium', 'saturated_fat', 'sugars', 'carbohydrates', 'category'], recipes, true);
    await batchInsert('reviews', ['recipe_id', 'user_id', 'date_submitted', 'date_modified', 'rating', 'review'], reviews, true);
    await batchInsert('instructions', ['recipe_id', 'step', 'instruction'], instructions, true);
    await batchInsert('recipe_info', ['recipe_id', 'description', 'image_url', 'recipe_yield'], recipeInfo, true);
    await batchInsert('ingredients', ['food_name', 'kcal', 'total_fat', 'protein', 'sodium', 'saturated_fat', 'sugars', 'carbohydrates'], ingredients, true);
    await batchInsert('recipestoingredients', ['recipe_id', 'food_name', 'quantity', 'unit'], recipesToIngredients, true);
    connection.end()
}

// create a schema named 'recipesdb' if it doesn't exist
async function createSchema() {
    await connection.query('CREATE SCHEMA IF NOT EXISTS recipesdb', (err, result) => {
        if (err) throw err;
        console.log(result);
    });
}
//create the tables of the schema
async function createTable() {
    var sqlUsers = "CREATE TABLE IF NOT EXISTS users (`user_id` int NOT NULL AUTO_INCREMENT,`username` varchar(100) NOT NULL,`password` varchar(150) NOT NULL,PRIMARY KEY (`user_id`,`username`))"
    await connection.query(sqlUsers, (err, result) => { if (err) throw err; console.log(result); });
    // alter auto increment
    var alter = 'ALTER TABLE users AUTO_INCREMENT=2002901500';
    await connection.query(alter, (err, result) => { if (err) throw err; console.log(result); });

    var sqlRecipes = "CREATE TABLE IF NOT EXISTS recipes ( `recipe_id` int NOT NULL AUTO_INCREMENT, `name` varchar(100) DEFAULT NULL,`contributor_id` int DEFAULT NULL,`date_submitted` date DEFAULT NULL, `minutes` int DEFAULT NULL,`kcal` double DEFAULT NULL, `total_fat` double DEFAULT NULL,`protein` double DEFAULT NULL,`saturated_fat` double DEFAULT NULL,`sodium` double DEFAULT NULL,`sugars` double DEFAULT NULL,`carbohydrates` double DEFAULT NULL,`category` varchar(50) DEFAULT NULL,PRIMARY KEY (`recipe_id`),KEY `contributer_id_idx` (`contributor_id`),CONSTRAINT `contributer_id` FOREIGN KEY (`contributor_id`) REFERENCES `users` (`user_id`))"
    await connection.query(sqlRecipes, (err, result) => { if (err) throw err; console.log(result); });
    // alter auto increment
    alter = 'ALTER TABLE recipes AUTO_INCREMENT=526000';
    await connection.query(alter, (err, result) => { if (err) throw err; console.log(result); });

    var sqlIngredients = "CREATE TABLE IF NOT EXISTS ingredients (food_name VARCHAR(500) PRIMARY KEY NOT NULL,kcal float DEFAULT NULL, total_fat float DEFAULT NULL, protein float DEFAULT NULL,saturated_fat float DEFAULT NULL, sodium float DEFAULT NULL,sugars float DEFAULT NULL,carbohydrates float DEFAULT NULL)"
    await connection.query(sqlIngredients, (err, result) => { if (err) throw err; console.log(result); });

    var sqlInstructions = "CREATE TABLE IF NOT EXISTS instructions (recipe_id int NOT NULL, step int NOT NULL,instruction varchar(5000) DEFAULT NULL, PRIMARY KEY (recipe_id,step),CONSTRAINT inst_recipe_id FOREIGN KEY (recipe_id) REFERENCES recipes (recipe_id) )"
    await connection.query(sqlInstructions, (err, result) => { if (err) throw err; console.log(result); });

    var sqlRecipeInfo = "CREATE TABLE IF NOT EXISTS recipe_info (`recipe_id` int NOT NULL,`description` text,`image_url` mediumtext,`recipe_yield` varchar(5000) DEFAULT NULL,PRIMARY KEY (`recipe_id`), CONSTRAINT `info_recipe_id` FOREIGN KEY (`recipe_id`) REFERENCES `recipes` (`recipe_id`))"
    await connection.query(sqlRecipeInfo, (err, result) => { if (err) throw err; console.log(result); });

    var sqlRecipestoIngredients = "CREATE TABLE IF NOT EXISTS recipestoingredients ( `recipe_id` int NOT NULL, `food_name` varchar(500) NOT NULL, `quantity` float DEFAULT NULL,`unit` varchar(20) NOT NULL, PRIMARY KEY (`recipe_id`,`food_name`,`unit`), KEY `fk_food_name` (`food_name`), CONSTRAINT `fk_food_name` FOREIGN KEY (`food_name`) REFERENCES `ingredients` (`food_name`), CONSTRAINT `mix_recipe_id` FOREIGN KEY (`recipe_id`) REFERENCES `recipes` (`recipe_id`))"
    await connection.query(sqlRecipestoIngredients, (err, result) => { if (err) throw err; console.log(result); });

    var sqlReviews = "CREATE TABLE IF NOT EXISTS reviews ( `recipe_id` int NOT NULL,`user_id` int NOT NULL, `date_submitted` datetime DEFAULT NULL,`date_modified` datetime DEFAULT NULL,`rating` tinyint DEFAULT NULL, `review` text, PRIMARY KEY (`recipe_id`,`user_id`), KEY `rev_user_id_idx` (`user_id`) , CONSTRAINT `rev_recipe_id` FOREIGN KEY (`recipe_id`) REFERENCES `recipes` (`recipe_id`), CONSTRAINT `rev_user_id` FOREIGN KEY (`user_id`) REFERENCES `users` (`user_id`))"
    await connection.query(sqlReviews, (err, result) => { if (err) throw err; console.log(result); });
}



// add data to mysql
const users = require('./raw_data/Users.json');
const recipes = require('./raw_data/Recipes.json');
const reviews = require('./raw_data/Reviews.json');
const instructions = require('./raw_data/Instructions.json');
const recipeInfo = require('./raw_data/RecipeInfo.json');
const ingredients = require('./raw_data/Ingredients.json');
const recipesToIngredients = require('./raw_data/RecipesToIngredients.json');


// function check
// recipesToIngredients.forEach((rti) => {
//     let exists = false;
//     recipes.forEach((recipe) => {
//         if (recipe.recipe_id === rti.recipe_id)
//             exists = true;
//     });
//     if (!exists) {
//         console.log(rti.recipe_id);
//     }
// });

// update password value in users table for all users in the users json
function updatePassword() {
    users.forEach((user, i) => {
        connection.query(`UPDATE users SET password = '${user.password}' WHERE user_id = ${user.user_id}`, (err, result) => {
            if (err) throw err;

            console.log(`user ${i} updated`);
        });
    });
}

// update the image_url value in recipe_info table for all recipes in the recipeInfo json
function updateImageUrl() {
    recipeInfo.forEach((recipe, i) => {
        connection.query(`UPDATE recipe_info SET image_url = '${recipe.image_url}' WHERE recipe_id = ${recipe.recipe_id}`, (err, result) => {
            if (err) throw err;

            console.log(`recipe ${i} updated`);
        });
    });
}



// generate a random password with letters and numbers
function generateRandomPassword(length = 8) {
    const charset = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let retVal = '';
    for (let i = 0, n = charset.length; i < length; ++i) {
        retVal += charset.charAt(Math.floor(Math.random() * n));
    }
    return retVal;
}

async function hashPassword(password) {
    return await bcrypt.hash(password, 5);
}

// add a random password using bcrypt to each user in the users json and save it to a new json file
async function addRandomPassword() {
    const usersWithPassword = [];
    users.forEach((user, i) => {
        usersWithPassword.push(hashPassword(generateRandomPassword()).then((hash) => {
            console.log(`user ${i} password: ${hash}`);
            return {
                ...user,
                password: hash,
            }
        }))
    });
    Promise.all(usersWithPassword).then((usersWithPassword) => {
        saveJsonFile(usersWithPassword, 'UsersWithPassword');
    });
}

function combineQuantities(rtis) {

    let newRecipes = {};
    recipesToIngredients.forEach((rti, i) => {
        if (newRecipes[rti.recipe_id]) {
            if (newRecipes[rti.recipe_id][rti.food_name]) {
                if (newRecipes[rti.recipe_id][rti.food_name][rti.unit])
                    newRecipes[rti.recipe_id][rti.food_name][rti.unit].quantity += rti.quantity;
                else
                    newRecipes[rti.recipe_id][rti.food_name][rti.unit] = rti;
            }
            else
                newRecipes[rti.recipe_id][rti.food_name] = { [rti.unit]: rti };
        }
        else
            newRecipes[rti.recipe_id] = { [rti.food_name]: { [rti.unit]: rti } };
    });
}


// let newRecipesArr = [];
// for (let recipe in newRecipes) {
//     for (let food in newRecipes[recipe]) {
//         for (let unit in newRecipes[recipe][food]) {
//             newRecipesArr.push(newRecipes[recipe][food][unit]);
//         }
//     }
// }
// saveJsonFile(newRecipesArr, 'newRecipes');


function createUserDatabase() {
    const query = 'CREATE DATABASE IF NOT EXISTS userdb';
    connection.query(query, (error, results) => {
        if (error) throw error;
        // console.log(results);
    });
}




function deleteAllRows(table) {
    connection.query(`DELETE FROM ${table}`, (err, result) => {
        if (err) throw err;
        console.log(result);
    });
}

async function batchInsert(table, columns, json, skipDups = false) {
    let query = `INSERT INTO ${table} (${columns}) VALUES `;
    let allValues = [];
    json.forEach((obj) => {
        let values = [];
        columns.forEach((column) => {
            values.push(obj[column]);
        });
        allValues.push(`(\'${values.join('\', \'')}\')`);
    });
    query += allValues.join(', ');


    await connection.query(query, (err, result) => {
        if (err != null && err.code === 'ER_DUP_ENTRY' && skipDups) return;
        if (err) throw err;
        console.log(result);
    });
    console.log('done');
}

// add step number to instructions
function addStepNumber(json) {
    let index = 1;
    let lastRecipeId = 0;
    let currentRecipeId = 0;
    json.forEach((obj) => {
        currentRecipeId = obj.recipeId;
        if (currentRecipeId !== lastRecipeId) {
            lastRecipeId = currentRecipeId;
            obj.step = 1;
            index = 1;
        } else {
            obj.step = index;
        }
        index++;
    });
}

function replaceAllSingleQuotes(json, key) {
    json.forEach((obj) => {
        if (typeof obj[key] === 'string' && obj[key].includes('\''))
            obj[key] = obj[key].replace(/\'/g, '\'\'');
    });
}

// save to json file
function saveJsonFile(json, name) {
    const fs = require('fs');
    fs.writeFileSync(`${name}.json`, JSON.stringify(json), (err) => {
        if (err) throw err;

        console.log('The file has been saved!');
    });
}

function makeDistinctJson(json) {
    function getFractionFromStr(string) {

        // helper function to get fraction from string
        function getFraction(fraction) {
            let split = fraction.split('/');
            return parseFloat(split[0]) / parseFloat(split[1]);
        }

        let split = string.split(' ');
        if (split.length === 1)
            if (string.includes('/'))
                return getFraction(string)
            else
                return parseInt(string);

        let fraction = getFraction(split[1]);
        return parseInt(split[0]) + fraction;
    }

    let distinctJson = {};
    json.forEach((obj) => {
        if (distinctJson[obj.food_name]) return;

        let quantity = getFractionFromStr(obj.quantity);
        let normalizedQuantity = 1 / quantity;
        let nutrPerIngredient = JSON.parse(obj.nutr_per_ingredient.includes('\'') ? obj.nutr_per_ingredient.replace(/\'/g, '\"') : obj.nutr_per_ingredient);
        for (let key in nutrPerIngredient) {
            nutrPerIngredient[key] *= normalizedQuantity;
        }
        nutrPerIngredient = JSON.stringify(nutrPerIngredient);

        distinctJson[obj.food_name] = {
            food_name: obj.food_name,
            quantity: 1,
            unit: obj.unit,
            nutr_per_ingredient: nutrPerIngredient
        };
    });
    return distinctJson;

}
// update users username in users table for all users
function updateUsernames() {
    users.forEach((user) => {
        let query = `UPDATE users SET username = '${user.username}' WHERE user_id = ${user.user_id}`;
        connection.query(query
            , (err, result) => {
                if (err) throw err;
                console.log(result);
            });
    });

}

createSQLDB();


