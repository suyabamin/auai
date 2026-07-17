import { apiFetch } from "../utils/fetch.js";

/**
 * Initialise Tasks & To-do List module.
 */
export function init() {
  const container = document.getElementById("todoList");
  if (!container) return;

  container.innerHTML = `
    <div class="card-glass anim-slide-up">
      <div class="module-header">
        <h2 class="module-title">✅ Tasks & To-do list</h2>
        <button class="btn-glass btn-back-dash">🏠 Home</button>
      </div>

      <div class="grid-12">
        <!-- Input & Form Pane -->
        <div style="grid-column: span 5; display: flex; flex-direction: column; gap: 1rem;">
          <h3 style="font-size: 1rem; color: var(--text-secondary); font-weight: 700;">Create Task</h3>
          
          <div style="display: flex; flex-direction: column; gap: 0.5rem;">
            <label style="font-size: 0.8rem; color: var(--text-muted); font-weight: 600;">Description</label>
            <input type="text" id="todo-input-text" class="input-glass" placeholder="What requires resolution today?" />
          </div>

          <div style="display: flex; flex-direction: column; gap: 0.5rem;">
            <label style="font-size: 0.8rem; color: var(--text-muted); font-weight: 600;">Tag Category</label>
            <select id="todo-input-tag" class="input-glass">
              <option value="Tasks">General Tasks</option>
              <option value="Core">Core System</option>
              <option value="Database">Database Tasks</option>
              <option value="Design">UI/UX Layout</option>
              <option value="Security">Security Audit</option>
            </select>
          </div>

          <button id="todo-add-btn" class="btn-primary" style="width: 100%; margin-top: 0.5rem;">
            Add New Task
          </button>
          
          <div class="card-glass" style="background: rgba(0,0,0,0.15); margin-top: 1rem;">
            <h4 style="font-size: 0.85rem; font-weight: 700; margin-bottom: 0.5rem;">Workspace Metrics</h4>
            <p style="font-size: 0.8rem; color: var(--text-secondary);">Completed items are automatically logged to the Sheets dashboard database.</p>
          </div>
        </div>

        <!-- Task List Display Pane -->
        <div style="grid-column: span 7; display: flex; flex-direction: column; gap: 1rem;">
          <div style="display: flex; justify-content: space-between; align-items: center;">
            <h3 style="font-size: 1rem; color: var(--text-secondary); font-weight: 700;">Active Checklists</h3>
            <div style="display: flex; gap: 6px;" id="todo-filters">
              <button class="btn-glass active" data-filter="all" style="padding: 0.25rem 0.5rem; font-size: 0.75rem;">All</button>
              <button class="btn-glass" data-filter="pending" style="padding: 0.25rem 0.5rem; font-size: 0.75rem;">Pending</button>
              <button class="btn-glass" data-filter="completed" style="padding: 0.25rem 0.5rem; font-size: 0.75rem;">Completed</button>
            </div>
          </div>

          <!-- Tasks list wrapper -->
          <div id="todo-list-items-container" style="background: rgba(0, 0, 0, 0.1); border-radius: var(--border-radius-md); border: 1px solid var(--glass-border); padding: 1rem; min-height: 320px; display: flex; flex-direction: column; gap: 8px; max-height: 400px; overflow-y: auto;">
            <!-- Render lists dynamically here -->
            <p style="color: var(--text-muted); text-align: center; margin-top: 100px;">Loading tasks...</p>
          </div>
        </div>
      </div>
    </div>
  `;

  const input = document.getElementById("todo-input-text");
  const tagSel = document.getElementById("todo-input-tag");
  const addBtn = document.getElementById("todo-add-btn");
  const containerList = document.getElementById("todo-list-items-container");
  const filterBtns = document.querySelectorAll("#todo-filters button");

  let localTasks = [];
  let activeFilter = "all";

  // Fetch tasks
  syncTasks();

  function syncTasks(action = "listTodo", payload = {}) {
    apiFetch(action, payload)
      .then(res => {
        if (res && res.tasks) {
          localTasks = res.tasks;
          localStorage.setItem("todos", JSON.stringify(localTasks));
        } else {
          try {
            localTasks = JSON.parse(localStorage.getItem("todos") || "[]");
          } catch(e) {}
        }
        renderTasks();
        updateDashboardSummary();
      })
      .catch(err => {
        console.warn("Tasks sync failed. Fetching offline local cache:", err);
        try {
          localTasks = JSON.parse(localStorage.getItem("todos") || "[]");
        } catch(e) {}
        renderTasks();
        updateDashboardSummary();
      });
  }

  function renderTasks() {
    containerList.innerHTML = "";

    const filtered = localTasks.filter(t => {
      if (activeFilter === "pending") return !t.done;
      if (activeFilter === "completed") return t.done;
      return true;
    });

    if (filtered.length === 0) {
      containerList.innerHTML = `
        <div style="text-align: center; color: var(--text-muted); margin-top: 100px; font-size: 0.9rem;">
          No checklist items discovered for this query.
        </div>
      `;
      return;
    }

    filtered.forEach(t => {
      const row = document.createElement("div");
      row.className = "widget-list-item anim-slide-up";
      row.style.background = "var(--glass-bg-accent)";
      row.style.padding = "0.75rem";
      row.style.borderRadius = "8px";
      row.style.border = "1px solid var(--glass-border)";
      row.style.marginBottom = "4px";
      row.style.display = "flex";
      row.style.alignItems = "center";
      row.style.justifyContent = "space-between";

      row.innerHTML = `
        <div style="display: flex; align-items: center; gap: 10px; flex: 1;">
          <input type="checkbox" class="todo-check" data-id="${t.id}" ${t.done ? "checked" : ""} style="width: 18px; height: 18px; cursor: pointer; accent-color: var(--primary);" />
          <span style="font-size: 0.9rem; font-weight: 500; cursor: pointer; ${t.done ? 'text-decoration: line-through; opacity: 0.5;' : ''}" class="todo-text-lbl" data-id="${t.id}">
            ${t.text}
          </span>
        </div>
        <div style="display: flex; align-items: center; gap: 10px;">
          <span class="badge ${t.done ? 'badge-success' : 'badge-primary'}" style="font-size: 0.7rem;">${t.tag || 'Tasks'}</span>
          <button class="todo-del-btn btn-glass" data-id="${t.id}" style="padding: 2px 6px; font-size: 0.75rem; border-color: transparent; color: var(--danger);">
            ✕
          </button>
        </div>
      `;

      // Assign toggle listeners
      row.querySelector(".todo-check").addEventListener("change", () => toggleTask(t.id));
      row.querySelector(".todo-text-lbl").addEventListener("click", () => toggleTask(t.id));
      row.querySelector(".todo-del-btn").addEventListener("click", () => deleteTask(t.id));

      containerList.appendChild(row);
    });
  }

  function toggleTask(id) {
    // Optimistic UI updates
    const task = localTasks.find(t => t.id === id);
    if (task) {
      task.done = !task.done;
      renderTasks();
    }
    syncTasks("toggleTodo", { id });
  }

  function deleteTask(id) {
    if (confirm("Delete this checklist entry?")) {
      localTasks = localTasks.filter(t => t.id !== id);
      renderTasks();
      syncTasks("deleteTodo", { id });
    }
  }

  addBtn.addEventListener("click", () => {
    const text = input.value.trim();
    const tag = tagSel.value;
    if (!text) return;

    const mockId = Date.now().toString();
    localTasks.push({ id: mockId, text, tag, done: false });
    renderTasks();
    input.value = "";

    syncTasks("addTodo", { text, tag });
  });

  input.addEventListener("keydown", e => {
    if (e.key === "Enter") addBtn.click();
  });

  // Filter keys configuration
  filterBtns.forEach(btn => {
    btn.addEventListener("click", () => {
      filterBtns.forEach(b => b.classList.remove("active"));
      btn.classList.add("active");
      activeFilter = btn.getAttribute("data-filter");
      renderTasks();
    });
  });

  function updateDashboardSummary() {
    const badge = document.getElementById("dash-todo-badge");
    const dashContainer = document.getElementById("dash-todo-items");
    const pending = localTasks.filter(t => !t.done);

    if (badge) {
      badge.textContent = `${pending.length} Pending`;
      badge.className = pending.length === 0 ? "badge badge-success" : "badge badge-warning";
    }

    if (dashContainer && localTasks.length > 0) {
      dashContainer.innerHTML = localTasks
        .slice(0, 3)
        .map(t => `
          <div class="widget-list-item">
            <span class="widget-list-text" style="${t.done ? 'text-decoration: line-through; opacity: 0.6;' : ''}">
              ${t.text}
            </span>
            <span class="badge ${t.done ? 'badge-success' : 'badge-primary'}">${t.tag || 'Tasks'}</span>
          </div>
        `)
        .join("");
    }
  }
}
