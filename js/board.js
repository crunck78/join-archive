let lists;

function handleLoad() {
    firebase.auth().onAuthStateChanged(handleUserAuthState);
}

async function handleUserAuthState(user) {
    if (user) {
        await initBoard(user);
    } else {
        redirectToStart();
    }
}

async function initBoard(user) {
    includeHTML();
    initNavBar(user);
    await refreshBoard();
}

async function handleAddList() {
    let newListRef = firebase.firestore().collection("lists").doc();
    let newList = createList(newListRef.id);
    await newListRef.set(newList);
    await refreshLists();
}

async function refreshLists() {
    await setLists();
    fillListContainers();
}

function createList(id) {
    return {
        title: "",
        uid: id,
        tasks: [], author: getCurrentUserId(),
        created: firebase.firestore.FieldValue.serverTimestamp()
    };
}

function generateListHTML(list) {
    return `
    <div class="list-card">
    <!-- ${list.ref.uid} -->
        <input id="list-input${list.index}" class="${getTitleInputDisplay(list.ref.title)}"
                onfocusout="setListTitle(event, this, ${list.index})" 
                onchange="setListTitle(event, this, ${list.index})" value="${list.ref.title}" placeholder="Enter List Title">
        <span id="list-title${list.index}" onclick="showTitleInput('list-input${list.index}')"  class="list-title">${list.ref.title}</span>
        <div class="list-content">
            <div id="tasks-container${list.ref.uid}">
                
            </div>
            <div onclick='openDialog("tasks-list-dialog"); selectTaskDialog("${list.ref.uid}")' class="">+ Add a Task </div>
        </div>
        <img onclick='removeList("${list.ref.uid}")' class="remove-selected" src="assets/img/minus-5-48.png">
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

async function setListTitle(event, inputRef, listIndex) {
    const list = lists[listIndex];
    inputRef.value = inputRef.value.trim();
    if (inputRef.value && inputRef.value != list.title) {
        await firebase.firestore()
            .collection("lists")
            .doc(list.uid)
            .update({ title: inputRef.value });
        list.title = inputRef.value;
        document.getElementById(`list-title${listIndex}`).innerHTML = list.title;
    }
    if (list.title.length > 0)
        inputRef.classList.add("d-none");
}

function selectTaskDialog(listId) {
    let unlisted = tasks.filter(task => task.currentList == "" && task.listed == false);
    fillContainer("Select Task Ticket", "tasks-list", unlisted, generateSelectTasksHTML, listId);
}

function generateSelectTasksHTML(task) {
    return `
    <!-- ${task.ref.uid} -->
    <div onclick='closeDialogById("tasks-list-dialog"); insertTask("${task.ref.uid}", "${task.data}")' class="member-info">
        ${task.ref.title}
    </div>
    `;
}

async function insertTask(taskId, listId) {
    await firebase.firestore()
        .collection("lists")
        .doc(listId)
        .update({
            tasks: firebase.firestore.FieldValue.arrayUnion(taskId)
        });
    await firebase.firestore()
        .collection("tasks")
        .doc(taskId)
        .update({
            listed: true,
            currentList: listId
        });
    await setLists();
    await setTasks();
    fillContainer("", `tasks-container${listId}`, getListTasks(listId), generateTaskHTML);
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

function generateTaskHTML(task) {
    return `
    <div draggable="true" ondragstart="startDrag(event, this)" ondragend="endDrag(event, this)" class="task">
        <div>
            <span class="task-name">${task.ref.title}</span>
            <span class="task-name">${task.ref.uid}</span>
        </div>
        <div id="ticket-assignments${task.ref.uid}">
        </div>
    </div>
    `;
}

function endDrag(event, elemRef) {
    elemRef.classList.remove("dragged");
}

function startDrag(event, elemRef) {
    elemRef.classList.add("dragged");
}

function generateTaskAssigmentsHTML(assignment) {
    return `<img class="assignment-img" src="${assignment.ref.photoURL || 'assets/img/profile.png'}">`;
}

async function setLists() {
    try {
        let snapshot = await firebase.firestore()
            .collection('lists')
            .where("author", "==", getCurrentUserId())
            .orderBy("created")
            .get();
        lists = snapshot.docs.map(doc => doc.data()) || [];
    } catch (error) {
        console.error(error);
    }
}

async function removeList(listId) {
    await removeTasksFromList(listId);
    await firebase.firestore().collection("lists").doc(listId).delete();
    await refreshBoard();
}

async function removeTasksFromList(listId) {
    let listToRemoveTickets = getListTasks(listId);
    for (let i = 0; i < listToRemoveTickets.length; i++) {
        const ticket = listToRemoveTickets[i];
        await firebase.firestore()
            .collection("tasks")
            .doc(ticket.uid)
            .update({ listed: false, currentList: "" });
    }
}

async function refreshBoard() {
    await setTasksAndLists();
    fillListContainers();
}

async function setTasksAndLists() {
    await setTasks();
    await setLists();
}

function fillListContainers() {
    fillContainer("", "lists-container", lists, generateListHTML);
    fillListTaskContainers();
}

function fillListTaskContainers() {
    lists.forEach((list) => {
        fillContainer("", `tasks-container${list.uid}`, getListTasks(list.uid), generateTaskHTML)
    });
}

function getListTasks(listId) {
    return tasks.filter(task => task.currentList == listId);
}