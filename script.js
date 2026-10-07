const RACES = {
  "平人": {
    stats: { str: 10, vit: 10, dex: 10, int: 10, mnd: 10, luk: 77 },
    growth: { str: 50, vit: 50, dex: 50, int: 50, mnd: 50 }
  },
  "翼人": {
    stats: { str: 9, vit: 9, dex: 12, int: 10, mnd: 12, luk: 40 },
    growth: { str: 70, vit: 60, dex: 80, int: 70, mnd: 80 }
  },
  "洞人": {
    stats: { str: 13, vit: 13, dex: 13, int: 5, mnd: 6, luk: 65 },
    growth: { str: 40, vit: 40, dex: 30, int: 15, mnd: 20 }
  },
  "森人": {
    stats: { str: 7, vit: 8, dex: 11, int: 12, mnd: 12, luk: 55 },
    growth: { str: 20, vit: 20, dex: 20, int: 30, mnd: 30 }
  }
};

const BACKGROUNDS = [
  { name: "凡才", bonus: 9, rate: 84 },
  { name: "非凡", bonus: 15, rate: 10 },
  { name: "天才", bonus: 25, rate: 5 },
  { name: "英雄", bonus: 50, rate: 1 }
];

const JOBS = [
  { name: "戦士", type: "基本職", conditions: { str: 14 } },
  { name: "狩人", type: "基本職", conditions: { dex: 14 } },
  { name: "僧侶", type: "基本職", conditions: { mnd: 14 } },
  { name: "魔法使い", type: "基本職", conditions: { int: 14 } },
  { name: "聖騎士", type: "上級職", conditions: { str: 16, vit: 16, mnd: 16 } },
  { name: "戦乙女", type: "上級職", conditions: { str: 16, int: 16, mnd: 16 } },
  { name: "賢者", type: "上級職", conditions: { int: 18, mnd: 18 } },
  { name: "忍者", type: "上級職", conditions: { str: 16, dex: 16, int: 16 } }
];

const STAT_LABELS = {
  str: "STR",
  vit: "VIT",
  dex: "DEX",
  int: "INT",
  mnd: "MND",
  luk: "LUK"
};

// 画像を追加する場合は要素を増やす
const IMAGE_OPTIONS = {
  "平人": ["01_a.png", "02_a.png", "03_a.png", "04_a.png", "05_a.png", "06_a.png", "07_a.png", "08_a.png", "09_a.png", "10_a.png", "11_a.png", "12_a.png", "13_a.png", "14_a.png", "15_a.png", "16_a.png", "17_a.png", "18_a.png", "19_a.png", "20_a.png", "21_a.png", "22_a.png", "23_a.png", "24_a.png"],
  "翼人": ["01_a.png", "02_a.png", "03_a.png"],
  "洞人": ["01_a.png", "02_a.png", "03_a.png", "04_a.png", "05_a.png", "06_a.png", "07_a.png", "08_a.png", "09_a.png", "10_a.png", "11_a.png", "12_a.png", "13_a.png", "14_a.png", "15_a.png", "16_a.png", "17_a.png", "18_a.png", "19_a.png", "20_a.png", "21_a.png"],
  "森人": ["01_a.png", "02_a.png", "03_a.png"]
};

// ゲームの状態の初期設定
const state = {
  candidates: [],
  currentCharacter: null,
  party: [],
  selectedImage: null
};

const $ = (selector) => document.querySelector(selector);

function randomByRate(items) {
  const rand = Math.random() * 100;
  let sum = 0;

  for (const item of items) {
    sum += item.rate;
    if (rand < sum) return item;
  }
  return items[items.length - 1];
}

function randomRace() {
  const rand = Math.random();

  if (rand < 0.50) return "平人";
  if (rand < 0.70) return "翼人";
  if (rand < 0.90) return "洞人";
  return "森人";
}

// 募集結果の初期キャラ情報をセット
function createCandidate() {
  const raceName = randomRace();
  const background = randomByRate(BACKGROUNDS);
  const race = RACES[raceName];

  return {
    id: createId(),
    race: raceName,
    background: background.name,
    bonus: background.bonus,
    stats: { ...race.stats },
    baseStats: { ...race.stats },
    growthRate: { ...race.growth },
    level: 1,
    exp: 0,
    hp: race.stats.vit * 3 + 1
  };
}

// 4人分の候補を作る
function generateCandidates() {
  state.candidates = Array.from({ length: 4 }, createCandidate);
  renderCandidates();
}

function showScreen(screenId) {
  document.querySelectorAll(".screen").forEach(screen => {
    screen.classList.toggle("active", screen.id === screenId);
  });
  window.scrollTo({ top: 0, behavior: "smooth" });
}

// 候補者4人の画面表示
function renderCandidates() {
  const container = $("#candidateList");
  container.innerHTML = "";

  state.candidates.forEach((candidate, index) => {
    const card = document.createElement("article");
    card.className = "candidate-card";

    const stats = Object.entries(candidate.stats)
      .map(([key, value]) => `<div>${STAT_LABELS[key]} ${value}</div>`)
      .join("");

    card.innerHTML = `
      <div class="avatar-placeholder">仮画像<br>候補者 ${index + 1}</div>
      <h3>候補者 ${index + 1}</h3>
      <div>
        <span class="tag">${candidate.race}</span>
        <span class="tag">${candidate.background}</span>
      </div>
      <div class="candidate-stats">${stats}</div>
      <button class="primary-button select-candidate">この冒険者を選ぶ</button>
    `;

    card.querySelector(".select-candidate").addEventListener("click", () => {
      startCharacterMake(candidate);
    });

    container.appendChild(card);
  });
}

function startCharacterMake(candidate) {
  state.currentCharacter = JSON.parse(JSON.stringify(candidate));
  const imageList = IMAGE_OPTIONS[state.currentCharacter.race];
  state.selectedImage = `images/portrait/${state.currentCharacter.race}/${imageList[0]}`;
  state.currentCharacter.image = state.selectedImage;
  state.currentCharacter.job = null;

  $("#nameInput").value = "";
  $("#nameError").textContent = "";

  renderCharacterMake();
  showScreen("makeScreen");
}

function renderCharacterMake() {
  const character = state.currentCharacter;
  if (!character) return;

  $("#makeRace").textContent = character.race;
  $("#makeBackground").textContent = character.background;
  $("#makeHp").textContent = character.stats.vit * 3 + character.level;
  $("#remainingBonus").textContent = character.bonus;

  renderStats();
  renderJobs();
  renderImages();
  renderSelectedImage();
}

function renderStats() {
  const character = state.currentCharacter;
  const container = $("#statList");
  container.innerHTML = "";

  Object.keys(STAT_LABELS).forEach(key => {
    const base = character.baseStats[key];
    const value = character.stats[key];
    const isLuk = key === "luk";
    const max = base * 2;
    const used = value - base;

    const row = document.createElement("div");
    row.className = "stat-row";

    row.innerHTML = `
      <div class="stat-name">${STAT_LABELS[key]}</div>
      <div class="stat-base">基礎 ${base}</div>
      <div class="stat-bar"><span style="width:${Math.min(100, value / max * 100)}%"></span></div>
      <div class="stat-value">${value}${isLuk ? "" : ` / ${max}`}</div>
      <button class="stat-button minus" ${isLuk || used <= 0 ? "disabled" : ""}>−</button>
      <button class="stat-button plus" ${isLuk || character.bonus <= 0 || value >= max ? "disabled" : ""}>＋</button>
    `;

    row.querySelector(".minus").addEventListener("click", () => {
      character.stats[key]--;
      character.bonus++;
      updateCharacterAfterStatChange();
    });

    row.querySelector(".plus").addEventListener("click", () => {
      character.stats[key]++;
      character.bonus--;
      updateCharacterAfterStatChange();
    });

    container.appendChild(row);
  });
}

function updateCharacterAfterStatChange() {
  state.currentCharacter.hp =
    state.currentCharacter.stats.vit * 3 + state.currentCharacter.level;

  renderCharacterMake();
}

function checkJobConditions(job, stats) {
  return Object.entries(job.conditions).every(
    ([key, required]) => stats[key] >= required
  );
}

function formatConditions(job, stats) {
  return Object.entries(job.conditions)
    .map(([key, required]) => {
      const current = stats[key];
      const ok = current >= required;
      return `<div class="${ok ? "condition-ok" : ""}">
        ${STAT_LABELS[key]} ${required}以上（現在 ${current}）
      </div>`;
    })
    .join("");
}

function renderJobs() {
  const character = state.currentCharacter;
  const container = $("#jobList");
  container.innerHTML = "";

  JOBS.forEach(job => {
    const available = checkJobConditions(job, character.stats);
    const selected = character.job === job.name;

    const button = document.createElement("button");
    button.className = `job-card ${selected ? "selected" : ""}`;
    button.disabled = !available;

    button.innerHTML = `
      <div class="job-name">${job.name}</div>
      <div class="job-type">${job.type}</div>
      <div class="job-condition">${formatConditions(job, character.stats)}</div>
      <div class="job-status ${available ? "ok" : "ng"}">
        ${available ? "選択可能" : "能力値が不足"}
      </div>
    `;

    if (available) {
      button.addEventListener("click", () => {
        character.job = job.name;
        renderJobs();
      });
    }

    container.appendChild(button);
  });
}

function renderImages() {
  const container = $("#imageList");
  container.innerHTML = "";

  // 今のキャラクターの種族に対応する画像一覧を取得
  const imageList = IMAGE_OPTIONS[state.currentCharacter.race];

  imageList.forEach(file => {

    // 実際の画像ファイルの場所を作る
    const src = `images/portrait/${state.currentCharacter.race}/${file}`;

    const option = document.createElement("div");

    option.className =
      `image-option ${state.selectedImage === src ? "selected" : ""}`;

    option.innerHTML =
      `<img src="${src}" alt="キャラクター画像">`;

    option.addEventListener("click", () => {

      // この画像を選択した
      state.selectedImage = src;

      // キャラクターにも保存
      state.currentCharacter.image = src;

      renderImages();
      renderSelectedImage();
    });

    container.appendChild(option);
  });
}

function renderSelectedImage() {
  const container = $("#selectedImagePreview");

  if (state.selectedImage) {
    container.innerHTML =  `<img src="${state.selectedImage}" alt="選択画像">`;
  } else {
    container.innerHTML = "選択画像<br>仮表示";
  }
}

function completeCharacter() {
  const character = state.currentCharacter;
  const name = $("#nameInput").value.trim();

  if (!name) {
    $("#nameError").textContent = "名前を入力してください。";
    return;
  }

  if (!character.job) {
    $("#nameError").textContent = "職業を1つ選択してください。";
    return;
  }

  if (character.bonus !== 0) {
    $("#nameError").textContent = `出自ボーナスをあと${character.bonus}pt配分してください。`;
    return;
  }

  character.name = name;
  character.hp = character.stats.vit * 3 + character.level;

  state.party.push(character);
  state.currentCharacter = null;

  renderParty();
  showScreen("partyScreen");
}

function renderParty() {
  $("#partyCount").textContent = `${state.party.length} / 4`;

  const townPreview = $("#partyPreview");
  townPreview.innerHTML = "";
  townPreview.classList.toggle("empty", state.party.length === 0);

  for (let i = 0; i < 4; i++) {
    const mini = document.createElement("div");
    mini.className = "party-mini";

    const character = state.party[i];

    if (character) {
      mini.innerHTML = `
        <div class="mini-avatar">
          <img src="${character.image}" alt="${escapeHtml(character.name)}">
        </div>

        <div class="mini-info">
          <strong>${escapeHtml(character.name)}</strong>
          <div>Lv ${character.level}</div>
          <div>${escapeHtml(character.job)}</div>
        </div>
      `;
    } else {
      mini.innerHTML = `
        <div class="mini-empty">
          空き
        </div>
      `;
    }
    townPreview.appendChild(mini);
  };

  const list = $("#partyList");
  list.innerHTML = "";

  if (state.party.length === 0) {
    list.innerHTML = `<div class="empty-message">まだ冒険者はいません。</div>`;
    return;
  }

  state.party.forEach((character, index) => {
    const card = document.createElement("article");
    card.className = "party-card";

    card.innerHTML = `
      <div class="avatar-placeholder">選択画像<br>${escapeHtml(character.image)}</div>
      <h3>${escapeHtml(character.name)}</h3>
      <div>
        <span class="tag">${character.race}</span>
        <span class="tag">${character.background}</span>
        <span class="tag">${character.job}</span>
      </div>
      <div class="candidate-stats">
        ${Object.entries(character.stats).map(([key, value]) =>
          `<div>${STAT_LABELS[key]} ${value}</div>`).join("")}
      </div>
      <div>HP：${character.hp}</div>
      <button class="remove-button">パーティーから外す（テスト）</button>
    `;

    card.querySelector(".remove-button").addEventListener("click", () => {
      state.party.splice(index, 1);
      renderParty();
    });

    list.appendChild(card);
  });
}

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function createId() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2);
}

$("#recruitButton").addEventListener("click", () => {
  if (state.party.length >= 4) {
    alert("パーティーは4人までです。");
    showScreen("partyScreen");
    return;
  }

  generateCandidates();
  showScreen("recruitScreen");
});

$("#partyRecruitButton").addEventListener("click", () => {
  if (state.party.length >= 4) {
    alert("パーティーは4人で満員です。");
    return;
  }

  generateCandidates();
  showScreen("recruitScreen");
});

$("#rerollButton").addEventListener("click", () => {
  generateCandidates();
});

$("#completeCharacterButton").addEventListener("click", completeCharacter);

$("#backToRecruitButton").addEventListener("click", () => {
  showScreen("recruitScreen");
});

$("#emptyPartyButton").addEventListener("click", () => {
  if (confirm("テスト用にパーティーを空にしますか？")) {
    state.party = [];
    renderParty();
    showScreen("townScreen");
  }
});

document.querySelectorAll("[data-back]").forEach(button => {
  button.addEventListener("click", () => showScreen(button.dataset.back));
});

renderParty();
