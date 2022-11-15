function handleLoad() {
    //firebase.auth().onAuthStateChanged(handleUserAuthState);
    handleUserAuthState(false);
}


async function handleUserAuthState(user) {
    if (user) {
        redirectToStart();
    } else {
        await initRegister();
    }
}

async function initRegister(user) {
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
    if(formData.get('password') !== formData.get('confirmpassword')){
        console.error("PASSWORD CONFIRMATION DOES NOT MATCH!");
        return;
    }
    const response = await fetch(`${API}/register/`, {
        method: 'post',
        body: formData
    });

    event.target.reset();
}