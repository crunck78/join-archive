let assignments = [];

function handleLoad() {
    firebase.auth().onAuthStateChanged(handleUserAuthState);
}

async function handleUserAuthState(user) {
    if (user) {
        await initBacklog(user);
    } else {
        redirectToStart();
    }
}

async function initBacklog(user){
    includeHTML();
    initNavBar(user);
    await refreshBacklog(); 
}

async function refreshBacklog(){
    await setTasks();
    await setUsers();
    setAssignments();
    fillContainer("", "assignments-list", assignments, generateAssignmentHTML);
}

function setAssignments() {
    tasks.forEach(task => {
        task.assignTo.forEach(assignment => {
            const tmpAssigment = users.find( user => user.uid == assignment);
            assignments.push({ user: tmpAssigment, task: task });
        });
    });
    return "Hallo";
}

function generateAssignmentHTML(assignment) {
    return `
    <div class="task-card" style="border-left: 10px solid ${assignment.ref.task.highlight}">
        <div class="assigne-info">
            <img id="assigne-img${assignment.ref.user.uid}" class="border-box-circle assigne-img" src="${assignment.ref.user.photoURL || 'assets/img/profile.png'}" alt="${assignment.ref.user.displayName}" title="${assignment.ref.user.email}">
            <div class="flex-col assignment-name-mail ml-10 mr-10">
                <span id="assigne-name">${assignment.ref.user.displayName}</span>
                <a href="mailto: ${assignment.ref.user.email}" id="assigne-mail">${assignment.ref.user.email}</a>
            </div>
        </div>
        <span id="task-category" class="task-category">${assignment.ref.task.category}</span>
        <p id="task-details" class="task-details" title="${assignment.ref.task.description}">${assignment.ref.task.description}</p>
    </div>`;
}