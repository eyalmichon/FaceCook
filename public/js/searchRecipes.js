$(document).ready(function () {
    $("#searchTerm").autocomplete({
        source: function (request, response) {
            $.ajax({
                url: "/search",
                type: "GET",
                data: {
                    type: "recipe",
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
});