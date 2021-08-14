/**
 * Includes all Templates. Adds an observer for changes to the user's sign-in state.
 * If user is signed in,
 * If no user is sign in starts the Authentication UI
 */
function init() {
    includeHTML();

    firebase.auth().onAuthStateChanged(function (user) {
        initNavBar(user);
        if (user) {
            console.log(user);
            // User is signed in.
            //window.location.assign("addTask.html");
        } else {
            // No user is signed in.
            // The start method will wait until the DOM is loaded.
            ui.start('#firebaseui-auth-container', uiConfig);
        }
    });
}
