// Box breathing
const phases = ["Inhale (4)", "Hold (4)", "Exhale (4)", "Hold (4)"];
let breathTimer = null, phaseIndex = 0, cycle = 0;

document.getElementById("startBreath").onclick = () => {
  if (breathTimer) return;
  updateBreath();
  breathTimer = setInterval(updateBreath, 4000);
};

document.getElementById("stopBreath").onclick = () => {
  clearInterval(breathTimer); breathTimer = null;
  document.getElementById("breathPhase").textContent = "Stopped";
};

function updateBreath() {
  document.getElementById("breathPhase").textContent = phases[phaseIndex];
  phaseIndex = (phaseIndex + 1) % phases.length;
  if (phaseIndex === 0) cycle++;
  document.getElementById("breathCount").textContent = `Cycle: ${cycle}`;
}

// Eye reset
document.getElementById("startEye").onclick = () => {
  const dot = document.getElementById("dot");
  let pos = 0, dir = 1, ticks = 0;
  const id = setInterval(() => {
    pos += dir * 4;
    if (pos > 260) dir = -1;
    if (pos < 0) dir = 1;
    dot.style.left = `${pos}px`;
    ticks++;
    if (ticks > 150) clearInterval(id); // ~30 sec
  }, 200);
};

// Grounding prompts
const grounding = [
  "Name 5 things you can see.",
  "Name 4 things you can feel.",
  "Name 3 things you can hear.",
  "Name 2 things you can smell.",
  "Name 1 thing you can taste."
];
let g = 0;
document.getElementById("nextGrounding").onclick = () => {
  document.getElementById("groundingPrompt").textContent = grounding[g];
  g = (g + 1) % grounding.length;
};

// Mood journal (local only)
document.getElementById("saveMood").onclick = () => {
  const mood = document.getElementById("moodSelect").value;
  const note = document.getElementById("moodNote").value.trim();
  if (!note) return;
  const item = `${new Date().toLocaleString()} — ${mood}: ${note}`;
  const entries = JSON.parse(localStorage.getItem("moodEntries") || "[]");
  entries.unshift(item);
  localStorage.setItem("moodEntries", JSON.stringify(entries));
  document.getElementById("moodNote").value = "";
  renderMood();
};

function renderMood() {
  const entries = JSON.parse(localStorage.getItem("moodEntries") || "[]");
  document.getElementById("moodList").innerHTML = entries.slice(0, 10).map(e => `<li>${e}</li>`).join("");
}
renderMood();

// Cheer-up activities
const activities = [
  "Drink water and do 10 slow breaths.",
  "Step outside for 3 minutes.",
  "Text one person you trust.",
  "Stretch your shoulders for 60 seconds.",
  "Write 3 things you handled well today."
];
document.getElementById("newActivity").onclick = () => {
  const i = Math.floor(Math.random() * activities.length);
  document.getElementById("activityText").textContent = activities[i];
};
