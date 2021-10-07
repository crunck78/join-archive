const MAX_IMG_SIZE = 50000000; //BYTES
const IMG_TYPES = /\.(jfif|jpg|jpeg|png|gif|JFFIF|JPG|JPEG|PNG|GIF|webp|pdf|PDF)$/;

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

function handleNavOpener(mainLinksContainer){
  //TODO CHANGE METHODE
  mainLinksContainer.classList.toggle("d-flex");
}

function setProfileImg(user) {
  document.getElementById("profile-img").src = user["photoURL"] || "assets/img/profile.png";
}

function initNavBar(user) {
  let awaitIncludeHTML = setInterval(() => {
    if (navbarIncluded()) {
      handleNavbarIncluded(user);
      clearInterval(awaitIncludeHTML);
    }
  }, 100);
}

function handleNavbarIncluded(user) {
  if (user) {
    setCurrentLinkSelected();
    setProfileImg(user);
    showContent();
    initImageProcesser();
  } else {
    hideContent();
  }
}

function handleInputFile(e) {
  const file = e.target.files[0];
  e.target.value = null;
  const check = checkFile(file);

  if (check.sizeOk && check.typeOk) {
    const processedFile = processFile(file);
    // upload(e.target.files[0]);
  } else {
    if (!check.sizeOk)
      console.error("SIZE TO LARGE");
    if (!check.typeOk)
      console.error("FORMAT UNACCEPTED");
  }
}

function checkFile(file) {
  return {
    sizeOk: file && file.size < MAX_IMG_SIZE,
    typeOk: file && file.name.toLowerCase().match(IMG_TYPES)
  };
}

function openChooseFileWindow() {
  document.getElementById("img-input").click();
}

function singOut() {
  firebase.auth().signOut().then(function () {
    console.log('Signed Out');
  }, function (error) {
    console.error('Sign Out Error', error);
  });
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