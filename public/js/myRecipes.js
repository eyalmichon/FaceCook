document.addEventListener('DOMContentLoaded', () => {
    getUserRecipes();

});

function getUserRecipes() {
    fetch('/getUserRecipes')
        .then(response => response.json())
        .then(results => {
            // get the recipes div
            const recipesDiv = document.getElementById('gallery');

            // loop through the results and create HTML elements for each recipe
            results.forEach(recipe => {
                // create the div that will contain the recipe
                const recipeDiv = document.createElement('div');
                recipeDiv.classList.add('picture-container', 'col-12', 'col-md-6', 'col-lg-4', 'col-xl-3');

                const carouselDiv = document.createElement('div');
                carouselDiv.classList.add('carousel', 'slide');
                // data-ride
                carouselDiv.setAttribute('data-ride', 'carousel');

                // create the carousel that will contain the images
                const imagesList = document.createElement('div');
                imagesList.classList.add('carousel-inner');

                let images = [];
                if (recipe.image_url && recipe.image_url.startsWith('c'))
                    images = recipe.image_url.slice(2, -2).split(', ').map(image => image.replace(/"/g, ''));
                else
                    images = [recipe.image_url.slice(1, -1)];

                // split the images string into an array and create an img element for each image
                images.length ? images.forEach((imageUrl, i) => {
                    const image = document.createElement('img');
                    image.src = imageUrl || "./images/Recipe_Placeholder_Image.jpg";
                    image.alt = recipe.name;
                    image.classList.add('d-block', 'w-100');
                    const divImage = document.createElement('div');
                    // add the active class to the first image
                    if (i === 0)
                        divImage.classList.add('carousel-item', 'active');
                    else
                        divImage.classList.add('carousel-item');
                    divImage.appendChild(image);
                    imagesList.appendChild(divImage);

                }) : imagesList.innerHTML = `<img src="./images/Recipe_Placeholder_Image.jpg" alt="${recipe.name}" class="d-block w-100">`;

                carouselDiv.appendChild(imagesList);

                // create the elements for the recipe name and number of reviews
                const name = document.createElement('h3');
                name.textContent = recipe.name;
                const reviews = JSON.parse(recipe.reviews).reviews;
                const reviewsElement = document.createElement('p');
                reviewsElement.textContent = reviews.length ? `${reviews.length} reviews with ${((reviews.reduce((acc, review) => acc + review.rating, 0) / reviews.length).toFixed(2)).replace('.00', '')} ⭐` : 'No reviews yet';

                recipeDiv.setAttribute('data-toggle', 'modal');
                recipeDiv.setAttribute('data-target', '#myModal');

                // add the event listener to the recipe div
                recipeDiv.addEventListener('click', () => {
                    // get the modal title and body elements
                    const modalTitle = document.querySelector('.modal-title');
                    const modalBody = document.querySelector('.modal-body');

                    // set the title and body content
                    modalTitle.textContent = recipe.name;
                    modalBody.innerHTML = `
                        ${carouselDiv.outerHTML}
                        <p><strong>Description:</strong></p>
                        ${recipe.description}
                        <br>
                        <br>
                        <p><strong>Reviews:</strong></p>
                        ${reviews.map(review => `${'⭐'.repeat(review.rating)} ${review.review}`).join('<br><br>')}
                    `;
                    $('.carousel').carousel();
                });

                // append the elements to the recipe div
                recipeDiv.appendChild(carouselDiv);
                recipeDiv.appendChild(name);
                recipeDiv.appendChild(reviewsElement);

                // append the recipe div to the recipes div
                recipesDiv.appendChild(recipeDiv);
            });
        }).then(() => {
            $('.carousel').carousel();
        })
}