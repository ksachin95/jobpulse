/* ==========================================================================
   STATE MANAGEMENT & INITIALIZATION
   ========================================================================== */
let applications = [];

// High-quality mock data to populate the app on first load
const mockApplications = [
  {
    id: "mock-1",
    company: "Stripe",
    jobTitle: "Senior Product Designer",
    status: "offered",
    dateApplied: "2026-06-10",
    jobUrl: "https://stripe.com/jobs",
    salary: "160,000",
    locationType: "Remote",
    notes: "Received formal offer letter! Equity package is competitive. Reviewing health insurance details. Need to reply by end of the week."
  },
  {
    id: "mock-2",
    company: "Google",
    jobTitle: "Frontend Engineer",
    status: "interviewing",
    dateApplied: "2026-06-15",
    jobUrl: "https://careers.google.com",
    salary: "145,000",
    locationType: "Hybrid",
    notes: "Passed recruiter phone screen and technical quiz. Technical panel scheduled for next Thursday. Topics to cover: Javascript deep-dive, CSS layouts, Web APIs."
  },
  {
    id: "mock-3",
    company: "Vercel",
    jobTitle: "Developer Advocate",
    status: "applied",
    dateApplied: "2026-06-18",
    jobUrl: "https://vercel.com/careers",
    salary: "130,000",
    locationType: "Remote",
    notes: "Submitted application via referral from Sarah. Standard application completed. Keeping fingers crossed!"
  },
  {
    id: "mock-4",
    company: "Netflix",
    jobTitle: "UI Engineer",
    status: "wishlist",
    dateApplied: "2026-06-20",
    jobUrl: "https://jobs.netflix.com",
    salary: "210,000",
    locationType: "On-site",
    notes: "Spoke with an engineer at a meetup. Need to tailor resume to emphasize performance tuning and streaming architecture before applying."
  },
  {
    id: "mock-5",
    company: "Meta",
    jobTitle: "Software Engineer",
    status: "rejected",
    dateApplied: "2026-06-01",
    jobUrl: "https://metacareers.com",
    salary: "185,000",
    locationType: "Hybrid",
    notes: "Completed final loop. Recruiter feedback: strong algorithms, but they went with a candidate who had more experience with low-level systems."
  }
];

// Load applications from localStorage
function loadApplications() {
  const localData = localStorage.getItem("job_pulse_applications");
  if (localData) {
    try {
      applications = JSON.parse(localData);
    } catch (e) {
      console.error("Error parsing localStorage data, using mock data", e);
      applications = [...mockApplications];
    }
  } else {
    // Populate with mock data for visual demonstration on first visit
    applications = [...mockApplications];
    saveToLocalStorage();
  }
}

// Save applications to localStorage
function saveToLocalStorage() {
  localStorage.setItem("job_pulse_applications", JSON.stringify(applications));
}

/* ==========================================================================
   DOM ELEMENTS
   ========================================================================== */
const elements = {
  // Navigation & Actions
  newAppBtn: document.getElementById("newAppBtn"),
  exportBtn: document.getElementById("exportBtn"),
  importBtn: document.getElementById("importBtn"),
  importFileInput: document.getElementById("importFileInput"),
  
  // Stats
  statTotal: document.getElementById("statTotal"),
  statActive: document.getElementById("statActive"),
  statInterviews: document.getElementById("statInterviews"),
  statSuccessRate: document.getElementById("statSuccessRate"),
  
  // Toolbar Filters
  searchInput: document.getElementById("searchInput"),
  filterStatus: document.getElementById("filterStatus"),
  filterLocation: document.getElementById("filterLocation"),
  sortBy: document.getElementById("sortBy"),
  viewKanbanBtn: document.getElementById("viewKanbanBtn"),
  viewListBtn: document.getElementById("viewListBtn"),
  
  // View Containers
  kanbanView: document.getElementById("kanbanView"),
  listView: document.getElementById("listView"),
  tableBody: document.getElementById("tableBody"),
  tableEmptyState: document.getElementById("tableEmptyState"),
  
  // Modal Elements
  appModal: document.getElementById("appModal"),
  modalTitle: document.getElementById("modalTitle"),
  appForm: document.getElementById("appForm"),
  appId: document.getElementById("appId"),
  companyName: document.getElementById("companyName"),
  jobTitle: document.getElementById("jobTitle"),
  appStatus: document.getElementById("appStatus"),
  dateApplied: document.getElementById("dateApplied"),
  locationType: document.getElementById("locationType"),
  jobUrl: document.getElementById("jobUrl"),
  salary: document.getElementById("salary"),
  notes: document.getElementById("notes"),
  closeModalBtn: document.getElementById("closeModalBtn"),
  cancelModalBtn: document.getElementById("cancelModalBtn"),
  
  // Toasts
  toastContainer: document.getElementById("toastContainer")
};

/* ==========================================================================
   TOAST NOTIFICATIONS
   ========================================================================== */
function showToast(message, type = "success") {
  const toast = document.createElement("div");
  toast.className = `toast toast-${type}`;
  
  let iconSVG = "";
  if (type === "success") {
    iconSVG = `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg>`;
  } else if (type === "error") {
    iconSVG = `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>`;
  } else {
    iconSVG = `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>`;
  }
  
  toast.innerHTML = `
    <div class="toast-icon">${iconSVG}</div>
    <div class="toast-message">${message}</div>
  `;
  
  elements.toastContainer.appendChild(toast);
  
  // Trigger animation after adding to DOM
  setTimeout(() => {
    toast.classList.add("show");
  }, 10);
  
  // Remove toast after delay
  setTimeout(() => {
    toast.classList.remove("show");
    setTimeout(() => {
      toast.remove();
    }, 300);
  }, 3500);
}

/* ==========================================================================
   UTILITY FUNCTIONS
   ========================================================================== */
// Helper to format date display (e.g. 2026-06-15 to Jun 15, 2026)
function formatDate(dateStr) {
  if (!dateStr) return "N/A";
  const date = new Date(dateStr);
  if (isNaN(date.getTime())) return dateStr;
  
  // Use local timezone formatting
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric"
  });
}

// Clean salary value input (removes commas/currency signs for storage)
function cleanSalaryValue(val) {
  if (!val) return "";
  return val.trim();
}

// Render formatted salary (e.g., "$120,000" or raw string if currency is custom)
function formatSalaryDisplay(salary) {
  if (!salary) return "N/A";
  // If it's a pure number or contains commas, format with dollar sign if no currency symbols exist
  const hasCurrencySymbol = /[$\u20AC\u00A3\u00A5]/g.test(salary);
  const cleanNum = salary.replace(/[^0-9]/g, "");
  
  if (!hasCurrencySymbol && cleanNum && !isNaN(Number(cleanNum))) {
    return `$${Number(cleanNum).toLocaleString()}`;
  }
  return salary;
}

// Generate unique identifier
function generateId() {
  return "job-" + Date.now().toString(36) + Math.random().toString(36).substr(2, 5);
}

/* ==========================================================================
   METRICS CALCULATION
   ========================================================================== */
function updateMetrics() {
  const total = applications.length;
  elements.statTotal.textContent = total;
  
  // Active funnel include Wishlist, Applied, Interviewing, Offered (excluding Rejected)
  const activeCount = applications.filter(a => a.status !== "rejected").length;
  elements.statActive.textContent = activeCount;
  
  const interviewCount = applications.filter(a => a.status === "interviewing").length;
  elements.statInterviews.textContent = interviewCount;
  
  // Conversion / Success rate defined as: (Interviewing + Offered) / Total
  const interviewOrOffered = applications.filter(a => a.status === "interviewing" || a.status === "offered").length;
  const rate = total > 0 ? Math.round((interviewOrOffered / total) * 100) : 0;
  elements.statSuccessRate.textContent = `${rate}%`;
}

/* ==========================================================================
   FILTERING & SORTING ENGINE
   ========================================================================== */
function getFilteredAndSortedApps() {
  const searchQuery = elements.searchInput.value.toLowerCase().trim();
  const statusFilter = elements.filterStatus.value;
  const locationFilter = elements.filterLocation.value;
  const sortingMethod = elements.sortBy.value;
  
  let result = [...applications];
  
  // Apply Search Filter (Company or Job Title)
  if (searchQuery !== "") {
    result = result.filter(app => 
      app.company.toLowerCase().includes(searchQuery) || 
      app.jobTitle.toLowerCase().includes(searchQuery) ||
      (app.notes && app.notes.toLowerCase().includes(searchQuery))
    );
  }
  
  // Apply Status Dropdown Filter (Note: Kanban always views all lanes unless filtered)
  if (statusFilter !== "all") {
    result = result.filter(app => app.status === statusFilter);
  }
  
  // Apply Location Dropdown Filter
  if (locationFilter !== "all") {
    result = result.filter(app => app.locationType === locationFilter);
  }
  
  // Apply Sorting
  result.sort((a, b) => {
    switch (sortingMethod) {
      case "newest":
        // Fallback to empty date at the end
        return new Date(b.dateApplied || "1970-01-01") - new Date(a.dateApplied || "1970-01-01");
      case "oldest":
        return new Date(a.dateApplied || "1970-01-01") - new Date(b.dateApplied || "1970-01-01");
      case "salary-desc":
        const salA = parseFloat((a.salary || "").replace(/[^0-9.]/g, "")) || 0;
        const salB = parseFloat((b.salary || "").replace(/[^0-9.]/g, "")) || 0;
        return salB - salA;
      case "company-asc":
        return a.company.toLowerCase().localeCompare(b.company.toLowerCase());
      default:
        return 0;
    }
  });
  
  return result;
}

/* ==========================================================================
   RENDER ENGINE: KANBAN VIEW
   ========================================================================== */
function renderKanbanView(filteredApps) {
  // Clear cards in all columns
  const laneIds = ["wishlist", "applied", "interviewing", "offered", "rejected"];
  const lanes = {};
  
  laneIds.forEach(id => {
    const laneContainer = document.getElementById(`lane-${id}`);
    laneContainer.innerHTML = "";
    lanes[id] = {
      container: laneContainer,
      badge: document.querySelector(`.count-${id}`),
      count: 0
    };
  });
  
  // Distribute cards
  filteredApps.forEach(app => {
    const status = app.status;
    if (lanes[status]) {
      const card = createJobCard(app);
      lanes[status].container.appendChild(card);
      lanes[status].count++;
    }
  });
  
  // Update badge count labels
  laneIds.forEach(id => {
    lanes[id].badge.textContent = lanes[id].count;
    
    // If column is empty, show a small visual hint helper
    if (lanes[id].count === 0) {
      lanes[id].container.innerHTML = `
        <div class="empty-lane-placeholder">
          Drop here
        </div>
      `;
    }
  });
}

function createJobCard(app) {
  const card = document.createElement("div");
  card.className = "job-card";
  card.id = `card-${app.id}`;
  card.setAttribute("draggable", "true");
  
  // Clean location type classes
  const locationClass = `badge-location-${app.locationType.toLowerCase().replace("-", "")}`;
  
  // Determine if a URL is provided
  const urlLink = app.jobUrl 
    ? `<a href="${app.jobUrl}" target="_blank" class="job-card-link" title="Visit job post link">
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg>
        Link
       </a>` 
    : "";
    
  card.innerHTML = `
    <div class="job-card-header">
      <div>
        <span class="job-card-company">${escapeHTML(app.company)}</span>
        <h4 class="job-card-title">${escapeHTML(app.jobTitle)}</h4>
      </div>
      <div class="job-card-actions">
        <button class="btn-edit-ghost btn-card-edit" data-id="${app.id}" title="Edit application">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/></svg>
        </button>
        <button class="btn-danger-ghost btn-card-delete" data-id="${app.id}" title="Delete application">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/><line x1="10" y1="11" x2="10" y2="17"/><line x1="14" y1="11" x2="14" y2="17"/></svg>
        </button>
      </div>
    </div>
    <div class="job-card-metadata">
      <span class="badge ${locationClass}">${app.locationType}</span>
      ${app.salary ? `<span class="job-card-salary">${formatSalaryDisplay(app.salary)}</span>` : ""}
    </div>
    <div class="job-card-footer">
      <div class="job-card-date">
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
        <span>${formatDate(app.dateApplied)}</span>
      </div>
      ${urlLink}
    </div>
  `;
  
  // Attach specific action triggers inside the card
  card.querySelector(".btn-card-edit").addEventListener("click", (e) => {
    e.stopPropagation();
    openFormModal(app.id);
  });
  
  card.querySelector(".btn-card-delete").addEventListener("click", (e) => {
    e.stopPropagation();
    deleteApplication(app.id);
  });
  
  // Drag elements setup
  card.addEventListener("dragstart", (e) => {
    card.classList.add("dragging");
    e.dataTransfer.setData("text/plain", app.id);
    e.dataTransfer.effectAllowed = "move";
  });
  
  card.addEventListener("dragend", () => {
    card.classList.remove("dragging");
  });
  
  return card;
}

/* ==========================================================================
   LIST / TABLE VIEW
   ========================================================================= */
function renderListView(filteredApps) {
  elements.tableBody.innerHTML = "";
  
  if (filteredApps.length === 0) {
    elements.tableEmptyState.style.display = "flex";
    return;
  }
  
  elements.tableEmptyState.style.display = "none";
  
  filteredApps.forEach(app => {
    const tr = document.createElement("tr");
    tr.id = `row-${app.id}`;
    
    // Status Badge classes map
    const badgeClass = `badge-status-${app.status}`;
    const locationClass = `badge-location-${app.locationType.toLowerCase().replace("-", "")}`;
    
    tr.innerHTML = `
      <td class="table-company-cell">${escapeHTML(app.company)}</td>
      <td>${escapeHTML(app.jobTitle)}</td>
      <td>
        <span class="status-indicator-badge ${badgeClass}">${app.status}</span>
      </td>
      <td>${formatDate(app.dateApplied)}</td>
      <td>
        <span class="badge ${locationClass}">${app.locationType}</span>
      </td>
      <td class="table-salary-cell">${formatSalaryDisplay(app.salary)}</td>
      <td style="text-align: right;">
        <div class="flex-center" style="justify-content: flex-end; gap: 4px;">
          <button class="btn-edit-ghost btn-row-edit" data-id="${app.id}">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/></svg>
          </button>
          <button class="btn-danger-ghost btn-row-delete" data-id="${app.id}">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/><line x1="10" y1="11" x2="10" y2="17"/><line x1="14" y1="11" x2="14" y2="17"/></svg>
          </button>
        </div>
      </td>
    `;
    
    tr.querySelector(".btn-row-edit").addEventListener("click", () => openFormModal(app.id));
    tr.querySelector(".btn-row-delete").addEventListener("click", () => deleteApplication(app.id));
    
    elements.tableBody.appendChild(tr);
  });
}

/* ==========================================================================
   GLOBAL RENDER HANDLER
   ========================================================================== */
function renderActiveView() {
  const filtered = getFilteredAndSortedApps();
  
  if (elements.viewKanbanBtn.classList.contains("active")) {
    renderKanbanView(filtered);
  } else {
    renderListView(filtered);
  }
  
  updateMetrics();
}

/* ==========================================================================
   CRUD CONTROLS
   ========================================================================== */
// Save or Update application
function handleFormSubmit(e) {
  e.preventDefault();
  
  // Form input validations
  let hasError = false;
  
  if (!elements.companyName.value.trim()) {
    setErrorState(elements.companyName, true);
    hasError = true;
  } else {
    setErrorState(elements.companyName, false);
  }
  
  if (!elements.jobTitle.value.trim()) {
    setErrorState(elements.jobTitle, true);
    hasError = true;
  } else {
    setErrorState(elements.jobTitle, false);
  }
  
  // URL check
  const urlValue = elements.jobUrl.value.trim();
  if (urlValue !== "") {
    try {
      new URL(urlValue);
      setErrorState(elements.jobUrl, false);
    } catch (_) {
      setErrorState(elements.jobUrl, true);
      hasError = true;
    }
  } else {
    setErrorState(elements.jobUrl, false);
  }
  
  if (hasError) return;
  
  const idValue = elements.appId.value;
  const jobPayload = {
    company: elements.companyName.value.trim(),
    jobTitle: elements.jobTitle.value.trim(),
    status: elements.appStatus.value,
    dateApplied: elements.dateApplied.value || new Date().toISOString().split("T")[0],
    locationType: elements.locationType.value,
    jobUrl: urlValue,
    salary: cleanSalaryValue(elements.salary.value),
    notes: elements.notes.value.trim()
  };
  
  if (idValue === "") {
    // Add mode
    jobPayload.id = generateId();
    applications.push(jobPayload);
    showToast(`Added ${jobPayload.company} to applications!`, "success");
  } else {
    // Edit mode
    const idx = applications.findIndex(a => a.id === idValue);
    if (idx !== -1) {
      jobPayload.id = idValue;
      applications[idx] = jobPayload;
      showToast(`Updated details for ${jobPayload.company}!`, "success");
    }
  }
  
  saveToLocalStorage();
  closeFormModal();
  renderActiveView();
}

// Delete application
function deleteApplication(id) {
  const app = applications.find(a => a.id === id);
  if (!app) return;
  
  const confirmed = confirm(`Are you sure you want to delete the application for ${app.company} (${app.jobTitle})?`);
  if (confirmed) {
    applications = applications.filter(a => a.id !== id);
    saveToLocalStorage();
    renderActiveView();
    showToast(`Removed application for ${app.company}.`, "info");
  }
}

// Set form group styling for error highlights
function setErrorState(inputEl, isError) {
  const parent = inputEl.closest(".form-group");
  if (isError) {
    parent.classList.add("error");
  } else {
    parent.classList.remove("error");
  }
}

/* ==========================================================================
   MODAL ACTIONS
   ========================================================================== */
function openFormModal(id = null) {
  // Clear error layouts
  document.querySelectorAll(".form-group").forEach(el => el.classList.remove("error"));
  
  if (id === null) {
    // ADD NEW MODE
    elements.modalTitle.textContent = "New Job Application";
    elements.appForm.reset();
    elements.appId.value = "";
    
    // Set default date as today
    elements.dateApplied.value = new Date().toISOString().split("T")[0];
    elements.appStatus.value = "applied";
    elements.locationType.value = "Remote";
  } else {
    // EDIT MODE
    const app = applications.find(a => a.id === id);
    if (!app) return;
    
    elements.modalTitle.textContent = "Edit Job Application";
    elements.appId.value = app.id;
    elements.companyName.value = app.company;
    elements.jobTitle.value = app.jobTitle;
    elements.appStatus.value = app.status;
    elements.dateApplied.value = app.dateApplied || "";
    elements.locationType.value = app.locationType;
    elements.jobUrl.value = app.jobUrl || "";
    elements.salary.value = app.salary || "";
    elements.notes.value = app.notes || "";
  }
  
  elements.appModal.classList.add("active");
  elements.companyName.focus();
}

function closeFormModal() {
  elements.appModal.classList.remove("active");
}

/* ==========================================================================
   DRAG AND DROP HANDLERS
   ========================================================================== */
function initializeDragAndDrop() {
  const lanes = document.querySelectorAll(".kanban-lane");
  
  lanes.forEach(lane => {
    const cardsContainer = lane.querySelector(".lane-cards");
    const status = lane.getAttribute("data-status");
    
    // Add visual highlights when item dragged over container
    lane.addEventListener("dragover", (e) => {
      e.preventDefault();
      cardsContainer.classList.add("dragover");
    });
    
    lane.addEventListener("dragleave", () => {
      cardsContainer.classList.remove("dragover");
    });
    
    lane.addEventListener("drop", (e) => {
      e.preventDefault();
      cardsContainer.classList.remove("dragover");
      
      const appId = e.dataTransfer.getData("text/plain");
      const app = applications.find(a => a.id === appId);
      
      // Update status if moved to a different lane
      if (app && app.status !== status) {
        const oldStatus = app.status;
        app.status = status;
        
        saveToLocalStorage();
        renderActiveView();
        
        showToast(`Moved ${app.company} to ${status.charAt(0).toUpperCase() + status.slice(1)}!`, "info");
      }
    });
  });
}

/* ==========================================================================
   DATA IMPORT / EXPORT UTILITIES
   ========================================================================== */
function exportBackup() {
  if (applications.length === 0) {
    showToast("There is no application data to export.", "error");
    return;
  }
  
  const dataStr = JSON.stringify(applications, null, 2);
  const dataBlob = new Blob([dataStr], { type: "application/json" });
  const url = URL.createObjectURL(dataBlob);
  
  const link = document.createElement("a");
  link.href = url;
  link.download = `jobpulse_backup_${new Date().toISOString().split("T")[0]}.json`;
  document.body.appendChild(link);
  link.click();
  
  // Clean up
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
  
  showToast("Backup file exported successfully!", "success");
}

function triggerImportFileInput() {
  elements.importFileInput.click();
}

function handleImportFile(e) {
  const file = e.target.files[0];
  if (!file) return;
  
  const reader = new FileReader();
  reader.onload = function(evt) {
    try {
      const data = JSON.parse(evt.target.result);
      
      // Basic validation: Check if file content is an array of application objects
      if (Array.isArray(data) && (data.length === 0 || (data[0].company && data[0].jobTitle))) {
        // Overwrite standard entries
        applications = data.map(item => ({
          id: item.id || generateId(),
          company: item.company || "Unknown Company",
          jobTitle: item.jobTitle || "Unknown Role",
          status: item.status || "applied",
          dateApplied: item.dateApplied || new Date().toISOString().split("T")[0],
          locationType: item.locationType || "Remote",
          jobUrl: item.jobUrl || "",
          salary: cleanSalaryValue(item.salary),
          notes: item.notes || ""
        }));
        
        saveToLocalStorage();
        renderActiveView();
        showToast("Backup imported successfully!", "success");
      } else {
        showToast("Import failed. Invalid file schema format.", "error");
      }
    } catch (err) {
      console.error(err);
      showToast("Import failed. File is not a valid JSON structure.", "error");
    }
  };
  
  reader.readAsText(file);
  // Clear input to allow re-upload of same file name
  elements.importFileInput.value = "";
}

/* ==========================================================================
   HTML SECURITY ESCAPING
   ========================================================================== */
function escapeHTML(str) {
  if (!str) return "";
  return str.replace(/[&<>'"]/g, 
    tag => ({
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      "'": '&#39;',
      '"': '&quot;'
    }[tag] || tag)
  );
}

/* ==========================================================================
   EVENT LISTENERS INITIALIZATION
   ========================================================================== */
function registerEvents() {
  // Modal Buttons
  elements.newAppBtn.addEventListener("click", () => openFormModal(null));
  elements.closeModalBtn.addEventListener("click", closeFormModal);
  elements.cancelModalBtn.addEventListener("click", closeFormModal);
  elements.appForm.addEventListener("submit", handleFormSubmit);
  
  // Close Modal on clicking outside content area
  elements.appModal.addEventListener("click", (e) => {
    if (e.target === elements.appModal) closeFormModal();
  });
  
  // Search & Filter Events
  elements.searchInput.addEventListener("input", renderActiveView);
  elements.filterStatus.addEventListener("change", renderActiveView);
  elements.filterLocation.addEventListener("change", renderActiveView);
  elements.sortBy.addEventListener("change", renderActiveView);
  
  // View Toggle Events
  elements.viewKanbanBtn.addEventListener("click", () => {
    elements.viewKanbanBtn.classList.add("active");
    elements.viewListBtn.classList.remove("active");
    elements.listView.classList.remove("active");
    elements.kanbanView.classList.add("active");
    renderActiveView();
  });
  
  elements.viewListBtn.addEventListener("click", () => {
    elements.viewListBtn.classList.add("active");
    elements.viewKanbanBtn.classList.remove("active");
    elements.kanbanView.classList.remove("active");
    elements.listView.classList.add("active");
    renderActiveView();
  });
  
  // Export / Import Events
  elements.exportBtn.addEventListener("click", exportBackup);
  elements.importBtn.addEventListener("click", triggerImportFileInput);
  elements.importFileInput.addEventListener("change", handleImportFile);
  
  // Drag & Drop
  initializeDragAndDrop();
}

/* ==========================================================================
   BOOTSTRAP
   ========================================================================== */
document.addEventListener("DOMContentLoaded", () => {
  loadApplications();
  registerEvents();
  renderActiveView();
});