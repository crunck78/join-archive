//Query Params from url and redirect to board and update list

let selectedMembers = [];

/**
 * 
 */
function handleLoad() {
    firebase.auth().onAuthStateChanged(handleUserAuthState);
}

async function handleUserAuthState(user) {
    if (user) {
        await initAddTask(user);
    } else {
        redirectToStart();
    }
}

async function initAddTask(user) {
    includeHTML();
    initNavBar(user);
    setCalendarMinDateToday();
    await setUsers();
    updateAddTask();
}

function setCalendarMinDateToday() {
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
 * Updates the Add Task HTML View
 */
 function updateAddTask(){
    updateAssignedToView();
}

function updateAssignedToView(){
    if(users.length == selectedMembers.length){
        document.getElementById("add-user").classList.add("d-none");
    }else{
        document.getElementById("add-user").classList.remove("d-none"); 
    }
}


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

function getFormTaskData(form) {
    const data = new FormData(form);
    const value = Object.fromEntries(data.entries());
    return value;
}

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
        uid: id,
        active: false
    };
}

/**
 * 
 * @param {SubmitEvent} event 
 */
async function handleSubmit(event) {
    console.log(event);
    event.preventDefault(); //
    let formData = getFormTaskData(event.target);
    let newTaskRef = getNewTaskRef();
    let newTask = createTask(formData, newTaskRef.id);
    await newTaskRef.set(newTask);
    await setTasks(getCurrentUserId());
    selectedMembers = [];
    fillContainer("", "selected-members-list", selectedMembers, generateSelectedMemberHTML);
    showTaskCreatedFeedback();
    updateAssignedToView();
    event.target.reset();
}

function getNewTaskRef() {
    return firebase.firestore()
        .collection("users")
        .doc(getCurrentUserId())
        .collection("tasks").doc();
}

function showTaskCreatedFeedback() {
    const feedbackCard = document.getElementById("feedback-taskcreated");
    feedbackCard.style.display = "unset";
    setTimeout(() => feedbackCard.style.display = "none", 2000);
}

function showUnselectedMembers() {
    fillContainer("Select A Member", "members-list", getUnselectedMembers(), generateMemberHTML);
}

function getUnselectedMembers(){
    return users.filter((user) => {
        return !selectedMembers.some((selectedMember) => {
            return user.uid === selectedMember.uid;          // assumes unique id
        });
    });
}

function generateMemberHTML(member) {
    return `<!--html-->
    <div title="${member.ref.uid}" onclick='handleMemberSelection(${JSON.stringify(member.ref.uid)})' class="member-info">
        <img class="border-box-circle" src="${member.ref.photoURL || 'assets/img/profile.png'}" alt="">
        <div class="flex-col">
            <span id="assigne-name">${member.ref.displayName}</span>
            <span id="assigne-mail">${member.ref.email}</span>
        </div>
    </div>
    `;
}

function handleMemberSelection(memberUid){
    closeDialogById("members-list-dialog");
    insertMember(memberUid);
    updateAssignedToView();
}

function insertMember(memberId) {
    const member = getElementById(users, memberId);
    if (!selectedMembers.includes(member)) {
        selectedMembers.push(member);
        fillContainer("", "selected-members-list", selectedMembers, generateSelectedMemberHTML);
    }
}

/**
 * @returns HTML string placeholder
 */
 function generateNoMembersHTML() {
    return `<!--html-->
        <div>
            
        </div>
    `;

}

function generateSelectedMemberHTML(selectedMember) {
    return `<!--html-->
    <div style="position: relative">
        <img onclick='handleMemberRemove(${selectedMember.index})' class="remove-selected" src="assets/img/minus-5-48.png">
        <img title="${selectedMember.ref.displayName}" class="border-box-circle selected-user" src="${selectedMember.ref.photoURL || 'assets/img/profile.png'}">
    </div>
    `;
}

function handleMemberRemove(selectedMemberIndex){
    removeMember(selectedMemberIndex);
    updateAssignedToView();
}

function removeMember(selectedMemberIndex) {
    selectedMembers.splice(selectedMemberIndex, 1);
    fillContainer("", "selected-members-list", selectedMembers, generateSelectedMemberHTML);
}

function handleAddMember() {
    openDialog('members-list-dialog', showUnselectedMembers);
}