const board = document.getElementById("game-board");
const resetBtn = document.getElementById("reset-btn");
const winBanner = document.getElementById("win-banner");
const finalMoves = document.getElementById("final-moves");
const finalTime = document.getElementById("final-time");
const playAgainBtn = document.getElementById("play-again");
const themeSelect = document.getElementById("theme-select");
themeSelect.addEventListener("change", resetGame);

const themes = {
  mint: {
    name: "Mint Mood",
    backClass: "back-style-mint",
    cards: ["🥑", "💚", "🐍", "🍐", "🍏", "🤢", "🔋", "📗"],
  },

  galaxy: {
    name: "Galaxy Drift",
    backClass: "back-style-galaxy",
    cards: ["🌑", "👽", "🚀", "🛰", "🌌", "🪐", "🌟", "🔭"],
  },

  retro: {
    name: "Retro Pop",
    backClass: "back-style-neon",
    cards: ["🔺", "🟡", "🔷", "🟥", "⬜", "🟢", "🟦", "🟠"],
  },

  zen: {
    name: "Zen Sky",
    backClass: "back-style-zen",
    cards: ["🌦", "🍃", "☁️", "🕊️", "🌾", "🧘‍♀️", "🔹", "🌥️"],
  },

  botanical: {
    name: "Botanical Bloom",
    backClass: "back-style-botanical",
    cards: ["🌸", "🌼", "🌺", "🌻", "🌷", "🌹", "🍂", "🍊"],
  },
};

console.log(finalMoves, finalTime);
console.log("Initial Best Moves:", localStorage.getItem("bestMoves"));
console.log("Initial Best Time:", localStorage.getItem("bestTime"));

let cards = [];
let moveCount = 0;
let secondsElapsed = 0;
let timerInterval = null;
let timerStarted = false;
let currentTheme; // default for now
let bestMoves = localStorage.getItem("bestMoves");
let bestTime = localStorage.getItem("bestTime");

function flashHighScore() {
    const movesContainer = document.getElementById("best-moves-container");
    const timeContainer = document.getElementById("best-time-container");
  
    [movesContainer, timeContainer].forEach((el) => {
      el.classList.remove("highlight");
      void el.offsetWidth; // force reflow to restart animation
      el.classList.add("highlight");
    });
  }
  
  function resetHighScoreAnimation() {
    const movesContainer = document.getElementById("best-moves-container");
    const timeContainer = document.getElementById("best-time-container");
  
    [movesContainer, timeContainer].forEach((el) => {
      el.classList.remove("highlight");
    });
  }
  

function updateHighScoreDisplay() {
    const bestMovesEl = document.getElementById("best-moves");
    const bestTimeEl = document.getElementById("best-time");
  
    bestMovesEl.textContent = bestMoves || "--";
    bestTimeEl.textContent = bestTime || "--";

    if (bestTime){
        const minutes = Math.floor(bestTime / 60);
        const seconds = bestTime % 60;

        bestTimeEl.textContent = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    } else {
        bestTimeEl.textContent = '--';
    }
  
  }
  
  

// Render the cards onto the board
function renderBoard() {
    board.innerHTML = "";
  
    cards.forEach((card, index) => {
      const cardEl = document.createElement("div");
      cardEl.classList.add("card");
      if (card.flipped || card.matched) {
        cardEl.classList.add("flipped");
      }
  
      const inner = document.createElement("div");
      inner.classList.add("card-inner");
  
      const front = document.createElement("div");
      front.classList.add("card-front");
      front.textContent = card.flipped || card.matched ? card.value : "" // Always show the emoji on the front
  
      const back = document.createElement("div");
      back.classList.add("card-back", currentTheme.backClass);
  
      inner.appendChild(front);
      inner.appendChild(back);
      cardEl.appendChild(inner);
  
      cardEl.addEventListener("click", () => handleCardClick(index));
      board.appendChild(cardEl);
    });
  }
  
  

let flippedCards = [];

function handleCardClick(index) {
  const card = cards[index];

  // ignore if already matched or already flipped or if there are two cards already flipped
  if (card.flipped || card.matched || flippedCards.length === 2) return;

  // start timer on first flip
  if (!timerStarted) {
    timerStarted = true;
    timerInterval = setInterval(() => {
      secondsElapsed++;
      updateTimerDisplay();
    }, 1000);
  }

  card.flipped = true;
  flippedCards.push(index);
  renderBoard();

  if (flippedCards.length === 2) {
    moveCount++;
    updateMoveDisplay();
    setTimeout(checkForMatch, 1000); // wait 1 sec before checking
  }
}

function checkForMatch() {
  const [i1, i2] = flippedCards;
  const card1 = cards[i1];
  const card2 = cards[i2];

  if (card1.value === card2.value) {
    card1.matched = true;
    card2.matched = true;
  } else {
    card1.flipped = false;
    card2.flipped = false;
  }

  flippedCards = [];
  renderBoard();
  checkForWin();
}

function checkForWin() {
    const allMatched = cards.every((card) => card.matched);
    if (!allMatched) return;
  
    clearInterval(timerInterval);
  
    finalMoves.textContent = moveCount;
    finalTime.textContent = secondsElapsed;
    winBanner.classList.remove("hidden");
  
    const currentBestMoves = bestMoves ? parseInt(bestMoves) : null;
    const currentBestTime = bestTime ? parseInt(bestTime) : null;
  
    const isBetter =
      currentBestMoves === null ||
      moveCount < currentBestMoves ||
      (moveCount === currentBestMoves && secondsElapsed < currentBestTime);
  
    if (isBetter) {
      bestMoves = moveCount;
      bestTime = secondsElapsed;
  
      localStorage.setItem("bestMoves", bestMoves);
      localStorage.setItem("bestTime", bestTime);
  
      updateHighScoreDisplay();
      flashHighScore(); // ✅ Flash only on new high score
    }
  }
  
  

function resetGame() {
  currentTheme = themes[themeSelect.value];
  document.getElementById("page-body").className = `theme-${themeSelect.value}`;
  clearInterval(timerInterval); // stop old timer if running
  timerStarted = false;
  let pairs = currentTheme.cards.concat(currentTheme.cards);
  pairs.sort(() => Math.random() - 0.5);

  cards = pairs.map((val) => ({
    value: val,
    flipped: false,
    matched: false,
  }));

  flippedCards = [];
  moveCount = 0;
  secondsElapsed = 0;
  winBanner.classList.add('hidden');

  updateMoveDisplay();
  updateTimerDisplay();

  renderBoard();
}


resetBtn.addEventListener('click', resetGame);
playAgainBtn.addEventListener('click', resetGame);

clearInterval(timerInterval);
secondsElapsed = 0;
timerStarted = false;
updateTimerDisplay();


function updateMoveDisplay() {
  document.getElementById("move-count").textContent = moveCount;
}

function updateTimerDisplay() {
  const minutes = Math.floor(secondsElapsed / 60);
  const seconds = secondsElapsed % 60;

  //padStart adds leading zeros before the actual number ('0') the 2 is the length we want the number to be in total.
  const formattedTime = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  
  document.getElementById("timer").textContent = formattedTime;
}

resetGame();
resetHighScoreAnimation();
updateHighScoreDisplay();

