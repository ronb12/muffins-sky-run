(() => {
  const app = document.querySelector("#app");
  const tabs = [...document.querySelectorAll(".subnav-tab")];
  const key = "muffins-sky-run-v2";
  const state = JSON.parse(localStorage.getItem(key) || "null") || {
    activeTab: "hangar",
    best: 0,
    coins: 12,
    runs: 0,
    selectedSkin: "classic",
    unlocked: ["classic"],
    lastScore: 0,
    challenges: [
      { id: "c1", label: "Collect 20 coins", reward: 10, done: false },
      { id: "c2", label: "Finish a 60-point run", reward: 15, done: false },
      { id: "c3", label: "Complete 3 runs", reward: 12, done: false }
    ]
  };

  const skins = [
    { id: "classic", name: "Cloud Muffin", cost: 0, accent: "#8256ff" },
    { id: "sunset", name: "Sunset Stripe", cost: 20, accent: "#ff7f50" },
    { id: "mint", name: "Mint Glide", cost: 35, accent: "#22c55e" }
  ];

  let running = false;
  let score = 0;
  let animation = 0;
  let canvas;
  let ctx;
  const player = { x: 80, y: 220, vy: 0, size: 34 };
  let obstacle = { x: 980, width: 28, height: 42 };

  function save() {
    localStorage.setItem(key, JSON.stringify(state));
  }

  function bindTabs() {
    tabs.forEach((tab) => {
      tab.classList.toggle("active", tab.dataset.tab === state.activeTab);
      tab.onclick = () => {
        state.activeTab = tab.dataset.tab;
        render();
      };
    });
  }

  function renderCollection(items, mapper, emptyText) {
    return items.length ? items.map(mapper).join("") : `<div class="empty-card">${emptyText}</div>`;
  }

  function updateChallenges() {
    state.challenges.forEach((challenge) => {
      if (challenge.id === "c1" && state.coins >= 20) challenge.done = true;
      if (challenge.id === "c2" && state.best >= 60) challenge.done = true;
      if (challenge.id === "c3" && state.runs >= 3) challenge.done = true;
    });
  }

  function renderHangar() {
    const selected = skins.find((skin) => skin.id === state.selectedSkin);
    return `
      <section class="split-layout">
        <article class="panel spotlight">
          <span class="eyebrow small">Current flyer</span>
          <h2>${selected.name}</h2>
          <p>Best score ${state.best} • Coins ${state.coins} • Runs ${state.runs}</p>
          <div class="pilot-preview" style="--accent:${selected.accent}">
            <div class="pilot-body"></div>
          </div>
        </article>
        <article class="panel">
          <h2>Hangar Log</h2>
          <div class="hangar-stats">
            <div><span class="muted">Last run</span><strong>${state.lastScore}</strong></div>
            <div><span class="muted">Unlocked skins</span><strong>${state.unlocked.length}</strong></div>
            <div><span class="muted">Daily goals done</span><strong>${state.challenges.filter((c) => c.done).length}</strong></div>
          </div>
          <button id="quickStart" type="button">Quick Start Run</button>
        </article>
      </section>
    `;
  }

  function renderRun() {
    return `
      <section class="panel">
        <div class="runner-head">
          <div>
            <h2>Sky Course</h2>
            <p class="muted">Jump with Space or Arrow Up, dodge towers, and chase a new best.</p>
          </div>
          <div class="runner-stats">
            <span id="score">Score 0</span>
            <span id="coins">Coins ${state.coins}</span>
            <span id="best">Best ${state.best}</span>
          </div>
        </div>
        <div class="runner-actions">
          <button id="startBtn" type="button">Start Run</button>
          <button id="jumpBtn" class="ghost" type="button">Jump</button>
        </div>
        <canvas id="game" width="920" height="300" aria-label="Muffin's Sky Run game area"></canvas>
      </section>
    `;
  }

  function renderChallenges() {
    return `
      <section class="panel">
        <h2>Challenge Board</h2>
        <div class="challenge-grid">
          ${state.challenges.map((challenge) => `
            <article class="challenge-card ${challenge.done ? "done" : ""}">
              <strong>${challenge.label}</strong>
              <p>${challenge.done ? "Completed" : "In progress"}</p>
              <span>Reward ${challenge.reward} coins</span>
            </article>
          `).join("")}
        </div>
      </section>
    `;
  }

  function renderWardrobe() {
    return `
      <section class="panel">
        <h2>Wardrobe</h2>
        <div class="skin-grid">
          ${skins.map((skin) => {
            const unlocked = state.unlocked.includes(skin.id);
            const active = state.selectedSkin === skin.id;
            return `
              <article class="skin-card ${active ? "active" : ""}">
                <div class="swatch" style="--accent:${skin.accent}"></div>
                <strong>${skin.name}</strong>
                <p>${unlocked ? "Unlocked" : `${skin.cost} coins`}</p>
                <button data-skin="${skin.id}" type="button">${unlocked ? (active ? "Equipped" : "Equip") : "Unlock"}</button>
              </article>
            `;
          }).join("")}
        </div>
      </section>
    `;
  }

  function render() {
    updateChallenges();
    let view = renderHangar();
    if (state.activeTab === "run") view = renderRun();
    if (state.activeTab === "challenges") view = renderChallenges();
    if (state.activeTab === "wardrobe") view = renderWardrobe();

    app.innerHTML = `
      <section class="metrics">
        <article class="metric"><span class="muted">Best</span><strong>${state.best}</strong></article>
        <article class="metric"><span class="muted">Coins</span><strong>${state.coins}</strong></article>
        <article class="metric"><span class="muted">Runs</span><strong>${state.runs}</strong></article>
        <article class="metric"><span class="muted">Goals done</span><strong>${state.challenges.filter((c) => c.done).length}</strong></article>
      </section>
      ${view}
    `;
    bindTabs();
    bindActions();
  }

  function resetRun() {
    player.y = 220;
    player.vy = 0;
    obstacle = { x: 980, width: 28 + Math.random() * 20, height: 38 + Math.random() * 24 };
    score = 0;
  }

  function jump() {
    if (player.y >= 220) player.vy = -13;
  }

  function draw() {
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = "#ffffff";
    ctx.beginPath();
    ctx.arc(160, 74, 30, 0, Math.PI * 2);
    ctx.arc(188, 70, 25, 0, Math.PI * 2);
    ctx.arc(214, 78, 22, 0, Math.PI * 2);
    ctx.fill();

    const skin = skins.find((item) => item.id === state.selectedSkin) || skins[0];
    ctx.fillStyle = skin.accent;
    ctx.fillRect(player.x, player.y, player.size, player.size);
    ctx.fillStyle = "#f0b957";
    ctx.fillRect(player.x + 8, player.y - 8, 18, 10);

    ctx.fillStyle = "#ef7b6f";
    ctx.fillRect(obstacle.x, 260 - obstacle.height, obstacle.width, obstacle.height);
  }

  function loop() {
    if (!running) return;
    player.vy += 0.7;
    player.y = Math.min(220, player.y + player.vy);
    if (player.y === 220) player.vy = 0;
    obstacle.x -= 8;
    if (obstacle.x + obstacle.width < 0) {
      obstacle.x = 980;
      obstacle.width = 28 + Math.random() * 20;
      obstacle.height = 38 + Math.random() * 24;
      score += 10;
      state.coins += 2;
      state.best = Math.max(state.best, score);
      save();
    }
    const hit = player.x + player.size > obstacle.x && player.x < obstacle.x + obstacle.width && player.y + player.size > 260 - obstacle.height;
    if (hit) {
      running = false;
      state.runs += 1;
      state.lastScore = score;
      state.best = Math.max(state.best, score);
      save();
      render();
      return;
    }
    document.querySelector("#score").textContent = `Score ${score}`;
    document.querySelector("#coins").textContent = `Coins ${state.coins}`;
    document.querySelector("#best").textContent = `Best ${state.best}`;
    draw();
    animation = requestAnimationFrame(loop);
  }

  function bindActions() {
    document.querySelector("#quickStart")?.addEventListener("click", () => {
      state.activeTab = "run";
      render();
    });

    document.querySelector("#startBtn")?.addEventListener("click", () => {
      canvas = document.querySelector("#game");
      ctx = canvas.getContext("2d");
      cancelAnimationFrame(animation);
      resetRun();
      running = true;
      draw();
      loop();
    });

    document.querySelector("#jumpBtn")?.addEventListener("click", jump);

    document.querySelectorAll("[data-skin]").forEach((button) => {
      button.addEventListener("click", () => {
        const skin = skins.find((item) => item.id === button.dataset.skin);
        if (!skin) return;
        if (!state.unlocked.includes(skin.id)) {
          if (state.coins < skin.cost) return;
          state.coins -= skin.cost;
          state.unlocked.push(skin.id);
        }
        state.selectedSkin = skin.id;
        save();
        render();
      });
    });
  }

  window.addEventListener("keydown", (event) => {
    if (state.activeTab === "run" && (event.code === "Space" || event.code === "ArrowUp")) jump();
  });

  save();
  render();
})();
