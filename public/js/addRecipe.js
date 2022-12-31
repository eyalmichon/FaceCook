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


    $("#add-ingredient-button").click(ingredientsClickEvent);
    $("#add-instruction-button").click(instructionsClickEvent);

    $("#ingredient-name").autocomplete({
        source: function (request, response) {
            $.ajax({
                url: "/search",
                type: "GET",
                data: {
                    type: "ingredient",
                    searchTerm: request.term
                },
                success: function (data) {
                    response(data.slice(0, 100));
                },
                error: function (error) {
                    console.log(error);
                }
            });
        },
        minLength: 2
    });

    // handle the submit event of the form
    $("form").submit(function (event) {
        // prevent the form from submitting the default way
        event.preventDefault();
        // get the values of the form fields from the event object
        let recipeName = event.target.recipeName.value;




        // send an HTTP POST request to a server-side script or API endpoint
        // $.ajax({
        //     type: "POST",
        //     url: "/addRecipe",
        //     data: JSON.stringify({
        //         name: recipeName,
        //         ingredients: ingredients,
        //         instructions: instructions
        //     }),
        //     contentType: "application/json; charset=utf-8",
        //     dataType: "json",
        //     success: function (response) {
        //         // handle the response from the server
        //     }
        // });
    });
});