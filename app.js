// ---------- App State ----------
const state = {
  breathTimer: null,
  breathPhaseIdx: 0,
  breathCycles: 0,
  eyeInterval: null,
  eyeTime: 30,
  groundingIndex: 0
};

const views = document.querySelectorAll(".view");
const navButtons = document.querySelectorAll(".nav-btn");

// ---------- Navigation ----------
navButtons.forEach(btn => {
  btn.addEventListener("click", () => {
    navButtons.forEach(b => b.classList.remove("active"));
    btn.classList.add("active");
    showView(btn.dataset.view);
    markUsage();
  });
});

document.querySelectorAll("[data-jump]").forEach(btn => {
  btn.addEventListener("click", () => {
    const target = btn.dataset.jump;
    document.querySelector(`.nav-btn[data-view="${target}"]`).click();
  });
});

function showView(id) {
  views.forEach(v => v.classList.remove("active"));
  document.getElementById(id).classList.add("active");
}

// ---------- Streak ----------
function todayKey() {
  return new Date().toISOString().slice(0, 10);
}

function markUsage() {
  const days = JSON.parse(localStorage.getItem("usedDays") || "[]");
  const today = todayKey();
  if (!days.includes(today)) {
    days.push(today);
    localStorage.setItem("usedDays", JSON.stringify(days));
  }
  document.getElementById("streakCount").textContent = days.length;
}
markUsage();

// ---------- Box Breathing ----------
const phases = [
  { name: "Inhale (4)", scale: 1.2, color: "#38bdf8" },
  { name: "Hold (4)", scale: 1.2, color: "#a78bfa" },
  { name: "Exhale (4)", scale: 0.8, color: "#22c55e" },
  { name: "Hold (4)", scale: 0.8, color: "#f59e0b" },
];

const breathPhaseEl = document.getElementById("breathPhase");
const breathCycleEl = document.getElementById("breathCycle");
const breathSquare = document.getElementById("breathSquare");

function tickBreath() {
  const phase = phases[state.breathPhaseIdx];
  breathPhaseEl.textContent = phase.name;
  breathSquare.style.transform = `scale(${phase.scale})`;
  breathSquare.style.borderColor = phase.color;

  state.breathPhaseIdx = (state.breathPhaseIdx + 1) % phases.length;
  if (state.breathPhaseIdx === 0) state.breathCycles++;
  breathCycleEl.textContent = `Cycle: ${state.breathCycles}`;
}

document.getElementById("startBreath").addEventListener("click", () => {
  if (state.breathTimer) return;
  tickBreath();
  state.breathTimer = setInterval(tickBreath, 4000);
  markUsage();
});

document.getElementById("stopBreath").addEventListener("click", () => {
  clearInterval(state.breathTimer);
  state.breathTimer = null;
  breathPhaseEl.textContent = "Stopped";
});

// ---------- Eye Reset ----------
const dot = document.getElementById("dot");
const eyeTimerEl = document.getElementById("eyeTimer");

document.getElementById("startEye").addEventListener("click", () => {
  if (state.eyeInterval) return;

  let pos = 0, dir = 1;
  state.eyeTime = 30;
  eyeTimerEl.textContent = `Time left: ${state.eyeTime}s`;

  state.eyeInterval = setInterval(() => {
    pos += dir * 6;
    if (pos > 580) dir = -1;
    if (pos < 0) dir = 1;
    dot.style.left = `${pos}px`;

    if (Math.floor(pos) % 20 === 0) {
      state.eyeTime--;
      eyeTimerEl.textContent = `Time left: ${state.eyeTime}s`;
      if (state.eyeTime <= 0) {
        clearInterval(state.eyeInterval);
        state.eyeInterval = null;
        eyeTimerEl.textContent = "Done. Blink slowly and relax your jaw.";
      }
    }
  }, 80);

  markUsage();
});

// ---------- Grounding ----------
const groundingPrompts = [
  "Name 5 things you can see right now.",
  "Name 4 things you can physically feel.",
  "Name 3 things you can hear.",
  "Name 2 things you can smell.",
  "Name 1 thing you can taste."
];

document.getElementById("nextGrounding").addEventListener("click", () => {
  const step = groundingPrompts[state.groundingIndex];
  document.getElementById("groundStep").textContent = step;
  state.groundingIndex = (state.groundingIndex + 1) % groundingPrompts.length;
  markUsage();
});

// ---------- Mood Journal ----------
function loadEntries() {
  return JSON.parse(localStorage.getItem("moodEntriesV10") || "[]");
}
function saveEntries(entries) {
  localStorage.setItem("moodEntriesV10", JSON.stringify(entries));
}
function renderMoodEntries() {
  const list = document.getElementById("moodList");
  const entries = loadEntries();
  list.innerHTML = entries.length
    ? entries.map(e => `<li><strong>${e.mood}</strong> — ${e.note}<br/><small>${e.time}</small></li>`).join("")
    : "<li>No entries yet.</li>";

  document.getElementById("todayMessage").textContent = entries[0]
    ? `Latest mood: ${entries[0].mood}`
    : "You haven’t logged a mood yet.";
}
renderMoodEntries();

document.getElementById("saveMood").addEventListener("click", () => {
  const mood = document.getElementById("moodSelect").value;
  const note = document.getElementById("moodNote").value.trim();
  if (!note) return alert("Write at least one sentence before saving.");

  const entries = loadEntries();
  entries.unshift({
    mood,
    note,
    time: new Date().toLocaleString()
  });

  saveEntries(entries.slice(0, 30));
  document.getElementById("moodNote").value = "";
  renderMoodEntries();
  markUsage();
});

// ---------- Cheer-Up Lab ----------
const activities = [
  "Do a 90-second ‘shake out’ — loosen shoulders, arms, jaw.",
  "Drink water and take 6 slow breaths.",
  "Put your hand on your chest and say: ‘I am safe right now.’",
  "Step outside and name 3 colors you see.",
  "Play one favorite song and just listen.",
  "Write one tiny win from today.",
  "Send a kind message to one person."
];

document.getElementById("newActivity").addEventListener("click", () => {
  const i = Math.floor(Math.random() * activities.length);
  document.getElementById("activityText").textContent = activities[i];
  markUsage();
});

// ---------- 60-second panic reset ----------
document.getElementById("panicBtn").addEventListener("click", () => {
  showView("breath");
  navButtons.forEach(b => b.classList.remove("active"));
  document.querySelector(`.nav-btn[data-view="breath"]`).classList.add("active");

  let seconds = 60;
  breathPhaseEl.textContent = "60-second reset started";
  if (state.breathTimer) clearInterval(state.breathTimer);
  state.breathTimer = null;

  const panicTimer = setInterval(() => {
    seconds--;
    breathCycleEl.textContent = `Reset ends in: ${seconds}s`;
    breathSquare.style.transform = seconds % 8 < 4 ? "scale(1.2)" : "scale(0.85)";
    if (seconds <= 0) {
      clearInterval(panicTimer);
      breathPhaseEl.textContent = "Great job. You completed a reset.";
      breathCycleEl.textContent = `Cycle: ${state.breathCycles}`;
    }
  }, 1000);

  markUsage();
});
