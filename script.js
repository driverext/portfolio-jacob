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
