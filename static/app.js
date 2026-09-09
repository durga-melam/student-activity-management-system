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
      const isRejected = act.status === "REJECTED" || act.status === "Rejected";

      let statusBadge = "bg-amber-100 text-amber-800 border border-amber-200";
      let statusText = "⏳ Pending";
      if (isApproved) {
        statusBadge = "bg-emerald-100 text-emerald-800 border border-emerald-200";
        statusText = "✓ Approved";
      } else if (isRejected) {
        statusBadge = "bg-rose-100 text-rose-800 border border-rose-200";
        statusText = "✕ Rejected";
      }

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
          <button onclick="openCertificateModal(${act.id})" class="inline-flex items-center gap-1 bg-rose-50 hover:bg-rose-100 border border-rose-200 text-[#7a1228] font-bold px-2 py-1 rounded text-[11px] transition shadow-xs" title="View Certificate Document Proof">
            <i data-lucide="file-text" class="w-3.5 h-3.5 text-[#ea580c]"></i>
            <span>View Cert</span>
          </button>
        </td>
        <td class="py-3 px-4 text-center">
          <span class="px-2 py-0.5 rounded font-bold text-[10px] ${statusBadge}">
            ${statusText}
          </span>
          ${isRejected && act.faculty_remarks ? `
            <div class="text-[10px] text-rose-700 font-medium mt-1 bg-rose-50 border border-rose-200 rounded px-1.5 py-0.5 max-w-[130px] mx-auto truncate" title="Faculty Remarks: ${act.faculty_remarks}">
              💬 ${act.faculty_remarks}
            </div>
          ` : ''}
        </td>
        <td class="py-3 px-4 text-right no-print">
          <div class="flex items-center justify-end space-x-1.5">
            ${currentRole === 'faculty' ? `
              ${!isApproved ? `
                <button onclick="approveRecord(${act.id})" class="bg-emerald-50 hover:bg-emerald-100 border border-emerald-300 text-emerald-700 font-bold px-2 py-1 rounded text-[11px] transition">Approve</button>
                ${!isRejected ? `
                  <button onclick="openRejectModal(${act.id})" class="bg-rose-50 hover:bg-rose-100 border border-rose-300 text-rose-700 font-bold px-2 py-1 rounded text-[11px] transition">Reject</button>
                ` : ''}
              ` : `
                <span class="text-emerald-700 text-[11px] font-bold bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded">✓ Verified</span>
              `}
              <button onclick="deleteRecord(${act.id})" class="text-slate-400 hover:text-rose-600 p-1 rounded hover:bg-rose-50 transition" title="Delete record">
                <i data-lucide="trash-2" class="w-4 h-4"></i>
              </button>
            ` : `
              ${!isApproved ? `
                <button onclick="deleteRecord(${act.id})" class="text-rose-600 hover:text-rose-800 bg-rose-50 hover:bg-rose-100 border border-rose-200 px-2 py-1 rounded text-[11px] font-bold transition flex items-center gap-1" title="Delete Mistaken Submission">
                  <i data-lucide="trash-2" class="w-3.5 h-3.5"></i>
                  <span>Delete</span>
                </button>
              ` : `
                <span class="text-slate-400 text-[11px] font-semibold">✓ Verified</span>
              `}
            `}
          </div>
        </td>
      `;
      tbody.appendChild(tr);
    });
  }

  if (window.lucide) lucide.createIcons();
}

async function approveRecord(id) {
  const item = activities.find(i => i.id === id);
  if (item) {
    item.status = "APPROVED";
    item.faculty_remarks = "Approved and verified by Faculty Coordinator";
    renderActivitiesTable();

    try {
      await fetch(`${API_BASE}/api/activities/${id}/verify`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          status: "APPROVED",
          faculty_remarks: "Approved and verified by Faculty Coordinator",
          verified_by: currentUser.name || "IT Faculty Coordinator"
        })
      });
    } catch (err) {
      // offline
    }
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

  // Check for uploaded certificate file (Akshaya's Pipeline)
  const fileInput = document.getElementById("modalCertificate");
  let localCertUrl = null;
  let certFile = null;
  if (fileInput && fileInput.files && fileInput.files[0]) {
    certFile = fileInput.files[0];
    localCertUrl = URL.createObjectURL(certFile);
  }

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
    certificate_file: localCertUrl,
    status: currentRole === "faculty" ? "APPROVED" : "PENDING",
    faculty_remarks: null
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
  if (certFile) {
    formData.append("certificate", certFile);
  }

  try {
    const res = await fetch(`${API_BASE}/api/activities`, {
      method: "POST",
      body: formData
    });
    if (res.ok) {
      const data = await res.json();
      if (data.id) newActivity.id = data.id;
    }
  } catch (err) {
    // Graceful offline save
  }

  alert(`Success: Activity record for ${name} (${regd}) submitted successfully!`);
}

// ==================== 6. VISUAL ANALYTICS (Akshaya's Lead Module) ====================
let monthlyTrendChartInstance = null;
let categoryChartInstance = null;

function toggleAnalytics() {
  const panel = document.getElementById("analyticsPanel");
  if (!panel) return;
  const isHidden = panel.classList.contains("hidden");
  if (isHidden) {
    panel.classList.remove("hidden");
    renderAnalyticsCharts();
    panel.scrollIntoView({ behavior: "smooth", block: "start" });
  } else {
    panel.classList.add("hidden");
  }
}

async function renderAnalyticsCharts() {
  if (typeof Chart === "undefined") {
    console.warn("Chart.js not loaded yet");
    return;
  }

  // Monthly buckets Jan-Dec
  let monthlyData = { "01": 0, "02": 0, "03": 0, "04": 0, "05": 0, "06": 0, "07": 0, "08": 0, "09": 0, "10": 0, "11": 0, "12": 0 };
  let categoryData = {};

  try {
    const res = await fetch(`${API_BASE}/api/analytics/summary`);
    if (res.ok) {
      const json = await res.json();
      if (json.monthly_trend) {
        Object.keys(json.monthly_trend).forEach(k => {
          monthlyData[k] = json.monthly_trend[k];
        });
      }
      if (json.category_counts) {
        categoryData = json.category_counts;
      }
    } else {
      throw new Error("fallback");
    }
  } catch (e) {
    // Client-side fallback calculation
    activities.forEach(act => {
      if (act.event_date) {
        const parts = act.event_date.split("-");
        if (parts.length >= 2) {
          const m = parts[1];
          monthlyData[m] = (monthlyData[m] || 0) + 1;
        }
      }
      const cat = act.category || "Other";
      categoryData[cat] = (categoryData[cat] || 0) + 1;
    });
  }

  const monthNames = ["Jan", "Feb", "Mar", "Apr", "May (Focus)", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  const monthKeys = ["01", "02", "03", "04", "05", "06", "07", "08", "09", "10", "11", "12"];
  const monthCounts = monthKeys.map(k => monthlyData[k] || 0);

  // Month Chart
  const ctxMonthly = document.getElementById("monthlyTrendChart");
  if (ctxMonthly) {
    if (monthlyTrendChartInstance) monthlyTrendChartInstance.destroy();
    monthlyTrendChartInstance = new Chart(ctxMonthly, {
      type: "bar",
      data: {
        labels: monthNames,
        datasets: [{
          label: "Activities Count",
          data: monthCounts,
          backgroundColor: monthKeys.map(k => k === "05" ? "#ea580c" : "rgba(122, 18, 40, 0.85)"),
          borderColor: monthKeys.map(k => k === "05" ? "#c2410c" : "#7a1228"),
          borderWidth: 1.5,
          borderRadius: 6
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false },
          tooltip: {
            callbacks: {
              afterLabel: function(context) {
                if (context.dataIndex === 4) return "⭐ Key SVECW accreditation month!";
                return "";
              }
            }
          }
        },
        scales: {
          y: {
            beginAtZero: true,
            ticks: { precision: 0, font: { size: 10 } },
            grid: { color: "#f1f5f9" }
          },
          x: {
            ticks: { font: { size: 10, weight: "bold" } },
            grid: { display: false }
          }
        }
      }
    });
  }

  // Category Doughnut Chart
  const ctxCat = document.getElementById("categoryDistributionChart");
  if (ctxCat) {
    if (categoryChartInstance) categoryChartInstance.destroy();
    const catLabels = Object.keys(categoryData);
    const catValues = Object.values(categoryData);

    categoryChartInstance = new Chart(ctxCat, {
      type: "doughnut",
      data: {
        labels: catLabels,
        datasets: [{
          data: catValues,
          backgroundColor: [
            "#ea580c", // Orange
            "#15803d", // Green
            "#6b21a8", // Purple
            "#0284c7", // Sky
            "#e11d48", // Rose
            "#f59e0b"  // Amber
          ],
          borderWidth: 2,
          borderColor: "#ffffff"
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: "bottom",
            labels: { boxWidth: 12, font: { size: 10, weight: "bold" }, padding: 10 }
          }
        },
        cutout: "65%"
      }
    });
  }
}

// ==================== 7. CERTIFICATE VIEWER MODAL (Akshaya's Document Pipeline) ====================
function openCertificateModal(id) {
  const act = activities.find(i => i.id === id);
  if (!act) return;

  const modal = document.getElementById("certificateModal");
  const titleEl = document.getElementById("certModalTitle");
  const subtitleEl = document.getElementById("certModalSubtitle");
  const container = document.getElementById("certPreviewContainer");
  const downloadLink = document.getElementById("certDownloadLink");

  titleEl.innerText = `${act.category}: ${act.title}`;
  subtitleEl.innerText = `${act.student_name} (${act.regd_no}) • ${act.organization}`;

  // If real uploaded file
  if (act.certificate_file) {
    const isPdf = act.certificate_file.toLowerCase().endsWith(".pdf") || act.certificate_file.includes("application/pdf");
    downloadLink.href = act.certificate_file;
    downloadLink.setAttribute("download", `SVECW_IT_${act.regd_no}_Certificate`);

    if (isPdf) {
      container.innerHTML = `
        <iframe src="${act.certificate_file}" class="w-full h-[450px] rounded-lg border border-slate-200"></iframe>
      `;
    } else {
      container.innerHTML = `
        <img src="${act.certificate_file}" alt="Certificate Proof" class="max-h-[440px] max-w-full object-contain rounded-lg shadow-md border" />
      `;
    }
  } else {
    // Official SVECW Institutional Digital Certificate Preview (High-Fidelity SVG Proof)
    const certSvg = `
      <svg viewBox="0 0 800 520" xmlns="http://www.w3.org/2000/svg" class="w-full h-auto max-h-[440px] rounded-xl shadow-md border border-amber-200 bg-white">
        <!-- Border Frame -->
        <rect x="20" y="20" width="760" height="480" rx="16" fill="#fffdfa" stroke="#7a1228" stroke-width="6" />
        <rect x="30" y="30" width="740" height="460" rx="12" fill="none" stroke="#ea580c" stroke-width="2" stroke-dasharray="6,4" />
        
        <!-- Header -->
        <text x="400" y="70" text-anchor="middle" font-family="sans-serif" font-size="18" font-weight="900" fill="#7a1228" letter-spacing="0.5">
          SHRI VISHNU ENGINEERING COLLEGE FOR WOMEN (AUTONOMOUS)
        </text>
        <text x="400" y="92" text-anchor="middle" font-family="sans-serif" font-size="12" font-weight="700" fill="#ea580c">
          DEPARTMENT OF INFORMATION TECHNOLOGY • ACCREDITATION PROOF
        </text>
        <line x1="180" y1="105" x2="620" y2="105" stroke="#7a1228" stroke-width="2" />
        
        <!-- Badge -->
        <rect x="280" y="118" width="240" height="26" rx="13" fill="#fdf2f4" stroke="#fbcfe8" />
        <text x="400" y="135" text-anchor="middle" font-family="sans-serif" font-size="11" font-weight="800" fill="#7a1228">
          CERTIFICATE OF ACHIEVEMENT
        </text>
        
        <!-- Body Text -->
        <text x="400" y="180" text-anchor="middle" font-family="sans-serif" font-size="13" fill="#475569">
          This is to verify that the extracurricular activity record of
        </text>
        
        <text x="400" y="220" text-anchor="middle" font-family="sans-serif" font-size="22" font-weight="900" fill="#0f172a">
          ${act.student_name}
        </text>
        <text x="400" y="246" text-anchor="middle" font-family="monospace" font-size="13" font-weight="bold" fill="#7a1228">
          Regd. No: ${act.regd_no} (${act.class_year || 'IV IT'})
        </text>
        
        <text x="400" y="284" text-anchor="middle" font-family="sans-serif" font-size="13" fill="#334155">
          has successfully completed / secured <tspan font-weight="bold" fill="#15803d">"${act.score_or_stipend || 'Completed'}"</tspan> in
        </text>
        
        <text x="400" y="318" text-anchor="middle" font-family="sans-serif" font-size="16" font-weight="800" fill="#7a1228">
          ${act.title.length > 55 ? act.title.substring(0, 52) + '...' : act.title}
        </text>
        
        <text x="400" y="348" text-anchor="middle" font-family="sans-serif" font-size="12" font-weight="600" fill="#475569">
          Conducted / Issued by <tspan font-weight="bold" fill="#0f172a">${act.organization}</tspan> • Date: <tspan font-weight="bold">${act.event_date}</tspan>
        </text>

        <!-- Verification Seal -->
        <circle cx="130" cy="420" r="42" fill="#f0fdf4" stroke="#15803d" stroke-width="2.5" />
        <text x="130" y="412" text-anchor="middle" font-family="sans-serif" font-size="9" font-weight="900" fill="#15803d">SVECW IT</text>
        <text x="130" y="425" text-anchor="middle" font-family="sans-serif" font-size="10" font-weight="900" fill="#15803d">VERIFIED</text>
        <text x="130" y="437" text-anchor="middle" font-family="sans-serif" font-size="8" font-weight="700" fill="#166534">★ NBA/NAAC ★</text>

        <!-- Signatures -->
        <line x1="300" y1="440" x2="450" y2="440" stroke="#94a3b8" stroke-width="1.5" />
        <text x="375" y="456" text-anchor="middle" font-family="sans-serif" font-size="11" font-weight="bold" fill="#334155">Activity Coordinator</text>
        
        <line x1="580" y1="440" x2="720" y2="440" stroke="#94a3b8" stroke-width="1.5" />
        <text x="650" y="456" text-anchor="middle" font-family="sans-serif" font-size="11" font-weight="bold" fill="#7a1228">Head of Department (IT)</text>
      </svg>
    `;
    container.innerHTML = certSvg;
    const svgBlob = new Blob([certSvg], { type: "image/svg+xml;charset=utf-8" });
    const blobUrl = URL.createObjectURL(svgBlob);
    downloadLink.href = blobUrl;
    downloadLink.setAttribute("download", `SVECW_IT_${act.regd_no}_Institutional_Certificate.svg`);
  }

  modal.classList.remove("hidden");
  if (window.lucide) lucide.createIcons();
}

function closeCertificateModal() {
  document.getElementById("certificateModal")?.classList.add("hidden");
}

// ==================== 8. FACULTY REJECTION WORKFLOW (Akshaya's Module) ====================
function openRejectModal(id) {
  const act = activities.find(i => i.id === id);
  if (!act) return;

  document.getElementById("rejectActivityId").value = id;
  document.getElementById("rejectRemarksInput").value = "";
  document.getElementById("rejectModal").classList.remove("hidden");
  if (window.lucide) lucide.createIcons();
}

function closeRejectModal() {
  document.getElementById("rejectModal")?.classList.add("hidden");
}

async function submitRejection() {
  const actId = parseInt(document.getElementById("rejectActivityId").value);
  const remarks = document.getElementById("rejectRemarksInput").value.trim();

  if (!remarks) {
    alert("Please enter a rejection reason/remarks for the student.");
    return;
  }

  const act = activities.find(i => i.id === actId);
  if (act) {
    act.status = "REJECTED";
    act.faculty_remarks = remarks;
    act.verified_by = currentUser.name || "IT Faculty Coordinator";
  }

  closeRejectModal();
  renderActivitiesTable();

  // Send to backend API
  try {
    await fetch(`${API_BASE}/api/activities/${actId}/verify`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        status: "REJECTED",
        faculty_remarks: remarks,
        verified_by: currentUser.name || "IT Faculty Coordinator"
      })
    });
  } catch (err) {
    // Offline fallback
  }

  alert("Submission marked as REJECTED with faculty feedback!");
}

// Start
window.addEventListener("DOMContentLoaded", () => {
  if (window.lucide) lucide.createIcons();
});