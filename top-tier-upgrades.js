(() => {
  const key = "muffins-sky-run-premium-v1";
  const state = JSON.parse(localStorage.getItem(key) || "null") || {
    world: "Cloudway One",
    glide: 26,
    rhythm: 18,
    wardrobe: 30,
    medals: 0,
    route: 1,
    board: "Cloud Scooter",
    event: "Morning Bakery Dash",
    serviceStatus: "Offline medal queue ready",
  };
  const worlds = ["Cloudway One", "Rainbow Jetstream", "Mooncake Heights", "Aurora Bakery"];
  const boards = ["Cloud Scooter", "Cupcake Hoverboard", "Rainbow Glider", "Moon Bun Rocket"];
  const events = ["Morning Bakery Dash", "Season Hunt", "Rivals Challenge", "Super Runner Trial"];
  const save = () => localStorage.setItem(key, JSON.stringify(state));
  const clamp = (value) => Math.max(0, Math.min(100, value));

  function train(field) {
    state[field] = clamp(state[field] + 14);
    state.medals += 1;
    if (state.medals % 3 === 0) {
      state.route = (state.route % worlds.length) + 1;
      state.world = worlds[state.route - 1];
      state.board = boards[state.route - 1];
      state.event = events[state.route - 1];
    }
    state.serviceStatus = `Queued ${state.medals} medals for future /api/sky-run/progress sync`;
    save();
    render();
  }

  function render() {
    const app = document.querySelector("#app");
    if (!app) return;
    let panel = document.querySelector("#skyPremium");
    if (!panel) {
      panel = document.createElement("section");
      panel.id = "skyPremium";
      panel.className = "sky-premium";
      app.insertAdjacentElement("afterend", panel);
    }

    panel.innerHTML = `
      <div class="sky-premium__top">
        <div>
          <h2>Sky Arcade Director</h2>
          <p>Turns each run into a stronger arcade loop with route variety, medal goals, and a wardrobe economy.</p>
        </div>
        <span class="sky-ticket">${state.world} · ${state.medals} medals</span>
      </div>
      <div class="sky-premium__grid">
        <article class="sky-module">
          <h3>Glide School</h3>
          <p>Sharper jump windows and cleaner obstacle rhythm for the first 30 seconds.</p>
          <div class="sky-track"><span style="width:${state.glide}%"></span></div>
          <button data-train="glide">Practice Glide</button>
        </article>
        <article class="sky-module">
          <h3>World Rotation</h3>
          <p>Route ${state.route} unlocks fresh color, obstacle pacing, and daily score goals.</p>
          <div class="sky-track"><span style="width:${state.rhythm}%"></span></div>
          <button data-train="rhythm">Tune Route</button>
        </article>
        <article class="sky-module">
          <h3>Cloud Boutique</h3>
          <p>${state.board} unlocked path. Character and board progression becomes the replay chase.</p>
          <div class="sky-track"><span style="width:${state.wardrobe}%"></span></div>
          <button data-train="wardrobe">Style Reward</button>
        </article>
        <article class="sky-module">
          <h3>Season Event</h3>
          <p>${state.event} adds daily missions, event tokens, and limited-time route flavor.</p>
          <div class="sky-track"><span style="width:${clamp(state.rhythm + state.glide / 3)}%"></span></div>
          <button data-train="rhythm">Run Event</button>
        </article>
        <article class="sky-module">
          <h3>Powerup Lab</h3>
          <p>Magnet, shield, double-jump, and glide boost tracks make each run feel more tactical.</p>
          <div class="sky-track"><span style="width:${clamp(state.glide + state.wardrobe / 3)}%"></span></div>
          <button data-train="glide">Tune Powerup</button>
        </article>
        <article class="sky-module">
          <h3>Leaderboard Goals</h3>
          <p>Bronze, silver, and gold medal targets create visible mastery beyond endless distance.</p>
          <div class="sky-track"><span style="width:${clamp(state.medals * 9)}%"></span></div>
          <button data-train="wardrobe">Set Goal</button>
        </article>
        <article class="sky-module">
          <h3>Cloud Sync Contract</h3>
          <p>${state.serviceStatus}. Stores medals, active board, route, event, and daily-score snapshot.</p>
          <div class="sky-track"><span style="width:${clamp(30 + state.medals * 6)}%"></span></div>
          <button data-train="glide">Queue Sync</button>
        </article>
      </div>
    `;

    panel.querySelectorAll("[data-train]").forEach((button) => {
      button.addEventListener("click", () => train(button.dataset.train));
    });
  }

  render();
})();
