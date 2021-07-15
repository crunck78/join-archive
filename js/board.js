let lists;

function init() {
    includeHTML();
    initNavBar();
    tasks = getTasks();
    lists = getLists();
    setListContainerHTML();
}

function generateListHTML(list) {
    return `
    <div class="list-card">
        <input class="${getTitleInputDisplay(list.ref.title)}" onfocusout="setTitle(event, this, ${list.index})" id="list-input${list.index}" onchange="setTitle(event, this, ${list.index})" value="${list.ref.title}" placeholder="Enter List Title">
        <span onclick="showTitleInput('list-input${list.index}')" id="list-title${list.index}" class="list-title">${list.ref.title}</span>
        <div class="list-content">
            <div id="tickets-container${list.ref.id}">
                
            </div>
            <div onclick="openDialog('tasks-list-dialog'); selectTaskDialog(${list.index})" class="">+ Add a Task </div>
        </div>
        <img onclick='removeList(${list.index})' class="remove-selected" src="assets/img/minus-5-48.png">
    </div>
    `;
}

function getTitleInputDisplay(title) {
    return title ? "d-none" : "";
}

function showTitleInput(id) {
    document.getElementById(id).classList.remove("d-none");
    document.getElementById(id).focus();
}

function setTitle(event, inputRef, listIndex) {
    const list = lists[listIndex];
    inputRef.value = inputRef.value.trim();
    if(inputRef.value){
        list.title = inputRef.value;
        document.getElementById(`list-title${listIndex}`).innerHTML = list.title;
        saveLists();
        inputRef.classList.add("d-none");

    } 
}

function selectTaskDialog(listIndex) {
    let unlisted = tasks.filter(task => !task.listed);
    fillContainer("Select Task Ticket", "tasks-list", unlisted, generateSelectTasksView, listIndex);
}

function generateSelectTasksView(task) {
    return `
    <div onclick='closeDialogById("tasks-list-dialog"); insertTask(${task.ref.id}, ${task.data})' class="member-info">
        ${task.ref.id}, ${task.ref.title}
    </div>
    `;
}

function insertTask(taskId, listIndex) {
    const list = lists[listIndex];
    const task = getElementById(tasks, taskId);
    task.listed = true;
    list.tickes.push(task);
    saveLists();
    saveTasks();
    fillContainer("", `tickets-container${list.id}`, list.tickes, generateTicketHTML);
}

function generateListHeadHTML(list) {
    return `
    <div class="list-head">
    
    </div>
    `;
}

function dragging(elemRef, dragEvent) {
    console.log(dragEvent);
}

function setDragged(ticketId) {
    dragged = ticketId;
}

function setOverDragged(listId) {
    currentOverDragged = listId;
}

function generateTicketHTML(ticket) {
    return `
    <div draggable="true" ondragstart="startDrag(event, this)" ondragend="endDrag(event, this)" class="ticket">
        <div>
            <span class="ticket-name">${ticket.ref.title}</span>
            <span class="ticket-name">${ticket.ref.id}</span>
        </div>
        <div id="ticket-assignments${ticket.ref.id}">
        </div>
    </div>
    `;
}

function endDrag(event, elemRef){
    elemRef.classList.remove("dragged");
}

function startDrag(event, elemRef){
    elemRef.classList.add("dragged");
}

function generateTicketAssignmentsHTML(assignment) {
    return `<img class="assignment-img" src="${assignment.ref.img}">`;
}

function getLists() {
    return JSON.parse(localStorage.getItem('lists')) || [];
}

function saveLists() {
    localStorage.setItem("lists", JSON.stringify(lists));
}

function createList() {
    lists.push({ title: "", id: getNewIdForCollection(lists), tickes: [] });
    saveLists();
    setListContainerHTML();
}

function removeList(listIndex) {
    lists[listIndex].tickes.forEach(ticket => ticket.listed = false);
    saveTasks();

    lists.splice(listIndex, 1);
    saveLists();

    setListContainerHTML();
}

function setListContainerHTML() {
    fillContainer("", "lists-container", lists, generateListHTML);
    lists.forEach(list => fillContainer("", `tickets-container${list.id}`, list.tickes, generateTicketHTML));
}