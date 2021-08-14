let selectedMembers = [];
let unselectedMembers = [];

let trashNotes = [];
let trashTitles = [];
let toDeleteIndex = 0;

function init() {
    firebase.auth().onAuthStateChanged(handleUserAuthState);
}

async function handleUserAuthState(user) {
    if (user) {
        loggedInUser = user;
        await initAddTask(loggedInUser);
    } else {
        loggedInUser = undefined;
        redirectToStart();
    }
}

async function initAddTask(user) {
    includeHTML();
    initNavBar(user);
    setDateMinToday();
    await setTasks(user.uid);
    await setUsers();
}

/**
 * Restricts calendar picker attribute min to date Today
 */
function setDateMinToday() {
    let today = new Date();
    let DD = today.getDate();
    let MM = today.getMonth() + 1;
    let YYYY = today.getFullYear();
    if (DD < 10) DD = "0" + DD;
    if (MM < 10) MM = "0" + MM;
    today = `${YYYY}-${MM}-${DD}`;
    console.log("Today", today);
    document.getElementById("date-field").setAttribute("min", today);
}

/**
 * Help function
 * Returns color name depending on  urgencies value
 * @param { string } urgency - The selected urgency option.
 * @returns { string }  Color name
 */
function getHighlight(urgency) {
    switch (urgency) {
        case "low":
            return "green";
        case "middle":
            return "yellow";
        case "high":
            return "red";
        default:
            return "blue";
    }
}

/**
 * Returns an Object with FormData.entries from @param form and resets the @param form.
 * (Warnning) Disabled Fields will not be included to FormData.entries
 * @param { HTMLFormElement } form - The HTMLFormElement to read FormData.entries from
 * @returns { {...} } Returns an object created by key-value entries for properties and methods
 */
function getFormTaskData(form) {
    const data = new FormData(form);
    const value = Object.fromEntries(data.entries());
    return value;
}

/**
 * Creates a Task structure.
 * @param { {title: string, category: string, description: string, date: Date, urgency: string} } data - Data fields values from a HTMLFormElement 
 * @returns { {listed: boolean, title: string, category: string, description: string, duedate: Date, urgency: string, assignTo: Object[], uid: number, highlight: string, currentList: string } } A new Task structure
 */
function createTask(data, id) {
    return {
        author: getCurrentUserId(),
        listed: false,
        title: data.title,
        category: data.category,
        description: data.description,
        duedate: data.date,
        urgency: data.urgency,
        assignTo: selectedMembers.map((selectedMember) => selectedMember.uid),
        highlight: getHighlight(data.urgency),
        currentList: "",
        id: id
    };
}

async function handleSubmit(event) {
    event.preventDefault();
    let formData = getFormTaskData(event.target);
    let newTaskRef = firebase.firestore().collection("tasks").doc();
    let newTask = createTask(formData, newTaskRef.id);
    await newTaskRef.set(newTask);
    await setTasks();
    selectedMembers = [];
    fillContainer("", "selected-users-list", selectedMembers, generateSelectedUserView);
    showTaskCreatedFeedback();
    event.target.reset();
}

function showTaskCreatedFeedback() {
    const feedbackCard = document.getElementById("feedback-taskcreated");
    feedbackCard.style.display = "unset";
    setTimeout(() => feedbackCard.style.display = "none", 2000);
}

function showUnselectedMembers() {
    let unselected = users.filter((user) => {
        // filter out (!) items in selectedMembers
        return !selectedMembers.some((selectedMember) => {
            return user.uid === selectedMember.uid;          // assumes unique id
        });
    });
    fillContainer("Select A Member", "members-list", unselected, generateMemberHTML);
}

/**
 * @param { object } member - 
 * @returns - 
 */
function generateMemberHTML(member) {
    return `
    <div title="${member.ref.uid}" onclick='closeDialogById("members-list-dialog"); insertMember(${JSON.stringify(member.ref.uid)})' class="member-info">
        
        <img class="border-box-circle" src="${member.ref.photoURL}" alt="">
        <div class="flex-col">
            <span id="assigne-name">${member.ref.displayName}</span>
            <span id="assigne-mail">${member.ref.email}</span>
        </div>
    </div>
    `;
}

function insertMember(memberId) {
    const member = getElementById(users, memberId);
    if (!selectedMembers.includes(member)) {
        selectedMembers.push(member);
        fillContainer("", "selected-users-list", selectedMembers, generateSelectedUserView);
    }
}

function generateSelectedUserView(selectedUser) {
    return `
   <!-- ${selectedUser.ref.uid} -->
    <div style="position: relative">
        <img onclick='removeMember(${selectedUser.index})' class="remove-selected" src="assets/img/minus-5-48.png">
        <img title="${selectedUser.ref.displayName}" class="border-box-circle selected-user" src="${selectedUser.ref.photoURL}">
    </div>
    `;
}

function removeMember(selectedUserIndex) {
    selectedMembers.splice(selectedUserIndex, 1);
    fillContainer("", "selected-users-list", selectedMembers, generateSelectedUserView);
}