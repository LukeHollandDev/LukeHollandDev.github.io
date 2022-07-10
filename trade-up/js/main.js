// global variables
let GAME = new Game();
let interval = null; // used to update time
const scoreTypes = ['local', 'global'];

// resets the game state
function play() {
  // data comes from the ./data.js file
  let data_copy = JSON.parse(JSON.stringify(data));
  GAME = new Game(data_copy);
  GAME.start();
  setTime();
  renderTopBar();
  renderAllItems();
  interval = setInterval(setTime, 1000);
}

function quit() {
  GAME.inProgress = false;
  clearInterval(interval);
}

// updates the value of time and the element value
function setTime() {
  if (!GAME.inProgress) {
    return;
  }
  ++GAME.time;
  var time = document.getElementById('time');
  time.innerHTML = renderTime(GAME.time);
}

// render the topBar
function renderTopBar() {
  const tradesElement = document.getElementById('trades');
  const valueElement = document.getElementById('value');
  tradesElement.innerHTML = `${GAME.trades} trades`
  valueElement.innerHTML = `£${GAME.currentItem.price} / £100`;
}

// render all the items
function renderAllItems() {
  const currentElement = document.getElementById('current');
  const offerElements = document.getElementById('offers');
  renderItem(currentElement, GAME.currentItem);
  Array.from(offerElements.children).map((el, i) => renderItem(el, GAME.currentOffers[i]));
}

// render the contents of an item
function renderItem(element, itemData) {
  const imgDiv = element.querySelector('#item-image');
  imgDiv.style.backgroundImage = `url('${itemData.imageUri}')`;
  imgDiv.classList.remove('value-more');
  imgDiv.classList.remove('value-same');
  imgDiv.classList.remove('value-less');
  const nameDiv = element.querySelector('#item-name');
  nameDiv.innerHTML = `<i>${itemData.name}</i>`
  const valueDiv = element.querySelector('#item-value');
  if (valueDiv)
    valueDiv.innerHTML = `<i>£${itemData.price}</i>`;
}

// select trade offer
function selectOffer(index) {
  // block selection if currently in progress (timer)
  if (GAME.selectingOffer)
    return;
  // pause game
  GAME.selectingOffer = true;
  GAME.inProgress = false;
  highlightOffers();
  setTimeout(() => {
    // select item, re-render and resume game
    GAME.selectItem(index);
    renderAllItems();
    renderTopBar();
    GAME.selectingOffer = false;
    GAME.inProgress = true;
    // if the player has passed £100 then show winning page
    if (GAME.currentItem.price >= 100) {
      quit();
      renderWin();
    }
  }, 500);
}

// highlight the offers based on their value relative to current item
function highlightOffers() {
  const offerElements = document.getElementById('offers');
  const currentValue = GAME.currentItem.price;
  Array.from(offerElements.children).map((offer, index) => {
    const imgDiv = offer.querySelector('#item-image');
    const offerValue = GAME.currentOffers[index].price;
    if (currentValue > offerValue)
      imgDiv.classList.add('value-less');
    else if (currentValue < offerValue)
      imgDiv.classList.add('value-more');
    else
      imgDiv.classList.add('value-same');
  });
}

// render the winner screen which allows user to input their name and see scoreboard
function renderWin() {
  show('winner', 'play');
  // update values with the game scores
  const tradesElement = document.getElementById('results-trades');
  const timeElement = document.getElementById('results-time');
  const valueElement = document.getElementById('results-value');
  tradesElement.innerHTML = GAME.trades;
  timeElement.innerHTML = renderTime(GAME.time);
  valueElement.innerHTML = `£${GAME.currentItem.price}`;
}

// reset the winner page
function resetWinnerPage() {
  const input = document.getElementById('player-name');
  const checkbox = document.getElementById('global');
  const button = document.getElementById('submit-score');
  const confirmationElement = document.getElementById('confirmation');
  const submissionElement = document.getElementById('submission');
  input.value = '';
  checkbox.disabled = true;
  button.classList.add('disabled');
  confirmationElement.style.display = 'none';
  submissionElement.style.display = 'block';
}

// valid the input for the player name input
function checkInput() {
  const input = document.getElementById('player-name');
  const button = document.getElementById('submit-score');
  const checkbox = document.getElementById('global');
  if (input.value.length >= 2) {
    button.classList.remove('disabled');
    checkbox.disabled = false;
  } else {
    button.classList.add('disabled');
    checkbox.disabled = true;
  }
  return input.value.length >= 2;
}

// submit score to local storage and, if checked, the score server
function submitScore() {
  if (!checkInput())
    return;
  const input = document.getElementById('player-name');
  const checkbox = document.getElementById('global');
  // save score to local storage
  const scores = JSON.parse(localStorage.getItem('trade-up-scores') || "[]");
  score = {
    id: uuidv4(),
    name: input.value,
    trades: GAME.trades,
    time: GAME.time,
    value: GAME.currentItem.price
  }
  scores.push(score);
  localStorage.setItem('trade-up-scores', JSON.stringify(scores));
  // if global handle posting the score to the server
  if (checkbox.checked) {
    const xhr = new XMLHttpRequest();
    xhr.open('POST', 'http://127.0.0.1:5000/scores', true);
    xhr.setRequestHeader('Content-Type', 'application/json');
    xhr.send(JSON.stringify(score));
  }
  // update to tell user it has been added
  const confirmationElement = document.getElementById('confirmation');
  const submissionElement = document.getElementById('submission');
  confirmationElement.style.display = 'block';
  submissionElement.style.display = 'none';
}

function toggleScoreboard() {
  const type = document.getElementById('scores-toggle');
  if (type.textContent.trim() === 'local')
    type.innerHTML = 'global'
  else
    type.innerHTML = 'local'
  renderScores();
}

// render the scores from local storage
function renderScores(globalReq=false, scores=null) {
  let type = document.getElementById('scores-toggle');
  if (type)
    type = type.textContent.trim();
  if (!scoreTypes.includes(type))
    type = 'local';

  if (type === 'local') {
    scores = JSON.parse(localStorage.getItem('trade-up-scores') || "[]");
  } else if (!globalReq) {
    // insert logic for fetching scores from server
    const xhr = new XMLHttpRequest();
    xhr.open('GET', 'http://127.0.0.1:5000/scores', true);
    xhr.onload = (e) => {
      if (xhr.readyState === 4) {
        if (xhr.status === 200) {
          renderScores(true, JSON.parse(xhr.responseText));
        } else {
          console.error(xhr.statusText);
        }
      }
    }
    xhr.send(null);
  }

  if (!scores)
    return;

  // hide table and show no score message if there is no scores
  const mainTableElement = document.getElementById('scores-table-el');
  const noScoresElement = document.getElementById('no-scores');
  mainTableElement.style.display = scores.length === 0 ? 'none' : 'table';
  noScoresElement.style.display = scores.length === 0 ? 'block' : 'none';

  // clear the table and then sort and loop through all the scores
  const scoreTableElement = document.getElementById('scores-table');
  scoreTableElement.innerHTML = '';
  scores = scores.sort((score1, score2) => {
    // sort by times asc
    if (score1.time > score2.time) return 1;
    if (score1.time < score2.time) return -1;
    // sort by trades asc
    if (score1.trades > score2.trades) return -1;
    if (score1.trades < score2.trades) return 1;
    // sort by name asc
    if (score1.name > score2.name) return 1;
    if (score1.name < score2.name) return -1;
  });

  let localScoreIds = []
  if (type === 'global') {
    localScoreIds = JSON.parse(localStorage.getItem('trade-up-scores') || "[]").map((s) => s.id);
  }

  scores = scores.slice(0, 25);

  scores.map((score, index) => {
    const tr = document.createElement('tr');
    if (index === 0)
      tr.classList.add('first');
    else if (index === 1)
      tr.classList.add('second');
    else if (index === 2)
      tr.classList.add('third');

    if (localScoreIds.includes(score.id))
      tr.classList.add('my-score');

    const ranking = document.createElement('td');
    ranking.innerHTML = index + 1;
    ranking.classList.add('ranking');
    tr.appendChild(ranking);

    const name = document.createElement('td');
    name.innerHTML = score.name;
    name.classList.add('name');
    tr.appendChild(name);

    const time = document.createElement('td');
    time.innerHTML = renderTime(score.time);
    time.classList.add('time');
    tr.appendChild(time);

    const trades = document.createElement('td');
    trades.innerHTML = score.trades || 0;
    trades.classList.add('trades');
    tr.appendChild(trades);

    scoreTableElement.appendChild(tr);
  });
}
