let contentContainer;

let cnvImg;
let cnvAvatar;
let cnvContainer;

let ctxImg;
let ctxAvatar;

let fr;
let img;

let draggingImg = false;

let avatarArcRadius = 640;

function initIamgeProcesser() {

  fr = new FileReader();
  fr.addEventListener("load", handleFileReaderLoad);

  img = new Image();
  img.addEventListener("load", handleImgLoad);

  contentContainer = document.getElementById("content-container");
  cnvContainer = document.getElementById("cnv-container");

  cnvImg = document.getElementById("processer-cnv-img");
  cnvAvatar = document.getElementById("processer-cnv-avatar");
  cnvAvatar.addEventListener("mousedown", handleCanvasMouseDown);
  cnvAvatar.addEventListener("mouseup", handleCanvasMouseUp);
  cnvAvatar.addEventListener("mousemove", handleCanvasMouseMove);
  cnvAvatar.addEventListener("mouseenter", handleCanvasMouseEnter);
  cnvAvatar.addEventListener("mouseleave", handleCanvasMouseLeave);

  ctxImg = cnvImg.getContext("2d");
  ctxAvatar = cnvAvatar.getContext("2d");

  window.addEventListener("resize", handleImgLoad);

}

function handleCanvasMouseLeave() {
  cnvAvatar.style.cursor = "unset";
}

function handleCanvasMouseEnter() {
  cnvAvatar.style.cursor = "move";
}

function handleCanvasMouseMove() {
  console.log("Dragging Image: ", draggingImg);
}

function handleCanvasMouseUp() {
  draggingImg = false;
}

function handleCanvasMouseDown() {
  draggingImg = true;
}

function handleFileReaderLoad() {
  img.src = fr.result;
}

function handleWindowResize() {

}

function handleImgLoad() {

  let contentHeight = contentContainer.getBoundingClientRect().height;
  let contentWidth = contentContainer.getBoundingClientRect().width;

  cnvContainer.style = "";
  
  if (img.width / img.height > contentWidth / contentHeight) {
    cnvContainer.style.height = `${contentHeight}px`;
    cnvContainer.style.width = `${img.width / (img.height / contentHeight)}px`;
    cnvContainer.style.left = `${(contentWidth - (img.width / (img.height / contentHeight))) / 2}px`;
  }
  else {
    cnvContainer.style.width = `${contentWidth}px`;
    cnvContainer.style.height = `${img.height / (img.width / contentWidth)}px`;
    cnvContainer.style.top = `${(contentHeight - (img.height / (img.width / contentWidth))) / 2}px`;
  }

  cnvImg.width = img.width;
  cnvImg.height = img.height;

  cnvAvatar.width = img.width;
  cnvAvatar.height = img.height;

  drawImgAndAvatar();
}

function drawImgAndAvatar() {
  drawAvatar();
  drawImage();
}

function drawImage() {
  ctxImg.drawImage(img, 0, 0, cnvImg.width, cnvImg.height);
}

function drawAvatar() {
  drawAvatarBackground();
  drawAvatarMiddleCircle();
}

function drawAvatarMiddleCircle() {
  ctxAvatar.beginPath();
  ctxAvatar.arc(cnvAvatar.width / 2, cnvAvatar.height / 2, avatarArcRadius, 0, 2 * Math.PI);
  ctxAvatar.clip();
  ctxAvatar.clearRect(0, 0, cnvAvatar.width, cnvAvatar.height);
}

function drawAvatarBackground() {
  ctxAvatar.globalAlpha = 0.8;
  ctxAvatar.fillRect(0, 0, cnvAvatar.width, cnvAvatar.height);
  ctxAvatar.globalAlpha = 1.0;
}

function handleZoomIn() {
  console.log("Handle Zoom In");
  ctxImg.scale(1.2, 1.2);
  ctxImg.drawImage(img, 0, 0, cnvImg.width, cnvImg.height);
}

function handleZoomOut() {
  console.log("Handle Zoom Out");
  ctxImg.scale(0.8, 0.8);
  ctxImg.drawImage(img, 0, 0, cnvImg.width, cnvImg.height);
}

function handleCheck() {
  let imgData = ctxImg.getImageData((img.width - 640) / 2, (img.height - 640) / 2, 640, 640);
  console.log(imgData);

  let createImgCnv = document.createElement("canvas");
  createImgCnv.width = 640;
  createImgCnv.height = 640;
  createImgCnv.getContext("2d").putImageData(imgData, 0, 0);
  let newImg = createImgCnv.toDataURL("image/jpg");
  document.write('<img src="' + newImg + '"/>');
}

function processFile(file) {
  fr.readAsDataURL(file);
  openDialog("file-processer");
  return;
}