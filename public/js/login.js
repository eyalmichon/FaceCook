$(document).ready(function () {
    // if true, show the signin form and hide the signup form and vice versa.
    let showSignUpText = true;
    const form = $('#signForm');
    const signInLink = $('#signLink');

    function changeShowSignUp() {
        if (showSignUpText) {
            form.attr("action", "/createUser");
            signInLink.html('Have an account? <a href="#">Sign In</a>')
            $('#password2').show();
            $('#password2Label').show();
        }
        else {
            form.attr("action", "/login");
            signInLink.html('Don\'t have an account? <a href="#">Sign Up</a>')
            $('#password2').hide();
            $('#password2Label').hide();
        }
        showSignUpText = !showSignUpText;
    }

    signInLink.click(function () {
        changeShowSignUp();
    });

    form.submit(function (event) {
        // Prevent the form from being submitted by default
        event.preventDefault();

        // Select the username and password fields
        const username = $('#name');
        const password = $('#password');
        const password2 = $('#password2');

        if (username.val() === '') {
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: 'Please enter a username'
            });
            return;
        }
        if (password.val() === '') {
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: 'Please enter a password'
            });
            return;
        }

        // Check that the password is at least 3 characters long
        if (!showSignUpText && (password.val().length < 3 || password2.val().length < 3)) {
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: 'Password must be at least 3 characters long'
            });
            return;
        }

        // Check that the passwords match if the user is signing up
        if (!showSignUpText && password.val() !== password2.val()) {
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: 'Passwords do not match'
            });
            return;
        }

        // check that the username exists in the database and the password matches
        // if it does not, display an error message
        // if it does, display a success message and wait for it to close before submitting the form
        $.ajax({
            url: form.attr('action'),
            type: form.attr('method'),
            data: form.serialize(),
            success: function (response) {
                console.log(response);
                if (response.status === 200 || response.status === 201) {
                    Swal.fire({
                        icon: 'success',
                        title: 'Success',
                        text: 'Logging in...',
                        timer: 1500,
                        showConfirmButton: false
                    }).then(function () {
                        // redirect to the home page
                        window.location.href = '/';
                    });
                }
                else {
                    //bad login text
                    Swal.fire({
                        icon: 'error',
                        title: 'Error',
                        text: 'Wrong username or password'
                    });
                }
            }
        });
    });
});

