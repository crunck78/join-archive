function handleLoad() {
    //firebase.auth().onAuthStateChanged(handleUserAuthState);
    handleUserAuthState(false);
}


async function handleUserAuthState(user) {
    if (user) {
        redirectToStart();
    } else {
        await initLogIn();
    }
}

async function initLogIn(user) {
    includeHTML();
    initNavBar(user);
}

/**
 *
 * @param {SubmitEvent} event 
 */
 async function handleSubmit(event) {
    console.log(event);
    event.preventDefault(); 
    const formData = new FormData(event.target);

    const response = await fetch(`${API}/login/`, {
        method: 'get',
        body: formData
    });

    event.target.reset();
}