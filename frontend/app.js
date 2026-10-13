const form = document.querySelector("#opportunity-form");
const formTitle = document.querySelector("#form-title");
const formErrors = document.querySelector("#form-errors");
const saveBtn = document.querySelector("#save-btn");
const listEl = document.querySelector("#list");
const emptyEl = document.querySelector("#empty");
const bannerEl = document.querySelector("#banner");
const filterEl = document.querySelector("#status-filter");
const detailEl = document.querySelector("#detail");
const detailTitle = document.querySelector("#detail-title");
const detailBody = document.querySelector("#detail-body");
const statusBtn = document.querySelector("#status-btn");
const deleteBtn = document.querySelector("#delete-btn");

const FIELDS = {
  title: "Title",
  description: "Description",
  researchArea: "Research area",
  facultyName: "Faculty name",
  department: "Department",
  requiredSkills: "Required skills",
  availablePositions: "Available positions",
  applicationDeadline: "Application deadline",
  status: "Status",
};

const searchEl = document.querySelector("#search");

let editingId = null;
let selected = null;
let deleteArmed = false;
let loadedRows = [];
let listFailed = false;

function showBanner(kind, text) {
  bannerEl.hidden = false;
  bannerEl.className = `banner ${kind}`;
  bannerEl.textContent = text;
}

function clearBanner() {
  bannerEl.hidden = true;
  bannerEl.textContent = "";
}

async function request(path, options) {
  const response = await fetch(path, {
    headers: { "Content-Type": "application/json" },
    ...options,
  });
  const text = await response.text();
  const data = text ? JSON.parse(text) : null;
  if (!response.ok) {
    const details = Array.isArray(data?.details) ? `\n${data.details.join("\n")}` : "";
    throw new Error((data?.error || "Request failed") + details);
  }
  return data;
}

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

function readForm() {
  const data = new FormData(form);
  const values = {};
  for (const key of Object.keys(FIELDS)) values[key] = String(data.get(key) ?? "").trim();
  return values;
}

function validate(values) {
  const errors = [];
  for (const [key, label] of Object.entries(FIELDS)) {
    if (values[key] === "") errors.push(`${label} is required`);
  }
  if (values.availablePositions !== "" && !/^\d+$/.test(values.availablePositions)) {
    errors.push("Available positions must be a whole number, 0 or greater");
  }
  return errors;
}

function fillForm(opportunity) {
  for (const key of Object.keys(FIELDS)) {
    form.elements[key].value = opportunity?.[key] ?? (key === "status" ? "Open" : "");
    form.elements[key].classList.remove("invalid");
  }
}

function setStats(rows) {
  const open = rows.filter((row) => row.status === "Open").length;
  document.querySelector("#stat-shown").textContent = String(rows.length);
  document.querySelector("#stat-open").textContent = String(open);
  document.querySelector("#stat-closed").textContent = String(rows.length - open);
}

function renderDetail(opportunity) {
  selected = opportunity;
  deleteArmed = false;
  deleteBtn.textContent = "Delete";
  detailEl.hidden = false;
  detailTitle.textContent = opportunity.title;
  statusBtn.textContent = opportunity.status === "Open" ? "Mark closed" : "Mark open";
  const rows = [
    ["Status", opportunity.status],
    ["Faculty", opportunity.facultyName],
    ["Department", opportunity.department],
    ["Research area", opportunity.researchArea],
    ["Required skills", opportunity.requiredSkills],
    ["Positions", opportunity.availablePositions],
    ["Deadline", opportunity.applicationDeadline],
    ["Description", opportunity.description],
  ];
  detailBody.innerHTML = rows
    .map(([label, value]) => `<dt>${label}</dt><dd>${escapeHtml(value)}</dd>`)
    .join("");
}

function matchesSearch(row, query) {
  if (!query) return true;
  return [row.title, row.researchArea, row.facultyName, row.department]
    .join(" ")
    .toLowerCase()
    .includes(query);
}

function renderRows(rows) {
  const query = searchEl.value.trim().toLowerCase();
  const visible = rows.filter((row) => matchesSearch(row, query));
  listEl.innerHTML = visible
    .map(
      (row) => `<tr data-id="${row.id}" class="${selected?.id === row.id ? "selected" : ""}">
          <td>${escapeHtml(row.title)}</td>
          <td>${escapeHtml(row.researchArea)}</td>
          <td>${escapeHtml(row.department)}</td>
          <td>${escapeHtml(row.facultyName)}</td>
          <td>${escapeHtml(row.applicationDeadline)}</td>
          <td>${escapeHtml(row.availablePositions)}</td>
          <td><span class="pill ${row.status === "Open" ? "open" : "closed"}">${row.status}</span></td>
        </tr>`
    )
    .join("");
  if (query && rows.length > 0 && visible.length === 0) {
    emptyEl.textContent = "No openings match this search.";
  } else {
    emptyEl.textContent = "No research opportunities in this view.";
  }
  emptyEl.hidden = visible.length > 0;
}

async function loadList() {
  const status = filterEl.value;
  const query = status ? `?status=${encodeURIComponent(status)}` : "";
  try {
    const rows = await request(`/api/opportunities${query}`);
    listFailed = false;
    loadedRows = rows;
    setStats(rows);
    renderRows(rows);
    if (selected && !rows.some((row) => row.id === selected.id)) {
      detailEl.hidden = true;
      selected = null;
    }
  } catch (error) {
    listFailed = true;
    loadedRows = [];
    listEl.innerHTML = "";
    emptyEl.hidden = false;
    emptyEl.textContent = "The list could not be loaded. Check that MySQL is running.";
    document.querySelector("#stat-shown").textContent = "–";
    document.querySelector("#stat-open").textContent = "–";
    document.querySelector("#stat-closed").textContent = "–";
    showBanner("bad", error.message);
  }
}

async function openDetail(id) {
  try {
    renderDetail(await request(`/api/opportunities/${id}`));
    await loadList();
  } catch (error) {
    showBanner("bad", error.message);
  }
}

listEl.addEventListener("click", (event) => {
  const row = event.target.closest("[data-id]");
  if (row) openDetail(row.dataset.id);
});

filterEl.addEventListener("change", () => {
  clearBanner();
  loadList();
});

searchEl.addEventListener("input", () => {
  if (!listFailed) renderRows(loadedRows);
});

form.addEventListener("submit", async (event) => {
  event.preventDefault();
  const values = readForm();
  const errors = validate(values);
  for (const key of Object.keys(FIELDS)) {
    form.elements[key].classList.toggle("invalid", values[key] === "");
  }
  if (errors.length > 0) {
    formErrors.hidden = false;
    formErrors.textContent = errors.join("\n");
    return;
  }
  formErrors.hidden = true;
  const payload = { ...values, availablePositions: Number(values.availablePositions) };
  try {
    if (editingId) {
      const updated = await request(`/api/opportunities/${editingId}`, {
        method: "PUT",
        body: JSON.stringify(payload),
      });
      showBanner("ok", "Research opportunity updated.");
      renderDetail(updated);
    } else {
      const created = await request("/api/opportunities", {
        method: "POST",
        body: JSON.stringify(payload),
      });
      showBanner("ok", "Research opportunity created.");
      renderDetail(created);
    }
    editingId = null;
    formTitle.textContent = "New opportunity";
    saveBtn.textContent = "Create opportunity";
    fillForm(null);
    await loadList();
  } catch (error) {
    formErrors.hidden = false;
    formErrors.textContent = error.message;
  }
});

document.querySelector("#reset-btn").addEventListener("click", () => {
  editingId = null;
  formTitle.textContent = "New opportunity";
  saveBtn.textContent = "Create opportunity";
  formErrors.hidden = true;
  fillForm(null);
});

document.querySelector("#edit-btn").addEventListener("click", () => {
  if (!selected) return;
  editingId = selected.id;
  formTitle.textContent = "Update opportunity";
  saveBtn.textContent = "Save changes";
  formErrors.hidden = true;
  fillForm(selected);
  form.scrollIntoView({ behavior: "smooth" });
});

statusBtn.addEventListener("click", async () => {
  if (!selected) return;
  const next = selected.status === "Open" ? "Closed" : "Open";
  try {
    const updated = await request(`/api/opportunities/${selected.id}`, {
      method: "PUT",
      body: JSON.stringify({ status: next }),
    });
    showBanner("ok", `Status changed to ${updated.status}.`);
    renderDetail(updated);
    await loadList();
  } catch (error) {
    showBanner("bad", error.message);
  }
});

deleteBtn.addEventListener("click", async () => {
  if (!selected) return;
  if (!deleteArmed) {
    deleteArmed = true;
    deleteBtn.textContent = "Confirm delete";
    return;
  }
  try {
    await request(`/api/opportunities/${selected.id}`, { method: "DELETE" });
    detailEl.hidden = true;
    selected = null;
    showBanner("ok", "Research opportunity deleted.");
    await loadList();
  } catch (error) {
    showBanner("bad", error.message);
  }
});

loadList();
