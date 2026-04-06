/* ================================================
   SKAT TRAINER – Spiellogik
   Portierung des Excel-VBA-Spiels (Rechner4.xlsm)
   ================================================ */

// -----------------------------------------------
// Kartendeck: Deutsches Skat-Blatt (32 Karten)
// -----------------------------------------------
const SUITS = ['♦', '♥', '♠', '♣'];

const CARD_VALS = [
  { label: '7',  pts: 0  },
  { label: '8',  pts: 0  },
  { label: '9',  pts: 0  },
  { label: '10', pts: 10 },
  { label: 'B',  pts: 2  },   // Bube   (Jack)
  { label: 'D',  pts: 3  },   // Dame   (Queen)
  { label: 'K',  pts: 4  },   // König  (King)
  { label: 'A',  pts: 11 },   // Ass    (Ace)
];
// Gesamtpunkte immer 120, davon 2 im Skat

// -----------------------------------------------
// Rangsystem (entspricht Tabelle4 / Bestenliste)
// -----------------------------------------------
const RANKS = [
  { name: 'Anfänger',           minStreak: 0   },
  { name: 'Skat-Bauer',         minStreak: 1   },
  { name: 'Kneipen-Dübler',     minStreak: 6   },
  { name: 'Kreuz-Bube',         minStreak: 12  },
  { name: 'Skat-Meister',       minStreak: 36  },
  { name: 'Skat-Großmeister',   minStreak: 72  },
  { name: 'König Skat der I.',  minStreak: 180 },
];

const RANK_MSGS = {
  'Skat-Bauer':
    'Herzlichen Glückwunsch, Skat-Bauer! Du hast deinen ersten Sieg eingefahren. Kein schlechter Anfang!',
  'Kneipen-Dübler':
    'Wow… 6 hintereinander… Das war wahrscheinlich nur Glück… Und wenn nicht, bist du immerhin kein Anfänger mehr. Bleib dran!',
  'Kreuz-Bube':
    'Immerhin ein Drittel eines Spiels am Stück. Für die Eckkneipe wird es schon reichen. Dran bleiben! Schaffst du auch ein ganzes Spiel am Stück?',
  'Skat-Meister':
    'Ein ganzes Spiel am Stück! Nicht schlecht… Ich denke, ich muss nicht erwähnen, dass dies einem wahren Meister allerdings noch lange nicht genügt. Er sammelt seine Energie, denn er weiß – dies war erst der Anfang!',
  'Skat-Großmeister':
    'Unglaublich! Du hast den Rang eines Skat-Großmeisters erreicht! Die Karten verneigen sich vor dir.',
  'König Skat der I.':
    'Unglaublich! 10 Spiele am Stück! Das ist wahrer Ehrgeiz! Die Skatwelt liegt dir zu Füßen!',
};

// -----------------------------------------------
// Spielzustand
// -----------------------------------------------
let state = {
  deck:          [],    // Arbeitsdeck (entspricht Tabelle1 im VBA)
  scoreA:        0,     // Tabelle2.Cells(1,5) – Punkte Partei A
  scoreB:        0,     // Tabelle2.Cells(2,5) – Punkte Partei B
  round:         1,     // Tabelle2.Cells(3,5) – aktuelle Runde
  currentCards:  [],    // Karten der laufenden Runde (Tischmitte)
  currentParty:  null,  // 'A' | 'B' – wer hat diese Runde gewonnen
  phase:         'idle' // 'idle' | 'playing' | 'solved'
};

// -----------------------------------------------
// Deck-Funktionen
// -----------------------------------------------
function createDeck() {
  const deck = [];
  for (const suit of SUITS) {
    for (const cv of CARD_VALS) {
      deck.push({ suit, label: cv.label, pts: cv.pts });
    }
  }
  return deck; // 32 Karten
}

function drawRandom(deck) {
  const idx = Math.floor(Math.random() * deck.length);
  return deck.splice(idx, 1)[0];
}

// -----------------------------------------------
// Fortschritt (localStorage)
// -----------------------------------------------
function loadProgress() {
  try {
    return JSON.parse(localStorage.getItem('skat_progress')) || {
      streak: 0, record: 0, totalGames: 0
    };
  } catch {
    return { streak: 0, record: 0, totalGames: 0 };
  }
}

function saveProgress(p) {
  try { localStorage.setItem('skat_progress', JSON.stringify(p)); } catch { /* ignore */ }
}

function getRank(streak) {
  // Höchsten passenden Rang zurückgeben
  let rank = RANKS[0];
  for (const r of RANKS) {
    if (streak >= r.minStreak) rank = r;
    else break;
  }
  return rank;
}

// -----------------------------------------------
// UI-Helfer
// -----------------------------------------------
const $ = id => document.getElementById(id);

function show(id) { $(id).classList.remove('hidden'); }
function hide(id) { $(id).classList.add('hidden'); }

/**
 * Rendert eine Spielkarte als DOM-Element.
 * @param {object} card – { suit, label, pts }
 * @param {boolean} small – kleinere Version für den Skat
 */
function renderCard(card, small = false) {
  const isRed = card.suit === '♥' || card.suit === '♦';
  const div = document.createElement('div');
  div.className = 'card' + (isRed ? ' red' : '') + (small ? ' small' : '');
  div.innerHTML =
    `<div class="card-top">${card.label}<br>${card.suit}</div>` +
    `<div class="card-center">${card.suit}</div>` +
    `<div class="card-bot">${card.suit}<br>${card.label}</div>`;
  return div;
}

/** Statistik-Zeile oben aktualisieren */
function updateStatsUI() {
  const p = loadProgress();
  const rank = getRank(p.streak);
  $('statRang').textContent   = rank.name;
  $('statSiege').textContent  = p.streak;
  $('statSpiele').textContent = p.totalGames;
  $('statRekord').textContent = p.record;
}

/** Modal anzeigen (Rang-Aufstieg oder Rekord) */
function showModal(title, msg) {
  $('modalTitle').textContent = title;
  $('modalMsg').textContent   = msg;
  $('modal').classList.remove('hidden');
}

// -----------------------------------------------
// Spiellogik – entspricht VBA-Prozeduren
// -----------------------------------------------

/**
 * Start_Click: Neues Spiel starten.
 * Kopiert alle 32 Karten ins Arbeitsdeck, setzt Zähler zurück, ruft nextRound().
 */
function startGame() {
  state.deck         = createDeck();
  state.scoreA       = 0;
  state.scoreB       = 0;
  state.round        = 1;
  state.currentCards = [];
  state.currentParty = null;
  state.phase        = 'playing';

  // Spielzähler hochzählen
  const p = loadProgress();
  p.totalGames++;
  saveProgress(p);

  // UI zurücksetzen
  $('inputA').value     = '';
  $('inputB').value     = '';
  $('inputA').disabled  = false;
  $('inputB').disabled  = false;
  $('actualA').textContent  = '—';
  $('actualB').textContent  = '—';
  $('actualA').className    = 'actual-value';
  $('actualB').className    = 'actual-value';
  $('skatPunkte').textContent = '? Pkt.';
  $('skatCards').innerHTML  = '<div class="card-back"></div><div class="card-back"></div>';
  $('result').textContent   = '';
  $('result').className     = 'result-display';
  $('indicatorA').className = 'side-indicator';
  $('indicatorB').className = 'side-indicator';
  $('btnStart').textContent = 'Neustart';

  show('btnWeiter');
  hide('btnLoesen');

  updateStatsUI();

  // Erste Runde sofort spielen (wie im VBA: Start_Click → Weiter_Click)
  nextRound();
}

/**
 * Weiter_Click: Nächste Runde.
 * Zieht 3 zufällige Karten, addiert ihre Punkte zu einer zufälligen Partei.
 * Wenn nur noch 2 Karten übrig → Skat, Lösen-Button einblenden.
 */
function nextRound() {
  // 3 zufällige Karten ziehen und Punkte summieren
  let roundPts = 0;
  const drawn = [];
  for (let i = 0; i < 3; i++) {
    const card = drawRandom(state.deck);
    roundPts += card.pts;
    drawn.push(card);
  }

  // Zufällige Partei (entspricht: Partei = Int(2 * Rnd) + 1)
  const party = Math.random() < 0.5 ? 'A' : 'B';
  if (party === 'A') state.scoreA += roundPts;
  else               state.scoreB += roundPts;

  state.currentCards = drawn;
  state.currentParty = party;

  // Tischmitte anzeigen
  renderTischmitte();

  // Runden-Zähler anzeigen
  $('roundDisplay').textContent = `Runde ${state.round} / 10`;
  state.round++;

  // Partei-Indikatoren: aktive Seite leuchtet rot
  $('indicatorA').className = 'side-indicator' + (party === 'A' ? ' active' : '');
  $('indicatorB').className = 'side-indicator right' + (party === 'B' ? ' active' : '');

  // Nur noch 2 Karten = Skat → Weiter ausblenden, Lösen einblenden
  if (state.deck.length === 2) {
    hide('btnWeiter');
    show('btnLoesen');
    state.phase = 'last';
  }
}

/**
 * Loesen_Click: Auflösung.
 * Zeigt tatsächliche Punkte, Skat-Karten, prüft Eingabe, aktualisiert Statistik.
 */
function solve() {
  const rawA = $('inputA').value.trim();
  const rawB = $('inputB').value.trim();

  if (rawA === '' || rawB === '') {
    $('result').textContent = 'Bitte beide Felder ausfüllen!';
    $('result').className   = 'result-display info';
    return;
  }

  const guessA = parseInt(rawA, 10);
  const guessB = parseInt(rawB, 10);

  // Skat-Karten (die letzten 2 im Deck)
  const skat1 = state.deck[0];
  const skat2 = state.deck[1];
  const skatPts = skat1.pts + skat2.pts;

  // Skat einblenden (wie Loesen_Click im VBA)
  $('skatPunkte').textContent = skatPts + ' Pkt.';
  $('skatCards').innerHTML    = '';
  
  $('skatCards').appendChild(renderCard(skat1, true));
  $('skatCards').appendChild(renderCard(skat2, true));

  // Tatsächliche Punkte einblenden
  $('actualA').textContent = state.scoreA;
  $('actualB').textContent = state.scoreB;

  // Eingaben sperren
  $('inputA').disabled = true;
  $('inputB').disabled = true;

  // Button-Zustand (Lösen ausblenden, Start bleibt)
  hide('btnLoesen');
  $('btnStart').textContent = 'Nächste Runde';

  // Korrektheitsprüfung (exakter Treffer beider Parteien)
  const correct = guessA === state.scoreA && guessB === state.scoreB;

  // Richtigkeit visuell markieren
  $('actualA').classList.add(guessA === state.scoreA ? 'correct' : 'wrong');
  $('actualB').classList.add(guessB === state.scoreB ? 'correct' : 'wrong');

  // Fortschritt aktualisieren
  const p = loadProgress();
  const prevRankName = getRank(p.streak).name;
  const oldRecord    = p.record;

  if (correct) {
    p.streak++;
    if (p.streak > p.record) p.record = p.streak;
    $('result').textContent = '✓ Richtig!';
    $('result').className   = 'result-display correct';
  } else {
    p.streak = 0;
    $('result').textContent = '✗ Flasch!';
    $('result').className   = 'result-display wrong';
  }

  saveProgress(p);
  updateStatsUI();

  // Rang-Aufstieg prüfen (wie Status() im VBA)
  if (correct) {
    const newRankName = getRank(p.streak).name;
    if (newRankName !== prevRankName && RANK_MSGS[newRankName]) {
      setTimeout(() => showModal('🎉 Aufgestiegen!', RANK_MSGS[newRankName]), 700);
    } else if (p.streak > oldRecord && p.streak > 1) {
      // Neuer persönlicher Rekord (ohne Rang-Aufstieg)
      const diff = p.streak - oldRecord;
      const msg  = diff > 1
        ? `${p.streak} hintereinander! Das sind ${diff} mehr als dein letzter Rekord!`
        : 'Und nochmal steigt dein Rekord um einen! Weitermachen!';
      setTimeout(() => showModal('⭐ Neuer Rekord!', msg), 700);
    }
  }

  state.phase = 'solved';
}

// -----------------------------------------------
// Render-Helfer
// -----------------------------------------------
function renderTischmitte() {
  const tisch = $('tischmitte');
  tisch.innerHTML = '';
  state.currentCards.forEach(card => tisch.appendChild(renderCard(card)));
}

// -----------------------------------------------
// Event Listener
// -----------------------------------------------
$('btnStart').onclick  = startGame;
$('btnWeiter').onclick = nextRound;
$('btnLoesen').onclick = solve;

$('modalClose').onclick = () => $('modal').classList.add('hidden');

// Enter-Taste in Eingabefeldern löst Lösen aus (falls aktiv)
[$('inputA'), $('inputB')].forEach(input => {
  input.addEventListener('keydown', e => {
    if (e.key === 'Enter' && state.phase === 'last') solve();
  });
});

// -----------------------------------------------
// Initialisierung: Statistik anzeigen
// -----------------------------------------------
updateStatsUI();
