function renderTime(time) {
  if (parseInt(time / 60) > 0) {
    return `${parseInt(game.time / 60)}m ${game.time % 60}s`
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
