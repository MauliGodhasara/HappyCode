console.log("Anagram script loaded ✅");

window.onload = () => {
  console.log("Event listeners binding…");

  const validWords = ["dayo", "pagal", "vaydo"];

  let currentWord = "";
  let score = 0;
  let timeLeft = 30;
  let timer;
  let found = new Set();
  let gameStarted = false;

  const playBtn = document.getElementById("playBtn");
  const gameArea = document.getElementById("gameArea");
  const timerDisplay = document.getElementById("timer");
  const scoreDisplay = document.getElementById("score");
  const foundWordsDiv = document.getElementById("foundWords");
  const instructions = document.getElementById("instructions");
  const continueBtn = document.getElementById("continueBtn");
  const resultPopup = document.getElementById("resultPopup");
  const resultTitle = document.getElementById("resultTitle");
  const resultBtn = document.getElementById("resultBtn");
  const currentWordDiv = document.getElementById("currentWord");

  // ====== PLAY & CONTINUE BUTTON HANDLERS ======
  let instructionsOpen = false; // 🔐 Track popup state

  playBtn.onclick = (e) => {
    if (gameStarted || instructionsOpen) return; // don't reopen if already open or game running
    instructionsOpen = true;
    instructions.classList.remove("hidden");
    console.log("Play popup opened");
  };

  continueBtn.onclick = (e) => {
    console.log("Continue button clicked ✅");
    e.stopPropagation(); // prevent bubbling to play button
    instructionsOpen = false; // mark closed
    instructions.style.pointerEvents = "none"; // prevent accidental re-click
    instructions.classList.add("fade-out");

    setTimeout(() => {
      instructions.classList.add("hidden");
      instructions.classList.remove("fade-out");
      instructions.style.pointerEvents = "auto";
      startGame();
    }, 600);
  };

  function startGame() {
    console.log("Game started ✅");

    // ✨ Hide instructions smoothly
    instructions.classList.add("fade-out");
    setTimeout(() => {
      instructions.classList.add("hidden");
      instructions.classList.remove("fade-out");
    }, 600); // match the CSS transition time

    // ✨ Reset game state
    gameArea.classList.remove("hidden");
    score = 0;
    timeLeft = 30;
    found.clear();
    updateScore();
    foundWordsDiv.innerHTML = "";
    currentWord = "";
    updateCurrentWord();

    gameStarted = true;

    // ✨ Prevent double-speed countdown
    if (timer) clearInterval(timer);

    timer = setInterval(() => {
      timeLeft--;
      timerDisplay.textContent = `⏰ ${timeLeft}s`;
      if (timeLeft <= 0) endGame();
    }, 1000);
  }

  // --- TILE CLICK SUPPORT ---
  const tiles = document.querySelectorAll(".tile");
  tiles.forEach((tile) => {
    tile.addEventListener("click", () => {
      if (!gameStarted) return;
      if (tile.classList.contains("selected")) return;
      currentWord += tile.textContent.toLowerCase();
      tile.classList.add("selected");
      updateCurrentWord();
    });
  });

  // --- KEYBOARD SUPPORT ---
  document.addEventListener("keydown", (e) => {
    if (!gameStarted) return;

    const key = e.key.toUpperCase();
    const validLetters = Array.from(tiles, (tile) => tile.textContent);

    if (validLetters.includes(key)) {
      const tile = Array.from(tiles).find(
        (t) => t.textContent === key && !t.classList.contains("selected"),
      );
      if (tile) {
        currentWord += key.toLowerCase();
        tile.classList.add("selected");
        tile.style.transform = "scale(1.1)";
        setTimeout(() => (tile.style.transform = "scale(1)"), 100);
        updateCurrentWord();
      }
    }

    if (e.key === "Backspace") {
      e.preventDefault();
      if (currentWord.length > 0) {
        const removedLetter = currentWord.slice(-1).toUpperCase();
        currentWord = currentWord.slice(0, -1);
        const tile = Array.from(tiles).find(
          (t) =>
            t.textContent === removedLetter && t.classList.contains("selected"),
        );
        if (tile) tile.classList.remove("selected");
        updateCurrentWord();
      }
    }

    if (e.key === "Enter" && gameStarted) submitWord();
  });

  // --- CLEAR & SUBMIT BUTTONS ---
  document.getElementById("clearBtn").addEventListener("click", () => {
    currentWord = "";
    tiles.forEach((t) => t.classList.remove("selected"));
    updateCurrentWord();
  });

  document.getElementById("submitBtn").addEventListener("click", submitWord);

  // --- UPDATE CURRENT WORD ---
  function updateCurrentWord() {
    currentWordDiv.textContent = currentWord.toUpperCase();

    // Update visible word tiles
    const wordTiles = document.getElementById("wordTiles");
    wordTiles.innerHTML = ""; // clear existing

    for (let i = 0; i < currentWord.length; i++) {
      const tile = document.createElement("div");
      tile.classList.add("word-tile", "filled");
      tile.textContent = currentWord[i].toUpperCase();
      tile.style.fontFamily = "Arial, sans-serif";
      tile.style.fontWeight = "bold";
      wordTiles.appendChild(tile);
    }

    for (let j = currentWord.length; j < tiles.length; j++) {
      const tile = document.createElement("div");
      tile.classList.add("word-tile");
      wordTiles.appendChild(tile);
    }
  }

  // --- SUBMIT WORD ---
  function submitWord() {
    if (!currentWord || currentWord.length < 3) return;

    const correctAnswer =
      validWords.includes(currentWord) && !found.has(currentWord);

    if (found.has(currentWord)) {
      shake(currentWordDiv);
    } else if (validWords.includes(currentWord)) {
      found.add(currentWord);
      const points =
        currentWord.length === 3
          ? 500
          : currentWord.length === 4
            ? 800
            : currentWord.length === 5
              ? 1000
              : 1500;

      score += points;
      foundWordsDiv.innerHTML += `<p>+${points} (${currentWord})</p>`;
      updateScore();
      sparkle(currentWordDiv);
    } else {
      shake(currentWordDiv);
    }

    currentWord = "";
    tiles.forEach((t) => t.classList.remove("selected"));
    updateCurrentWord();

    if (correctAnswer && score >= 1500) endGame();
  }

  function updateScore() {
    scoreDisplay.textContent = `💗 Score: ${score}`;
  }

  function shake(element) {
    element.classList.add("shake");
    setTimeout(() => element.classList.remove("shake"), 400);
  }

  function sparkle(element) {
    element.classList.add("sparkle");
    setTimeout(() => element.classList.remove("sparkle"), 600);
  }

  function endGame() {
    clearInterval(timer);
    gameStarted = false;
    gameArea.classList.add("hidden");
    resultPopup.classList.remove("hidden");

    if (score >= 1500) {
      resultTitle.textContent = `You did it! Score: ${score} 💖`;
      resultBtn.textContent = "Continue ➜";
      resultBtn.onclick = () => (window.location.href = "flower.html");
    } else {
      resultTitle.textContent = "Not quite there 😜 Try again!";
      resultBtn.textContent = "Retry 🔁";
      resultBtn.onclick = () => {
        resultPopup.classList.add("hidden");
        startGame();
      };
    }
  }
}; // ✅ closes window.onload correctly
