async function loadData() {
  const res = await fetch("data.json");
  if (!res.ok) {
    throw new Error("Failed to load data.json");
  }
  return res.json();
}

function setText(id, value) {
  const el = document.getElementById(id);
  if (el) {
    el.textContent = value ?? "";
  }
}

function setHref(id, value) {
  const el = document.getElementById(id);
  if (el) {
    if (value && value !== "#") {
      el.href = value;
    } else {
      el.removeAttribute("href");
    }
  }
}

function renderList(listId, items) {
  const list = document.getElementById(listId);
  if (!list) return;
  list.innerHTML = "";
  items.forEach((item) => {
    const li = document.createElement("li");
    li.textContent = item;
    list.appendChild(li);
  });
}

function renderPills(listId, items) {
  const list = document.getElementById(listId);
  if (!list) return;
  list.innerHTML = "";
  items.forEach((item) => {
    const li = document.createElement("li");
    li.className = "pill";
    li.textContent = item;
    list.appendChild(li);
  });
}

function renderProjects(projects) {
  const grid = document.getElementById("projects");
  if (!grid) return;
  grid.innerHTML = "";

  projects.forEach((project) => {
    const card = document.createElement("article");
    card.className = "project-card";

    const title = document.createElement("h3");
    title.textContent = project.title;

    const meta = document.createElement("div");
    meta.className = "project-meta";

    const status = document.createElement("span");
    status.textContent = project.status || "";

    const metaRight = document.createElement("span");
    metaRight.textContent = (project.stack || []).join(" • ");

    meta.appendChild(status);
    meta.appendChild(metaRight);

    const desc = document.createElement("p");
    desc.textContent = project.description;

    const stack = document.createElement("div");
    stack.className = "stack";
    (project.stack || []).forEach((tech) => {
      const tag = document.createElement("span");
      tag.textContent = tech;
      stack.appendChild(tag);
    });

    const links = document.createElement("div");
    links.className = "project-links";
    (project.links || []).forEach((link) => {
      const a = document.createElement("a");
      a.textContent = link.label;
      a.href = link.url || "#";
      a.target = "_blank";
      a.rel = "noreferrer";
      links.appendChild(a);
    });

    card.appendChild(title);
    card.appendChild(meta);
    card.appendChild(desc);
    card.appendChild(stack);
    card.appendChild(links);
    grid.appendChild(card);
  });
}

async function init() {
  const data = await loadData();
  setText("name", data.meta?.name);
  setText("tagline", data.meta?.tagline);
  setText("about-body", data.about?.body);
  setText("location", data.meta?.location);

  const email = data.meta?.email ? `mailto:${data.meta.email}` : "#";
  setHref("email", email);
  setHref("resume", data.meta?.resumeUrl);
  setHref("github", data.meta?.githubUrl);
  setHref("linkedin", data.meta?.linkedinUrl);

  renderPills("current-classes", data.currentClasses || []);
  renderList("current-list", data.currentClasses || []);
  renderList("previous-list", data.previousCoursework || []);
  renderProjects(data.projects || []);
}

init().catch((err) => {
  console.error(err);
});

function initSnake() {
  const canvas = document.getElementById("snake-canvas");
  if (!canvas) return;
  const ctx = canvas.getContext("2d");
  const scoreEl = document.getElementById("snake-score");
  const bestEl = document.getElementById("snake-best");
  const startBtn = document.getElementById("snake-start");
  const resetBtn = document.getElementById("snake-reset");

  const size = 16;
  const cols = Math.floor(canvas.width / size);
  const rows = Math.floor(canvas.height / size);
  let snake = [];
  let dir = { x: 1, y: 0 };
  let food = { x: 10, y: 8 };
  let score = 0;
  let best = Number(localStorage.getItem("snakeBest") || 0);
  let running = false;
  let timer = null;

  function resetGame() {
    snake = [
      { x: 6, y: 8 },
      { x: 5, y: 8 },
      { x: 4, y: 8 },
    ];
    dir = { x: 1, y: 0 };
    score = 0;
    placeFood();
    updateScore();
    draw();
  }

  function updateScore() {
    if (scoreEl) scoreEl.textContent = score;
    if (bestEl) bestEl.textContent = best;
  }

  function placeFood() {
    let pos;
    do {
      pos = {
        x: Math.floor(Math.random() * cols),
        y: Math.floor(Math.random() * rows),
      };
    } while (snake.some((s) => s.x === pos.x && s.y === pos.y));
    food = pos;
  }

  function step() {
    const head = { x: snake[0].x + dir.x, y: snake[0].y + dir.y };
    if (head.x < 0 || head.y < 0 || head.x >= cols || head.y >= rows) {
      stopGame();
      return;
    }
    if (snake.some((s) => s.x === head.x && s.y === head.y)) {
      stopGame();
      return;
    }
    snake.unshift(head);
    if (head.x === food.x && head.y === food.y) {
      score += 1;
      if (score > best) {
        best = score;
        localStorage.setItem("snakeBest", String(best));
      }
      placeFood();
      updateScore();
    } else {
      snake.pop();
    }
    draw();
  }

  function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = "#06090f";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.strokeStyle = "rgba(94, 242, 214, 0.08)";
    for (let x = 0; x <= cols; x += 1) {
      ctx.beginPath();
      ctx.moveTo(x * size, 0);
      ctx.lineTo(x * size, canvas.height);
      ctx.stroke();
    }
    for (let y = 0; y <= rows; y += 1) {
      ctx.beginPath();
      ctx.moveTo(0, y * size);
      ctx.lineTo(canvas.width, y * size);
      ctx.stroke();
    }

    ctx.fillStyle = "#5ef2d6";
    snake.forEach((s, idx) => {
      const inset = idx === 0 ? 2 : 3;
      ctx.fillRect(s.x * size + inset, s.y * size + inset, size - inset * 2, size - inset * 2);
    });

    ctx.fillStyle = "#ffb454";
    ctx.beginPath();
    ctx.arc(food.x * size + size / 2, food.y * size + size / 2, size / 3, 0, Math.PI * 2);
    ctx.fill();
  }

  function startGame() {
    if (running) return;
    running = true;
    timer = setInterval(step, 110);
  }

  function stopGame() {
    running = false;
    if (timer) clearInterval(timer);
    timer = null;
  }

  function setDir(x, y) {
    if (dir.x === -x && dir.y === -y) return;
    dir = { x, y };
  }

  document.addEventListener("keydown", (e) => {
    switch (e.key.toLowerCase()) {
      case "arrowup":
      case "w":
        setDir(0, -1);
        break;
      case "arrowdown":
      case "s":
        setDir(0, 1);
        break;
      case "arrowleft":
      case "a":
        setDir(-1, 0);
        break;
      case "arrowright":
      case "d":
        setDir(1, 0);
        break;
      default:
        return;
    }
    if (!running) startGame();
  });

  if (startBtn) startBtn.addEventListener("click", startGame);
  if (resetBtn) {
    resetBtn.addEventListener("click", () => {
      stopGame();
      resetGame();
    });
  }

  bestEl.textContent = best;
  resetGame();
}

window.addEventListener("load", initSnake);
