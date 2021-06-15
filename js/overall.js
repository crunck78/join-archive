let tasks = [];
const users = [
  {
    id: 0,
    name: "Mihai A. Neacsu",
    email: "crunck78@googlemail.com",
    img: "assets/img/profile.png"
  },
  {
    id: 1,
    name: "Mihai A. Neacsu",
    email: "crunck78@googlemail.com",
    img: "assets/img/profile.png"
  },
  {
    id: 2,
    name: "Mihai A. Neacsu",
    email: "crunck78@googlemail.com",
    img: "assets/img/profile.png"
  },
  {
    id: 3,
    name: "Mihai A. Neacsu",
    email: "crunck78@googlemail.com",
    img: "assets/img/profile.png"
  }
];

function saveTasks() {
  localStorage.setItem("tasks", JSON.stringify(tasks));
}

function getTasks() {
  return JSON.parse(localStorage.getItem("tasks")) || [];
}

function showFeedback(id) {
  document.getElementById(id).style.display = "flex";
}

function hideFeedback(id) {
  document.getElementById(id).style.display = "none";
}

function openDialog(id) {
  document.getElementById(id).style.display = "flex";
}

function closeDialogByRef(ref) {
  ref.style.display = "none";
}

function closeDialogById(id) {
  document.getElementById(id).style.display = "none";
}

function fillContainer(title = "", id, array, toGenerate, data) {
  const container = document.getElementById(id);
  container.innerHTML = title;
  if (array.length > 0)
    array.forEach((elem, index) => container.insertAdjacentHTML("beforeend", toGenerate({ ref: elem, index: index, data: data })));
  else {
    container.innerHTML = `<div class="empty-container">NOTHING TO SHOW</div>`;
  }

}

function getElementById(collection, id) {
  return collection.find(elem => elem.id === id);
}

function getNewIdForCollection(collection) {
  let newId = Math.floor(Math.random() * new Date().getTime());
  console.log(newId);
  return collection.some(elem => elem.id == newId) ? getNewIdForCollection(collection) : newId;
}

function setCurrentLinkSelected() {
  const navbarLinks = Array.from(document.getElementById("links-container").childNodes);
  const current = navbarLinks.find( navbarLink => navbarLink.baseURI == navbarLink.href);
  current.classList.add("current-link");
}

function includeHTML() {
  var z, i, elmnt, file, xhttp;
  /* Loop through a collection of all HTML elements: */
  z = document.getElementsByTagName("*");
  for (i = 0; i < z.length; i++) {
    elmnt = z[i];
    /*search for elements with a certain atrribute:*/
    file = elmnt.getAttribute("w3-include-html");
    if (file) {

      /* Make an HTTP request using the attribute value as the file name: */
      xhttp = new XMLHttpRequest();
      xhttp.onreadystatechange = function () {
        if (this.readyState == 4) {
          if (this.status == 200) {
            elmnt.innerHTML = this.responseText;
            if(file.includes("navbar.html"))
              setCurrentLinkSelected();
          }
          if (this.status == 404) { elmnt.innerHTML = "Page not found."; }
          /* Remove the attribute, and call this function once more: */
          elmnt.removeAttribute("w3-include-html");
          includeHTML();
        }
      }
      xhttp.open("GET", file, true);
      xhttp.send();
      /* Exit the function: */
      return;
    }
  }
}