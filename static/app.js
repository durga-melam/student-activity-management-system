// =========================================================================
// SHRI VISHNU ENGINEERING COLLEGE FOR WOMEN :: BHIMAVARAM
// DEPARTMENT OF INFORMATION TECHNOLOGY - ACCREDITATION PORTAL SCRIPT
// =========================================================================

let allActivities = [];
let filteredActivities = [];

const MONTH_NAMES = {
    "01": "January", "02": "February", "03": "March", "04": "April",
    "05": "May", "06": "June", "07": "July", "08": "August",
    "09": "September", "10": "October", "11": "November", "12": "December"
};

document.addEventListener("DOMContentLoaded", () => {
    initApp();
});

function initApp() {
    setupLoginHandler();

    if (document.getElementById("activityTableBody")) {
        loadUserSession();
        setupFilters();
        setupFormSubmit();
        loadActivities();
    }
}

// -------------------------------------------------------------
// 1. LOGIN & SESSION HANDLER
// -------------------------------------------------------------
function setupLoginHandler() {
    const loginForm = document.getElementById("loginForm");
    if (loginForm) {
        loginForm.addEventListener("submit", (e) => {
            e.preventDefault();
            const uname = (document.getElementById("username") || {}).value.trim() || "22B01A1231";
            const isRajesh = (uname.toLowerCase() === "rajesh");
            localStorage.setItem("svecw_user", JSON.stringify({ 
                name: isRajesh ? "Rajesh Sir (Faculty Incharge)" : uname.toUpperCase(), 
                regd_no: uname.toUpperCase(),
                role: isRajesh ? "FACULTY" : "STUDENT"
            }));
            window.location.href = "/dashboard";
        });
    }
}

function loadUserSession() {
    const user = JSON.parse(localStorage.getItem("svecw_user") || "null");
    const label = document.getElementById("userNameLabel");
    if (label && user) {
        label.innerText = `Hi, ${user.name || user.regd_no || '22B01A1231'}`;
    }
}

function handleLogout() {
    localStorage.removeItem("svecw_user");
    window.location.href = "/";
}

// -------------------------------------------------------------
// 2. LOAD ACTIVITIES FROM BACKEND
// -------------------------------------------------------------
async function loadActivities() {
    try {
        const res = await fetch("/api/activities");
        const data = await res.json();
        allActivities = data.activities || [];
        applyFilters();
    } catch (err) {
        console.error("Failed to load activities:", err);
    }
}

// -------------------------------------------------------------
// 3. RENDER TABLE (9 Columns - Rajesh gets Buttons, Students get Status)
// -------------------------------------------------------------
function renderTable(list) {
    const tbody = document.getElementById("activityTableBody");
    if (!tbody) return;

    const userSession = JSON.parse(localStorage.getItem("svecw_user") || "{}");
    // 👉 ONLY RAJESH ANNA GETS APPROVE/REJECT BUTTONS
    const isRajesh = (userSession.role === "FACULTY" && (userSession.regd_no || "").toLowerCase() === "rajesh");

    if (!list || list.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="9" style="text-align:center; padding: 28px; color: #94a3b8; font-size: 14px;">
                    🔍 No student activity records found for this date/filter.
                </td>
            </tr>
        `;
        return;
    }

    tbody.innerHTML = list.map((item, index) => {
        const catBadge = getCategoryBadge(item.category);
        return `
            <tr>
                <!-- 1. # -->
                <td style="font-weight: 700; text-align: center; color: #64748b;">${index + 1}</td>
                
                <!-- 2. STUDENT DETAILS -->
                <td>
                    <div style="font-weight: 800; color: #0f172a; font-size: 13px;">${item.student_name}</div>
                    <div style="font-size: 11px; color: #d97706; font-weight: 700;">${item.regd_no} <span style="color:#64748b; font-weight:500;">(${item.class_year || 'IT'} • Sec ${item.section || 'A'})</span></div>
                </td>
                
                <!-- 3. CATEGORY -->
                <td>
                    <span class="${catBadge}">${item.category}</span>
                </td>
                
                <!-- 4. TITLE / EVENT -->
                <td>
                    <div style="font-weight: 600; color: #334155; line-height: 1.4; max-width: 320px;">${item.title}</div>
                    ${item.guide_or_mentor ? `<div style="font-size: 11px; color: #64748b; margin-top: 2px;">Guide: ${item.guide_or_mentor}</div>` : ''}
                </td>
                
                <!-- 5. ORGANIZATION -->
                <td>
                    <div style="font-weight: 700; color: #0284c7; font-size: 12px;"><i class="fa-regular fa-building"></i> ${item.organization}</div>
                    ${item.place ? `<div style="font-size: 11px; color: #64748b; margin-top: 2px;">• ${item.place}</div>` : ''}
                </td>
                
                <!-- 6. DATE -->
                <td style="white-space: nowrap; font-size: 12px; color: #475569; font-weight: 600;">
                    <i class="fa-regular fa-calendar" style="color:#9333ea;"></i> ${item.event_date}
                    ${item.to_date ? `<div style="font-size: 10px; color:#94a3b8;">to ${item.to_date}</div>` : ''}
                </td>
                
                <!-- 7. ACHIEVEMENT -->
                <td>
                    <div style="font-weight: 700; color: #059669; font-size: 12px;">
                        ${item.score_or_stipend || item.duration || 'Completed'}
                    </div>
                </td>
                
                <!-- 8. CERTIFICATE -->
                <td style="text-align: center;">
                    ${item.certificate_file ? 
                        `<a href="${item.certificate_file}" target="_blank" class="btn-view-cert"><i class="fa-solid fa-file-pdf"></i> View Cert</a>`
                        : `<a href="#" onclick="alert('Viewing verified certificate proof for ${item.regd_no}')" class="btn-view-cert"><i class="fa-regular fa-file-lines"></i> View Cert</a>`
                    }
                </td>

                <!-- 9. VERIFICATION (Rajesh gets Buttons, Students get Status Badge) -->
                <td style="text-align: center; white-space: nowrap;">
                    ${isRajesh ? `
                        <div style="display: flex; gap: 5px; justify-content: center; align-items: center;">
                            <button onclick="handleFacultyDecision(${item.id}, 'APPROVED')" title="Approve Record" style="background: #15803d; color: white; border: none; padding: 4px 8px; border-radius: 4px; font-size: 11px; font-weight: 700; cursor: pointer; display: inline-flex; align-items: center; gap: 3px;">
                                <i class="fa-solid fa-check"></i> Approve
                            </button>
                            <button onclick="handleFacultyDecision(${item.id}, 'REJECTED')" title="Reject Record" style="background: #dc2626; color: white; border: none; padding: 4px 8px; border-radius: 4px; font-size: 11px; font-weight: 700; cursor: pointer; display: inline-flex; align-items: center; gap: 3px;">
                                <i class="fa-solid fa-xmark"></i> Reject
                            </button>
                        </div>
                    ` : `
                        <span style="display: inline-block; font-size: 11px; font-weight: 700; padding: 3px 8px; border-radius: 12px; ${
                            item.status === 'APPROVED' ? 'background: #dcfce7; color: #15803d; border: 1px solid #bbf7d0;' :
                            (item.status === 'REJECTED' ? 'background: #fee2e2; color: #dc2626; border: 1px solid #fecaca;' :
                            'background: #fef3c7; color: #d97706; border: 1px solid #fde68a;')
                        }">
                            ${item.status === 'APPROVED' ? '✓ Approved' : 
                             (item.status === 'REJECTED' ? '✕ Rejected' : 
                             '⏳ Pending')}
                        </span>
                    `}
                    ${item.faculty_remarks && item.status === 'REJECTED' ? `<div style="font-size: 10px; color: #dc2626; margin-top: 3px; font-weight: 600;">Remarks: ${item.faculty_remarks}</div>` : ''}
                </td>
            </tr>
        `;
    }).join("");
}

function getCategoryBadge(cat) {
    if (!cat) return "badge-cat-hack";
    const c = cat.toLowerCase();
    if (c.includes("hackathon")) return "badge-cat-hack";
    if (c.includes("internship")) return "badge-cat-intern";
    if (c.includes("paper") || c.includes("journal")) return "badge-cat-paper";
    return "badge-cat-cert";
}

// -------------------------------------------------------------
// 4. UPDATE 4 METRIC CARDS
// -------------------------------------------------------------
function updateCards(list) {
    const totalEl = document.getElementById("cardTotalActivities");
    const studentsEl = document.getElementById("cardDistinctStudents");
    const hackEl = document.getElementById("cardHackathons");
    const nptelEl = document.getElementById("cardNptel");

    if (totalEl) totalEl.innerText = list.length;
    
    if (studentsEl) {
        const unique = new Set(list.map(i => i.regd_no)).size;
        studentsEl.innerText = unique;
    }

    if (hackEl) {
        const count = list.filter(i => i.category && i.category.toLowerCase().includes("hackathon")).length;
        hackEl.innerText = count;
    }

    if (nptelEl) {
        const count = list.filter(i => i.category && (i.category.toLowerCase().includes("nptel") || i.category.toLowerCase().includes("cert"))).length;
        nptelEl.innerText = count;
    }
}

// -------------------------------------------------------------
// 5. FILTER ENGINE
// -------------------------------------------------------------
function setupFilters() {
    const month = document.getElementById("monthFilter");
    const eventYear = document.getElementById("eventYearFilter");
    const classYr = document.getElementById("classFilter");
    const sec = document.getElementById("sectionFilter");
    const cat = document.getElementById("categoryFilter");
    const status = document.getElementById("statusFilter");
    const search = document.getElementById("searchInput");
    const fromDate = document.getElementById("fromDateInput");
    const toDate = document.getElementById("toDateInput");

    if (month) {
        month.addEventListener("change", (e) => {
            const customBox = document.getElementById("customDateRangeBox");
            if (e.target.value === "CUSTOM") {
                if (customBox) customBox.style.display = "flex";
            } else {
                if (customBox) customBox.style.display = "none";
                if (fromDate) fromDate.value = "";
                if (toDate) toDate.value = "";
                applyFilters();
            }
        });
    }

    [eventYear, classYr, sec, cat, status].forEach(el => {
        if (el) el.addEventListener("change", applyFilters);
    });

    if (search) search.addEventListener("input", applyFilters);
    if (fromDate) fromDate.addEventListener("change", applyFilters);
    if (toDate) toDate.addEventListener("change", applyFilters);
}

function resetCustomDate() {
    const fromDate = document.getElementById("fromDateInput");
    const toDate = document.getElementById("toDateInput");
    const month = document.getElementById("monthFilter");
    if (fromDate) fromDate.value = "";
    if (toDate) toDate.value = "";
    if (month) month.value = "";
    document.getElementById("customDateRangeBox").style.display = "none";
    applyFilters();
}

function applyFilters() {
    const monthVal = (document.getElementById("monthFilter") || {}).value || "";
    const eventYearVal = (document.getElementById("eventYearFilter") || {}).value || "";
    const classVal = (document.getElementById("classFilter") || {}).value || "";
    const secVal = (document.getElementById("sectionFilter") || {}).value || "";
    const catVal = (document.getElementById("categoryFilter") || {}).value || "";
    const statusVal = (document.getElementById("statusFilter") || {}).value || "";
    const searchVal = ((document.getElementById("searchInput") || {}).value || "").toLowerCase().trim();
    const fromDateVal = (document.getElementById("fromDateInput") || {}).value || "";
    const toDateVal = (document.getElementById("toDateInput") || {}).value || "";

    filteredActivities = allActivities.filter(item => {
        // Custom Date Range
        if (monthVal === "CUSTOM") {
            if (fromDateVal && item.event_date < fromDateVal) return false;
            if (toDateVal && item.event_date > toDateVal) return false;
        } else if (monthVal) {
            const itemMonth = item.event_date ? item.event_date.split("-")[1] : "";
            if (itemMonth !== monthVal) return false;
        }

        // Event Year Check
        if (eventYearVal) {
            const itemYear = item.event_date ? item.event_date.split("-")[0] : "";
            if (itemYear !== eventYearVal) return false;
        }

        // Class Year Filter
        if (classVal && item.class_year !== classVal) return false;

        // Section Filter
        if (secVal && item.section !== secVal) return false;

        // Category Filter
        if (catVal && (!item.category || !item.category.toLowerCase().includes(catVal.toLowerCase()))) return false;

        // Status Filter
        if (statusVal && item.status !== statusVal) return false;

        // Search Query
        if (searchVal) {
            const str = `${item.regd_no} ${item.student_name} ${item.title} ${item.organization}`.toLowerCase();
            if (!str.includes(searchVal)) return false;
        }

        return true;
    });

    renderTable(filteredActivities);
    updateCards(filteredActivities);

    // Update Subtitle
    const subTitle = document.getElementById("cardFilterSubtitle");
    if (subTitle) {
        if (monthVal === "CUSTOM" && (fromDateVal || toDateVal)) {
            subTitle.innerText = `Filter: ${fromDateVal || 'Start'} to ${toDateVal || 'End'}`;
        } else if (monthVal) {
            const mName = MONTH_NAMES[monthVal] || monthVal;
            subTitle.innerText = `Filter: ${mName} ${eventYearVal || ''}`;
        } else if (eventYearVal) {
            subTitle.innerText = `Filter: Year ${eventYearVal}`;
        } else {
            subTitle.innerText = "All Verified Records";
        }
    }
}

// -------------------------------------------------------------
// 6. EXCEL (.XLSX) EXPORT
// -------------------------------------------------------------
function exportToExcel() {
    if (!filteredActivities || filteredActivities.length === 0) {
        alert("No data to export!");
        return;
    }

    const excelRows = filteredActivities.map((item, idx) => ({
        "S.No": idx + 1,
        "Regd. No": item.regd_no,
        "Student Name": item.student_name,
        "Class / Year": item.class_year || "IT",
        "Section": item.section || "A",
        "Category": item.category,
        "Event Date": item.event_date + (item.to_date ? ` to ${item.to_date}` : ''),
        "Title of Event / Paper / Internship": item.title,
        "Organization / College / Company": item.organization + (item.place ? ` (${item.place})` : ''),
        "Achievement / Stipend / Grade": item.score_or_stipend || item.duration || 'Completed',
        "Status": item.status || 'APPROVED'
    }));

    if (window.XLSX) {
        const ws = XLSX.utils.json_to_sheet(excelRows);

        ws['!cols'] = [
            { wch: 6 },   // S.No
            { wch: 15 },  // Regd. No
            { wch: 32 },  // Student Name
            { wch: 14 },  // Class / Year
            { wch: 10 },  // Section
            { wch: 22 },  // Category
            { wch: 22 },  // Event Date
            { wch: 70 },  // Title of Event
            { wch: 40 },  // Organization
            { wch: 25 },  // Achievement
            { wch: 14 }   // Status
        ];

        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, "SVECW IT Activities");

        const fileName = `SVECW_IT_Student_Activities_${new Date().toISOString().slice(0,10)}.xlsx`;
        XLSX.writeFile(wb, fileName);
    } else {
        let csv = "S.No,Regd No,Student Name,Class,Section,Category,Date,Title / Event,Organization,Achievement,Status\n";
        filteredActivities.forEach((item, idx) => {
            const t = `"${(item.title || '').replace(/"/g, '""')}"`;
            const o = `"${(item.organization || '').replace(/"/g, '""')}"`;
            const a = `"${(item.score_or_stipend || item.duration || 'Completed').replace(/"/g, '""')}"`;
            csv += `${idx + 1},${item.regd_no},"${item.student_name}",${item.class_year || 'IT'},${item.section || 'A'},"${item.category}",${item.event_date},${t},${o},${a},${item.status || 'APPROVED'}\n`;
        });
        const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
        const a = document.createElement("a");
        a.href = URL.createObjectURL(blob);
        a.download = `SVECW_IT_Activities_${new Date().toISOString().slice(0,10)}.csv`;
        a.click();
    }
}

// -------------------------------------------------------------
// 7. FORM SUBMIT HANDLER
// -------------------------------------------------------------
function setupFormSubmit() {
    const form = document.getElementById("activityForm");
    if (form) {
        form.addEventListener("submit", async (e) => {
            e.preventDefault();
            const fd = new FormData(form);
            try {
                const res = await fetch("/api/activities", { method: "POST", body: fd });
                const json = await res.json();
                if (res.ok && json.success) {
                    alert("Record added successfully!");
                    form.reset();
                    closeAddModal();
                    loadActivities();
                } else {
                    alert(json.detail || "Submission failed!");
                }
            } catch (err) {
                alert("Server error!");
            }
        });
    }
}

// -------------------------------------------------------------
// 8. FACULTY DECISION HANDLER (Rajesh Anna Decision Pipeline)
// -------------------------------------------------------------
async function handleFacultyDecision(activityId, decisionStatus) {
    let remarks = "";
    if (decisionStatus === "REJECTED") {
        remarks = prompt("Enter Rejection Remarks / Reason for Student (e.g., Incomplete Certificate, Roll No mismatch):");
        if (remarks === null) return; // User cancelled
        if (!remarks.trim()) remarks = "Certificate proof or details invalid. Please re-verify.";
    }

    try {
        const res = await fetch(`/api/activities/${activityId}/verify`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                status: decisionStatus,
                faculty_remarks: remarks || "Verified and approved by Rajesh Sir",
                verified_by: "Rajesh Sir (Faculty Incharge)"
            })
        });

        const data = await res.json();
        if (res.ok && data.success) {
            alert(`Record #${activityId} successfully marked as ${decisionStatus}!`);
            loadActivities();
        } else {
            alert(data.detail || "Failed to update status!");
        }
    } catch (err) {
        console.error("Verification error:", err);
        alert("Server error while submitting verification decision!");
    }
}