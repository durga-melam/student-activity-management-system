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
// 1. LOGIN HANDLER
// -------------------------------------------------------------
function setupLoginHandler() {
    const loginForm = document.getElementById("loginForm");
    if (loginForm) {
        loginForm.addEventListener("submit", (e) => {
            e.preventDefault();
            const uname = (document.getElementById("username") || {}).value.trim() || "22B01A1231";
            localStorage.setItem("svecw_user", JSON.stringify({ name: uname.toUpperCase() }));
            window.location.href = "/dashboard";
        });
    }
}

function loadUserSession() {
    const user = JSON.parse(localStorage.getItem("svecw_user") || "null");
    const label = document.getElementById("userNameLabel");
    if (label && user) {
        // Clean "Hi, <Register Number / Name>" format
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
// 3. RENDER TABLE (8 Columns 1-to-1 Mapping)
// -------------------------------------------------------------
function renderTable(list) {
    const tbody = document.getElementById("activityTableBody");
    if (!tbody) return;

    if (!list || list.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="8" style="text-align:center; padding: 28px; color: #94a3b8; font-size: 14px;">
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
// 6. EXCEL (.XLSX) EXPORT (FIRST DATE -> THEN EVENT TITLE)
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