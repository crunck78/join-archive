const SCREEN_WIDTH_BREAKPOINT = 700;
const ZOOM_FACTOR = 0.2;
let scaleFactor = 1;

let contentContainer;


let cnvImg;
let cnvAvatar;
let cnvContainer;

let ctxImg;
let ctxAvatar;

let avatarArcRadius = 640;

let fr;
let img;

let draggingImg = false;
let mouseDown;

const DISPLACEMENT = { x: 0, y: 0 };
const LAST_DISPLACEMENT = { x: 0, y: 0 };

function initImageProcesser() {

  fr = new FileReader();
  fr.addEventListener("load", handleFileReaderLoad);

  img = new Image();
  img.addEventListener("load", handleImgLoad);

  contentContainer = document.getElementById("content-container");
  cnvContainer = document.getElementById("cnv-container");

  cnvImg = document.getElementById("processer-cnv-img");
  cnvAvatar = document.getElementById("processer-cnv-avatar");

  cnvAvatar.addEventListener("mouseup", handleCanvasMouseUp);
  cnvAvatar.addEventListener("mousedown", handleCanvasMouseDown);
  cnvAvatar.addEventListener("mousemove", handleCanvasMouseMove);
  cnvAvatar.addEventListener("mouseenter", handleCanvasMouseEnter);
  cnvAvatar.addEventListener("mouseleave", handleCanvasMouseLeave);

  ctxImg = cnvImg.getContext("2d");
  ctxAvatar = cnvAvatar.getContext("2d");

  window.addEventListener("resize", handleWindowResize);

}

function handleCanvasMouseLeave() {
  cnvAvatar.style.cursor = "unset";
}

function handleCanvasMouseEnter() {
  cnvAvatar.style.cursor = "move";
}

function handleCanvasMouseMove(mouseMove) {
  if (draggingImg) {
    DISPLACEMENT.x = mouseMove.pageX - mouseDown.x;
    DISPLACEMENT.y = mouseMove.pageY - mouseDown.y;
    
    drawImage();
  }
}

function handleCanvasMouseUp(event) {
  draggingImg = false;
  LAST_DISPLACEMENT.x += DISPLACEMENT.x;
  LAST_DISPLACEMENT.y += DISPLACEMENT.y;
}

function handleCanvasMouseDown(event) {
  draggingImg = true;
  mouseDown = { x: event.pageX, y: event.pageY };
}

function handleFileReaderLoad() {
  img.src = fr.result;
}

function handleWindowResize() {
  drawProcesser();
}

function drawProcesser() {
  if (isMobile()) { setForMobile(); }
  else { setForDesktop(); }
  drawImgAndAvatar();
}

function handleImgLoad() {
  setCanvases();
  drawProcesser();
}

function setCanvases() {
  cnvImg.width = img.width;
  cnvImg.height = img.height;

  cnvAvatar.width = img.width;
  cnvAvatar.height = img.height;
}

function setForDesktop() {
  let contentHeight = getContentHeight();
  let contentWidth = getContentWidth();

  cnvContainer.style = "";

  let widthScale = img.width / (img.height / contentHeight);
  if (widthScale >= contentWidth) {
    let leftPosition = (contentWidth - widthScale) / 2;
    cnvContainer.style.height = `${contentHeight}px`;
    cnvContainer.style.width = `${widthScale}px`;
    cnvContainer.style.left = `${leftPosition}px`;
  }
  else {
    let heightScale = img.height / (img.width / contentWidth);
    let topPosition = (contentHeight - heightScale) / 2;
    cnvContainer.style.width = `${contentWidth}px`;
    cnvContainer.style.height = `${heightScale}px`;
    cnvContainer.style.top = `${topPosition}px`;
  }
}

function setForMobile() {
  let contentHeight = getContentHeight();
  let contentWidth = getContentWidth();

  cnvImg.width = img.width;
  cnvImg.height = img.height;

  cnvAvatar.width = img.width;
  cnvAvatar.height = img.height;

  cnvContainer.style = "";

  let widthScale = img.width / (img.height / contentHeight);

  if (widthScale >= contentWidth) {
    let leftPosition = (contentWidth - widthScale) / 2;
    cnvContainer.style.height = `${contentHeight}px`;
    cnvContainer.style.width = `${widthScale}px`;
    cnvContainer.style.left = `${leftPosition}px`;
  }
  else {
    let heightScale = img.height / (img.width / contentWidth);
    let topPosition = (contentHeight - heightScale) / 2;
    cnvContainer.style.width = `${contentWidth}px`;
    cnvContainer.style.height = `${heightScale}px`;
    cnvContainer.style.top = `${topPosition}px`;
  }
}

function drawImgAndAvatar() {
  drawAvatar();
  drawImage();
}

function drawImage() {
  const halfWidth = cnvImg.width / 2;
  const halfHeight = cnvImg.height / 2;

  ctxImg.clearRect(0, 0, cnvImg.width, cnvImg.height);

  ctxImg.save();
  ctxImg.translate(halfWidth, halfHeight);
  ctxImg.scale(scaleFactor, scaleFactor);
  ctxImg.drawImage(img, -halfWidth + LAST_DISPLACEMENT.x + DISPLACEMENT.x, -halfHeight + LAST_DISPLACEMENT.y + DISPLACEMENT.y, cnvImg.width, cnvImg.height);
  ctxImg.restore();
}

function drawAvatar() {
  drawAvatarBackground();
  drawAvatarMiddleCircle();
}

function drawAvatarMiddleCircle() {

  setAvatarCircleRadius();

  ctxAvatar.beginPath();
  ctxAvatar.arc(cnvAvatar.width / 2, cnvAvatar.height / 2, avatarArcRadius, 0, 2 * Math.PI);
  ctxAvatar.clip();
  ctxAvatar.clearRect(0, 0, cnvAvatar.width, cnvAvatar.height);
}

function setAvatarCircleRadius() {
  let contentWidth = getContentWidth();
  let contentArcRadius = contentWidth * 0.35;
  let cnvContainerStyleWidth = parseFloat(cnvContainer.style.width.replace("px", ""));

  let scaledArcRadius = contentArcRadius * cnvAvatar.width / cnvContainerStyleWidth;
  avatarArcRadius = scaledArcRadius;
  console.log(avatarArcRadius);
}

function drawAvatarBackground() {
  ctxAvatar.globalAlpha = 0.8;
  ctxAvatar.fillRect(0, 0, cnvAvatar.width, cnvAvatar.height);
  ctxAvatar.globalAlpha = 1.0;
}

function handleZoomIn() {
  scaleFactor += ZOOM_FACTOR;
  drawImage();
}

function handleZoomOut() {
  scaleFactor -= ZOOM_FACTOR;
  drawImage();
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

function isMobile() {
  return window.innerWidth < SCREEN_WIDTH_BREAKPOINT;
}

function isLandscape(width, height) {
  return getRatio(width, height) > 1.0;
}

function isPortrait(width, height) {
  return getRatio(width, height) < 1.0;
}

function sameOrientation() {
  let contentHeight = getContentHeight();
  let contentWidth = getContentWidth();
  return isLandscape(img.width, img.height) && isLandscape(contentWidth, contentHeight) ||
    isPortrait(img.width, img.height) && isPortrait(contentWidth, contentHeight);
}

function getContentWidth() {
  return contentContainer.getBoundingClientRect().width;
}

function getContentHeight() {
  return contentContainer.getBoundingClientRect().height;
}

function getRatio(width, height) {
  return width / height;
}

function handleProccesserClose(event) {
  if (!draggingImg) {
    scaleFactor = 1;
    closeDialogByRef(event.target);
  }else{
    draggingImg = false;
  }
}

function fullView(path) {
  document.getElementById('ImageContainer').classList.remove('d-none');
  document.body.style = 'overflow: hidden';
  document.getElementById('FullView').src = path;
}

function CloseFullView() {
  document.getElementById('ImageContainer').classList.add('d-none');
  document.body.style = 'overflow: unset';
}