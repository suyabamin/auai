import { apiFetch } from "../utils/fetch.js";

/**
 * Initialise Notes Workspace Studio module.
 */
export function init() {
  const container = document.getElementById("notes");
  if (!container) return;

  container.innerHTML = `
    <div class="card-glass anim-slide-up">
      <div class="module-header">
        <h2 class="module-title">📝 Notes Workspace Database</h2>
        <button class="btn-glass btn-back-dash">🏠 Home</button>
      </div>

      <div class="grid-12">
        <!-- Notes Sidebar lists -->
        <div style="grid-column: span 4; display: flex; flex-direction: column; gap: 1rem; border-right: 1px solid var(--glass-border); padding-right: 1rem;">
          <input type="text" id="notes-search" class="input-glass" placeholder="Search notes..." />
          
          <button id="notes-new-btn" class="btn-glass" style="width: 100%; display: flex; align-items: center; justify-content: center; gap: 8px;">
            <span>➕</span> New Blank Draft
          </button>
          
          <!-- Notes deck -->
          <div id="notes-list-deck" style="display: flex; flex-direction: column; gap: 8px; max-height: 350px; overflow-y: auto; min-height: 250px;">
            <p style="color: var(--text-muted); text-align: center; margin-top: 100px;">Loading notes...</p>
          </div>
        </div>

        <!-- Note Editing pane -->
        <div style="grid-column: span 8; display: flex; flex-direction: column; gap: 0.75rem;">
          <input type="text" id="note-edit-title" class="input-glass" style="font-weight: 700; font-size: 1.1rem;" placeholder="Untitled Note Title" />
          
          <textarea id="note-edit-content" class="input-glass" style="height: 330px; resize: none; font-size: 0.95rem; line-height: 1.6; padding: 1.25rem;" placeholder="Jot detailing notes down, compose guides, sync references..."></textarea>
          
          <div style="display: flex; justify-content: space-between; align-items: center;">
            <span id="note-sync-status" style="font-size: 0.8rem; color: var(--text-muted);">Draft cached locally</span>
            <button id="note-save-btn" class="btn-primary" style="display: flex; align-items: center; gap: 8px;">
              <span>💾</span> Save Note Changes
            </button>
          </div>
        </div>
      </div>
    </div>
  `;

  const listDeck = document.getElementById("notes-list-deck");
  const searchInput = document.getElementById("notes-search");
  const newBtn = document.getElementById("notes-new-btn");
  const titleInput = document.getElementById("note-edit-title");
  const contentInput = document.getElementById("note-edit-content");
  const saveBtn = document.getElementById("note-save-btn");
  const statusLbl = document.getElementById("note-sync-status");

  let localNotes = [];
  let selectedNoteId = null;

  // Initial load
  loadNotes();

  function loadNotes() {
    apiFetch("loadNote", {})
      .then(res => {
        // Expects list of notes or fallback object
        if (res && res.notes) {
          localNotes = res.notes;
        } else if (res && res.content) {
          // fallback single note conversion
          localNotes = [{ id: "note-1", title: "Global Workspace Note", content: res.content, date: new Date().toISOString() }];
        }
        localStorage.setItem("notes", JSON.stringify(localNotes));
        renderList();
      })
      .catch(err => {
        console.warn("Unable to load remote notes. Fetching local storage fallback:", err);
        try {
          localNotes = JSON.parse(localStorage.getItem("notes") || "[]");
        } catch(e){}
        if (localNotes.length === 0) {
          localNotes = [{ id: "note-1", title: "ReadMe Workspace Introduction", content: "Welcome to your Personal AI Assistant! Notes saved here sync automatically to your Google Sheets database.", date: new Date().toISOString() }];
        }
        renderList();
      });
  }

  function renderList() {
    listDeck.innerHTML = "";
    const filter = searchInput.value.toLowerCase().trim();

    const filtered = localNotes.filter(n => 
      n.title.toLowerCase().includes(filter) || n.content.toLowerCase().includes(filter)
    );

    if (filtered.length === 0) {
      listDeck.innerHTML = `<div style="text-align: center; color: var(--text-muted); padding-top: 50px;">No notes found</div>`;
      return;
    }

    filtered.forEach(n => {
      const card = document.createElement("div");
      card.className = `card-glass ${selectedNoteId === n.id ? "active" : ""}`;
      card.style.padding = "0.75rem";
      card.style.borderWidth = selectedNoteId === n.id ? "2px" : "1px";
      card.style.borderColor = selectedNoteId === n.id ? "var(--primary)" : "var(--glass-border)";
      card.style.cursor = "pointer";
      card.style.display = "flex";
      card.style.flexDirection = "column";
      card.style.gap = "4px";

      card.innerHTML = `
        <div style="display: flex; justify-content: space-between; align-items: center;">
          <h4 style="font-size: 0.85rem; font-weight: 700; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; max-width: 140px;">${n.title || "Untitled Note"}</h4>
          <button class="note-del-btn" data-id="${n.id}" style="background:none; border:none; cursor:pointer; color:var(--text-muted); font-size:0.75rem;">🗑️</button>
        </div>
        <p style="font-size: 0.75rem; color: var(--text-secondary); white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">${n.content || "Empty content..."}</p>
      `;

      card.addEventListener("click", (e) => {
        if (e.target.classList.contains("note-del-btn")) return;
        selectNote(n.id);
      });

      card.querySelector(".note-del-btn").addEventListener("click", (e) => {
        e.stopPropagation();
        deleteNote(n.id);
      });

      listDeck.appendChild(card);
    });

    // select first node if none active
    if (!selectedNoteId && localNotes.length > 0) {
      selectNote(localNotes[0].id);
    }
  }

  function selectNote(id) {
    selectedNoteId = id;
    const note = localNotes.find(n => n.id === id);
    if (note) {
      titleInput.value = note.title;
      contentInput.value = note.content;
      statusLbl.textContent = "Synced cache changes active";
      
      // Update UI highlights
      const cards = listDeck.querySelectorAll(".card-glass");
      cards.forEach(c => {
        c.style.borderColor = "var(--glass-border)";
        c.style.borderWidth = "1px";
      });
      renderList();
    }
  }

  newBtn.addEventListener("click", () => {
    const mockId = "note-" + Date.now();
    const newNote = {
      id: mockId,
      title: "Untitled Note Draft",
      content: "",
      date: new Date().toISOString()
    };
    localNotes.unshift(newNote);
    selectedNoteId = mockId;
    renderList();
    selectNote(mockId);
    titleInput.focus();
  });

  saveBtn.addEventListener("click", () => {
    if (!selectedNoteId) return;
    const title = titleInput.value.trim() || "Untitled Note";
    const content = contentInput.value;

    const note = localNotes.find(n => n.id === selectedNoteId);
    if (note) {
      note.title = title;
      note.content = content;
      note.date = new Date().toISOString();
      renderList();

      saveBtn.disabled = true;
      saveBtn.textContent = "Syncing with Database...";
      statusLbl.textContent = "Updating sheets registry...";

      apiFetch("saveNote", { note: content, title: title, id: selectedNoteId })
        .then(() => {
          statusLbl.textContent = "Changes synced to Apps Script!";
          localStorage.setItem("notes", JSON.stringify(localNotes));
        })
        .catch(err => {
          console.warn("Unable to post notes to sheets, saving in local offline registry:", err);
          statusLbl.textContent = "Saved offline in backup cache.";
          localStorage.setItem("notes", JSON.stringify(localNotes));
        })
        .finally(() => {
          saveBtn.disabled = false;
          saveBtn.textContent = "Save Note Changes";
        });
    }
  });

  function deleteNote(id) {
    if (confirm("Delete this note content forever?")) {
      localNotes = localNotes.filter(n => n.id !== id);
      localStorage.setItem("notes", JSON.stringify(localNotes));
      if (selectedNoteId === id) {
        selectedNoteId = localNotes.length > 0 ? localNotes[0].id : null;
      }
      renderList();
      if (selectedNoteId) {
        selectNote(selectedNoteId);
      } else {
        titleInput.value = "";
        contentInput.value = "";
      }
      
      apiFetch("deleteNote", { id })
        .catch(err => console.error("Apps script note deletion sync failure:", err));
    }
  }

  searchInput.addEventListener("input", renderList);
}
