let assignments = [];

function init(){
    includeHTML();
    tasks = getTasks();
    setAssignments();
    fillContainer("", "assignments-list", assignments, generateAssignment);

    
}

function setAssignments(){
    tasks.forEach(task =>{
        task.assignTo.forEach( assignment =>{
            assignments.push({user: assignment, task: task});
        });
    });
}

function generateAssignment(assignment){
    return `
    <div class="task-card" style="border-left: 10px solid ${assignment.ref.task.highlight}">
        <div class="assigne-info">
            <img id="assigne-img" class="border-box-circle" src="${assignment.ref.user.img}" alt="">
            <div class="flex-col assignment-name-mail">
                <span id="assigne-name">${assignment.ref.user.name}, ${assignment.ref.user.id}</span>
                <a href="mailto: ${assignment.ref.user.email}" id="assigne-mail">${assignment.ref.user.email}</a>
            </div>
        </div>
        <span id="task-category" class="task-category">${assignment.ref.task.category}</span>
        <p id="task-details" class="task-details" title="${assignment.ref.task.description}">${assignment.ref.task.description}</p>
    </div>`;
}