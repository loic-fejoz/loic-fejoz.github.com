/* Return a random natural number "i" such that 0 <= i < n */
function random(n) {
  return Math.floor(Math.random() * n);
}

/* the square root of the number of images must be an natural number. */
var images = new Array();
var trial = 0;
var turn = 0;
var firstImgSelected = null;
var secondImgSelected = null;
var nbRemainingImages = images.length;

function sexy() {
  images = new Array(
		     "/projets/bonnepaire/sexy1.jpg",
		     "/projets/bonnepaire/sexy2.jpg",
		     "/projets/bonnepaire/sexy3.jpg",
		     "/projets/bonnepaire/sexy4.jpg",
		     "/projets/bonnepaire/sexy5.jpg",
		     "/projets/bonnepaire/sexy6.jpg",
		     "/projets/bonnepaire/sexy7.jpg",
		     "/projets/bonnepaire/sexy8.jpg",
		     "/projets/bonnepaire/sexy9.jpg"
		     );
}
sexy();

function tux() {
  images = new Array(
		     "/projets/bonnepaire/tux1.jpg",
		     "/projets/bonnepaire/tux2.jpg",
		     "/projets/bonnepaire/tux3.jpg",
		     "/projets/bonnepaire/tux4.jpg",
		     "/projets/bonnepaire/tux5.jpg",
		     "/projets/bonnepaire/tux6.jpg",
		     "/projets/bonnepaire/tux7.jpg",
		     "/projets/bonnepaire/tux8.jpg",
		     "/projets/bonnepaire/tux9.jpg"
		     );
}

function removePreviousRow(table) {
  var trs = table.childNodes;
  var i;
  for(i=0; i<trs.length; i++) {
    table.removeChild(trs[i]);
  }
  /* Do not know why we need this! */
  if (table.firstChild) {
    table.removeChild(table.firstChild);
  }
}

function playAgain() {
  trial = 0;
  turn = 0;
  firstImgSelected = null;
  secondImgSelected = null;
  nbRemainingImages = images.length;
  setNbImages(nbRemainingImages);
  setTrialField(trial);
  removePreviousRow(document.getElementById("grid"));
  createTable(document.getElementById("grid"), images);
}

function endGame() {
  if (window.confirm("Bravo, vous avez réussi en " + trial + " coups ! \nVoulez-vous rejouez ? ")) {
    playAgain();
  };
}

function endTurn() {
  turn = 0;
  if (firstImgSelected != null) {
    firstImgSelected.style.visibility = "hidden";
  }
  firstImgSelected = null;
  if (secondImgSelected != null) {
    secondImgSelected.style.visibility = "hidden";
  }
  secondImgSelected = null;
}

function checkCorrect() {
  trial++;
  setTrialField(trial);
  if (firstImgSelected.src == secondImgSelected.src) {
    firstImgSelected.parentNode.setAttribute("onClick","");
    secondImgSelected.parentNode.setAttribute("onClick","");
    firstImgSelected.parentNode.setAttribute("class","discovered");
    secondImgSelected.parentNode.setAttribute("class","discovered");
    firstImgSelected.parentNode.removeChild(firstImgSelected);
    secondImgSelected.parentNode.removeChild(secondImgSelected);
    firstImgSelected = null;
    secondImgSelected = null;
    turn = 0;
    nbRemainingImages--;
    setNbImages(nbRemainingImages);
    if (nbRemainingImages == 0) {
      endGame();
    }
    return true;
  } else {
    return false;
  }
}

function onImageClick(td) {
  if (turn == 0) {
    firstImgSelected = td.firstChild;
    turn++;
    firstImgSelected.style.visibility = "visible";
  } else if ((turn == 1) && (td.firstChild != firstImgSelected)) {
    secondImgSelected = td.firstChild;
    secondImgSelected.style.visibility = "visible";
    turn++;
    if (!checkCorrect()) {
      window.setTimeout("endTurn();", 500);
    }
  }
  return true;
}

function addImage(tr, src) {
  var td = tr.insertCell(0);
  td.innerHTML = "<img src='" + src + "' width='100px' height='100px'/>";
  td.setAttribute("class","undiscovered");
  var img = td.childNodes[0];
  img.style.visibility = "hidden";
  td.onclick = function() { onImageClick(td); };
}

var imgCounter = null;

function resetImgCounter(images) {
  /* set an array that will tell us how many times an image scan be choosen. */
  imgCounter = new Array();
  for(i=0; i<images.length; i++) {
    imgCounter[i] = 2;
  }
}

/* Randomly pick an image such that each images are choosen exactly twice */
function chooseImg(images) {
  var imgNb = random(imgCounter.length);
  /* Of course we can be unlucky and be stuck in the loop :( */
  while (imgCounter[imgNb] == 0) {
    imgNb = random(imgCounter.length);
  }
  imgCounter[imgNb] = imgCounter[imgNb] - 1;
  return images[imgNb];
}

/* create the table and fill it with the given images */
function createTable(table, images) {
  resetImgCounter(images);
  var h = Math.sqrt(images.length);
  var l = 2 * h;
  for(i=0; i < h; i++) {
    var tr = table.insertRow(0);
    for(j=0; j < l; j++) {
      addImage(tr, chooseImg(images));
    }
  }
}

function setTrialField(trial) {
  sp = document.getElementById("nbClics");
  sp.firstChild.nodeValue = trial;
}

function setNbImages(nb) {
  sp = document.getElementById("nbImages");
  sp.firstChild.nodeValue = nb;
}

function setTitle(titl) {
  sp = document.getElementById("game");
  sp.firstChild.nodeValue = titl;
}
