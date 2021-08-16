function init() {
    includeHTML();
    firebase.auth().onAuthStateChanged(handleUserAuthState);
}

function handleUserAuthState(user) {
    initNavBar(user);
    if (user) {
        console.log(user);
    } else {
        SIGNEIN_UI.start('#firebaseui-auth-container', uiConfig);
    }
}
