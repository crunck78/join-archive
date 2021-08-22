let tasks;
let users;

async function setTasks() {
  try {
    let snapshot = await firebase.firestore()
      .collection('tasks')
      .where("author", "==", getCurrentUserId())
      .get();
    tasks = snapshot.docs.map(doc => doc.data()) || [];
  } catch (error) {
    console.error(error);
  }
}

function getCurrentUserId() {
  return firebase.auth().currentUser.uid;
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
  window.location.assign("index.html");
}

async function updatePhotoURL(url, id) {
  await firebase.firestore()
    .collection("users")
    .doc(id)
    .update({ photoURL: url });
}