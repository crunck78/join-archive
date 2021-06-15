let selectedMembers = [];
let unselectedMembers = [];

function init() {
    includeHTML();
    tasks = getTasks();
    setDateMinToToday();
}

function setDateMinToToday(){
    let today = new Date();
    let DD = today.getDate();
    let MM = today.getMonth() + 1;
    let YYYY = today.getFullYear();
    if(DD < 10) DD = "0" + DD;
    if( MM < 10) MM = "0" + MM;
    today = `${YYYY}-${MM}-${DD}`;
    console.log(today);
    document.getElementById("date-field").setAttribute("min", today);
}

function getHighlight(urgency){
    switch (urgency){
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

function createTask(event, form) {
    let title = document.getElementById("title-field");
    let category = document.getElementById("category-field");
    let description = document.getElementById("description-field");
    let duedate = document.getElementById("date-field");
    let urgency = document.getElementById("urgency-field");

    let newTask =  {
        listed: false,
        title: title.value,
        category: category.value,
        description: description.value,
        duedate: duedate.value,
        urgency: urgency.value,
        assignTo: selectedMembers,
        id: getNewIdForCollection(tasks),
        highlight: getHighlight(urgency.value)
    };

    tasks.push(newTask);
    saveTasks();

    title.value = "";
    category.value = "";
    description.value = "";
    duedate.value = "";
    urgency.value = "";

    selectedMembers = [];
    fillContainer("", "selected-users-list", selectedMembers, generateSelectedUserView);

    showTaskCreatedFeedback();

    return false;
}

function showTaskCreatedFeedback() {
    const feedbackCard = document.getElementById("feedback-taskcreated");
    feedbackCard.style.display = "unset";
    setTimeout(() => feedbackCard.style.display = "none", 2000);
}

function showUnselectedMembers() {
    let  unselected = users.filter( (user)=> {
        // filter out (!) items in selectedMembers
        return !selectedMembers.some( (selectedMember)=> {
            return user.id === selectedMember.id;          // assumes unique id
        });
    });
    fillContainer("Select A Member", "members-list", unselected, generateMemberHTML);
}

function generateMemberHTML(member) {
    return `
    <div onclick='closeDialogById("members-list-dialog"); insertMember(${member.ref.id})' class="member-info">
        ${member.ref.id}
        <img class="border-box-circle" src="${member.ref.img}" alt="">
        <div class="flex-col">
            <span id="assigne-name">${member.ref.name}</span>
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
    ${selectedUser.ref.id}
    <div style="position: relative">
        <img onclick='removeMember(${selectedUser.index})' class="remove-selected" src="assets/img/minus-5-48.png">
        <img class="border-box-circle selected-user" src="${selectedUser.ref.img}">
    </div>
    `;
}

function removeMember(selectedUserIndex) {
    selectedMembers.splice(selectedUserIndex, 1);
    fillContainer("", "selected-users-list", selectedMembers, generateSelectedUserView);
}