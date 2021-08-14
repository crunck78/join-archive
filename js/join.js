let loggedInUser;
let tasks;
let users;

async function setTasks(id) {
  try{
    let snapshot = await firebase.firestore().collection('tasks').where("author", "==", id).get();
    tasks = snapshot.docs.map(doc => doc.data()) || [];
  }catch(error){
    console.error(error);
  }
}

function getCurrentUserId(){
  return firebase.auth().currentUser.uid;
}

async function setUsers(){
  try {
    let snapshot = await firebase.firestore().collection('users').get();
    users = snapshot.docs.map(doc => doc.data()) || [];
  }
  catch (error) {
    console.error(error);
  }
}

function setCurrentLinkSelected() {
  const navbarLinks = Array.from(document.getElementById("links-container").childNodes);
  const current = navbarLinks.find(navbarLink => navbarLink.baseURI == navbarLink.href);
  if (current)
    current.classList.add("current-link");
}

function navbarIncluded() {
  return document.getElementById("nav-bar");
}

function showContent() {
  document.getElementById("links-container").classList.remove("d-none");
  document.getElementById("profile-logout").classList.remove("d-none");
}

function hideContent() {
  document.getElementById("links-container").classList.add("d-none");
  document.getElementById("profile-logout").classList.add("d-none");
}

function setProfileImg(user) {
  document.getElementById("profile-img").src = user["photoURL"] || "assets/img/profile.png";
}

function initNavBar(user) {
  let awaitIncludeHTML = setInterval(() => {
    if (navbarIncluded()) {
      if (user) {
        setCurrentLinkSelected();
        setProfileImg(user);
        showContent();
      } else {
        hideContent();
      }
      clearInterval(awaitIncludeHTML);
    }
  }, 100);
}

function openChooseFileWindow() {
  document.getElementById("img-input").click();
}

function updatePhotoURL(url, id) {
  firebase.firestore().collection("users").doc(id).update({ photoURL: url });
}

function uploadImg(e) {
  const file = e.target.files[0];

  console.log(e);
  const check = checkFile(file);
  document.getElementById("img-input").value = null;
  if (check.sizeOk && check.typeOk) {
    console.log("FILE OK");
    const processedFile = processFile(file);
    // upload(e.target.files[0]);

  } else {
    if (!check.sizeOk)
      console.log("SIZE TO LARGE");
    if (!check.typeOk)
      console.log("FORMAT UNACCEPTED");
  }
}

function processFile(file) {

  const fr = new FileReader();
  const img = new Image();
  fr.onload = function () {
    img.src = fr.result;
    img.onload = function () {
      const cnvImg = document.getElementById("processer-cnv-img");
      const cnvAvatar = document.getElementById("processer-cnv-avatar");
      cnvImg.width = img.width;
      cnvImg.height = img.height;
      cnvAvatar.width = img.width;
      cnvAvatar.height = img.height;
      const ctxImg = cnvImg.getContext("2d");
      const ctxAvatar = cnvImg.getContext("2d");

      ctxAvatar.globalAlpha = 0.2;
      ctxAvatar.fillRect(0, 0, cnvAvatar.width, cnvAvatar.height);
      ctxAvatar.globalAlpha = 1.0;


      // ctxAvatar.beginPath();
      // ctxAvatar.arc(100, 75, 50, 0, 2 * Math.PI);
      // ctxAvatar.clip();
      // ctxAvatar.clearRect(0, 0, cnvAvatar.width, cnvAvatar.height);




      //ctx.drawImage(img, 0.2 * (img.width - cnv.width), 0.2 * (img.height - cnv.height), cnv.width, cnv.height, 0, 0, cnv.width, cnv.height);
      ctxImg.drawImage(img, 0, 0, img.width, img.height);
    }
  }
  fr.readAsDataURL(file);

  openDialog("file-processer");

  return;
}

function checkFile(file) {
  return {
    sizeOk: file && file.size < MAX_IMG_SIZE,
    typeOk: file && file.name.toLowerCase().match(IMG_TYPES)
  };
}

function redirectToStart() {
  window.location.assign("index.html");
}

function upload(file) {
  const user = firebase.auth().currentUser;
  console.log(file);
  const storageRef = firebase.storage().ref();

  var metadata = {
    contentType: file.type,
    name: file.name,
    size: file.size
  };

  var uploadTask = storageRef.child('images/' + user.uid).put(file, metadata);

  uploadTask.on(firebase.storage.TaskEvent.STATE_CHANGED, // or 'state_changed'
    (snapshot) => {
      // Get task progress, including the number of bytes uploaded and the total number of bytes to be uploaded
      var progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
      console.log('Upload is ' + progress + '% done');
      switch (snapshot.state) {
        case firebase.storage.TaskState.PAUSED: // or 'paused'
          console.log('Upload is paused');
          break;
        case firebase.storage.TaskState.RUNNING: // or 'running'
          console.log('Upload is running');
          break;
      }
    },
    (error) => {
      // A full list of error codes is available at
      // https://firebase.google.com/docs/storage/web/handle-errors
      switch (error.code) {
        case 'storage/unauthorized':
          // User doesn't have permission to access the object
          break;
        case 'storage/canceled':
          // User canceled the upload
          break;

        // ...

        case 'storage/unknown':
          // Unknown error occurred, inspect error.serverResponse
          break;
      }
    },
    () => {
      // Upload completed successfully, now we can get the download URL
      uploadTask.snapshot.ref.getDownloadURL().then((downloadURL) => {
        console.log('File available at', downloadURL);
        user.updateProfile({
          photoURL: downloadURL
        }).then(() => {
          // Update successful
          // ...
          updatePhotoURL(downloadURL, user.uid);
        }).catch((error) => {
          // An error occurred
          // ...
        });
      });
    }
  );
}