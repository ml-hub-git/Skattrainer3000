// ======================
// Game Core
// ======================

const SUITS = ["♠", "♥", "♦", "♣"];
const VALUES = [
  { label: "7", value: 0 },
  { label: "8", value: 0 },
  { label: "9", value: 0 },
  { label: "10", value: 10 },
  { label: "J", value: 2 },
  { label: "Q", value: 3 },
  { label: "K", value: 4 },
  { label: "A", value: 11 },
];

function createDeck() {
  const deck = [];
  SUITS.forEach(suit => {
    VALUES.forEach(v => {
      deck.push({
        label: v.label,
        suit,
        value: v.value
      });
    });
  });
  return deck;
}

function drawRandom(deck, count) {
  const drawn = [];
  for (let i = 0; i < count; i++) {
    const index = Math.floor(Math.random() * deck.length);
    drawn.push(deck.splice(index, 1)[0]);
  }
  return drawn;
}

const game = {
  deck: [],
  currentDraw: [],
  skat: [],
  scoreA: 0,
  scoreB: 0,
  round: 1,
  activeParty: null
};

function startGame() {
  game.deck = createDeck();
  game.scoreA = 0;
  game.scoreB = 0;
  game.round = 1;
  game.currentDraw = [];
  game.skat = [];

  nextRound();
}

function nextRound() {
  if (game.deck.length <= 2) return;

  const cards = drawRandom(game.deck, 3);
  game.currentDraw = cards;

  const sum = cards.reduce((a, c) => a + c.value, 0);

  if (Math.random() < 0.5) {
    game.scoreA += sum;
    game.activeParty = "A";
  } else {
    game.scoreB += sum;
    game.activeParty = "B";
  }

  game.round++;
}

function solve(inputA, inputB) {
  game.skat = game.deck.slice();

  const correct =
    Number(inputA) === game.scoreA &&
    Number(inputB) === game.scoreB;

  updateProgress(correct);

  return {
    correct,
    scoreA: game.scoreA,
    scoreB: game.scoreB
  };
}

// ======================
// Progress (localStorage)
// ======================

function getProgress() {
  return JSON.parse(localStorage.getItem("skat_progress")) || {
    streak: 0,
    record: 0
  };
}

function saveProgress(p) {
  localStorage.setItem("skat_progress", JSON.stringify(p));
}

function updateProgress(correct) {
  const p = getProgress();

  if (correct) {
    p.streak++;
    if (p.streak > p.record) p.record = p.streak;
  } else {
    p.streak = 0;
  }

  saveProgress(p);
}

// ======================
// UI
// ======================

const cardsDiv = document.getElementById("cards");
const skatDiv = document.getElementById("skat");
const roundDiv = document.getElementById("round");
const resultDiv = document.getElementById("result");

function renderCard(c) {
  const div = document.createElement("div");
  div.className = "card";

  if (c.suit === "♥" || c.suit === "♦") {
    div.classList.add("red");
  }

  div.innerHTML = `
    <div>${c.label}${c.suit}</div>
    <div>${c.label}${c.suit}</div>
  `;

  return div;
}

function render() {
  cardsDiv.innerHTML = "";
  game.currentDraw.forEach(c => {
    cardsDiv.appendChild(renderCard(c));
  });

  skatDiv.innerHTML = "";
  game.skat.forEach(c => {
    skatDiv.appendChild(renderCard(c));
  });

  roundDiv.innerText = "Runde: " + game.round;

  if (game.activeParty) {
    cardsDiv.className = "cards active";
  }
}

// ======================
// Events
// ======================

document.getElementById("start").onclick = () => {
  resultDiv.innerText = "";
  startGame();
  render();
};

document.getElementById("next").onclick = () => {
  nextRound();
  render();
};

document.getElementById("solve").onclick = () => {
  const a = document.getElementById("inputA").value;
  const b = document.getElementById("inputB").value;

  const res = solve(a, b);

  resultDiv.innerText = res.correct ? "Richtig!" : "Falsch!";
  render();
};