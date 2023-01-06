const mysql = require("mysql");
const secrets = require("./secrets.json");
const bcrypt = require("bcrypt");

// create a connection to the database
const dbConnection = mysql.createConnection({
  host: "localhost",
  user: secrets.DB_USERNAME,
  password: secrets.DB_PASSWORD,
  database: "recipesdb",
});

dbConnection.connect((err) => {
  if (err) throw err;
  console.log("Connected to recipesdb!");
});

function convertToKg(unit, value) {
  switch (unit) {
    case "tablespoon":
      return value * 0.0147868;
    case "teaspoon":
      return value * 0.00492892;
    case "cup":
      return value * 0.236588;
    case "ounce":
      return value * 0.0283495;
    case "ml":
      return value * 0.001;
    case "pint":
      return value * 0.473176;
    case "pound":
      return value * 0.453592;
    case "g":
      return value * 0.001;
    case "fl.oz":
      return value * 0.0283495;
    case "drop":
      return value * 0.00005;
    case "liter":
      return value * 1;
    case "quart":
      return value * 0.946353;
    case "shot":
      return value * 0.0408471;
    case "gallon":
      return value * 3.78541;
    case "kg":
      return value;
    case "dash":
      return value * 0.00005;
    case "scoop":
      return value * 0.0647989;
    case "pinch":
      return value * 0.005;
    case "glass":
      return value * 0.25;
    case "bushel":
      return value * 35.2391;
    default:
      return "Invalid unit";
  }
}

function addReview(user, recipeName, review, rating, callback) {
  // add review to database by finding the user_id and recipe_id of the user and recipe
  // then insert into reviews with the date and time into date_submitted and date_modified

  // get user_id
  const sqlSearch = "Select * from users where username = ?";
  const search_query = mysql.format(sqlSearch, [user]);
  dbConnection.query(search_query, async (err, result2) => {
    if (err) {
      callback({ message: err, status: 404 });
      return;
    }
    if (result2.length == 0) {
      console.log("--------> User does not exist");
      callback({ message: "User does not exist", status: 404 });
    } else {
      const user_id = result2[0].user_id;

      // get recipe_id
      const sqlSearch2 = "Select * from recipes where name = ?";
      const search_query2 = mysql.format(sqlSearch2, [recipeName]);
      dbConnection.query(search_query2, async (err, result3) => {
        if (err) {
          callback({ message: err, status: 404 });
          return;
        }
        if (result3.length == 0) {
          console.log("--------> Recipe does not exist");
          callback({ message: "Recipe does not exist", status: 404 });
        } else {
          const recipe_id = result3[0].recipe_id;

          // insert into reviews
          const sqlInsert =
            "INSERT INTO reviews (user_id, recipe_id, review, rating, date_submitted, date_modified) VALUES (?, ?, ?, ?, NOW(), NOW())";
          const insert_query = mysql.format(sqlInsert, [
            user_id,
            recipe_id,
            review,
            rating,
          ]);
          dbConnection.query(insert_query, async (err, result4) => {
            if (err) {
              callback({ message: err, status: 404 });
              return;
            }
            console.log("--------> Review added");
            callback({ message: "Review added", status: 200 });
          });
        }
      });
    }
  });
}

function getRecipeByName(name, callback) {
  let query = `SELECT r.*,
                  (SELECT JSON_ARRAYAGG(JSON_OBJECT('food_name', food_name, 'quantity', quantity, 'unit', unit))
                  FROM recipesdb.recipestoingredients
                  WHERE recipe_id = r.recipe_id) AS ingredients,
                  (SELECT JSON_ARRAYAGG(JSON_OBJECT('step', step, 'instruction', instruction))
                  FROM recipesdb.instructions
                  WHERE recipe_id = r.recipe_id) AS instructions,
                  (SELECT JSON_ARRAYAGG(JSON_OBJECT('rating', rating, 'review', review))
                  FROM recipesdb.reviews
                  WHERE recipe_id = r.recipe_id) AS reviews, description 
                FROM recipesdb.recipes AS r
                LEFT JOIN recipesdb.recipe_info AS info ON r.recipe_id = info.recipe_id
                WHERE r.name = ?
                LIMIT 1`
  const formattedQuery = mysql.format(query, [name]);

  dbConnection.query(formattedQuery, (error, results) => {
    if (error) throw error;
    callback(results);
  });
}

async function addRecipe(user, recipe, callback) {
  const sqlSearch = "Select * from users where username = ?";
  const search_query = mysql.format(sqlSearch, [user]);
  dbConnection.query(search_query, async (err, result2) => {
    if (err) throw err;
    if (result2.length == 0) {
      console.log("--------> User does not exist");
      callback({ message: "User does not exist", status: 404 });
    } else {
      let query = "";
      for (let i = 0; i < recipe.ingredients.length; i++) {
        let ingredient = recipe.ingredients[i];
        let food_name = ingredient.name;
        let unit = ingredient.unit;
        let quantity = ingredient.quantity;

        let quantity_100g = 10 * convertToKg(unit, quantity);
        quantity_100g.toFixed(3);
        query += `SELECT ${quantity_100g} * kcal AS kcal, `;
        query += `${quantity_100g} * total_fat AS total_fat, `;
        query += `${quantity_100g} * protein AS protein, `;
        query += `${quantity_100g} * saturated_fat AS saturated_fat, `;
        query += `${quantity_100g} * sodium AS sodium, `;
        query += `${quantity_100g} * sugars AS sugars, `;
        query += `${quantity_100g} * carbohydrates AS carbohydrates `;
        query += `FROM recipesdb.ingredients WHERE food_name = '${food_name}'`;
        if (i < recipe.ingredients.length - 1) {
          query += ` UNION ALL `;
        }
      }

      dbConnection.query(query, async (err, result) => {
        if (err) {
          console.log(err);
          callback({ message: "Unknown error", status: 404 });
          return;
        }
        sum_kcal = 0;
        sum_total_fat = 0;
        sum_protein = 0;
        sum_saturated_fat = 0;
        sum_sodium = 0;
        sum_sugars = 0;
        sum_carbohydrates = 0;
        for (let i = 0; i < result.length; i++) {
          sum_kcal += result[i].kcal;
          sum_total_fat += result[i].total_fat;
          sum_protein += result[i].protein;
          sum_saturated_fat += result[i].saturated_fat;
          sum_sodium += result[i].sodium;
          sum_sugars += result[i].sugars;
          sum_carbohydrates += result[i].carbohydrates;
        }

        let addRecipeQuery =
          "INSERT INTO recipes (name, contributor_id, date_submitted, minutes, kcal, total_fat, protein, saturated_fat, sodium, sugars, carbohydrates, category)";
        addRecipeQuery += " VALUES (?, ?, NOW(), ?, ?, ?, ?, ?, ?, ?, ?, ?)";
        let columns = [
          recipe.name,
          result2[0].user_id,
          recipe.minutes,
          sum_kcal,
          sum_total_fat,
          sum_protein,
          sum_saturated_fat,
          sum_sodium,
          sum_sugars,
          sum_carbohydrates,
          recipe.category,
        ];
        let insert_query = mysql.format(addRecipeQuery, columns);
        // add ingredients to sql query here
        dbConnection.query(insert_query, async (err, result) => {
          const recipeId = result.insertId;
          if (err) {
            console.log(err);
            callback({ message: "Unknown error", status: 404 });
            return;
          }
          console.log("---------> Recipe added");
          // add ingredients to recipeToIngredients table
          let addRecipeToIngredientsQuery =
            "INSERT INTO recipestoingredients (recipe_id, food_name, quantity, unit) VALUES ";
          recipe.ingredients.forEach((ingredient) => {
            addRecipeToIngredientsQuery += `(${recipeId}, '${ingredient.name}', ${ingredient.quantity}, '${ingredient.unit}'), `;
          });
          addRecipeToIngredientsQuery = addRecipeToIngredientsQuery.slice(
            0,
            -2
          );

          dbConnection.query(
            addRecipeToIngredientsQuery,
            async (err, result) => {
              if (err) {
                console.log(err);
                callback({ message: "Unknown error", status: 404 });
                return;
              }
              console.log("---------> Ingredients added");

              // add instructions to instructions table
              let addInstructionsQuery =
                "INSERT INTO instructions (recipe_id, step, instruction) VALUES ";
              recipe.instructions.forEach((instruction, index) => {
                addInstructionsQuery += `(${recipeId}, ${
                  index + 1
                }, '${instruction}'), `;
              });
              addInstructionsQuery = addInstructionsQuery.slice(0, -2);

              dbConnection.query(addInstructionsQuery, async (err, result) => {
                if (err) {
                  console.log(err);
                  callback({ message: "Unknown error", status: 404 });
                  return;
                }
                console.log("---------> Instructions added");

                // add recipeInfo to recipeInfo table
                let addRecipeInfoQuery =
                  "INSERT INTO recipe_info (recipe_id, description, image_url, recipe_yield) VALUES ";
                addRecipeInfoQuery += `(${recipeId}, '${recipe.description}', '${recipe.images}', '${recipe.recipeYield}')`;

                dbConnection.query(addRecipeInfoQuery, async (err, result) => {
                  if (err) {
                    console.log(err);
                    callback({ message: "Unknown error", status: 404 });
                    return;
                  }
                  console.log("---------> RecipeInfo added");
                  callback({ message: "Recipe added", status: 200 });
                });
              });
            }
          );
        });
      });
    }
  });
}

function getUserRecipes(username, callback) {
  const query = `
      SELECT
      (SELECT JSON_ARRAYAGG(
        JSON_OBJECT(
            'user_id', u.user_id, 
            'date_submitted', rv.date_submitted, 
            'date_modified', rv.date_modified, 
            'rating', rv.rating, 
            'review', rv.review
        )
    )) AS reviews,
    ri.description, ri.image_url,
    (SELECT JSON_ARRAYAGG(
      JSON_OBJECT(
          'step', ins.step, 
          'instruction', ins.instruction
          )
      )
    FROM recipesdb.instructions ins
    WHERE r.recipe_id = ins.recipe_id
    GROUP BY ins.recipe_id) AS instructions
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
    results = results.map((result) => {
      result.reviews = JSON.parse(result.reviews);
      result.instructions = JSON.parse(result.instructions);
      return result;
    });
    callback(results);
  });
}

function getHomeRecipes(callback) {
  const query = `
  SELECT  
  (SELECT JSON_ARRAYAGG(
            JSON_OBJECT(
                'user_id', u.user_id, 
                'date_submitted', rv.date_submitted, 
                'date_modified', rv.date_modified, 
                'rating', rv.rating, 
                'review', rv.review
            )
        ) 
     FROM recipesdb.reviews rv
     WHERE r.recipe_id = rv.recipe_id
     GROUP BY rv.recipe_id) AS reviews,
    ri.description, ri.image_url,
    (SELECT JSON_ARRAYAGG(
              JSON_OBJECT(
                  'step', ins.step, 
                  'instruction', ins.instruction
              )
          )
      FROM recipesdb.instructions ins
      WHERE r.recipe_id = ins.recipe_id
      GROUP BY ins.recipe_id) AS instructions
      FROM recipesdb.recipes r
      JOIN recipesdb.users u ON r.contributor_id = u.user_id
      LEFT JOIN recipesdb.recipe_info ri ON r.recipe_id = ri.recipe_id
      WHERE r.recipe_id IN (SELECT test.recipe_id
      FROM (SELECT recipe_id, COUNT(*) as num_reviews
      FROM recipesdb.reviews
      GROUP BY recipe_id
      ORDER BY num_reviews DESC
      LIMIT 100) as test)
    `;

  dbConnection.query(query, (error, results) => {
    if (error) throw error;
    results = results.map((result) => {
      result.reviews = JSON.parse(result.reviews);
      result.instructions = JSON.parse(result.instructions);
      return result;
    });
    // sort the results by the number of reviews
    results.sort((a, b) => {
      return b.reviews.length - a.reviews.length;
    });
    callback(results);
  });
}

/**
 * Get all recipes from the database that match the given search term or part of a search term.
 * @param {string} searchTerm The search term to match against the recipes.
 * @returns {Array} An array of recipes that match the search term.
 */
function getRecipesByTerm(searchTerm, toggle, filter, callback) {
  let query = `SELECT * FROM recipes WHERE name LIKE '%${searchTerm}%'`;
  if (toggle === "true") {
    query += ` AND recipe_id IN (SELECT recipe_id 
                                     FROM (SELECT recipe_id, AVG(rating) as avg_rating FROM reviews GROUP BY recipe_id) as ratings 
                                     WHERE avg_rating >= ${filter.rating})`;
    query += ` AND kcal <= ${filter.maxCalories}`;
    // limit max instructions
    query += ` AND recipe_id IN (SELECT recipe_id
            FROM (SELECT recipe_id, max(step) as max_step FROM instructions group by recipe_id) as instructions
            WHERE max_step <= ${filter.maxInstructions})`;
    //  query += ` AND id IN (SELECT recipe_id FROM recipestoingredients WHERE ingredient LIKE '%${filter.ingredient}%')`;
    // console.log(query)
  }
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
  const sqlSearch = "Select * from users where username = ?";
  const search_query = mysql.format(sqlSearch, [user]);
  dbConnection.query(search_query, async (err, result) => {
    if (err) throw err;
    if (result.length == 0) {
      console.log("--------> User does not exist");
      callback({ message: "User does not exist", status: 404 });
    } else {
      const hashedPassword = result[0].password;
      //get the hashedPassword from result
      if (await bcrypt.compare(password, hashedPassword)) {
        console.log("---------> Login Successful");
        callback({ message: `${user} is logged in!`, status: 200 });
      } else {
        console.log("---------> Password Incorrect");
        callback({
          message: `Password incorrect for user: ${user}!`,
          status: 401,
        });
      }
    }
  });
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
  const sqlSearch = "SELECT * FROM users WHERE username = ?";
  const search_query = mysql.format(sqlSearch, [user]);
  const sqlInsert = "INSERT INTO users (username, password) VALUES (?,?)";
  // ? will be replaced by values
  // ?? will be replaced by string
  const insert_query = mysql.format(sqlInsert, [user, hashedPassword]);
  dbConnection.query(search_query, async (err, result) => {
    if (err) throw err;
    console.log("------> Search Results");
    console.log(`Result: ${result}`);
    if (result.length != 0) {
      console.log("------> User already exists");
      callback({ message: `User: ${user} already exists!`, status: 409 });
    } else {
      dbConnection.query(insert_query, (err, result) => {
        if (err) throw err;
        console.log("--------> Created new User");
        callback({
          message: `Created new user with id: ${result.insertId}`,
          status: 201,
        });
      });
    }
  });
}


module.exports = {
  getRecipeByName,
  getRecipesByTerm,
  getIngredientsByTerm,
  login,
  register,
  getUserRecipes,
  getHomeRecipes,
  addRecipe,
  addReview,
};
