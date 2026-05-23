(() => {
  const key = "muffins-sky-run-v1";
  const state = JSON.parse(localStorage.getItem(key) || "null") || { best: 0, coins: 0, runs: 0 };
  const save = () => localStorage.setItem(key, JSON.stringify(state));

  document.head.insertAdjacentHTML("beforeend", `<style>
    body{margin:0;background:linear-gradient(180deg,#8fd7ff,#eefbff);font:16px/1.4 system-ui,sans-serif;color:#17314b}
    main{max-width:980px;margin:0 auto;padding:28px 20px 40px}.sky-shell{display:grid;gap:18px}.sky-card,.sky-game{background:rgba(255,255,255,.72);backdrop-filter:blur(8px);border:1px solid rgba(54,115,157,.22);border-radius:24px;padding:18px}
    .sky-top,.sky-stats,.sky-controls{display:flex;gap:12px;flex-wrap:wrap;align-items:center}.sky-stats span{background:#dff4ff;padding:8px 12px;border-radius:999px}
    button{font:inherit;padding:11px 14px;border:none;border-radius:14px;background:#1f7cf0;color:#fff;font-weight:700;cursor:pointer}.ghost{background:#eff7ff;color:#1f5aa6}
    canvas{width:100%;height:auto;background:linear-gradient(180deg,#83d7ff,#e9fbff 62%,#b6f2c3 62%,#8fd69b 100%);border-radius:18px;display:block}
  </style>`);

  const main = document.querySelector("main");
  main.innerHTML = `
    <div class="sky-shell">
      <section class="sky-card">
        <div class="sky-top">
          <div>
            <p>Playable endless runner</p>
            <h1>Muffin's Sky Run</h1>
          </div>
          <div class="sky-controls">
            <button id="startBtn" type="button">Start Run</button>
            <button id="jumpBtn" class="ghost" type="button">Jump</button>
          </div>
        </div>
        <div class="sky-stats">
          <span id="score">Score 0</span>
          <span id="coins">Coins ${state.coins}</span>
          <span id="best">Best ${state.best}</span>
        </div>
      </section>
      <section class="sky-game">
        <canvas id="game" width="920" height="300" aria-label="Muffin's Sky Run game area"></canvas>
      </section>
    </div>`;

  const canvas = document.querySelector("#game");
  const ctx = canvas.getContext("2d");
  const scoreEl = document.querySelector("#score");
  const coinsEl = document.querySelector("#coins");
  const bestEl = document.querySelector("#best");

  const player = { x: 80, y: 220, vy: 0, size: 34 };
  let running = false;
  let score = 0;
  let animation = 0;
  let obstacle = { x: 980, width: 28, height: 42 };

  function reset() {
    player.y = 220;
    player.vy = 0;
    obstacle = { x: 980, width: 28 + Math.random() * 20, height: 38 + Math.random() * 24 };
    score = 0;
  }

  function jump() {
    if (player.y >= 220) player.vy = -13;
  }

  function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = "#ffffff";
    ctx.beginPath();
    ctx.arc(160, 74, 30, 0, Math.PI * 2);
    ctx.arc(188, 70, 25, 0, Math.PI * 2);
    ctx.arc(214, 78, 22, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = "#8256ff";
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
      coinsEl.textContent = `Coins ${state.coins}`;
      bestEl.textContent = `Best ${state.best}`;
      save();
    }
    const hit = player.x + player.size > obstacle.x && player.x < obstacle.x + obstacle.width && player.y + player.size > 260 - obstacle.height;
    if (hit) {
      running = false;
      state.runs += 1;
      state.best = Math.max(state.best, score);
      save();
      bestEl.textContent = `Best ${state.best}`;
      alert(`Run over. Score ${score}. Best ${state.best}.`);
      return;
    }
    scoreEl.textContent = `Score ${score}`;
    draw();
    animation = requestAnimationFrame(loop);
  }

  document.querySelector("#startBtn").addEventListener("click", () => {
    cancelAnimationFrame(animation);
    reset();
    running = true;
    scoreEl.textContent = "Score 0";
    draw();
    loop();
  });
  document.querySelector("#jumpBtn").addEventListener("click", jump);
  window.addEventListener("keydown", (event) => {
    if (event.code === "Space" || event.code === "ArrowUp") jump();
  });

  draw();
})();
