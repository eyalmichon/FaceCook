
// autocomplete for search box
$(document).ready(function () {
    $("#searchTerm").autocomplete({
        source: function (request, response) {
            $.ajax({
                url: "/search",
                type: "GET",
                data: {
                    searchTerm: request.term
                },
                success: function (data) {
                    response(data.slice(0, 10));
                },
                error: function (error) {
                    console.log(error);
                }
            });
        },
        minLength: 2
    });
});
