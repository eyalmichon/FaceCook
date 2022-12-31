const mysql = require('mysql');
const secrets = require('./secrets.json');
const bcrypt = require("bcrypt")

const connection = mysql.createConnection({
    host: 'localhost',
    user: secrets.DB_USERNAME,
    password: secrets.DB_PASSWORD,
});



function createSQLDB() {
    createSchema();
    createTable();
    batchInsert('users', ['user_id', 'username', 'password'], users, false);
    batchInsert('recipes', ['recipe_id', 'name', 'contributor_id', 'date_submitted', 'minutes', 'kcal', 'total_fat', 'protein', 'sodium', 'saturated_fat', 'sugars', 'carbohydrates', 'category'], recipes, true);
    batchInsert('reviews', ['recipe_id', 'user_id', 'date_submitted', 'date_modified', 'rating', 'review'], reviews, true);
    batchInsert('instructions', ['recipe_id', 'step', 'instruction'], instructions, true);
    batchInsert('recipe_info', ['recipe_id', 'description', 'food_standards', 'image_url', 'recipe_yield'], recipeInfo, true);
    batchInsert('ingredients', ['food_name', 'kcal', 'total_fat', 'protein', 'sodium', 'saturated_fat', 'sugars', 'carbohydrates'], ingredients, true);
    batchInsert('recipestoingredients', ['recipe_id', 'food_name', 'quantity', 'unit'], recipesToIngredients, true);
}

// create a schema named 'recipesdb' if it doesn't exist
function createSchema() {
    connection.query('CREATE SCHEMA IF NOT EXISTS recipesdb', (err, result) => {
        if (err) throw err;
        console.log(result);
    });
}

function createTable() {
    var sqlUsers = "CREATE TABLE IF NOT EXISTS recipesdb.users (`user_id` int NOT NULL AUTO_INCREMENT,`username` varchar(100) NOT NULL,`password` varchar(150) NOT NULL,PRIMARY KEY (`user_id`,`username`))"
    connection.query(sqlUsers, (err, result) => { if (err) throw err; console.log(result); });
    // alter auto increment
    var alter = 'ALTER TABLE recipesdb.users AUTO_INCREMENT=2002901500';
    connection.query(alter, (err, result) => { if (err) throw err; console.log(result); });

    var sqlRecipes = "CREATE TABLE IF NOT EXISTS recipesdb.recipes ( `recipe_id` int NOT NULL AUTO_INCREMENT, `name` varchar(100) DEFAULT NULL,`contributor_id` int DEFAULT NULL,`date_submitted` date DEFAULT NULL, `minutes` int DEFAULT NULL,`kcal` double DEFAULT NULL, `total_fat` double DEFAULT NULL,`protein` double DEFAULT NULL,`saturated_fat` double DEFAULT NULL,`sodium` double DEFAULT NULL,`sugars` double DEFAULT NULL,`carbohydrates` double DEFAULT NULL,`category` varchar(50) DEFAULT NULL,PRIMARY KEY (`recipe_id`),KEY `contributer_id_idx` (`contributor_id`),CONSTRAINT `contributer_id` FOREIGN KEY (`contributor_id`) REFERENCES `users` (`user_id`))"
    connection.query(sqlRecipes, (err, result) => { if (err) throw err; console.log(result); });
    // alter auto increment
    alter = 'ALTER TABLE recipesdb.recipes AUTO_INCREMENT=526000';
    connection.query(alter, (err, result) => { if (err) throw err; console.log(result); });

    var sqlIngredients = "CREATE TABLE IF NOT EXISTS recipesdb.ingredients (food_name VARCHAR(500) PRIMARY KEY NOT NULL,kcal float DEFAULT NULL, total_fat float DEFAULT NULL, protein float DEFAULT NULL,saturated_fat float DEFAULT NULL, sodium float DEFAULT NULL,sugars float DEFAULT NULL,carbohydrates float DEFAULT NULL)"
    connection.query(sqlIngredients, (err, result) => { if (err) throw err; console.log(result); });

    var sqlInstructions = "CREATE TABLE IF NOT EXISTS recipesdb.instructions (recipe_id int NOT NULL, step int NOT NULL,instruction varchar(5000) DEFAULT NULL, PRIMARY KEY (recipe_id,step),CONSTRAINT inst_recipe_id FOREIGN KEY (recipe_id) REFERENCES recipes (recipe_id) )"
    connection.query(sqlInstructions, (err, result) => { if (err) throw err; console.log(result); });

    var sqlRecipeInfo = "CREATE TABLE IF NOT EXISTS recipesdb.recipe_info (`recipe_id` int NOT NULL,`description` text,`food_standards` json DEFAULT NULL,`image_url` text,`recipe_yield` varchar(5000) DEFAULT NULL,PRIMARY KEY (`recipe_id`), CONSTRAINT `info_recipe_id` FOREIGN KEY (`recipe_id`) REFERENCES `recipes` (`recipe_id`))"
    connection.query(sqlRecipeInfo, (err, result) => { if (err) throw err; console.log(result); });

    var sqlRecipestoIngredients = "CREATE TABLE IF NOT EXISTS recipesdb.recipestoingredients ( `recipe_id` int NOT NULL, `food_name` varchar(500) NOT NULL, `quantity` float DEFAULT NULL,`unit` varchar(20) NOT NULL, PRIMARY KEY (`recipe_id`,`food_name`,`unit`), KEY `fk_food_name` (`food_name`), CONSTRAINT `fk_food_name` FOREIGN KEY (`food_name`) REFERENCES `ingredients` (`food_name`), CONSTRAINT `mix_recipe_id` FOREIGN KEY (`recipe_id`) REFERENCES `recipes` (`recipe_id`))"
    connection.query(sqlRecipestoIngredients, (err, result) => { if (err) throw err; console.log(result); });

    var sqlReviews = "CREATE TABLE IF NOT EXISTS recipesdb.reviews ( `recipe_id` int NOT NULL,`user_id` int NOT NULL, `date_submitted` datetime DEFAULT NULL,`date_modified` datetime DEFAULT NULL,`rating` tinyint DEFAULT NULL, `review` text, PRIMARY KEY (`recipe_id`,`user_id`), KEY `rev_user_id_idx` (`user_id`) , CONSTRAINT `rev_recipe_id` FOREIGN KEY (`recipe_id`) REFERENCES `recipes` (`recipe_id`), CONSTRAINT `rev_user_id` FOREIGN KEY (`user_id`) REFERENCES `users` (`user_id`))"
    connection.query(sqlReviews, (err, result) => { if (err) throw err; console.log(result); });
}



// add data to mysql
const users = require('./raw_data/Users.json');
const recipes = require('./raw_data/Recipes.json');
const reviews = require('./raw_data/Reviews.json');
const instructions = require('./raw_data/Instructions.json');
const recipeInfo = require('./raw_data/RecipeInfo.json');
const ingredients = require('./raw_data/Ingredients.json');
const recipesToIngredients = require('./raw_data/RecipesToIngredients.json');


// batchInsert('users', ['user_id', 'username', 'password'], users, false);
// batchInsert('recipes', ['recipe_id', 'name', 'contributor_id', 'date_submitted', 'minutes', 'kcal', 'fat', 'protein', 'sodium', 'saturated_fat', 'sugar', 'carbohydrates', 'category'], recipes, true);
// batchInsert('reviews', ['recipe_id', 'user_id', 'date_submitted', 'date_modified', 'rating', 'review'], reviews, true);
// batchInsert('instructions', ['recipe_id', 'step', 'instruction'], instructions, true);
// batchInsert('recipe_info', ['recipe_id', 'description', 'food_standards', 'image_url', 'recipe_yield'], recipeInfo, true);
// batchInsert('ingredients', ['food_name', 'kcal', 'total_fat', 'protein', 'sodium', 'saturated_fat', 'sugars', 'carbohydrates'], ingredients, true);
// batchInsert('recipestoingredients', ['recipe_id', 'food_name', 'quantity', 'unit'], recipesToIngredients, true);

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
        connection.query(`UPDATE recipesdb.users SET password = '${user.password}' WHERE user_id = ${user.user_id}`, (err, result) => {
            if (err) throw err;

            console.log(`user ${i} updated`);
        });
    });
}

// update the image_url value in recipe_info table for all recipes in the recipeInfo json
function updateImageUrl() {
    recipeInfo.forEach((recipe, i) => {
        connection.query(`UPDATE recipesdb.recipe_info SET image_url = '${recipe.image_url}' WHERE recipe_id = ${recipe.recipe_id}`, (err, result) => {
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

// users.forEach((user, i) => {
// recipes.forEach((recipe, i) => {
// reviews.forEach((review, i) => {
// instructions.forEach((instruction, i) => {
// recipeInfo.forEach((recipe, i) => {
// ingredients.forEach((ingredient, i) => {
// recipesToIngredients.forEach((rti, i) => {


// let query = `INSERT INTO recipesdb.users (user_id, nick_name) VALUES ('${user.user_id}', '${user.nick_name}')`;
// let query = `INSERT INTO recipesdb.recipes (recipe_id, name, contributor_id, date_submitted, minutes, kcal, fat, protein, sodium, saturated_fat, sugar, carbohydrates, category) VALUES ('${recipe.recipe_id}', '${recipe.name.includes('\'') ? recipe.name.replace(/\'/g, '\'\'') : recipe.name}', '${recipe.contributor_id}', '${recipe.date_submitted}', '${recipe.minutes}', '${recipe.kcal}', '${recipe.fat}', '${recipe.protein}', '${recipe.sodium}', '${recipe.saturated_fat}', '${recipe.sugar}', '${recipe.carbohydrates}', '${recipe.category.includes('\'') ? recipe.category.replace(/\'/g, '\'\'') : recipe.category}')`;
// let query = `INSERT INTO recipesdb.reviews (recipe_id, user_id, date_submitted, date_modified, rating, review) VALUES ('${review.recipe_id}', '${review.user_id}', '${review.date_submitted.substring(0, 10)}', '${review.date_modified.substring(0, 10)}', '${review.rating}', '${review.review.includes('\'') ? review.review.replace(/\'/g, '\'\'') : review.review}')`;
// let query = `INSERT INTO recipesdb.instructions (recipe_id, step, instruction) VALUES ('${instruction.recipeId}', '${instruction.step}', '${instruction.instruction.includes('\'') ? instruction.instruction.replace(/\'/g, '\'\'') : instruction.instruction}')`;
// let query = `INSERT INTO recipesdb.recipe_info (recipe_id, description, food_standards, image_url, recipe_yield) VALUES ('${recipe.recipe_id}', '${recipe.description.includes('\'') ? recipe.description.replace(/\'/g, '\'\'') : recipe.description}', '${recipe.food_standards.replace(/\'/g, '\"')}', '${recipe.image_url}', '${recipe.recipe_yield.includes('\'') ? recipe.recipe_yield.replace(/\'/g, '\'\'') : recipe.recipe_yield}')`;
// let query = `INSERT INTO recipesdb.ingredients (food_name, quantity, unit, nutr_per_ingredient) VALUES ('${ingredient.food_name.includes('\'') ? ingredient.food_name.replace(/\'/g, '\'\'') : ingredient.food_name}', '${ingredient.quantity}', '${ingredient.unit}', '${ingredient.nutr_per_ingredient.replace(/\'/g, '\"')}')`;
// let query = `INSERT INTO recipesdb.recipestoingredients (recipe_id, food_name, quantity, unit) VALUES ('${rti.recipe_id}', '${rti.food_name.includes('\'') ? rti.food_name.replace(/\'/g, '\'\'') : rti.food_name}', '${rti.quantity}', '${rti.unit}')`;


// connection.query(query, (err, result) => {
//     if (err) {
//         if (err.code === 'ER_DUP_ENTRY') {
//             console.log(`duplicate entry: ${i}`)
//             return
//         };
//         console.log(err);
//         throw err;
//     }
//     console.log(i);
// });
// });


function createUserDatabase() {
    const query = 'CREATE DATABASE IF NOT EXISTS userdb';
    connection.query(query, (error, results) => {
        if (error) throw error;
        // console.log(results);
    });
}




function deleteAllRows(table) {
    connection.query(`DELETE FROM recipesdb.${table}`, (err, result) => {
        if (err) throw err;
        console.log(result);
    });
}

function batchInsert(table, columns, json, skipDups = false) {
    let query = `INSERT INTO recipesdb.${table} (${columns}) VALUES `;
    let allValues = [];
    json.forEach((obj) => {
        let values = [];
        columns.forEach((column) => {
            values.push(obj[column]);
        });
        allValues.push(`(\'${values.join('\', \'')}\')`);
    });
    query += allValues.join(', ');


    connection.query(query, (err, result) => {
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
        let query = `UPDATE recipesdb.users SET username = '${user.username}' WHERE user_id = ${user.user_id}`;
        connection.query(query
            , (err, result) => {
                if (err) throw err;
                console.log(result);
            });
    });

}

// createSQLDB();


