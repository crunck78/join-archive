function init() {
    includeHTML();
    initNavBar();
    firebase.auth().onAuthStateChanged(function (user) {
        if (user) {
            console.log(user);
            // User is signed in.
            //window.location.assign("addTask.html");
        } else {
            // No user is signed in.
            // The start method will wait until the DOM is loaded.
          
        }
    });
}
