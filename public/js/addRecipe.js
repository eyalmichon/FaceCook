$(document).ready(function () {
    // add options to category select
    [`Yeast Breads`, `Yam/Sweet Potato`, `Winter`, `Wild Game`, `Whole Turkey`,
        `Whole Chicken`, `Whitefish`, `White Rice`, `Wheat Bread`, `Weeknight`, `Vietnamese`, `Very Low Carbs`,
        `Vegetable`, `Vegan`, `Turkish`, `Turkey Breasts`, `Tuna`, `Tropical Fruits`, `Toddler Friendly`,
        `Tilapia`, `Thanksgiving`, `Thai`, `Tex Mex`, `Tarts`, `Szechuan`, `Sweet`, `Swedish`, `Summer`,
        `Strawberry`, `Stove Top`, `Stocks`, `Stew`, `Steak`, `Spring`, `Spreads`, `Spinach`, `Spicy`, `Spanish`,
        `Spaghetti`, `Soy/Tofu`, `Southwestern U.S.`, `Southwest Asia (middle East)`, `South American`, `South African`,
        `Sourdough Breads`, `Smoothies`, `Short Grain Rice`, `Shakes`, `Scottish`, `Scones`, `Scandinavian`, `Savory Pies`,
        `Savory`, `Sauces`, `Salad Dressings`, `Russian`, `Roast Beef`, `Rice`, `Refrigerator`, `Raspberries`, `Quick Breads`,
        `Punch Beverage`, `Pumpkin`, `Puerto Rican`, `Poultry`, `Potluck`, `Potato`, `Pot Pie`, `Portuguese`, `Pork`, `Polynesian`,
        `Polish`, `Plums`, `Pineapple`, `Pie`, `Peppers`, `Pennsylvania Dutch`, `Penne`, `Pears`, `Peanut Butter`, `Papaya`, `Pakistani`,
        `Oven`, `Oranges`, `Orange Roughy`, `Onions`, `One Dish Meal`, `Oatmeal`, `Nuts`, `Norwegian`, `No Shell Fish`, `No Cook`,
        `Nigerian`, `Native American`, `Moroccan`, `Mixer`, `Microwave`, `Mexican`, `Melons`, `Medium Grain Rice`, `Meatloaf`,
        `Meatballs`, `Meat`, `Mashed Potatoes`, `Mango`, `Macaroni And Cheese`, `Lunch/Snacks`, `Low Protein`, `Low Cholesterol`,
        `Long Grain Rice`, `Lime`, `Lentil`, `Lemon`, `Lamb/Sheep`, `Lactose Free`, `Kosher`, `Korean`, `Kid Friendly`, `Jellies`,
        `Japanese`, `Iraqi`, `Indian`, `Icelandic`, `Ice Cream`, `Hungarian`, `Hunan`, `Household Cleaner`, `Homeopathy/Remedies`,
        `High Protein`, `High In...`, `High Fiber`, `Healthy`, `Hawaiian`, `Ham`, `Halloween`, `Halibut`, `Gumbo`, `Greens`,
        `Greek`, `Grains`, `German`, `Gelatin`, `Fruit`, `Frozen Desserts`, `From Scratch`, `Free Of...`, `For Large Groups`,
        `Finnish`, `European`, `Ethiopian`, `Egyptian`, `Egg Free`, `Ecuadorean`, `Easy`, `Dutch`, `Duck`, `Drop Cookies`,
        `Dessert`, `Deer`, `Danish`, `Czech`, `Curries`, `Creole`, `Crab`, `Corn`, `Collard Greens`, `Coconut`, `Clear Soup`,
        `Citrus`, `Chutneys`, `Christmas`, `Chowders`, `Chocolate Chip Cookies`, `Chinese`, `Chicken Thigh & Leg`, `Chicken Livers`,
        `Chicken Breast`, `Chicken`, `Cherries`, `Cheesecake`, `Cheese`, `Cauliflower`, `Catfish`, `Caribbean`, `Cantonese`, `Canning`,
        `Candy`, `Canadian`, `Camping`, `Cambodian`, `Cajun`, `Buttermilk Biscuits`, `Brunch`, `Brown Rice`, `Broil/Grill`, `Breakfast`,
        `Breads`, `Bread Machine`, `Brazilian`, `Black Beans`, `Birthday`, `Beverages`, `Berries`, `Beginner Cook`, `Beef Organ Meats`,
        `Beef Liver`, `Beans`, `Bath/Beauty`, `Bar Cookie`, `Baking`, `Austrian`, `Australian`, `Asian`, `Apple`, `African`, `< 60 Mins`,
        `< 4 Hours`, `< 30 Mins`, `< 15 Mins`].forEach(category => {
            $('#recipeInfoCategory').append(`<option value="${category}">${category}</option>`);
        });

    function ingredientsClickEvent() {
        // Clone the last row of the table
        let newIngredient = $("#ingredients-table tr:last").clone();

        // Clear the values of the inputs in the new row
        newIngredient.find("input").val("");
        newIngredient.find("input").autocomplete({
            source: getIngredientsByTerm,
            minLength: 2
        });

        // Add a click event to the new button
        newIngredient.find("button").click(ingredientsClickEvent);

        // Add the minus button to the new tr element - have bugs
        // if (!newIngredient.find(".remove-ingredient-btn").length) {
        //     newIngredient.append('<td><button class="remove-ingredient-btn">-</button></td>');
        //     newIngredient.find(".remove-ingredient-btn").click(function() {
        //         $(this).closest('tr').remove();
        //       });
        // }

        console.log(newIngredient);
        // Append the new row to the end of the table
        $("#ingredients-table").append(newIngredient);
    }

    function instructionsClickEvent() {
        // Clone the last element of the instructions list
        let newInstruction = $("#instructionsToDup").clone();

        // Clear the value of the input in the new instruction
        newInstruction.find("textarea").val("");

        // Add a click event to the new button
        newInstruction.find("button").click(instructionsClickEvent);

        // Append the new instruction to the end of the list
        $("#instructions").append(newInstruction);
    }

    function getIngredientsByTerm(request, response, slice = true) {
        new Promise((resolve, reject) => {
            fetch('/search?type=ingredient&searchTerm=' + encodeURIComponent(request.term), {
                method: 'GET'
            })
                .then(res => res.json())
                .then(data => {
                    resolve(slice ? data.slice(0, 100) : data);
                })
                .catch(error => {
                    reject(error);
                });
        })
            .then(data => {
                response(data);
            })
            .catch(error => {
                console.log(error);
            });
    }

    function showError(msg) {
        Swal.fire({
            icon: 'error',
            title: 'Error',
            text: msg
        });
    }

    function showSuccess(msg) {
        Swal.fire({
            icon: 'success',
            title: 'Success',
            text: msg
        });
    }


    /////////////////////// Event Handlers ///////////////////////
    $("#add-ingredient-button").click(ingredientsClickEvent);
    $("#add-instruction-button").click(instructionsClickEvent);

    $("#ingredient-name").autocomplete({
        source: getIngredientsByTerm,
        minLength: 2
    });

    // handle the submit event of the form
    $("form").submit(async function (event) {
        // prevent the form from submitting the default way
        event.preventDefault();
        // get the values of the form fields from the event object
        let recipeName = event.target.recipeName.value;

        if (!recipeName) {
            showError("Please enter a recipe name.");
            return;
        }

        let description = event.target.description.value;

        if (!description) {
            showError("Please enter a description.");
            return;
        }

        let category = event.target.category.value;
        if (!category) {
            showError("Please enter a category.");
            return;
        }
        let minutes = event.target.minutes.value;
        if (!minutes) {
            showError("Please enter the minutes.");
            return;
        }
        let recipeYield = event.target.recipeYield.value;
        if (!recipeYield) {
            showError("Please enter the recipe yield.");
            return;
        }

        let ingredients = [];  // Array to store the ingredient data

        // Iterate over the rows of the table
        $(event.target).find('#ingredients-table tr').each(function () {
            let ingredient = {};  // Object to store the data for each ingredient

            // Get the values of the input elements
            ingredient.name = $(this).find('#ingredient-name').val();
            ingredient.quantity = $(this).find('#ingredient-quantity').val();
            ingredient.unit = $(this).find('#ingredient-unit').val();

            // Add the ingredient object to the array
            ingredients.push(ingredient);
        });

        ingredients = ingredients.slice(1);  // Remove the first element of the array

        // Check that all the ingredients have a name, quantity, and unit
        try {
            ingredients.forEach(ingredient => {
                if (!ingredient.name || !ingredient.quantity || !ingredient.unit) {
                    throw new Error("Please enter all the ingredient information.");
                }
            });
        } catch (error) {
            showError(error.message);
            return;
        }

        let instructions = [];  // Array to store the instruction data

        // Iterate over the elements of the instructions list
        $(event.target).find('#instructions div').each(function () {
            // Get the value of the textarea element
            let instruction = $(this).find('textarea').val();

            if (!instruction)
                return;
            // Add the instruction to the array
            instructions.push(instruction);
        });

        if (!instructions.length) {
            showError("Please enter at least one instruction.");
            return;
        }

        let images = [];  // Array to store the image data
        // Iterate over the images that were uploaded
        let files = $(event.target).find('#image-uploader').prop('files');
        for (let i = 0; i < files.length; i++) {
            let file = files[i];
            images.push(file);
        }



        // Check that all the ingredients exist in the database
        const ingredientPromises = ingredients.map(ingredient => {
            return new Promise((resolve, reject) => {
                getIngredientsByTerm({ term: ingredient.name }, data => {
                    if (data.length) {
                        resolve(data[0]);
                    } else {
                        reject(`Ingredient ${ingredient.name} not found.`);
                    }
                }, false);
            });
        });

        try {
            await Promise.all(ingredientPromises)
                .catch(error => {
                    throw new Error(error);
                });
        } catch (error) {
            showError(error.message);
            return;
        }


        // Convert the images to base64
        const imagePromises = images.map(image => {
            return new Promise((resolve, reject) => {
                let reader = new FileReader();
                let blob = new Blob([image], { type: image.type });
                reader.readAsDataURL(blob);
                reader.onloadend = function () {
                    let base64 = reader.result;
                    resolve(base64);
                }
            });
        });

        try {
            await Promise.all(imagePromises)
                .then(data => {
                    images = images.length > 1 ? `c(${data.map(image => `"${image}"`).join(', ')})` : `"${data[0]}"`;
                })
                .catch(error => {
                    throw new Error('Error converting images to base64.');
                });
        }
        catch (error) {
            showError(error);
        }

        // Create the recipe object
        let recipe = {
            name: recipeName,
            description: description,
            category: category,
            minutes: minutes,
            recipeYield: recipeYield,
            ingredients: ingredients,
            instructions: instructions,
            images: images
        };

        // Send the recipe to the server
        try {
            await fetch('/addRecipe', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(recipe)
            })
                .then(res => res.json())
                .then(data => {
                    if (data.status === 200) {
                        showSuccess(data.message);
                    } else {
                        showError(data.message);
                    }
                })
                .catch(error => {
                    throw new Error(error);
                });
        } catch (error) {
            showError(error.message);
            return;
        }


    });
});