let selectedMembers = [];

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
        uid: id
    };
}

async function handleSubmit(event) {
    event.preventDefault();
    let formData = getFormTaskData(event.target);
    let newTaskRef = firebase.firestore().collection("tasks").doc();
    let newTask = createTask(formData, newTaskRef.id);
    await newTaskRef.set(newTask);
    await setTasks(getCurrentUserId());
    selectedMembers = [];
    fillContainer("", "selected-members-list", selectedMembers, generateSelectedMemberHTML);
    showTaskCreatedFeedback();
    event.target.reset();
}

function showTaskCreatedFeedback() {
    const feedbackCard = document.getElementById("feedback-taskcreated");
    feedbackCard.style.display = "unset";
    setTimeout(() => feedbackCard.style.display = "none", 2000);
}

function showUnselectedMembers() {
    let unselectedMembers = users.filter((user) => {
        return !selectedMembers.some((selectedMember) => {
            return user.uid === selectedMember.uid;          // assumes unique id
        });
    });
    fillContainer("Select A Member", "members-list", unselectedMembers, generateMemberHTML);
}

function generateMemberHTML(member) {
    return `
    <div title="${member.ref.uid}" onclick='closeDialogById("members-list-dialog"); insertMember(${JSON.stringify(member.ref.uid)})' class="member-info">
        
        <img class="border-box-circle" src="${member.ref.photoURL || 'assets/img/profile.png'}" alt="">
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
        fillContainer("", "selected-members-list", selectedMembers, generateSelectedMemberHTML);
    }
}

function generateSelectedMemberHTML(selectedMember) {
    return `
   <!-- ${selectedMember.ref.uid} -->
    <div style="position: relative">
        <img onclick='removeMember(${selectedMember.index})' class="remove-selected" src="assets/img/minus-5-48.png">
        <img title="${selectedMember.ref.displayName}" class="border-box-circle selected-user" src="${selectedMember.ref.photoURL || 'assets/img/profile.png'}">
    </div>
    `;
}

function removeMember(selectedMemberIndex) {
    selectedMembers.splice(selectedMemberIndex, 1);
    fillContainer("", "selected-members-list", selectedMembers, generateSelectedMemberHTML);
}