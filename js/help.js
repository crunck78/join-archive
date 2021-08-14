function init() {
    includeHTML();
    firebase.auth().onAuthStateChanged(function (user) {
        initNavBar(user);
        if (user) {
            // User is signed in.
            
        } else {
            // No user is signed in.
            //window.location.assign("index.html");
        }
    });
}