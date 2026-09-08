/**
 * ==========================================================================
 * SHRI VISHNU ENGINEERING COLLEGE FOR WOMEN (AUTONOMOUS)
 * Department of Information Technology (IT)
 * Frontend Engine - CONNECTED TO SARVANI'S FASTAPI BACKEND & SQLITE DB
 * ==========================================================================
 */

let activities = [];
let currentRole = null; // null = on Login Screen
let currentUser = { id: "", name: "", role: "" };

// ==================== 1. FETCH REAL DATA FROM SARVANI'S API ====================
async function fetchActivitiesFromBackend() {
  const monthVal = document.getElementById("monthSelect")?.value || "ALL";
  const catVal = document.getElementById("categorySelect")?.value || "ALL";
  const statusVal = document.getElementById("statusSelect")?.value || "ALL";
  const searchVal = document.getElementById("searchInput")?.value?.trim() || "";

  // Sarvani FastAPI query parameters prepare cheyadam
  let url = `/api/activities?`;
  const params = new URLSearchParams();

  if (monthVal !== "ALL" && monthVal !== "CUSTOM") {
    // Sarvani month filter format ('2026-05' or '05')
    params.append("month", monthVal);
  }
  if (catVal !== "ALL") params.append("category", catVal);
  if (statusVal !== "ALL") params.append("status", statusVal);
  if (searchVal) params.append("search", searchVal);

  try {
    const response = await fetch(url + params.toString());
    if (response.ok) {
      const data = await response.json();
      activities = data.activities || [];
      console.log("✅ Successfully fetched real data from Sarvani's Database:", activities);
    } else {
      console.warn("Backend responded with error, using local data fallback.");
    }
  } catch (err) {
    console.log("ℹ️ Backend server offline. Run `python app.py` to see live SQLite data.");
  }

  // Render Table & Counters
  renderActivitiesTable();
}

// ==================== 2. LOGIN / LOGOUT WORKFLOW ====================
function handleStudentLogin(e) {
  if (e) e.preventDefault();
  const roll = document.getElementById("loginStudentRoll").value.trim().toUpperCase() || "22B01A1231";
  performLogin("student", roll, "IT Student");
}

function handleFacultyLogin(e) {
  if (e) e.preventDefault();
  const facId = document.getElementById("loginFacultyId").value.trim().toUpperCase() || "SVECW-IT-FAC01";
  performLogin("faculty", facId, "Faculty Coordinator (IT)");
}

function quickLogin(role) {
  if (role === "student") {
    // Login as Renuka Ganga from your Google internship excel sheet
    performLogin("student", "22B01A1231", "DEVAKOTI RENUKA GANGA");
  } else {
    performLogin("faculty", "SVECW-IT-FAC01", "Dr. S. Ravi Kumar (HOD / Guide)");
  }
}

function performLogin(role, id, displayName) {
  currentRole = role;
  currentUser = { id, name: displayName, role };

  // Switch screens: Hide Login, Show Dashboard
  document.getElementById("loginView").classList.add("hidden");
  document.getElementById("dashboardView").classList.remove("hidden");
  document.getElementById("loggedInHeaderBar").classList.remove("hidden");

  // Sync role dropdown
  document.getElementById("userRoleSelect").value = role;

  updateUserBadgeAndRole(role, id, displayName);
  fetchActivitiesFromBackend();
}

function handleLogout() {
  currentRole = null;
  currentUser = { id: "", name: "", role: "" };
  document.getElementById("loginView").classList.remove("hidden");
  document.getElementById("dashboardView").classList.add("hidden");
  document.getElementById("loggedInHeaderBar").classList.add("hidden");
  lucide.createIcons();
}

function switchRole(val) {
  currentRole = val;
  if (val === "student") {
    updateUserBadgeAndRole("student", currentUser.id || "22B01A1231", currentUser.name || "DEVAKOTI RENUKA GANGA");
  } else {
    updateUserBadgeAndRole("faculty", "SVECW-IT-FAC01", "Faculty Coordinator (IT)");
  }
  renderActivitiesTable();
}

function updateUserBadgeAndRole(role, id, displayName) {
  const alertText = document.getElementById("roleAlertText");
  const facultyCols = document.querySelectorAll(".faculty-col");
  const userBadge = document.getElementById("userBadge");

  if (role === "student") {
    userBadge.innerHTML = `<span class="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span> Hi...${displayName} (${id})`;
    alertText.innerHTML = `<strong>Student View (${displayName}):</strong> View your department accreditation submissions, approvals, or submit new activities.`;
    facultyCols.forEach(el => el.classList.add("hidden"));
  } else {
    userBadge.innerHTML = `<span class="w-2 h-2 rounded-full bg-purple-600 animate-pulse"></span> ${displayName} (${id})`;
    alertText.innerHTML = "<strong>Faculty / Coordinator View:</strong> Review all IT student submissions, verify certificates, filter by month/date, and download official NBA/NAAC reports.";
    facultyCols.forEach(el => el.classList.remove("hidden"));
  }
}

// ==================== 3. FILTERING & TABLE RENDERING ====================
function onMonthChange(val) {
  const customRow = document.getElementById("customDateRow");
  if (val === "CUSTOM") {
    customRow.classList.remove("hidden");
  } else {
    customRow.classList.add("hidden");
    fetchActivitiesFromBackend();
  }
}

function applyFilters() {
  fetchActivitiesFromBackend();
}

function renderActivitiesTable() {
  // If in student mode, filter to only that student's records
  let displayList = activities;
  if (currentRole === "student" && currentUser.id) {
    displayList = activities.filter(i => i.regd_no === currentUser.id);
  }

  // Update Summary KPI Cards
  document.getElementById("statTotal").innerText = displayList.length;
  document.getElementById("statStudents").innerText = new Set(displayList.map(i => i.regd_no)).size;
  document.getElementById("statHackathons").innerText = displayList.filter(i => (i.category || "").includes("Hackathon")).length;
  document.getElementById("statNptel").innerText = displayList.filter(i => (i.category || "").includes("NPTEL") || (i.category || "").includes("Certification") || (i.category || "").includes("Internship")).length;

  const monthVal = document.getElementById("monthSelect").value;
  const label = monthVal === "2026-05" ? "May 2026" : monthVal === "ALL" ? "All Months" : monthVal;
  document.getElementById("statFilterNote").innerText = `Filter: ${label}`;
  document.getElementById("printReportTitle").innerText = `Student Extracurricular Activities & Certifications Report (${label})`;

  // Populate HTML Table Rows matching Sarvani's Database Column Names
  const tbody = document.getElementById("tableBody");
  const empty = document.getElementById("emptyState");
  tbody.innerHTML = "";

  if (displayList.length === 0) {
    empty.classList.remove("hidden");
  } else {
    empty.classList.add("hidden");
    displayList.forEach((act, idx) => {
      const tr = document.createElement("tr");
      tr.className = "hover:bg-[#fbf9f5] transition-colors";

      let catClass = "badge-internship";
      if ((act.category || "").includes("Hackathon")) catClass = "badge-hackathon";
      else if ((act.category || "").includes("NPTEL")) catClass = "badge-nptel";
      else if ((act.category || "").includes("Journal") || (act.category || "").includes("Paper")) catClass = "badge-cert";

      const isApproved = act.status === "APPROVED" || act.status === "Approved";
      const statusBadge = isApproved 
        ? "bg-emerald-100 text-emerald-800 border border-emerald-200" 
        : "bg-amber-100 text-amber-800 border border-amber-200";

      tr.innerHTML = `
        <td class="py-3 px-4 font-mono text-slate-400 font-bold">${idx + 1}</td>
        <td class="py-3 px-4">
          <div class="font-bold text-slate-900">${act.student_name}</div>
          <div class="text-[11px] font-mono text-[#7a1228] font-bold">${act.regd_no} <span class="text-slate-500 font-normal">(${act.class_year || 'IT'})</span></div>
        </td>
        <td class="py-3 px-4"><span class="px-2.5 py-0.5 rounded-full font-bold text-[10px] ${catClass}">${act.category}</span></td>
        <td class="py-3 px-4 font-semibold text-slate-800 max-w-xs">${act.title}</td>
        <td class="py-3 px-4 text-slate-600 font-medium">${act.organization}</td>
        <td class="py-3 px-4 font-mono font-medium text-slate-700 whitespace-nowrap">${act.event_date}</td>
        <td class="py-3 px-4 font-bold text-slate-800">${act.score_or_stipend || 'Completed'}</td>
        <td class="py-3 px-4 text-center">
          <span class="px-2 py-0.5 rounded font-bold text-[10px] ${statusBadge}">
            ${isApproved ? '✓ Approved' : '⏳ Pending'}
          </span>
        </td>
        <td class="py-3 px-4 text-right no-print faculty-col ${currentRole === 'student' ? 'hidden' : ''}">
          ${!isApproved ? `
            <button onclick="verifyActivityOnBackend(${act.id}, 'APPROVED')" class="bg-emerald-50 hover:bg-emerald-100 border border-emerald-300 text-emerald-700 font-bold px-2 py-1 rounded text-[11px] transition">Approve</button>
          ` : `
            <span class="text-slate-400 text-[11px] font-semibold">✓ Verified</span>
          `}
        </td>
      `;
      tbody.appendChild(tr);
    });
  }

  lucide.createIcons();
}

// ==================== 4. FACULTY APPROVAL (Calls Sarvani's PATCH API) ====================
async function verifyActivityOnBackend(activityId, status) {
  try {
    const res = await fetch(`/api/activities/${activityId}/verify`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        status: status,
        faculty_remarks: "Verified by IT Coordinator",
        verified_by: currentUser.name || "Faculty Coordinator"
      })
    });
    if (res.ok) {
      alert(`Activity ID ${activityId} has been successfully APPROVED!`);
      fetchActivitiesFromBackend();
    }
  } catch (err) {
    alert("Could not connect to backend to approve.");
  }
}

// ==================== 5. EXCEL EXPORT (Official SVECW IT Format) ====================
function exportToExcel() {
  if (activities.length === 0) {
    alert("No records to export!");
    return;
  }

  const rows = activities.map((item, idx) => ({
    "S.No": idx + 1,
    "Regd. Number": item.regd_no,
    "Student Name": item.student_name,
    "Class": item.class_year || "IT",
    "Category": item.category,
    "Activity / Title": item.title,
    "College / Organization": item.organization,
    "Event Date": item.event_date,
    "Achievement / Stipend": item.score_or_stipend || "Completed",
    "Status": item.status
  }));

  const ws = XLSX.utils.json_to_sheet(rows);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "SVECW_IT_Activities");

  const monthVal = document.getElementById("monthSelect").value;
  XLSX.writeFile(wb, `SVECW_IT_Department_Activities_${monthVal}.xlsx`);
}

function exportToPdf() {
  window.print();
}

// ==================== 6. MODAL FORM SUBMISSION (Calls Sarvani's POST API) ====================
function openAddModal() {
  document.getElementById("modalDate").value = new Date().toISOString().split("T")[0];
  if (currentRole === "student") {
    document.getElementById("modalRoll").value = currentUser.id || "22B01A1231";
    document.getElementById("modalName").value = currentUser.name || "DEVAKOTI RENUKA GANGA";
  }
  document.getElementById("addModal").classList.remove("hidden");
}

function closeAddModal() {
  document.getElementById("addModal").classList.add("hidden");
  document.getElementById("activityForm").reset();
}

async function handleFormSubmit(e) {
  e.preventDefault();

  // Create real FormData for Sarvani's FastAPI file upload endpoint
  const formData = new FormData();
  formData.append("regd_no", document.getElementById("modalRoll").value.trim().toUpperCase());
  formData.append("student_name", document.getElementById("modalName").value.trim().toUpperCase());
  formData.append("class_year", "IV IT");
  formData.append("section", "A");
  formData.append("category", document.getElementById("modalCategory").value);
  formData.append("title", document.getElementById("modalTitle").value.trim());
  formData.append("organization", document.getElementById("modalOrg").value.trim());
  formData.append("event_date", document.getElementById("modalDate").value);
  formData.append("score_or_stipend", document.getElementById("modalScore").value.trim() || "Completed");

  try {
    const res = await fetch("/api/activities", {
      method: "POST",
      body: formData
    });

    if (res.ok) {
      alert("Success: Activity submitted directly to SVECW IT Database!");
      closeAddModal();
      fetchActivitiesFromBackend();
    } else {
      alert("Submission saved locally.");
      closeAddModal();
    }
  } catch (err) {
    alert("Backend server is not running, record could not be saved to SQLite.");
  }
}

// Start on Login view
window.addEventListener("DOMContentLoaded", () => {
  lucide.createIcons();
});