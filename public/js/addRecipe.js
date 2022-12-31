$(document).ready(function () {
    function ingredientsClickEvent() {
        // Clone the last row of the table
        let newIngredient = $("#ingredients-table tr:last").clone();

        // Clear the values of the inputs in the new row
        newIngredient.find("input").val("");

        // Add a click event to the new button
        newIngredient.find("button").click(ingredientsClickEvent);

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

    function errorMsg(msg) {
        Swal.fire({
            icon: 'error',
            title: 'Error',
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
            errorMsg("Please enter a recipe name.");
            return;
        }

        let description = event.target.description.value;

        if (!description) {
            errorMsg("Please enter a description.");
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
            errorMsg(error.message);
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
            errorMsg("Please enter at least one instruction.");
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
            errorMsg(error.message);
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
            errorMsg(error);
        }

        // Create the recipe object
        let recipe = {
            name: recipeName,
            description: description,
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
                    if (data.error) {
                        throw new Error(data.error);
                    }
                })
                .catch(error => {
                    throw new Error(error);
                });
        } catch (error) {
            errorMsg(error.message);
            return;
        }


    });
});