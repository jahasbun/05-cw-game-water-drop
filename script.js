const scoreElement = document.getElementById("score");
const timeElement = document.getElementById("time");
const startButton = document.getElementById("start-btn");
const gameContainer = document.getElementById("game-container");
const messageElement = document.getElementById("game-message");

let gameRunning = false;
let score = 0;
let timeLeft = 30;
let dropMaker;
let timer;

const winningMessages = [
  "Amazing work! You saved the day!",
  "Great job! The water mission is thriving!",
  "You’re a water hero! Keep it up!",
  "Incredible catch! You made a real impact!"
];

const losingMessages = [
  "Nice try! You can do better next round!",
  "Almost there! Try again and catch more drops!",
  "The mission needs one more round!",
  "Not quite enough yet—give it another shot!"
];

function updateScore() {
  scoreElement.textContent = score;
}

function updateTimer() {
  timeElement.textContent = timeLeft;
}

function hideMessage() {
  messageElement.classList.add("hidden");
  messageElement.classList.remove("is-losing");
  messageElement.textContent = "";
}

function showMessage(message, isWinning) {
  messageElement.textContent = message;
  messageElement.classList.remove("hidden");

  if (isWinning) {
    messageElement.classList.remove("is-losing");
  } else {
    messageElement.classList.add("is-losing");
  }
}

startButton.addEventListener("click", startGame);

function startGame() {
  if (gameRunning) {
    return;
  }

  gameRunning = true;
  score = 0;
  timeLeft = 30;
  updateScore();
  updateTimer();
  hideMessage();
  startButton.textContent = "Game Running";
  gameContainer.innerHTML = "";

  clearInterval(dropMaker);
  clearInterval(timer);

  dropMaker = setInterval(createDrop, 850);
  timer = setInterval(() => {
    timeLeft -= 1;

    if (timeLeft <= 0) {
      timeLeft = 0;
      updateTimer();
      endGame();
      return;
    }

    updateTimer();
  }, 1000);
}

function endGame() {
  gameRunning = false;
  clearInterval(dropMaker);
  clearInterval(timer);
  startButton.textContent = "Start Game";
  gameContainer.innerHTML = "";

  const isWinning = score >= 20;
  const randomMessage = (isWinning ? winningMessages : losingMessages)
    [Math.floor(Math.random() * (isWinning ? winningMessages.length : losingMessages.length))];

  showMessage(randomMessage, isWinning);
}

function createDrop() {
  if (!gameRunning) {
    return;
  }

  const drop = document.createElement("div");
  const isBadDrop = Math.random() < 0.2;
  drop.className = `water-drop${isBadDrop ? " bad-drop" : ""}`;
  drop.dataset.scoreValue = isBadDrop ? "-1" : "1";

  const initialSize = 60;
  const sizeMultiplier = Math.random() * 0.8 + 0.5;
  const size = initialSize * sizeMultiplier;
  drop.style.width = `${size}px`;
  drop.style.height = `${size}px`;

  const gameWidth = gameContainer.offsetWidth - size;
  const xPosition = Math.random() * gameWidth;
  drop.style.left = `${xPosition}px`;

  drop.style.animationDuration = `${4 + Math.random() * 2}s`;

  drop.addEventListener("click", () => {
    if (!gameRunning) {
      return;
    }

    const points = Number(drop.dataset.scoreValue || 1);
    score += points;
    updateScore();
    drop.remove();
  });

  drop.addEventListener("animationend", () => {
    if (drop.isConnected) {
      drop.remove();
    }
  });

  gameContainer.appendChild(drop);
}
