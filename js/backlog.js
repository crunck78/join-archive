let assignments = [];

function init() {
    firebase.auth().onAuthStateChanged(async function (user) {
        if (user) {
            // User is signed in.
            includeHTML();
            initNavBar(user);
            await setTasks(user.uid);
            await setUsers();
            setAssignments();
            fillContainer("", "assignments-list", assignments, generateAssignment);
        } else {
            // No user is signed in.
            window.location.assign("index.html");
        }
    });
}

/**
 * this function does this and this
 * @param { string | number | object | Array } param - 
 * @returns - 
 */
function setAssignments(param) {
    tasks.forEach(task => {
        task.assignTo.forEach(assignment => {
            const tmpAssigment = users.find( user => user.uid == assignment);
            assignments.push({ user: tmpAssigment, task: task });
        });
    });
    return "Hall0";
}

function generateAssignment(assignment) {
    return `
    <div class="task-card" style="border-left: 10px solid ${assignment.ref.task.highlight}">
        <div class="assigne-info">
            <img id="assigne-img" class="border-box-circle" src="${assignment.ref.user.photoURL}" alt="">
            <div class="flex-col assignment-name-mail">
                <span id="assigne-name">${assignment.ref.user.displayName}, ${assignment.ref.user.uid}</span>
                <a href="mailto: ${assignment.ref.user.email}" id="assigne-mail">${assignment.ref.user.email}</a>
            </div>
        </div>
        <span id="task-category" class="task-category">${assignment.ref.task.category}</span>
        <p id="task-details" class="task-details" title="${assignment.ref.task.description}">${assignment.ref.task.description}</p>
    </div>`;
}