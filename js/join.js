let tasks;
let users;

/**
 * 
 * @param {string} taskId - firestore task id 
 */
async function deleteUserTask(taskId) {
  try {

  }
  catch (error) {
    console.log(error);
  }
}

async function deleteUserTasks() {
  try {

  }
  catch (error) {
    console.log(error);
  }
}

async function deleteUserLists() {
  try {

  }
  catch (error) {
    console.log(error);
  }
}

async function deleteUserAuthProfile() {
  try {

  }
  catch (error) {
    console.log(error);
  }
}

async function deleteUserFirestoreProfile() {
  try {

  }
  catch (error) {
    console.log(error);
  }
}

async function deleteUserStorage() {
  try {

  }
  catch (error) {
    console.log(error);
  }
}

async function deleteUserJoinProfile() {
  try {
    await deleteUserTasks();
    await deleteUserLists();
    await deleteUserAuthProfile();
    await deleteUserFirestoreProfile();
    await deleteUserStorage();
  }
  catch (error) {
    console.log(`Error deleting User Id ${getCurrentUserId()} Join Profile!`, error);
  }
}

async function setTasks() {
  try {
    let snapshot = await firebase.firestore()
      .collection('users')
      .doc(getCurrentUserId())
      .collection('tasks')
      .get();
    tasks = snapshot.docs.map(doc => doc.data()) || [];
  } catch (error) {
    console.error(error);
  }
}

function getCurrentUserId() {
  return firebase.auth().currentUser?.uid || null;
}

async function setUsers() {
  try {
    let snapshot = await firebase.firestore()
      .collection('users')
      .get();
    users = snapshot.docs.map(doc => doc.data()) || [];
  }
  catch (error) {
    console.error(error);
  }
}

function redirectToStart() {
  //TODO signInFailure must finnish before onAuthStateChanged triggers this line
  window.location.assign("index.html");
}

async function updatePhotoURL(url, id) {
  await firebase.firestore()
    .collection("users")
    .doc(id)
    .update({ photoURL: url });
}