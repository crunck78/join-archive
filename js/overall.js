const MAX_IMG_SIZE = 5000000; //BYTES
const IMG_TYPES = /\.(jfif|jpg|jpeg|png|gif|JFFIF|JPG|JPEG|PNG|GIF|webp|pdf|PDF)$/;

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
    container.innerHTML = `<div class="empty-container"></div>`;
  }
}

function getElementById(collection, id) {
  return collection.find(elem => elem.uid === id);
}

function getNewIdForCollection(collection) {
  let newId = Math.floor(Math.random() * new Date().getTime());
  console.log(newId);
  return collection.some(elem => elem.uid == newId) ? getNewIdForCollection(collection) : newId;
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
          if (this.status == 200) { elmnt.innerHTML = this.responseText; }
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