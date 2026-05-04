const STORAGE_KEY = "youtuber-simulator-save-v2";

const TREND_TOPICS = [
  "Gaming",
  "Vlog",
  "Challenge",
  "Tutorial",
  "Reaction",
  "Comedy",
  "Tech",
  "Music",
  "Drama",
  "Fitness"
];

const TITLE_PARTS = {
  Gaming: {
    start: ["I Tried", "Beating", "INSANE", "Can I Survive", "The Truth About", "My First Ever"],
    middle: ["The Hardest", "A Pro Level", "100 Hour", "Secret", "Most Cursed", "Fastest"],
    end: ["Challenge", "Run", "Speedrun", "Playthrough", "Tutorial", "Gameplay"]
  },
  Vlog: {
    start: ["My", "A Day in", "I Went", "What Happened When", "We Tried", "I Survived"],
    middle: ["Wild", "Unexpected", "Last Minute", "Entire", "First", "Worst"],
    end: ["Vlog", "Adventure", "Trip", "Day", "Experience", "Story"]
  },
  Challenge: {
    start: ["I Tried", "We Did", "Can I", "Nobody Could", "This Was", "The Hardest"],
    middle: ["24 Hour", "Impossible", "Mega", "No-Handshake", "Spicy", "Random"],
    end: ["Challenge", "Experiment", "Test", "Attempt", "Race", "Battle"]
  },
  Tutorial: {
    start: ["How to", "I Learned to", "The Easiest Way to", "Beginner Guide to", "Pro Tips for", "Fixing"],
    middle: ["Actually", "Instantly", "Perfectly", "Quickly", "Properly", "Efficiently"],
    end: ["Tutorial", "Guide", "Setup", "Workflow", "Strategy", "Tips"]
  },
  Reaction: {
    start: ["Reacting to", "My Reaction to", "We Watched", "This Broke Me:", "I Cannot Believe", "The Funniest"],
    middle: ["Most", "Newest", "Unhinged", "Legendary", "Unexpected", "Viral"],
    end: ["Reaction", "Clip", "Moment", "Video", "Compilation", "Trend"]
  },
  Comedy: {
    start: ["The Funniest", "When", "I Made", "This Skit", "The Worst", "POV:"],
    middle: ["Completely", "Accidentally", "Super", "Ridiculously", "Painfully", "Absolutely"],
    end: ["Sketch", "Skits", "Bit", "Moment", "Joke", "Fail"]
  }
};

const THUMB_TEXTS = [
  "VIRAL!",
  "NEW VIDEO",
  "TRENDING",
  "MUST WATCH",
  "DON'T MISS",
  "EPIC"
];

const UPGRADE_DEFS = {
  camera: { label: "Better Camera", base: 50, growth: 1.45, desc: "+2 passive views/sec per level" },
  editor: { label: "Hire Editor", base: 75, growth: 1.5, desc: "+1 passive likes/sec per level" },
  ads: { label: "Run Ads", base: 90, growth: 1.5, desc: "+1 passive subs/sec per level" },
  thumbnail: { label: "Thumbnail Boost", base: 100, growth: 1.55, desc: "+10% upload power per level" },
  manager: { label: "Channel Manager", base: 140, growth: 1.6, desc: "+$3 passive money/sec per level" }
};

const ACHIEVEMENTS = [
  { id: "firstUpload", title: "First Upload", desc: "Upload your first video.", icon: "▶", check: s => s.totalUploads >= 1 },
  { id: "hundredViews", title: "100 Views", desc: "Reach 100 total views.", icon: "👀", check: s => s.views >= 100 },
  { id: "creator", title: "Creator", desc: "Upload 10 videos.", icon: "🎬", check: s => s.totalUploads >= 10 },
  { id: "star", title: "Rising Star", desc: "Reach 100 subscribers.", icon: "⭐", check: s => s.subs >= 100 },
  { id: "viral", title: "Viral Hit", desc: "Get a single video to 5,000 views.", icon: "🔥", check: s => s.bestVideoViews >= 5000 },
  { id: "rich", title: "Making Bank", desc: "Earn $1,000.", icon: "💰", check: s => s.money >= 1000 },
  { id: "legend", title: "Channel Legend", desc: "Reach level 10.", icon: "🏆", check: s => s.level >= 10 }
];

const defaultState = {
  views: 0,
  likes: 0,
  subs: 0,
  money: 0,
  xp: 0,
  level: 1,
  streak: 0,
  totalUploads: 0,
  bestVideoViews: 0,
  currentTrend: randomChoice(TREND_TOPICS),
  lastTrendChange: Date.now(),
  titleDraft: "",
  selectedGenre: "Gaming",
  selectedLength: "medium",
  upgrades: {
    camera: 0,
    editor: 0,
    ads: 0,
    thumbnail: 0,
    manager: 0
  },
  achievements: {},
  videos: [],
  log: ["Welcome to your channel. Generate a title and upload your first video."]
};

let state = loadState(defaultState);

const el = {
  views: document.getElementById("views"),
  likes: document.getElementById("likes"),
  subs: document.getElementById("subs"),
  money: document.getElementById("money"),
  level: document.getElementById("level"),
  xp: document.getElementById("xp"),
  streak: document.getElementById("streak"),
  videoCount: document.getElementById("videoCount"),
  topVideo: document.getElementById("topVideo"),
  currentTrend: document.getElementById("currentTrend"),
  trendText: document.getElementById("trendText"),
  trendBadge: document.getElementById("trendBadge"),
  titleInput: document.getElementById("titleInput"),
  genreSelect: document.getElementById("genreSelect"),
  lengthSelect: document.getElementById("lengthSelect"),
  previewTitle: document.getElementById("previewTitle"),
  previewSubtitle: document.getElementById("previewSubtitle"),
  thumbPreview: document.getElementById("thumbPreview"),
  videoGrid: document.getElementById("videoGrid"),
  achievementsList: document.getElementById("achievementsList"),
  log: document.getElementById("log"),
  saveState: document.getElementById("saveState"),
  saveBtn: document.getElementById("saveBtn"),
  resetBtn: document.getElementById("resetBtn"),
  generateTitleBtn: document.getElementById("generateTitleBtn"),
  uploadBtn: document.getElementById("uploadBtn"),
  cameraBtn: document.getElementById("cameraBtn"),
  editorBtn: document.getElementById("editorBtn"),
  adsBtn: document.getElementById("adsBtn"),
  thumbnailBtn: document.getElementById("thumbnailBtn"),
  managerBtn: document.getElementById("managerBtn")
};

let passiveTick = 0;
let trendTick = 0;

function randomChoice(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

function clamp(n, min, max) {
  return Math.max(min, Math.min(max, n));
}

function formatNumber(n) {
  return Math.floor(n).toLocaleString();
}

function formatMoney(n) {
  return `$${Math.floor(n).toLocaleString()}`;
}

function getUpgradeCost(key) {
  const def = UPGRADE_DEFS[key];
  const level = state.upgrades[key];
  return Math.floor(def.base * Math.pow(def.growth, level));
}

function updateUpgradeButton(key, button) {
  const def = UPGRADE_DEFS[key];
  const cost = getUpgradeCost(key);
  const level = state.upgrades[key];
  button.innerHTML = `
    <span class="upgrade-title">${def.label}</span>
    Level ${level}
    <span class="upgrade-cost">${def.desc}<br>Cost: ${formatMoney(cost)}</span>
  `;
  button.disabled = state.money < cost;
}

function randomTitle(genre) {
  const pack = TITLE_PARTS[genre] || TITLE_PARTS.Gaming;
  const start = randomChoice(pack.start);
  const middle = randomChoice(pack.middle);
  const end = randomChoice(pack.end);
  return `${start} ${middle} ${end}`.replace(/\s+/g, " ").trim();
}

function generateThumbnailText(title) {
  return `${randomChoice(THUMB_TEXTS)}\n${title}`.toUpperCase();
}

function getLengthData(length) {
  if (length === "short") return { viewMult: 0.9, likeMult: 0.95, subMult: 1.05, moneyMult: 0.9 };
  if (length === "long") return { viewMult: 1.25, likeMult: 1.08, subMult: 1.02, moneyMult: 1.15 };
  return { viewMult: 1, likeMult: 1, subMult: 1, moneyMult: 1 };
}

function getTrendMultiplier(genre) {
  if (genre === state.currentTrend) return 1.55 + state.streak * 0.04;
  return 1;
}

function logMessage(text) {
  state.log.unshift(text);
  state.log = state.log.slice(0, 8);
}

function levelUpIfNeeded() {
  while (state.xp >= state.level * 100) {
    state.xp -= state.level * 100;
    state.level += 1;
    state.money += 20 * state.level;
    logMessage(`Level up! You reached level ${state.level}.`);
  }
}

function refreshTrend(force = false) {
  const now = Date.now();
  const elapsed = now - state.lastTrendChange;
  if (force || elapsed >= 30000) {
    let next = randomChoice(TREND_TOPICS);
    while (next === state.currentTrend) next = randomChoice(TREND_TOPICS);
    state.currentTrend = next;
    state.lastTrendChange = now;
    logMessage(`Trend changed to ${state.currentTrend}.`);
  }
}

function updateAchievements() {
  const unlocked = [];
  for (const ach of ACHIEVEMENTS) {
    const done = !!state.achievements[ach.id] || ach.check(state);
    if (done && !state.achievements[ach.id]) {
      state.achievements[ach.id] = true;
      logMessage(`Achievement unlocked: ${ach.title}`);
    }
    unlocked.push({ ...ach, done });
  }

  el.achievementsList.innerHTML = unlocked.map(a => `
    <div class="achievement ${a.done ? "unlocked" : ""}">
      <div class="ach-icon">${a.icon}</div>
      <div>
        <div class="ach-title">${a.title}</div>
        <div class="ach-desc">${a.desc}</div>
      </div>
      <div class="ach-state">${a.done ? "Unlocked" : "Locked"}</div>
    </div>
  `).join("");
}

function updateVideoGrid() {
  if (!state.videos.length) {
    el.videoGrid.innerHTML = `
      <div class="achievement" style="grid-column: 1 / -1;">
        <div class="ach-icon">📼</div>
        <div>
          <div class="ach-title">No uploads yet</div>
          <div class="ach-desc">Your thumbnails will show up here after you publish a video.</div>
        </div>
      </div>
    `;
    return;
  }

  el.videoGrid.innerHTML = state.videos.map(video => `
    <div class="video-card">
      <div class="video-thumb" style="background:${video.bg};">
        ${video.thumbText.replace(/\n/g, "<br>")}
      </div>
      <div class="video-meta">
        <strong>${video.title}</strong>
        ${video.genre} • ${video.lengthLabel}<br>
        ${formatNumber(video.views)} views • ${formatNumber(video.likes)} likes<br>
        ${video.trendMatch ? "Trend bonus applied" : "No trend bonus"}
      </div>
    </div>
  `).join("");
}

function updateUI() {
  el.views.textContent = formatNumber(state.views);
  el.likes.textContent = formatNumber(state.likes);
  el.subs.textContent = formatNumber(state.subs);
  el.money.textContent = formatMoney(state.money);
  el.level.textContent = formatNumber(state.level);
  el.xp.textContent = `${formatNumber(state.xp)}/${formatNumber(state.level * 100)}`;
  el.streak.textContent = formatNumber(state.streak);
  el.videoCount.textContent = formatNumber(state.totalUploads);

  el.currentTrend.textContent = state.currentTrend;
  el.trendText.textContent = `Uploading ${state.currentTrend} videos gives a bonus to views, likes, and subscribers.`;
  el.trendBadge.textContent = `Trend: ${state.currentTrend}`;
  el.titleInput.value = state.titleDraft || "";
  el.genreSelect.value = state.selectedGenre;
  el.lengthSelect.value = state.selectedLength;

  el.previewTitle.textContent = state.titleDraft || "Your title will appear here";
  el.previewSubtitle.textContent = `Genre: ${state.selectedGenre} • Length: ${state.selectedLength}`;
  el.thumbPreview.innerHTML = `<span>${generateThumbnailText(state.titleDraft || "YOUR VIDEO")}</span>`;

  const top = state.videos[0];
  el.topVideo.textContent = top ? `${top.title.slice(0, 24)}${top.title.length > 24 ? "..." : ""}` : "None yet";

  el.log.innerHTML = state.log.map(line => `• ${line}`).join("<br>");

  updateVideoGrid();
  updateAchievements();

  updateUpgradeButton("camera", el.cameraBtn);
  updateUpgradeButton("editor", el.editorBtn);
  updateUpgradeButton("ads", el.adsBtn);
  updateUpgradeButton("thumbnail", el.thumbnailBtn);
  updateUpgradeButton("manager", el.managerBtn);

  el.saveState.textContent = `Saved locally • ${new Date(state.lastTrendChange).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}`;

  saveState();
}

function saveState() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

function loadState(fallback) {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return structuredClone(fallback);
    const parsed = JSON.parse(raw);
    return {
      ...structuredClone(fallback),
      ...parsed,
      upgrades: { ...fallback.upgrades, ...(parsed.upgrades || {}) },
      achievements: { ...(parsed.achievements || {}) },
      videos: Array.isArray(parsed.videos) ? parsed.videos : [],
      log: Array.isArray(parsed.log) ? parsed.log : fallback.log,
    };
  } catch {
    return structuredClone(fallback);
  }
}

function buildVideo() {
  const genre = el.genreSelect.value;
  const length = el.lengthSelect.value;
  const title = (el.titleInput.value || randomTitle(genre)).trim();

  state.selectedGenre = genre;
  state.selectedLength = length;
  state.titleDraft = title;

  const lengthData = getLengthData(length);
  const trendMatch = genre === state.currentTrend;
  const trendMultiplier = getTrendMultiplier(genre);
  const thumbnailBonus = 1 + state.upgrades.thumbnail * 0.1;
  const baseViews = (80 + Math.random() * 140 + state.level * 12) * lengthData.viewMult;

  const views = Math.floor(baseViews * trendMultiplier * thumbnailBonus);
  const likes = Math.floor(views * (0.12 + state.upgrades.editor * 0.02) * lengthData.likeMult);
  const subs = Math.floor(views * (0.03 + state.upgrades.ads * 0.01) * lengthData.subMult);
  const money = Math.floor((views * 0.045 + likes * 0.02) * lengthData.moneyMult * (trendMatch ? 1.15 : 1));

  state.views += views;
  state.likes += likes;
  state.subs += subs;
  state.money += money;
  state.totalUploads += 1;
  state.bestVideoViews = Math.max(state.bestVideoViews, views);

  state.xp += Math.floor(views / 12 + likes / 3 + subs / 2);
  state.streak = trendMatch ? state.streak + 1 : 0;
  levelUpIfNeeded();

  const colors = [
    "linear-gradient(135deg, #ff3d71, #7c5cff 50%, #0ea5e9)",
    "linear-gradient(135deg, #f59e0b, #ef4444 55%, #8b5cf6)",
    "linear-gradient(135deg, #22c55e, #06b6d4 55%, #6366f1)",
    "linear-gradient(135deg, #ec4899, #8b5cf6 52%, #14b8a6)"
  ];

  state.videos.unshift({
    title,
    genre,
    lengthLabel: length.charAt(0).toUpperCase() + length.slice(1),
    views,
    likes,
    subs,
    trendMatch,
    bg: randomChoice(colors),
    thumbText: generateThumbnailText(title)
  });

  state.videos = state.videos.slice(0, 8);

  logMessage(
    `Uploaded "${title}" • +${formatNumber(views)} views, +${formatNumber(likes)} likes, +${formatNumber(subs)} subs, +${formatMoney(money)}`
  );

  state.titleDraft = "";
  updateUI();
}

function buyUpgrade(key) {
  const cost = getUpgradeCost(key);
  if (state.money < cost) {
    logMessage(`Not enough money for ${UPGRADE_DEFS[key].label}.`);
    return;
  }

  state.money -= cost;
  state.upgrades[key] += 1;
  logMessage(`${UPGRADE_DEFS[key].label} upgraded to level ${state.upgrades[key]}.`);
  updateUI();
}

function resetGame() {
  localStorage.removeItem(STORAGE_KEY);
  state = structuredClone(defaultState);
  logMessage("Save deleted. Fresh start loaded.");
  updateUI();
}

function saveNow() {
  saveState();
  el.saveState.textContent = "Saved now";
  setTimeout(() => updateUI(), 500);
}

function generateAndPreviewTitle() {
  const genre = el.genreSelect.value;
  const trend = state.currentTrend;
  const title = `${randomTitle(genre)} — ${trend} Edition`;
  state.titleDraft = title;
  state.selectedGenre = genre;
  state.selectedLength = el.lengthSelect.value;
  updateUI();
}

el.generateTitleBtn.addEventListener("click", generateAndPreviewTitle);
el.uploadBtn.addEventListener("click", buildVideo);
el.cameraBtn.addEventListener("click", () => buyUpgrade("camera"));
el.editorBtn.addEventListener("click", () => buyUpgrade("editor"));
el.adsBtn.addEventListener("click", () => buyUpgrade("ads"));
el.thumbnailBtn.addEventListener("click", () => buyUpgrade("thumbnail"));
el.managerBtn.addEventListener("click", () => buyUpgrade("manager"));
el.saveBtn.addEventListener("click", saveNow);
el.resetBtn.addEventListener("click", resetGame);

el.genreSelect.addEventListener("change", () => {
  state.selectedGenre = el.genreSelect.value;
  generateAndPreviewTitle();
});

el.lengthSelect.addEventListener("change", () => {
  state.selectedLength = el.lengthSelect.value;
  updateUI();
});

el.titleInput.addEventListener("input", () => {
  state.titleDraft = el.titleInput.value;
  updateUI();
});

window.addEventListener("beforeunload", saveState);

setInterval(() => {
  passiveTick += 1;
  trendTick += 1;

  const viewGain = 1 + state.upgrades.camera * 2 + Math.floor(state.level / 2);
  const likeGain = state.upgrades.editor;
  const subGain = state.upgrades.ads;
  const moneyGain = state.upgrades.manager * 3 + Math.floor(state.subs / 200);

  state.views += viewGain;
  state.likes += likeGain;
  state.subs += subGain;
  state.money += moneyGain;
  state.xp += 1 + state.upgrades.thumbnail * 0.2;

  if (passiveTick % 5 === 0) {
    logMessage(`Passive income: +${viewGain} views, +${likeGain} likes, +${subGain} subs, +${formatMoney(moneyGain)}.`);
  }

  if (trendTick % 30 === 0) {
    refreshTrend(true);
  }

  levelUpIfNeeded();
  updateUI();
}, 1000);

updateUI();
refreshTrend(false);
generateAndPreviewTitle();