function show(toShow, toHide) {
  const elShow = document.getElementById(toShow);
  const elHide = document.getElementById(toHide);

  if (elShow) {
    elShow.classList.remove("hide");
    if (toShow !== 'menu')
      elShow.classList.add("show");
  }
  if (elHide){
    elHide.classList.remove("show");
    elHide.classList.add("hide");
  }
}

function renderTime(time) {
  if (parseInt(time / 60) > 0) {
    return `${parseInt(time / 60)}m ${time % 60}s`
  } else {
    return `${time % 60}s`
  }
}

function renderValue(value, max = 100.00) {
  return `£${value} / £${max}`;
}

function renderMoves(moves) {
  return `${moves} move${moves > 1 ? s : ''}`;
}

function shuffle(array) {
  let currentIndex = array.length,  randomIndex;

  // While there remain elements to shuffle...
  while (currentIndex != 0) {

    // Pick a remaining element...
    randomIndex = Math.floor(Math.random() * currentIndex);
    currentIndex--;

    // And swap it with the current element.
    [array[currentIndex], array[randomIndex]] = [
      array[randomIndex], array[currentIndex]];
  }

  return array;
}

function uuidv4() {
  return ([1e7]+-1e3+-4e3+-8e3+-1e11).replace(/[018]/g, c =>
    (c ^ crypto.getRandomValues(new Uint8Array(1))[0] & 15 >> c / 4).toString(16)
  );
}
