//= require bootstrap
let user1 = ""
let user2 = ""
let currentPlayer
let currentGame = {}
let currentBoxNum
let counter = 0
let curr_grid = []
const container = document.getElementById("container");
const gems = ['assets/greengem.png','assets/whitegem.png','assets/purplegem.png','assets/redgem.png']
addEventListeners()

//API Calls
function getWord(difficulty){
  fetch(`${WORDS_URL}/${difficulty}`)
  .then(res => res.json())
  .then(object => addWordToCard(object))
}

//Backend Fetches
const BASE_URL = 'http://localhost:3000'
const WORDS_URL = `${BASE_URL}/words`
const USERS_URL = `${BASE_URL}/users`
const GAMES_URL = `${BASE_URL}/games`
const SESSIONS_URL = `${BASE_URL}/sessions`

function newUser(e){
    e.preventDefault()
    document.getElementById('new-user-form').remove()
    fetch(USERS_URL, {
        method: 'POST',
        headers: {'content-type':'application/json'},
        body: JSON.stringify({
            name: e.target.querySelector('input').value,
        })
    })
    .then(res => res.json())
    .then(user => {
        if (user.id == null){
            alert('Username already taken.')
        } else {
            alert(`Player "${user.name}" has been created!`)
        }
    })
}

function login(e, num){
    if (document.getElementById(`player-${num}-name`).textContent === `PLAYER ${num}`){
      e.preventDefault()
      let name = e.target.querySelector('input').value
      fetch(USERS_URL)
      .then(res => res.json())
      .then(users => {
          if (users.find(user => user.name === name) === undefined){
              alert("User does not exist.")
          } else {
              document.querySelector(`#player-${num}-login input`).value = ""
              populateUser(name, num)
          }
      })
    }
}

function newGame(u1, u2, num=4){
  if (document.getElementById('1') === null || counter === curr_grid.length**2){
    if (u1 === "" || u2 === ""){
      alert("Log in both players before starting a new game.")
    } else {
      startGame(num)
      fetch(GAMES_URL, {
          method: 'POST',
          headers: {'content-type':'application/json'},
          body: JSON.stringify({
              user1: u1,
              user2: u2
          })
      })
      .then(res => res.json())
      .then(object => currentGame = object)
    }
  }
}

//DOM Changes
function startGame(num){
   clearBoard()
  counter = 0
  createGrid(num);
  currentPlayer = 1
  document.querySelector('div.boxed').style.background = '#D0FFA3'
}

function clearBoard(){
  document.getElementById('container').innerHTML = ""
  document.querySelector('div.boxed').style.background = 'white'
  document.querySelector('div.boxed2').style.background = 'white'
  document.querySelectorAll('div.correct1 table td').forEach(el => el.remove())
  document.querySelectorAll('div.incorrect1 table td').forEach(el => el.remove())
  document.querySelectorAll('div.correct2 table td').forEach(el => el.remove())
  document.querySelectorAll('div.incorrect2 table td').forEach(el => el.remove())
}

function newUserMenu(){
    if (!document.getElementById('new-user-form')){
        let form = document.createElement('form')
        form.id = 'new-user-form'
        let label = document.createElement('label')
        label.textContent = "Username: "
        let input = document.createElement('input')
        input.style = 'color:black'
        input.placeholder = "Joe Schmoe"
        let button = document.createElement('button')
        button.type = 'submit'
        button.textContent = "Submit"
        button.style = 'color:black'
        form.append(label, input, button)
        document.getElementById('new-user-div').appendChild(form)
        form.addEventListener('submit', newUser)
    }
}

function populateUser(name, num){
  (num === 1)? user1 = name : user2 = name
  document.getElementById(`player-${num}-name`).textContent = `PLAYER ${num}: ${name}`;
  let h3 = document.getElementById(`player-${num}-score`)
  let span = document.createElement('span')
  span.textContent = "0"
  h3.appendChild(span)
}

//Event Listeners
function addEventListeners(){
  let rulesnav = document.querySelector('li.rulesnav')
  let closeBtn = document.getElementsByClassName('close')[0]
  rulesnav.addEventListener('click',showRules)
  closeBtn.addEventListener('click',hideRules)

  document.getElementById('new-user-button').addEventListener('click', newUserMenu)
  document.getElementById('player-1-login').addEventListener('submit', (e) => login(e, 1))
  document.getElementById('player-2-login').addEventListener('submit', (e) => login(e, 2))
  // document.querySelector('button.new-game').addEventListener('click', () => newGame(user1, user2))

  document.getElementById('answer').addEventListener('submit', (e) => evaluateAnswer(e, currentBoxNum))

  document.getElementById('bee1').addEventListener('click', () => {
    document.getElementById('container').innerHTML = ""
    curr_grid = []
    newGame(user1, user2, 2)
  })
  document.getElementById('bee2').addEventListener('click', () => {
    document.getElementById('container').innerHTML = ""
    curr_grid = []
    newGame(user1, user2, 4)
  })
  document.getElementById('bee3').addEventListener('click', () => {
    document.getElementById('container').innerHTML = ""
    curr_grid = []
    newGame(user1, user2, 6)
  })
}

function showRules(){
    let rules = document.getElementById('rules')
    rules.style.display = 'block'
    rules.style.background = 'darkgray'
}

function hideRules(){
    let wordcard = document.getElementById('rules')
    wordcard.style.display = 'None'
}

function showCard(e){
  // startTimer()
  // document.querySelector('div.base-timer').style.display = "block"
  getWord(parseInt(e.target.innerText))
  currentBoxNum = e.target.id
  let wordcard = document.getElementById('wordcard')
  wordcard.style.display = 'block'
  wordcard.style.background = 'darkgray'
}

function addWordToCard(word){
    document.querySelector('#audio-source').src = word.url
    document.querySelector('#definition').textContent = word.definition
    document.querySelector('#correct-word').textContent = word.name
}

function evaluateAnswer(e, num){
  e.preventDefault()
  let box = document.getElementById(`${num}`)
  // document.querySelector('div.base-timer').style.display = "none"
  let answer = e.target.querySelector('input').value.toLowerCase()
  let correct = document.querySelector('#wordcard #correct-word').textContent.toLowerCase()
  if (answer === correct) {
    updateScore(box.innerText)
    addToCorrectColumn(answer)
    boxToDone(box)
    box.removeEventListener('click', showCard)
  } else {
    addToIncorrectColumn(correct)
  }
  document.querySelector('form#answer input').value = ""
  document.getElementById('wordcard').style.display = "None"
  togglePlayer()
}

function boxToDone(box){
  box.textContent = 'X'
  box.style.color = 'white'
  box.style.backgroundColor = 'red'
  let row = Math.floor((box.id-1)/curr_grid.length)
  let column = (box.id-1)%curr_grid.length
  curr_grid[row][column] = 0
  counter += 1
  if (counter === curr_grid.length * curr_grid.length){
    endGame()
  }
}

function endGame(){
  let canvas = document.createElement('canvas')
  canvas.id = 'canvas'
  document.querySelector('body').appendChild(canvas)
  throwConfetti()
  setTimeout(() => {
    document.querySelector('canvas').remove()
    clearBoard()
  }, 5000)
}

function addToCorrectColumn(word){
  let table = document.querySelector(`div.correct${currentPlayer} table`)
  let newRow = document.createElement('tr')
  let newData = document.createElement('td')
  newData.textContent = word
  newRow.appendChild(newData)
  table.appendChild(newRow)
}

function addToIncorrectColumn(word){
  let table = document.querySelector(`div.incorrect${currentPlayer} table`)
  let newRow = document.createElement('tr')
  let newData = document.createElement('td')
  newData.textContent = word
  newRow.appendChild(newData)
  table.appendChild(newRow)
}

function togglePlayer(){
  if (currentPlayer === 1){
    currentPlayer = 2
    document.querySelector('div.boxed2').style.background = '#D0FFA3'
    document.querySelector('div.boxed').style.background = 'white'
  } else {
    currentPlayer = 1
    document.querySelector('div.boxed').style.background = '#D0FFA3'
    document.querySelector('div.boxed2').style.background = 'white'
  }
}

function updateScore(points){
    let num = currentPlayer
    currentScore = parseInt(document.querySelector(`#player-${num}-score span`).textContent)
    newScore = currentScore + parseInt(points)
    document.querySelector(`#player-${num}-score span`).textContent = newScore
}

function createGrid(n){
  for (let i = 0; i < n; i++) {
    curr_grid[i] = [];
    for (let j = 0; j < n; j++){
        curr_grid[i][j] = Math.floor(Math.random() * 3) + 1
    }
    }
    makeGrid(curr_grid)
}

function makeGrid(grid) {
  let rows = grid.length
  let cols = grid.length
  container.style.setProperty('--grid-rows', rows);
  container.style.setProperty('--grid-cols', cols);
  for (c = 0; c < (rows * cols); c++) {
    let cell = document.createElement("div");
    cell.innerText = grid[Math.floor(c/rows)][c%rows]
    cell.id = c+1;
    cell.addEventListener('click',showCard)
    cell.onmouseover="" 
    cell.style="cursor: pointer;"
    // cell.style.width = '100%' ;
    // cell.style.height = '100%';
    if (cell.innerText == '1'){
        cell.style.backgroundColor = '#f2f2f2';
        cell.style.color = 'black'
        cell.style.fontSize = '30px'
    }
    else if(cell.innerText == '2'){
        cell.style.backgroundColor = '#595959';
        cell.style.color = 'white'
        cell.style.fontSize = '30px'
    }
    else if
    (cell.innerText == '3'){
        cell.style.backgroundColor = '#000000'
        cell.style.color = 'white'
        cell.style.fontSize = '30px'
    }
    container.appendChild(cell).className = "grid-item";
  };
};

// function makeRows(rows, cols) {
//   container.style.setProperty('--grid-rows', rows);
//   container.style.setProperty('--grid-cols', cols);
//   for (c = 0; c < (rows * cols); c++) {
//     let cell = document.createElement("div");
//     var gem = gems[Math.floor(Math.random() * gems.length)];
//     // console.log(gem)
//     cell.style=`background-image: url(${gem});`
//     cell.innerText = Math.floor(Math.random() * 3) + 1
//     cell.id = c+1;
//     cell.addEventListener('click',showCard)
//     cell.onmouseover="" 
//     cell.style="cursor: pointer;"
//     // cell.style.width = '100%' ;
//     // cell.style.height = '100%';

//     if (cell.innerText == '1'){
//         cell.style.backgroundColor = '#f2f2f2';
//         cell.style.color = 'black'
//         cell.style.fontSize = '30px'
//     }
//     else if(cell.innerText == '2'){
//         cell.style.backgroundColor = '#595959';
//         cell.style.color = 'white'
//         cell.style.fontSize = '30px'
//     }
//     else if
//     (cell.innerText == '3'){
//         cell.style.backgroundColor = '#000000'
//         cell.style.color = 'white'
//         cell.style.fontSize = '30px'
//     }
//     container.appendChild(cell).className = "grid-item";
//   };
// };

const FULL_DASH_ARRAY = 283;
const WARNING_THRESHOLD = 10;
const ALERT_THRESHOLD = 5;

const COLOR_CODES = {
  info: {
    color: "green"
  },
  warning: {
    color: "orange",
    threshold: WARNING_THRESHOLD
  },
  alert: {
    color: "red",
    threshold: ALERT_THRESHOLD
  }
};


function onTimesUp() {
  clearInterval(timerInterval);
  document.querySelector('div.base-timer').style.display = "none"
  document.querySelector('form#answer input').value = ""
  document.getElementById('wordcard').style.display = "None"
  togglePlayer()
}

const TIME_LIMIT = 3;
let timePassed = 0;
let timerInterval = null;
let timeLeft = TIME_LIMIT;
let remainingPathColor = COLOR_CODES.info.color;

document.getElementById("app").innerHTML = `
<div class="base-timer">
  <svg class="base-timer__svg" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
    <g class="base-timer__circle">
      <circle class="base-timer__path-elapsed" cx="50" cy="50" r="20"></circle>
      <path
        id="base-timer-path-remaining"
        stroke-dasharray="283"
        class="base-timer__path-remaining ${remainingPathColor}"
        d="
          M 50, 50
          m -20, 0
          a 20,20 0 1,0 40,0
          a 20,20 0 1,0 -40,0
        "
      ></path>
    </g>
  </svg>
  <span id="base-timer-label" class="base-timer__label">${formatTime(
    timeLeft
  )}</span>
</div>
`;

function startTimer() {

  timerInterval = setInterval(() => {
    timePassed = timePassed += 1;
    timeLeft = TIME_LIMIT - timePassed;
    document.getElementById("base-timer-label").innerHTML = formatTime(
      timeLeft
    );
    setCircleDasharray();
    setRemainingPathColor(timeLeft);

    if (timeLeft === 0) {
      onTimesUp();
    }
  }, 1000);
}

function formatTime(time) {
  const minutes = Math.floor(time / 60);
  let seconds = time % 60;

  if (seconds < 10) {
    seconds = `0${seconds}`;
  }

  return `${minutes}:${seconds}`;
}

function setRemainingPathColor(timeLeft) {
  const { alert, warning, info } = COLOR_CODES;
  if (timeLeft <= alert.threshold) {
    document
      .getElementById("base-timer-path-remaining")
      .classList.remove(warning.color);
    document
      .getElementById("base-timer-path-remaining")
      .classList.add(alert.color);
  } else if (timeLeft <= warning.threshold) {
    document
      .getElementById("base-timer-path-remaining")
      .classList.remove(info.color);
    document
      .getElementById("base-timer-path-remaining")
      .classList.add(warning.color);
  }
}

function calculateTimeFraction() {
  const rawTimeFraction = timeLeft / TIME_LIMIT;
  return rawTimeFraction - (1 / TIME_LIMIT) * (1 - rawTimeFraction);
}

function setCircleDasharray() {
  const circleDasharray = `${(
    calculateTimeFraction() * FULL_DASH_ARRAY
  ).toFixed(0)} 283`;
  document
    .getElementById("base-timer-path-remaining")
    .setAttribute("stroke-dasharray", circleDasharray);
}

function throwConfetti(){
  const canvasEl = document.querySelector('#canvas');
  const w = canvasEl.width = window.innerWidth;
  const h = canvasEl.height = window.innerHeight * 2;

  function loop() {
    requestAnimationFrame(loop);
    ctx.clearRect(0,0,w,h);
    
    confs.forEach((conf) => {
      conf.update();
      conf.draw();
    })
  }

  function Confetti () {
    //construct confetti
    const colours = ['#fde132', '#009bde', '#ff6b00'];
    
    this.x = Math.round(Math.random() * w);
    this.y = Math.round(Math.random() * h)-(h/2);
    this.rotation = Math.random()*360;

    const size = Math.random()*(w/60);
    this.size = size < 15 ? 15 : size;

    this.color = colours[Math.floor(colours.length * Math.random())];

    this.speed = this.size/2;
    
    this.opacity = Math.random();

    this.shiftDirection = Math.random() > 0.5 ? 1 : -1;
  }

  Confetti.prototype.border = function() {
    if (this.y >= h) {
      this.y = h;
    }
  }

  Confetti.prototype.update = function() {
    this.y += this.speed;
    
    if (this.y <= h) {
      this.x += this.shiftDirection/3;
      this.rotation += this.shiftDirection*this.speed/100;
    }

    if (this.y > h) this.border();
  };

  Confetti.prototype.draw = function() {
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.size, this.rotation, this.rotation+(Math.PI/2));
    ctx.lineTo(this.x, this.y);
    ctx.closePath();
    ctx.globalAlpha = this.opacity;
    ctx.fillStyle = this.color;
    ctx.fill();
  };

  const ctx = canvasEl.getContext('2d');
  const confNum = Math.floor(w / 4);
  const confs = new Array(confNum).fill().map(_ => new Confetti());

  loop();
}