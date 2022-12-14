const mysql = require('mysql');
const secrets = require('./secrets.json');

const connection = mysql.createConnection({
    host: 'localhost',
    user: secrets.DB_USERNAME,
    password: secrets.DB_PASSWORD,
});




// create a schema named 'recipesdb' if it doesn't exist
function createSchema() {
    connection.query('CREATE SCHEMA IF NOT EXISTS recipesdb', (err, result) => {
        if (err) throw err;
        console.log(result);
    });
}

// add data to mysql
const users = require('./raw_data/Users.json');
const recipes = require('./raw_data/Recipes.json');
const reviews = require('./raw_data/Reviews.json');
const instructions = require('./raw_data/Instructions.json');
const recipeInfo = require('./raw_data/RecipeInfo.json');
const ingredients = require('./raw_data/Ingredients.json');
const recipesToIngredients = require('./raw_data/RecipesToIngredients.json');



// batchInsert('users', ['user_id', 'nick_name'], users, true);
// batchInsert('recipes', ['recipe_id', 'name', 'contributor_id', 'date_submitted', 'minutes', 'kcal', 'fat', 'protein', 'sodium', 'saturated_fat', 'sugar', 'carbohydrates', 'category'], recipes, true);
// batchInsert('reviews', ['recipe_id', 'user_id', 'date_submitted', 'date_modified', 'rating', 'review'], reviews, true);
// batchInsert('instructions', ['recipe_id', 'step', 'instruction'], instructions, true);
// batchInsert('recipe_info', ['recipe_id', 'description', 'food_standards', 'image_url', 'recipe_yield'], recipeInfo, true);
// batchInsert('ingredients', ['food_name', 'calories', 'total_fat', 'protein', 'sodium', 'saturated_fat', 'sugars', 'carbohydrates'], ingredients, true);
// batchInsert('recipestoingredients', ['recipe_id', 'food_name', 'quantity', 'unit'], recipesToIngredients, true);

// deleteAllRows('recipestoingredients');

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





console.log('done');
connection.end();


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
        if (err.code === 'ER_DUP_ENTRY' && skipDups) return;
        if (err) throw err;
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