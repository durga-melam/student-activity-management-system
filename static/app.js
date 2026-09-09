/**
 * ==========================================================================
 * SHRI VISHNU ENGINEERING COLLEGE FOR WOMEN (AUTONOMOUS)
 * Department of Information Technology (IT)
 * Frontend Engine - Clean SVECW IT Department Dataset
 * ==========================================================================
 */

// ONLY SARVANI'S AUTHENTIC SVECW IT DATASET (From Department Excel Records)
const DEFAULT_SVECW_ACTIVITIES = [
  { id: 1, regd_no: "22B01A1231", student_name: "DEVAKOTI RENUKA GANGA", class_year: "IV IT", section: "A", category: "Internship", title: "Got internship with stipend Rs. 1,35,000", organization: "Google", place: "Bangalore", event_date: "2025-05-12", score_or_stipend: "Rs. 1,35,000", status: "APPROVED" },
  { id: 2, regd_no: "21B01A12C6", student_name: "NOUBATTULA BHAVYA SRI NAGA ANJANI DEVI", class_year: "IV IT", section: "B", category: "Internship", title: "Got internship with stipend Rs. 1,27,083", organization: "Adobe Systems India Private Limited", place: "Noida", event_date: "2025-06-16", score_or_stipend: "Rs. 1,27,083", status: "APPROVED" },
  { id: 3, regd_no: "24B01A1219", student_name: "CHEEKURTHI NIRUPAMA", class_year: "II IT", section: "A", category: "Internship", title: "Completed a one month internship in UI/UX Design", organization: "Future Interns", place: "Online", event_date: "2026-04-20", score_or_stipend: "Completed", status: "APPROVED" },
  { id: 4, regd_no: "24B01A12E3", student_name: "RATNALA RENUKA DEVI", class_year: "II IT", section: "A", category: "Hackathon", title: "Amaravati Quantum Valley Hackathon-2025-Semi Final", organization: "SRKR Engineering College(A)", place: "Bhimavaram", event_date: "2025-09-10", score_or_stipend: "Semi-Finalist", status: "APPROVED" },
  { id: 5, regd_no: "23B01A12B1", student_name: "MEDIDI CHARANYA", class_year: "III IT", section: "B", category: "Hackathon", title: "OMNITRIX Hackathon 2025-Nationwide Innovation Challenge", organization: "Siddhartha Academy of Higher Education", place: "Vijayawada", event_date: "2025-10-17", score_or_stipend: "1st Prize", status: "APPROVED" },
  { id: 6, regd_no: "23B01A12A0", student_name: "MANCHIKANTI LAKSHMI SRUTHI MANOJNA", class_year: "III IT", section: "A", category: "Hackathon", title: "24 Hr National Level HACKOVERFLOW-2K25", organization: "SRKR Engineering College(A)", place: "Bhimavaram", event_date: "2026-05-19", score_or_stipend: "Participation", status: "APPROVED" },
  { id: 7, regd_no: "20B01A1258", student_name: "GOVARDHANAM DEVI SRIYA", class_year: "IV IT", section: "A", category: "Journal / Paper", title: "Optimized disease recognition in tomato plants using YOLOv7", organization: "Springer - Progress in AI", place: "Online", event_date: "2025-11-20", score_or_stipend: "Published", status: "APPROVED" },
  { id: 8, regd_no: "23B01A1278", student_name: "KESARI DEVI SUHITHA", class_year: "III IT", section: "A", category: "NPTEL / Certification", title: "NPTEL - Deep Learning and Cloud Architecture", organization: "NPTEL / SWAYAM - IIT Madras", place: "Online", event_date: "2026-05-04", score_or_stipend: "Elite + Gold (91%)", status: "APPROVED" },
  { id: 9, regd_no: "23B01A1251", student_name: "GUNTUPALLI PRAMEELA NAGA SRI", class_year: "III IT", section: "B", category: "NPTEL / Certification", title: "AWS Certified Cloud Practitioner", organization: "Amazon Web Services", place: "Online", event_date: "2026-05-22", score_or_stipend: "Passed (880/1000)", status: "PENDING" }
];

let activities = [...DEFAULT_SVECW_ACTIVITIES];
let currentRole = null;
let currentUser = { id: "", name: "", role: "" };

// Backend Host URL (Checks both relative and local port 8000)
const API_BASE = window.location.protocol === "file:" ? "http://127.0.0.1:8000" : "";

// ==================== 1. FETCH ACTIVITIES ====================
async function fetchActivitiesFromBackend() {
  const monthVal = document.getElementById("monthSelect")?.value || "ALL";
  const catVal = document.getElementById("categorySelect")?.value || "ALL";
  const statusVal = document.getElementById("statusSelect")?.value || "ALL";
  const searchVal = document.getElementById("searchInput")?.value?.trim() || "";

  let url = `${API_BASE}/api/activities?`;
  const params = new URLSearchParams();

  if (monthVal !== "ALL" && monthVal !== "CUSTOM") params.append("month", monthVal);
  if (catVal !== "ALL") params.append("category", catVal);
  if (statusVal !== "ALL") params.append("status", statusVal);
  if (searchVal) params.append("search", searchVal);

  try {
    const response = await fetch(url + params.toString());
    if (response.ok) {
      const data = await response.json();
      if (data.activities && data.activities.length > 0) {
        activities = data.activities;
      }
    }
  } catch (err) {
    // Offline / file fallback
  }

  renderActivitiesTable();
}

// ==================== 2. LOGIN / LOGOUT ====================
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
    performLogin("student", "22B01A1231", "DEVAKOTI RENUKA GANGA");
  } else {
    performLogin("faculty", "SVECW-IT-FAC01", "Dr. S. Ravi Kumar (Faculty Coordinator)");
  }
}

function performLogin(role, id, displayName) {
  currentRole = role;
  currentUser = { id, name: displayName, role };

  document.getElementById("loginView").classList.add("hidden");
  document.getElementById("dashboardView").classList.remove("hidden");
  document.getElementById("loggedInHeaderBar").classList.remove("hidden");
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
  if (window.lucide) lucide.createIcons();
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
    alertText.innerHTML = `<strong>Student Portal (${displayName}):</strong> View your department accreditation submissions, approvals, or submit new activities.`;
    facultyCols.forEach(el => el.classList.add("hidden"));
  } else {
    userBadge.innerHTML = `<span class="w-2 h-2 rounded-full bg-purple-600 animate-pulse"></span> ${displayName} (${id})`;
    alertText.innerHTML = "<strong>Faculty / Coordinator View:</strong> Review all IT student submissions, verify certificates, filter by month/date, and download official NBA/NAAC reports.";
    facultyCols.forEach(el => el.classList.remove("hidden"));
  }
}

// ==================== 3. FILTER & RENDER TABLE ====================
function onMonthChange(val) {
  const customRow = document.getElementById("customDateRow");
  if (val === "CUSTOM") customRow.classList.remove("hidden");
  else {
    customRow.classList.add("hidden");
    fetchActivitiesFromBackend();
  }
}

function applyFilters() {
  fetchActivitiesFromBackend();
}

function renderActivitiesTable() {
  let displayList = activities;
  if (currentRole === "student" && currentUser.id) {
    displayList = activities.filter(i => i.regd_no === currentUser.id);
  }

  // Counters
  document.getElementById("statTotal").innerText = displayList.length;
  document.getElementById("statStudents").innerText = new Set(displayList.map(i => i.regd_no)).size;
  document.getElementById("statHackathons").innerText = displayList.filter(i => (i.category || "").includes("Hackathon")).length;
  document.getElementById("statNptel").innerText = displayList.filter(i => (i.category || "").includes("NPTEL") || (i.category || "").includes("Certification") || (i.category || "").includes("Internship")).length;

  const monthVal = document.getElementById("monthSelect").value;
  const label = monthVal === "2026-05" ? "May 2026" : monthVal === "ALL" ? "All Months" : monthVal;
  document.getElementById("statFilterNote").innerText = `Filter: ${label}`;
  document.getElementById("printReportTitle").innerText = `Student Extracurricular Activities & Certifications Report (${label})`;

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
          <div class="flex items-center justify-end space-x-2">
            ${!isApproved ? `
              <button onclick="approveRecord(${act.id})" class="bg-emerald-50 hover:bg-emerald-100 border border-emerald-300 text-emerald-700 font-bold px-2 py-1 rounded text-[11px] transition">Approve</button>
            ` : `
              <span class="text-slate-400 text-[11px] font-semibold">✓ Verified</span>
            `}
            <button onclick="deleteRecord(${act.id})" class="text-rose-500 hover:text-rose-700 p-1 rounded hover:bg-rose-50 transition" title="Delete record">
              <i data-lucide="trash-2" class="w-4 h-4"></i>
            </button>
          </div>
        </td>
      `;
      tbody.appendChild(tr);
    });
  }

  if (window.lucide) lucide.createIcons();
}

function approveRecord(id) {
  const item = activities.find(i => i.id === id);
  if (item) {
    item.status = "APPROVED";
    renderActivitiesTable();
  }
}

// ==================== DELETE RECORD ====================
async function deleteRecord(id) {
  const item = activities.find(i => i.id === id);
  const name = item ? item.student_name : "this activity";

  if (confirm(`Are you sure you want to delete the record for ${name}?`)) {
    // 1. Remove immediately from UI table
    activities = activities.filter(i => i.id !== id);
    renderActivitiesTable();

    // 2. Delete from SQLite database if server is running
    try {
      await fetch(`${API_BASE}/api/activities/${id}`, {
        method: "DELETE"
      });
    } catch (err) {
      // offline fallback
    }
  }
}

// ==================== 4. EXCEL & PDF EXPORTS ====================
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

// ==================== 5. ADD ACTIVITY (Local & Backend Seamless Append!) ====================
function openAddModal() {
  document.getElementById("modalDate").value = new Date().toISOString().split("T")[0];
  if (currentRole === "student") {
    document.getElementById("modalRoll").value = currentUser.id || "22B01A1231";
    document.getElementById("modalName").value = currentUser.name || "DEVAKOTI RENUKA GANGA";
  } else {
    document.getElementById("modalRoll").value = "";
    document.getElementById("modalName").value = "";
  }
  document.getElementById("addModal").classList.remove("hidden");
}

function closeAddModal() {
  document.getElementById("addModal").classList.add("hidden");
  document.getElementById("activityForm").reset();
}

async function handleFormSubmit(e) {
  e.preventDefault();

  const regd = document.getElementById("modalRoll").value.trim().toUpperCase();
  const name = document.getElementById("modalName").value.trim().toUpperCase();
  const cat = document.getElementById("modalCategory").value;
  const title = document.getElementById("modalTitle").value.trim();
  const org = document.getElementById("modalOrg").value.trim();
  const date = document.getElementById("modalDate").value;
  const score = document.getElementById("modalScore").value.trim() || "Completed";

  // Create new record object
  const newActivity = {
    id: Date.now(),
    regd_no: regd,
    student_name: name,
    class_year: "IV IT",
    section: "A",
    category: cat,
    title: title,
    organization: org,
    place: "Bhimavaram",
    event_date: date,
    score_or_stipend: score,
    status: currentRole === "faculty" ? "APPROVED" : "PENDING"
  };

  // 1. ALWAYS Append locally so the table immediately updates!
  activities.unshift(newActivity);
  closeAddModal();
  renderActivitiesTable();

  // 2. Try to persist to backend if server is alive
  const formData = new FormData();
  formData.append("regd_no", regd);
  formData.append("student_name", name);
  formData.append("class_year", "IV IT");
  formData.append("section", "A");
  formData.append("category", cat);
  formData.append("title", title);
  formData.append("organization", org);
  formData.append("event_date", date);
  formData.append("score_or_stipend", score);

  try {
    await fetch(`${API_BASE}/api/activities`, {
      method: "POST",
      body: formData
    });
  } catch (err) {
    // Graceful offline save
  }

  alert(`Success: Activity record for ${name} (${regd}) added to the table!`);
}

// Start
window.addEventListener("DOMContentLoaded", () => {
  if (window.lucide) lucide.createIcons();
});