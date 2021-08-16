let lists;
let draggedTask;

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

async function refreshBoard() {
    await setTasksAndLists();
    fillListContainers();
}

async function setTasksAndLists() {
    await setTasks();
    await setLists();
}

async function handleAddList() {
    let newListRef = firebase.firestore().collection("lists").doc();
    let newList = createList(newListRef.id);
    await newListRef.set(newList);
    await refreshLists();
}

function createList(id) {
    return {
        title: "",
        uid: id,
        tasks: [], author: getCurrentUserId(),
        created: firebase.firestore.FieldValue.serverTimestamp()
    };
}

async function refreshLists() {
    await setLists();
    fillListContainers();
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

function generateListHTML(list) {
    return `
    <div id="list-${list.ref.uid}" class="list-card" 
        ondrop='handleDragDrop(event, "${list.ref.uid}")'
        ondragover="handleDragOver(event)"
        <input id="list-title-input${list.ref.uid}" class="${getTitleInputDisplay(list.ref.title)}"
                onfocusout='setListTitle(event, this, "${list.ref.uid}")' 
                onchange='setListTitle(event, this, "${list.ref.uid}")' value="${list.ref.title}" placeholder="Enter List Title">
        <span id="list-title${list.ref.uid}" onclick='showTitleInput("${list.ref.uid}")'  class="list-title">${list.ref.title}</span>
        <div class="list-content">
            <div id="tasks-container${list.ref.uid}">
                
            </div>
            <div onclick='openDialog("tasks-list-dialog"); selectTaskDialog("${list.ref.uid}")' class="">+ Add a Task </div>
        </div>
        <img onclick='handleListRemove("${list.ref.uid}")' class="remove-selected" src="assets/img/minus-5-48.png">
    </div>
    `;
}

function getTitleInputDisplay(title) {
    return title ? "d-none" : "";
}

function showTitleInput(listId) {
    const listTitleInput = document.getElementById(`list-title-input${listId}`);
    listTitleInput.classList.remove("d-none");
    listTitleInput.focus();
}

async function setListTitle(event, inputRef, listId) {
    const list = lists.find(list => list.uid == listId);
    inputRef.value = inputRef.value.trim();
    if (inputRef.value && inputRef.value != list.title) {
        await updateListTitle(list.uid, inputRef.value);
        refreshListTitle(list, inputRef.value);
    }
    if (list.title.length > 0)
        inputRef.classList.add("d-none");
}

async function updateListTitle(listId, newTitle) {
    await firebase.firestore()
        .collection("lists")
        .doc(listId)
        .update({ title: newTitle });
}

function refreshListTitle(list, value) {
    list.title = value;
    document.getElementById(`list-title${list.uid}`).innerHTML = list.title;
}

function selectTaskDialog(listId) {
    const unlisted = tasks.filter(task => task.currentList == "" && task.listed == false);
    fillContainer("Select Task Ticket", "tasks-list", unlisted, generateSelectTasksHTML, listId);
}

function generateSelectTasksHTML(task) {
    return `
    <!-- ${task.ref.uid} -->
    <div onclick='closeDialogById("tasks-list-dialog"); handleAddTask("${task.ref.uid}", "${task.data}")' class="member-info">
        ${task.ref.title}
    </div>
    `;
}

async function handleAddTask(taskId, listId) {
    await addTaskIdToList(taskId, listId);
    await markTaskAsListed(taskId, listId);
    await refreshList(listId);
}

async function addTaskIdToList(taskId, listId) {
    await firebase.firestore()
        .collection("lists")
        .doc(listId)
        .update({
            tasks: firebase.firestore.FieldValue.arrayUnion(taskId)
        });
}

async function markTaskAsListed(taskId, listId) {
    await firebase.firestore()
        .collection("tasks")
        .doc(taskId)
        .update({
            listed: true,
            currentList: listId
        });
}

async function refreshList(listId) {
    await setTasksAndLists();
    fillContainer("", `tasks-container${listId}`, getListTasks(listId), generateTaskHTML);
}

function generateTaskHTML(task) {
    return `
    <div id="task-${task.ref.uid}" class="task" draggable="true"
        ondragstart='handleDragStart(event, "${task.ref.uid}")'
        <div>
            <span class="task-name">${task.ref.title}</span>
            <span class="task-name">${task.ref.uid}</span>
        </div>
        <div id="task-assignments${task.ref.uid}">
        </div>
    </div>
    `;
}

function handleDragStart(event, taskId) {
    draggedTask = tasks.find(task => task.uid == taskId);
    console.log(draggedTask);
}

function handleDragOver(event) {
    event.preventDefault();
}

async function handleDragDrop(event, listId) {
    if (draggedTask.currentList != listId) {
        await transferTaskToList(listId);
        await refreshBoard();
    }
    draggedTask = undefined;
}

async function transferTaskToList(listId) {
    await firebase.firestore()
        .collection("lists")
        .doc(draggedTask.currentList)
        .update({
            tasks: firebase.firestore.FieldValue.arrayRemove(draggedTask.uid)
        });

    await firebase.firestore()
        .collection("lists")
        .doc(listId)
        .update({
            tasks: firebase.firestore.FieldValue.arrayUnion(draggedTask.uid)
        });
    await firebase.firestore()
        .collection("tasks")
        .doc(draggedTask.uid)
        .update({
            currentList: listId
        });
}

function generateTaskAssigmentsHTML(assignment) {
    return `<img class="assignment-img" src="${assignment.ref.photoURL || 'assets/img/profile.png'}">`;
}

async function handleListRemove(listId) {
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