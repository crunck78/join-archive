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

function setCurrentLinkSelected() {
  const navbarLinks = Array.from(document.getElementById("links-container").childNodes);
  const current = navbarLinks.find(navbarLink => navbarLink.baseURI == navbarLink.href);
  if (current)
    current.classList.add("current-link");
}

function navbarIncluded() {
  return document.getElementById("nav-bar");
}

function initNavBar() {
  let awaitIncludeHTML = setInterval(() => {
    if (navbarIncluded()) {
      setCurrentLinkSelected();
      clearInterval(awaitIncludeHTML);
    }
  }, 100);
}