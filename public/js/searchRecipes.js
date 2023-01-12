

$(document).ready(function () {
  function showError(error) {
    Swal.fire({
      icon: 'error',
      title: 'Error',
      text: error
    });
  }

  function showSuccess(message) {
    Swal.fire({
      icon: 'success',
      title: 'Success',
      text: message
    });
  }


  function showNutritionLabel(data) {
    let nutritionLabelContainer = $('<div class="nutrition-label-container"></div>');
    let ing_ins_container = $('<div class="ing-ins-container"></div>');


    // remove the nutrition label if it already exists
    $('.nutrition-label-container').remove();
    $('.ing-ins-container').remove();


    let ingredientsContainer = $('<div class="ingredients-container"></div>');
    let instructionsContainer = $('<div class="instructions-container"></div>');



    // create ingredients container
    ingredientsContainer.append('<p><strong>Ingredients:</strong></p>');
    let ingredientsList = $('<ol class="ingredients-list"></ol>');
    JSON.parse(data[0].ingredients).forEach(ingredient => {
      console.log(ingredient);
      ingredientsList.append(`<li>${ingredient.food_name} - ${ingredient.quantity.toFixed(3)} ${ingredient.unit} </li>`);
    });
    ingredientsContainer.append(ingredientsList);

    // create instructions container
    instructionsContainer.append('<p><strong>Instructions:</strong></p>');
    let instructionsList = $('<ol class="instructions-list"></ol>');
    JSON.parse(data[0].instructions).forEach(instruction => {
      instructionsList.append(`<li>(${instruction.step}) ${instruction.instruction}</li>`);
    });
    instructionsContainer.append(instructionsList);
    // create instructions and ingredients container
    ing_ins_container.append(instructionsContainer);
    ing_ins_container.append(ingredientsContainer);

    // create a new element for the nutrition label
    let nutritionLabel = $('<div class="nutrition-label">\
        <h3>Nutrition Facts</h3>\
        <hr>\
        <p>Category: <span class="category"></span></p>\
        <p>Description: <span class="description"></span></p>\
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
    let reviewAndRatings = $('<form id="addReviewForm" action="/addReview" method="POST">\
        <div class="review-and-ratings">\
        <textarea id="review" name="reviewText" style="height: 100px; width: 700px;"></textarea>\
        <button id="addReviewButton" type="submit">Add Review</button>\
        <div id="star-rating" class="star-rating">\
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
        </div>\
        </form>');

    // append the review and ratings to the nutrition label container
    nutritionLabelContainer.append(nutritionLabel);
    nutritionLabelContainer.append(reviewAndRatings);

    // append the nutrition label container to the body
    $("body").append(ing_ins_container);
    $("body").append(nutritionLabelContainer);

    // Add event listener to the form on submit
    $('#addReviewForm').submit(function (event) {
      event.preventDefault();
      let recipeName = $('#searchTerm').val();
      let review = event.target.reviewText.value;
      let rating = event.target.rating.value;

      if(rating == null || rating == undefined || rating == ""){
        rating = 0;
      }
      
      console.log(recipeName, review, rating);
      // send the review and rating to the server
      fetch('/addReview', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          recipeName: recipeName,
          review: review,
          rating: rating
        })
      }) //handle errors
        .then(response => response.json())
        .then(async response => {
          if (response.error) {
            showError('An error occurred while adding the review. Please try again later.');
            return;
          }
          if(response.status == 500)
            showError(response.message)
          
          if(response.status == 200){
            showSuccess(response.message);
            let recipeWithReviews = await getRecipeWithReviews(recipeName);
            showNutritionLabel(recipeWithReviews);
          }
        })
        .catch(error => {
          console.log(error);
          return;
        });
    });

    // set the nutrition label values
    $('.category').text(data[0].category);
    $('.description').text(data[0].description);
    $('.sodium').text(data[0].sodium.toFixed(2));
    $('.total_fat').text(data[0].total_fat.toFixed(2));
    $('.carbohydrates').text(data[0].carbohydrates.toFixed(2));
    $('.protein').text(data[0].protein.toFixed(2));
    $('.calories').text(data[0].kcal.toFixed(2));
    $('.sugars').text(data[0].sugars.toFixed(2));
    $('.saturated_fat').text(data[0].saturated_fat.toFixed(2));


    reviews = JSON.parse(data[0].reviews);
    // loop through the reviews array
    for (let i = 0; i < reviews.length; i++) {
      let review = reviews[i].review;

      // create a new element for the review and ratings system
      let reviewElement = $(`<div class="review">
            <p>${review}</p>
            <div class="star-rating">
              <!-- display the review's rating using text characters -->
              ${'&#9733;'.repeat(reviews[i].rating)}
            </div>`);

      // handle the edit functionality for the review
      reviewElement.find('.edit-review').click(function () {
        let index = $(this).data('index');
        let review = data.reviews[index];

        // populate the review text box and ratings system with the review's text and rating
        $('#review').val(review.text);
        $(`input[name="rating"][value="${review.rating}"]`).prop('checked', true);
      });

      // append the review element to the review and ratings element
      $('.review-and-ratings').prepend(reviewElement);
    }
  }

  // function to get the recipe with reviews
  function getRecipeWithReviews(searchTerm){
    return fetch('/getRecipeWithReviews', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        search: $('#searchTerm').val(),
      })
    })
      .then(response => response.json())
  }

  // function to show the nutrition label
  $("#searchForm").submit(async function (event) {
    // prevent the form from submitting the default way
    event.preventDefault();

    // get the recipe with reviews
    getRecipeWithReviews(event.target.searchTerm.value)
      .then(data => {
        if (data.error) {
          throw new Error(data.error);
        }
        if (data.length !== 0) {
          showNutritionLabel(data);
        }
        else {
          showError('No recipe found!');
        }
        // console.log(data);
      })
      .catch(error => {
        console.log(error);
        return;
      });

  });


    // function to show the nutrition label
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

  $("#ingredient-filter").autocomplete({
    source: getIngredientsByTerm,
    minLength: 2
});

  // function to show the nutrition label
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