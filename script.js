async function loadData() {
  const res = await fetch("data.json");
  if (!res.ok) throw new Error("Failed to load data.json");
  return res.json();
}

function setText(id, value) {
  const el = document.getElementById(id);
  if (el) el.textContent = value ?? "";
}

function setHref(id, value) {
  const el = document.getElementById(id);
  if (!el) return;
  if (value && value !== "#") {
    el.href = value;
  } else {
    el.removeAttribute("href");
  }
}

function setImage(id, value) {
  const el = document.getElementById(id);
  if (!el || !value) return;
  el.addEventListener("error", () => {
    el.style.display = "none";
  });
  el.src = value;
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

function uniqueStack(projects) {
  return [...new Set(projects.flatMap((project) => project.stack || []))];
}

function renderFilters(projects, activeCategory, onPick) {
  const mount = document.getElementById("project-filters");
  if (!mount) return;
  const categories = ["All", ...new Set(projects.map((project) => project.category).filter(Boolean))];
  mount.innerHTML = "";
  categories.forEach((category) => {
    const button = document.createElement("button");
    button.type = "button";
    button.className = `filter-btn${category === activeCategory ? " active" : ""}`;
    button.textContent = category;
    button.addEventListener("click", () => onPick(category));
    mount.appendChild(button);
  });
}

function renderProjects(projects, activeCategory = "All") {
  const grid = document.getElementById("projects-grid");
  if (!grid) return;
  const visible = activeCategory === "All" ? projects : projects.filter((project) => project.category === activeCategory);
  grid.innerHTML = "";

  visible.forEach((project, index) => {
    const card = document.createElement("article");
    card.className = `project-card${index === 0 && activeCategory === "All" ? " featured" : ""}`;

    const main = document.createElement("div");
    main.className = "project-main";

    const kicker = document.createElement("div");
    kicker.className = "project-kicker";
    kicker.innerHTML = `<span>${project.status || "Project"}</span><span>${project.repoName || ""}</span>`;

    const title = document.createElement("h3");
    title.textContent = project.title;

    const desc = document.createElement("p");
    desc.textContent = project.description;

    const stack = document.createElement("div");
    stack.className = "stack";
    (project.stack || []).forEach((tech) => {
      const tag = document.createElement("span");
      tag.textContent = tech;
      stack.appendChild(tag);
    });

    main.append(kicker, title, desc, stack);

    const foot = document.createElement("div");
    foot.className = "project-foot";

    const date = document.createElement("span");
    date.className = "project-date";
    date.textContent = project.updated ? `Updated ${project.updated}` : "";

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

    foot.append(date, links);
    card.append(main, foot);
    grid.appendChild(card);
  });
}

function initCommandPalette(data) {
  const palette = document.getElementById("command-palette");
  const input = document.getElementById("palette-input");
  const results = document.getElementById("palette-results");
  const openBtn = document.getElementById("palette-open");
  if (!palette || !input || !results) return;

  const email = data.meta?.email ? `mailto:${data.meta.email}` : "#";
  const commands = [
    { title: "projects/", detail: "Selected work", action: () => goTo("#projects") },
    { title: "snake/", detail: "Canvas game", action: () => goTo("#lab") },
    { title: "about/", detail: "Focus areas and coursework", action: () => goTo("#about") },
    { title: "Open resume", detail: "PDF", action: () => openLink(data.meta?.resumeUrl) },
    { title: "Open GitHub", detail: data.meta?.githubUrl, action: () => openLink(data.meta?.githubUrl) },
    { title: "Email Jacob", detail: data.meta?.email, action: () => openLink(email, false) },
    ...(data.projects || []).map((project) => ({
      title: project.title,
      detail: `${project.category || "Project"} · ${project.status || "GitHub"}`,
      action: () => {
        const repo = (project.links || []).find((link) => link.label.toLowerCase() === "repo") || project.links?.[0];
        openLink(repo?.url);
      },
    })),
  ];

  let activeIndex = 0;
  let visibleCommands = commands;

  function goTo(hash) {
    closePalette();
    document.querySelector(hash)?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  function openLink(url, newTab = true) {
    if (!url) return;
    closePalette();
    if (newTab && !url.startsWith("mailto:")) {
      window.open(url, "_blank", "noopener,noreferrer");
    } else {
      window.location.href = url;
    }
  }

  function render() {
    const query = input.value.trim().toLowerCase();
    visibleCommands = commands.filter((command) => {
      return `${command.title} ${command.detail}`.toLowerCase().includes(query);
    });
    activeIndex = Math.min(activeIndex, Math.max(visibleCommands.length - 1, 0));
    results.innerHTML = "";

    if (!visibleCommands.length) {
      const empty = document.createElement("div");
      empty.className = "palette-empty";
      empty.textContent = "No commands found";
      results.appendChild(empty);
      return;
    }

    visibleCommands.forEach((command, index) => {
      const item = document.createElement("button");
      item.type = "button";
      item.className = `palette-item${index === activeIndex ? " active" : ""}`;
      item.innerHTML = `<span>${command.title}</span><small>${command.detail || ""}</small>`;
      item.addEventListener("mouseenter", () => {
        activeIndex = index;
        render();
      });
      item.addEventListener("click", command.action);
      results.appendChild(item);
    });
  }

  function openPalette() {
    palette.hidden = false;
    input.value = "";
    activeIndex = 0;
    render();
    requestAnimationFrame(() => input.focus());
  }

  function closePalette() {
    palette.hidden = true;
  }

  if (openBtn) openBtn.addEventListener("click", openPalette);
  input.addEventListener("input", () => {
    activeIndex = 0;
    render();
  });
  palette.addEventListener("click", (event) => {
    if (event.target === palette) closePalette();
  });
  document.addEventListener("keydown", (event) => {
    const isShortcut = (event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k";
    if (isShortcut) {
      event.preventDefault();
      openPalette();
      return;
    }
    if (palette.hidden) return;
    if (event.key === "Escape") closePalette();
    if (event.key === "ArrowDown") {
      event.preventDefault();
      activeIndex = Math.min(activeIndex + 1, visibleCommands.length - 1);
      render();
    }
    if (event.key === "ArrowUp") {
      event.preventDefault();
      activeIndex = Math.max(activeIndex - 1, 0);
      render();
    }
    if (event.key === "Enter" && visibleCommands[activeIndex]) {
      event.preventDefault();
      visibleCommands[activeIndex].action();
    }
  });
}

function initSignalCanvas() {
  const canvas = document.getElementById("signal-canvas");
  if (!canvas) return;
  const ctx = canvas.getContext("2d");
  let width = 0;
  let height = 0;
  let nodes = [];

  function resize() {
    const dpr = window.devicePixelRatio || 1;
    width = window.innerWidth;
    height = window.innerHeight;
    canvas.width = Math.floor(width * dpr);
    canvas.height = Math.floor(height * dpr);
    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    nodes = Array.from({ length: Math.min(80, Math.floor(width / 18)) }, () => ({
      x: Math.random() * width,
      y: Math.random() * height,
      vx: (Math.random() - 0.5) * 0.18,
      vy: (Math.random() - 0.5) * 0.18,
    }));
  }

  function frame() {
    ctx.clearRect(0, 0, width, height);
    nodes.forEach((node, index) => {
      node.x += node.vx;
      node.y += node.vy;
      if (node.x < 0 || node.x > width) node.vx *= -1;
      if (node.y < 0 || node.y > height) node.vy *= -1;

      for (let i = index + 1; i < nodes.length; i += 1) {
        const other = nodes[i];
        const dx = node.x - other.x;
        const dy = node.y - other.y;
        const distance = Math.hypot(dx, dy);
        if (distance < 145) {
          ctx.strokeStyle = `rgba(112, 245, 197, ${0.11 * (1 - distance / 145)})`;
          ctx.beginPath();
          ctx.moveTo(node.x, node.y);
          ctx.lineTo(other.x, other.y);
          ctx.stroke();
        }
      }
    });
    requestAnimationFrame(frame);
  }

  resize();
  window.addEventListener("resize", resize);
  frame();
}

function initRepoMap(projects) {
  const canvas = document.getElementById("repo-map");
  if (!canvas || !projects.length) return;
  const ctx = canvas.getContext("2d");
  let tick = 0;
  const colors = ["#70f5c5", "#f3ba5d", "#ff7c6e", "#75a7ff", "#d4f27a", "#f3f0df"];

  function draw() {
    const { width, height } = canvas;
    const cx = width / 2;
    const cy = height / 2;
    ctx.clearRect(0, 0, width, height);

    ctx.strokeStyle = "rgba(255,255,255,0.08)";
    for (let r = 58; r <= 150; r += 46) {
      ctx.beginPath();
      ctx.arc(cx, cy, r, 0, Math.PI * 2);
      ctx.stroke();
    }

    ctx.fillStyle = "#70f5c5";
    ctx.beginPath();
    ctx.arc(cx, cy, 9, 0, Math.PI * 2);
    ctx.fill();
    ctx.font = "700 13px JetBrains Mono";
    ctx.fillText("driverext", cx - 34, cy + 30);

    projects.forEach((project, index) => {
      const angle = tick * 0.006 + (index / projects.length) * Math.PI * 2;
      const radius = 78 + (index % 3) * 34;
      const x = cx + Math.cos(angle) * radius;
      const y = cy + Math.sin(angle) * radius * 0.72;

      ctx.strokeStyle = "rgba(112,245,197,0.18)";
      ctx.beginPath();
      ctx.moveTo(cx, cy);
      ctx.lineTo(x, y);
      ctx.stroke();

      ctx.fillStyle = colors[index % colors.length];
      ctx.beginPath();
      ctx.arc(x, y, index === 0 ? 8 : 6, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = "rgba(236,246,241,0.82)";
      ctx.font = "600 11px JetBrains Mono";
      ctx.fillText(project.repoName || project.title, x + 10, y + 4);
    });

    tick += 1;
    requestAnimationFrame(draw);
  }

  draw();
}

async function init() {
  const data = await loadData();
  const projects = data.projects || [];
  let activeCategory = "All";

  setText("name", data.meta?.name);
  setText("tagline", data.meta?.tagline);
  setText("hero-summary", data.meta?.summary);
  setText("about-body", data.about?.body);
  setText("location", data.meta?.location);
  setText("last-updated", `GitHub projects refreshed ${data.meta?.lastProjectRefresh || ""}`);
  setText("metric-projects", projects.length);
  setText("metric-stack", uniqueStack(projects).length);

  const email = data.meta?.email ? `mailto:${data.meta.email}` : "#";
  setHref("email", email);
  setHref("footer-email", email);
  setHref("resume", data.meta?.resumeUrl);
  setHref("github", data.meta?.githubUrl);
  setHref("footer-github", data.meta?.githubUrl);
  setHref("linkedin", data.meta?.linkedinUrl);
  setImage("avatar", data.meta?.avatarUrl);

  renderList("focus-list", data.focusAreas || []);
  renderList("coursework-list", data.completedCoursework || []);
  const applyFilter = (category) => {
    activeCategory = category;
    renderFilters(projects, activeCategory, applyFilter);
    renderProjects(projects, activeCategory);
  };
  renderFilters(projects, activeCategory, applyFilter);
  renderProjects(projects, activeCategory);
  initRepoMap(projects);
  initCommandPalette(data);
}

initSignalCanvas();
init().catch((err) => console.error(err));

function initSnake() {
  const canvas = document.getElementById("snake-canvas");
  if (!canvas) return;
  const ctx = canvas.getContext("2d");
  const scoreEl = document.getElementById("snake-score");
  const bestEl = document.getElementById("snake-best");
  const statusEl = document.getElementById("snake-status");
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

  function setStatus(message) {
    if (statusEl) statusEl.textContent = message;
  }

  function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = "#050909";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.strokeStyle = "rgba(112,245,197,0.08)";
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

    snake.forEach((s, idx) => {
      const inset = idx === 0 ? 2 : 3;
      ctx.fillStyle = idx === 0 ? "#70f5c5" : "#43c99e";
      ctx.fillRect(s.x * size + inset, s.y * size + inset, size - inset * 2, size - inset * 2);
    });

    ctx.fillStyle = "#f3ba5d";
    ctx.beginPath();
    ctx.arc(food.x * size + size / 2, food.y * size + size / 2, size / 3, 0, Math.PI * 2);
    ctx.fill();
  }

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
    setStatus("Ready. Press Start or use an arrow key.");
    draw();
  }

  function stopGame() {
    running = false;
    if (timer) clearInterval(timer);
    timer = null;
  }

  function gameOver(message) {
    stopGame();
    setStatus(message);
    resetGame();
  }

  function step() {
    const head = { x: snake[0].x + dir.x, y: snake[0].y + dir.y };
    if (head.x < 0 || head.y < 0 || head.x >= cols || head.y >= rows) {
      gameOver("Game over: hit the wall.");
      return;
    }
    if (snake.some((s) => s.x === head.x && s.y === head.y)) {
      gameOver("Game over: collided with yourself.");
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

  function startGame() {
    if (running) return;
    canvas.focus();
    running = true;
    setStatus("In progress...");
    timer = setInterval(step, 105);
  }

  function setDir(x, y) {
    if (dir.x === -x && dir.y === -y) return;
    dir = { x, y };
  }

  function handleKey(e) {
    const key = e.key.toLowerCase();
    if (key === "arrowup" || key === "w") setDir(0, -1);
    else if (key === "arrowdown" || key === "s") setDir(0, 1);
    else if (key === "arrowleft" || key === "a") setDir(-1, 0);
    else if (key === "arrowright" || key === "d") setDir(1, 0);
    else return;
    e.preventDefault();
    if (!running) startGame();
  }

  canvas.addEventListener("keydown", handleKey);
  canvas.addEventListener("click", () => canvas.focus());
  if (startBtn) startBtn.addEventListener("click", startGame);
  if (resetBtn) {
    resetBtn.addEventListener("click", () => {
      stopGame();
      resetGame();
    });
  }

  resetGame();
}

window.addEventListener("load", initSnake);
