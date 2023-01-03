$(document).ready(function () {
    

    function showNutritionLabel(data) {
        $('.nutrition-label').remove();

        // create a new element for the nutrition label
        var nutritionLabel = $('<div class="nutrition-label">\
        <h3>Nutrition Facts</h3>\
        <hr>\
        <p>Category: <span class="category"></span></p>\
        <p>Serving Size: <span class="serving-size"></span></p>\
        <hr>\
        <table>\
            <tr>\
            <td>Calories :</td>\
            <td class="calories"></td>\
            </tr>\
            <tr>\
            <td>Total Fat :</td>\
            <td class="total_fat"></td>\
            </tr>\
            <tr>\
            <td>Sodium :</td>\
            <td class="sodium"></td>\
            </tr>\
            <tr>\
            <td>Carbohydrates :</td>\
            <td class="carbohydrates"></td>\
            </tr>\
            <tr>\
            <td>Protein :</td>\
            <td class="protein"></td>\
            </tr>\
            <tr>\
            <td>Sugars :</td>\
            <td class="sugars"></td>\
            </tr>\
            <tr>\
            <td>Saturated fat :</td>\
            <td class="saturated_fat"></td>\
            </tr>\
        </table>\
        </div>');
    
        $("body").append(nutritionLabel);

        $('.category').text(data.category);
        $('.sodium').text(data.sodium);
        $('.total_fat').text(data.total_fat);
        $('.carbohydrates').text(data.carbohydrates);
        $('.protein').text(data.protein);
        $('.calories').text(data.kcal);
        $('.sugars').text(data.sugars);
        $('.saturated_fat').text(data.saturated_fat);
    }

    $("form").submit(async function (event) {
        // prevent the form from submitting the default way
        event.preventDefault();

        // showNutritionLabel();

        // console.log(filter.search)  

        // get the recipe with reviews
        fetch('/getRecipeWithReviews', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({
              search: $('#searchTerm').val(),
            })
          })
            .then(response => response.json())
            .then(data => {
              if (data.error) {
                throw new Error(data.error);
              }
                showNutritionLabel(data[0]);
            })
            .catch(error => {
              console.log(error);
              return;
            });

    });

    $("#searchTerm").autocomplete({
        source: function (request, response) {
            $.ajax({
                url: "/search",
                type: "GET",
                data: {
                    type: "recipe",
                    searchTerm: request.term,
                    isFilter: $('#toggle-filters').prop('checked'),
                    filter: {
                        rating: $('#rating-filter').val(), // get the value of the rating filter
                        maxCalories: $('#calories-filter').val(), // get the value of the calories filter
                        maxInstructions: $('#instructions-filter').val(), // get the value of the instructions filter
                        ingredient: $('#ingredient-filter').val() // get the value of the ingredient filter
                    }
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
});