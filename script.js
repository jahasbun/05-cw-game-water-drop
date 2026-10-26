const scoreElement = document.getElementById("score");
const timeElement = document.getElementById("time");
const startButton = document.getElementById("start-btn");
const gameContainer = document.getElementById("game-container");
const messageElement = document.getElementById("game-message");
const bucket = document.getElementById("bucket");
const hearts = Array.from(document.querySelectorAll(".heart"));
const livesText = document.getElementById("lives-text");

let gameRunning = false;
let score = 0;
let timeLeft = 30;
let lives = 3;
let dropMaker;
let timer;
let collisionFrame;

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

function updateLives() {
  hearts.forEach((heart, index) => {
    heart.classList.toggle("is-lost", index >= lives);
  });
  livesText.textContent = `${lives} of 3 lives remaining`;
}

function clearDrops() {
  gameContainer.querySelectorAll(".water-drop").forEach((drop) => drop.remove());
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
gameContainer.addEventListener("pointermove", moveBucket);

function startGame() {
  if (gameRunning) {
    return;
  }

  gameRunning = true;
  score = 0;
  timeLeft = 30;
  lives = 3;
  updateScore();
  updateTimer();
  updateLives();
  hideMessage();
  startButton.textContent = "Game Running";
  clearDrops();
  bucket.style.left = `calc(50% - ${bucket.offsetWidth / 2}px)`;

  clearInterval(dropMaker);
  clearInterval(timer);

  dropMaker = setInterval(createDrop, 850);
  collisionFrame = requestAnimationFrame(checkCollisions);
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

function endGame(forcedLoss = false) {
  gameRunning = false;
  clearInterval(dropMaker);
  clearInterval(timer);
  cancelAnimationFrame(collisionFrame);
  startButton.textContent = "Start Game";
  clearDrops();

  const isWinning = !forcedLoss && score >= 20;
  const messages = isWinning ? winningMessages : losingMessages;
  const randomMessage = messages[Math.floor(Math.random() * messages.length)];

  showMessage(forcedLoss ? `Game over! ${randomMessage}` : randomMessage, isWinning);
}

function moveBucket(event) {
  const containerBounds = gameContainer.getBoundingClientRect();
  const maxLeft = gameContainer.clientWidth - bucket.offsetWidth;
  const left = Math.max(
    0,
    Math.min(
      maxLeft,
      event.clientX - containerBounds.left - gameContainer.clientLeft - bucket.offsetWidth / 2
    )
  );
  bucket.style.left = `${left}px`;
}

function checkCollisions() {
  if (!gameRunning) {
    return;
  }

  const bucketBounds = bucket.getBoundingClientRect();
  const drops = gameContainer.querySelectorAll(".water-drop");

  drops.forEach((drop) => {
    if (!gameRunning) {
      return;
    }

    const dropBounds = drop.getBoundingClientRect();
    const isTouching =
      dropBounds.left < bucketBounds.right &&
      dropBounds.right > bucketBounds.left &&
      dropBounds.top < bucketBounds.bottom &&
      dropBounds.bottom > bucketBounds.top;

    if (!isTouching) {
      return;
    }

    const isBadDrop = drop.classList.contains("bad-drop");
    score += isBadDrop ? -1 : 1;
    updateScore();
    drop.remove();

    if (isBadDrop) {
      lives -= 1;
      updateLives();

      if (lives === 0) {
        endGame(true);
      }
    }
  });

  if (gameRunning) {
    collisionFrame = requestAnimationFrame(checkCollisions);
  }
}

function createDrop() {
  if (!gameRunning) {
    return;
  }

  const drop = document.createElement("div");
  const isBadDrop = Math.random() < 0.2;
  drop.className = `water-drop${isBadDrop ? " bad-drop" : ""}`;

  const initialSize = 60;
  const sizeMultiplier = Math.random() * 0.8 + 0.5;
  const size = initialSize * sizeMultiplier;
  drop.style.width = `${size}px`;
  drop.style.height = `${size}px`;

  const gameWidth = gameContainer.offsetWidth - size;
  const xPosition = Math.random() * Math.max(0, gameWidth);
  drop.style.left = `${xPosition}px`;

  drop.style.setProperty("--fall-distance", `${gameContainer.clientHeight + 20}px`);
  drop.style.animationDuration = `${4 + Math.random() * 2}s`;

  drop.addEventListener("animationend", () => {
    if (drop.isConnected) {
      drop.remove();
    }
  });

  gameContainer.appendChild(drop);
}
