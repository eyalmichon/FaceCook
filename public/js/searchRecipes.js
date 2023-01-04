$(document).ready(function () {
    

    function showNutritionLabel(data) {
        var nutritionLabelContainer = $('<div class="nutrition-label-container"></div>');

        // remove the nutrition label if it already exists
        $('.nutrition-label-container').remove();

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
    
        // create a new element for the review and ratings system
        var reviewAndRatings = $('<div class="review-and-ratings">\
        <textarea id="review"></textarea>\
        <button id="send">Send</button>\
        <div class="star-rating">\
        <input type="radio" id="5-stars" name="rating" value="5" />\
        <label for="5-stars" class="star">&#9733;</label>\
        <input type="radio" id="4-stars" name="rating" value="4" />\
        <label for="4-stars" class="star">&#9733;</label>\
        <input type="radio" id="3-stars" name="rating" value="3" />\
        <label for="3-stars" class="star">&#9733;</label>\
        <input type="radio" id="2-stars" name="rating" value="2" />\
        <label for="2-stars" class="star">&#9733;</label>\
        <input type="radio" id="1-star" name="rating" value="1" />\
        <label for="1-star" class="star">&#9733;</label>\
        </div>\
        </div>');

        // append the review and ratings to the nutrition label container
        nutritionLabelContainer.append(nutritionLabel);
        nutritionLabelContainer.append(reviewAndRatings);

        // append the nutrition label container to the body
        $("body").append(nutritionLabelContainer);

        // set the nutrition label values
        $('.category').text(data[0].category);
        $('.sodium').text(data[0].sodium);
        $('.total_fat').text(data[0].total_fat);
        $('.carbohydrates').text(data[0].carbohydrates);
        $('.protein').text(data[0].protein);
        $('.calories').text(data[0].kcal);
        $('.sugars').text(data[0].sugars);
        $('.saturated_fat').text(data[0].saturated_fat);


          // loop through the reviews array
        for (var i = 0; i < data.length; i++) {
            var review = data[i].review;

            // create a new element for the review
            var reviewElement = $(`<div class="review">
              <p>${review}</p>
              <div class="star-rating">
                <!-- display the review's rating using radio buttons -->
                <input type="radio" id="5-stars-${i}" name="rating-${i}" value="5" ${data[i].rating === 5 ? 'checked' : ''} />
                <label for="5-stars-${i}" class="star">&#9733;</label>
                <input type="radio" id="4-stars-${i}" name="rating-${i}" value="4" ${data[i].rating === 4 ? 'checked' : ''} />
                <label for="4-stars-${i}" class="star">&#9733;</label>
                <input type="radio" id="3-stars-${i}" name="rating-${i}" value="3" ${data[i].rating === 3 ? 'checked' : ''} />
                <label for="3-stars-${i}" class="star">&#9733;</label>
                <input type="radio" id="2-stars-${i}" name="rating-${i}" value="2" ${data[i].rating === 2 ? 'checked' : ''} />
                <label for="2-stars-${i}" class="star">&#9733;</label>
                <input type="radio" id="1-star-${i}" name="rating-${i}" value="1" ${data[i].rating === 1 ? 'checked' : ''} />
                <label for="1-star-${i}" class="star">&#9733;</label>
              </div>
              <button class="edit-review" data-index="${i}">Edit</button>
            </div>`);

          // handle the edit functionality for the review
          reviewElement.find('.edit-review').click(function() {
            var index = $(this).data('index');
            var review = data.reviews[index];

          // populate the review text box and ratings system with the review's text and rating
          $('#review').val(review.text);
          $(`input[name="rating"][value="${review.rating}"]`).prop('checked', true);
          });

          // append the review element to the review and ratings element
          $('.review-and-ratings').prepend(reviewElement);
        }
    }

    $("form").submit(async function (event) {
        // prevent the form from submitting the default way
        event.preventDefault();

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
              if (data.length !== 0) {
                showNutritionLabel(data);
              }
              else {
                alert("No recipe found!");
              }
              // console.log(data);
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