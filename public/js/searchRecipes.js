$(document).ready(function () {
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