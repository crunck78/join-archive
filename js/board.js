let lists;

function init() {
    firebase.auth().onAuthStateChanged(function (user) {
        if (user) {
            // User is signed in.
            includeHTML();
            initNavBar(user);
            setTasks(user.uid);
            setLists(user.uid);
            setUsers();
        } else {
            // No user is signed in.
            window.location.assign("index.html");
        }
    });
}

function generateListHTML(list) {
    return `
    <div class="list-card">
        <input class="${getTitleInputDisplay(list.ref.title)}" onfocusout="setTitle(event, this, ${list.index})" id="list-input${list.index}" onchange="setTitle(event, this, ${list.index})" value="${list.ref.title}" placeholder="Enter List Title">
        <span onclick="showTitleInput('list-input${list.index}')" id="list-title${list.index}" class="list-title">${list.ref.title}</span>
        <div class="list-content">
            <div id="tickets-container${list.ref.uid}">
                
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
    if (inputRef.value) {
        list.title = inputRef.value;
        document.getElementById(`list-title${listIndex}`).innerHTML = list.title;
        updateLists(firebase.auth().currentUser.uid);
        inputRef.classList.add("d-none");
    }
}

function selectTaskDialog(listIndex) {
    let unlisted = tasks.filter(task => !task.listed);
    fillContainer("Select Task Ticket", "tasks-list", unlisted, generateSelectTasksView, listIndex);
}

function generateSelectTasksView(task) {
    return `
    <div onclick='closeDialogById("tasks-list-dialog"); insertTask(${task.ref.uid}, ${task.data})' class="member-info">
        ${task.ref.uid}, ${task.ref.title}
    </div>
    `;
}

function insertTask(taskId, listIndex) {
    const list = lists[listIndex];
    const task = getElementById(tasks, taskId);
    task.listed = true;
    list.tickes.push(task.uid);
    updateLists(firebase.auth().currentUser.uid);
    updateTasks(firebase.auth().currentUser.uid);
    fillContainer("", `tickets-container${list.uid}`, list.tickes, generateTicketHTML);
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
    const tmpTicket = tasks.find( task => task.uid == ticket.ref)
    return `
    <div draggable="true" ondragstart="startDrag(event, this)" ondragend="endDrag(event, this)" class="ticket">
        <div>
            <span class="ticket-name">${tmpTicket.title}</span>
            <span class="ticket-name">${tmpTicket.uid}</span>
        </div>
        <div id="ticket-assignments${tmpTicket.uid}">
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

function generateTicketAssignmentsHTML(assignment) {
    return `<img class="assignment-img" src="${assignment.ref.photoURL}">`;
}

function setLists(id) {
    // return JSON.parse(localStorage.getItem('lists')) || [];
    firebase.firestore().collection("users").doc(id)
        .get().then((doc) => {
            if (doc.exists) {
                console.log("Document data:", doc.data());
                lists = doc.data()["lists"] || [];
                console.log(lists);
                setListContainerHTML();
            } else {
                // doc.data() will be undefined in this case
                console.log("No such document!");
                lists = [];
            }
        }).catch((error) => {
            console.log("Error getting document:", error);
            lists = [];
        });
}

async function updateLists(uid) {
    await firebase.firestore().collection("users").doc(uid).update({ lists: lists })
    // localStorage.setItem("lists", JSON.stringify(lists));
}

function createList() {
    lists.push({ title: "", uid: getNewIdForCollection(lists), tickes: [] });
    updateLists(firebase.auth().currentUser.uid)
        .then(() => {
            setListContainerHTML();
        })
        .catch(error => {
            console.error(error)
        });
}

function removeList(listIndex) {
    lists[listIndex].tickes.forEach(ticket => {
        const tmpTicket = tasks.find( task => task.uid == ticket );
        tmpTicket.listed = false;
    });
    
    updateTasks(firebase.auth().currentUser.uid);

    lists.splice(listIndex, 1);
    updateLists(firebase.auth().currentUser.uid)
    .then(() => {
        setListContainerHTML();
    })
    .catch(error => {
        console.error(error)
    });
}

function setListContainerHTML() {
    fillContainer("", "lists-container", lists, generateListHTML);
    lists.forEach(list => fillContainer("", `tickets-container${list.uid}`, list.tickes, generateTicketHTML));
}