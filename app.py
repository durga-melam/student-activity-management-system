import os
import shutil
from datetime import datetime
from typing import Optional
from fastapi import FastAPI, UploadFile, File, Form, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse, JSONResponse
from pydantic import BaseModel
from database import get_db_connection, init_db

# FastAPI App Initialization
app = FastAPI(
    title="SVECW IT Department Activity & Accreditation Portal",
    description="Backend API for Student Extracurricular, Hackathon, Internship & Certification Tracking",
    version="1.0.0"
)

# CORS Configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Base Directories
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
UPLOAD_DIR = os.path.join(BASE_DIR, "uploads", "certificates")
STATIC_DIR = os.path.join(BASE_DIR, "static")

os.makedirs(UPLOAD_DIR, exist_ok=True)
os.makedirs(STATIC_DIR, exist_ok=True)

# Mount Folders
app.mount("/uploads", StaticFiles(directory=os.path.join(BASE_DIR, "uploads")), name="uploads")
if os.path.exists(STATIC_DIR):
    app.mount("/static", StaticFiles(directory=STATIC_DIR), name="static")


@app.on_event("startup")
def startup_event():
    init_db()


# -------------------------------------------------------------
# 1. PAGE NAVIGATION & DIRECT STATIC ROUTES (Fixes 404s & Logo)
# -------------------------------------------------------------
@app.get("/")
def get_login_page():
    index_path = os.path.join(STATIC_DIR, "index.html")
    if os.path.exists(index_path):
        return FileResponse(index_path)
    return {"message": "SVECW IT Portal Backend Running! Visit /dashboard or /docs."}

@app.get("/dashboard")
@app.get("/dashboard.html")
def get_dashboard_page():
    dash_path = os.path.join(STATIC_DIR, "dashboard.html")
    if os.path.exists(dash_path):
        return FileResponse(dash_path)
    return FileResponse(os.path.join(STATIC_DIR, "index.html"))

@app.get("/login")
def get_login_redirect():
    return FileResponse(os.path.join(STATIC_DIR, "index.html"))

# Direct JS / CSS Serving
@app.get("/app.js")
def get_app_js():
    js_path = os.path.join(STATIC_DIR, "app.js")
    if os.path.exists(js_path):
        return FileResponse(js_path)
    raise HTTPException(status_code=404, detail="app.js not found in static folder")

@app.get("/styles.css")
def get_styles_css():
    css_path = os.path.join(STATIC_DIR, "styles.css")
    if os.path.exists(css_path):
        return FileResponse(css_path)
    return ""

# Official SVECW Logo Serving
@app.get("/svecw_logo.png")
@app.get("/static/svecw_logo.png")
def get_logo():
    path1 = os.path.join(STATIC_DIR, "svecw_logo.png")
    path2 = os.path.join(BASE_DIR, "svecw_logo.png")
    if os.path.exists(path1):
        return FileResponse(path1)
    if os.path.exists(path2):
        return FileResponse(path2)
    raise HTTPException(status_code=404, detail="svecw_logo.png not found")


# -------------------------------------------------------------
# 2. AUTHENTICATION / LOGIN API
# -------------------------------------------------------------
class LoginRequest(BaseModel):
    username: str
    password: Optional[str] = None
    role: Optional[str] = None

@app.post("/api/auth/login")
@app.post("/api/login")
def login(req: LoginRequest):
    uname = req.username.strip()
    pwd = (req.password or "").strip()
    
    # Faculty Login
    if uname.lower() in ["admin", "faculty", "hod_it", "svecw_it", "dr_ravi_kumar", "sarru"]:
        if pwd in ["password123", "svecw@123", "admin123", "it@2026", "123456", ""]:
            return {
                "success": True,
                "role": "FACULTY",
                "name": "Faculty Coordinator (IT) (SARRU)",
                "username": uname,
                "message": "Faculty login successful!"
            }
        else:
            raise HTTPException(status_code=401, detail="Invalid Faculty Password!")
            
    # Student Login (Roll Number)
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM activities WHERE regd_no = ? LIMIT 1", (uname.upper(),))
    student = cursor.fetchone()
    conn.close()
    
    student_name = student["student_name"] if student else "SVECW Student"
    class_year = student["class_year"] if student else "III IT"
    
    return {
        "success": True,
        "role": "STUDENT",
        "name": student_name,
        "regd_no": uname.upper(),
        "class_year": class_year,
        "message": "Student login successful!"
    }


# -------------------------------------------------------------
# 3. GET ACTIVITIES (With Month Filter & Query Support)
# -------------------------------------------------------------
@app.get("/api/activities")
def get_activities(
    month: Optional[str] = Query(None, description="Month (e.g. '05', '2025-10', '2026-05')"),
    category: Optional[str] = Query(None, description="Category filter"),
    class_year: Optional[str] = Query(None, description="Class (II IT, III IT, IV IT)"),
    section: Optional[str] = Query(None, description="Section (A, B)"),
    status: Optional[str] = Query(None, description="Status (APPROVED, PENDING, REJECTED)"),
    search: Optional[str] = Query(None, description="Search term")
):
    conn = get_db_connection()
    cursor = conn.cursor()
    
    query = "SELECT * FROM activities WHERE 1=1"
    params = []
    
    # Month Filter (e.g. '2025-10' or '05')
    if month and month != "ALL":
        if len(month) == 7:  # '2025-10' or '2026-05'
            query += " AND strftime('%Y-%m', event_date) = ?"
            params.append(month)
        elif len(month) == 2:  # '05'
            query += " AND strftime('%m', event_date) = ?"
            params.append(month)
        else:
            query += " AND event_date LIKE ?"
            params.append(f"%{month}%")
            
    # Category Filter
    if category and category != "ALL":
        query += " AND category LIKE ?"
        params.append(f"%{category}%")
        
    # Class Filter
    if class_year and class_year != "ALL":
        query += " AND class_year = ?"
        params.append(class_year)
        
    # Section Filter
    if section and section != "ALL":
        query += " AND section = ?"
        params.append(section)
        
    # Status Filter
    if status and status != "ALL":
        query += " AND status = ?"
        params.append(status)
        
    # Search Query
    if search:
        query += " AND (regd_no LIKE ? OR student_name LIKE ? OR title LIKE ? OR organization LIKE ?)"
        pattern = f"%{search}%"
        params.extend([pattern, pattern, pattern, pattern])
        
    query += " ORDER BY event_date DESC"
    
    cursor.execute(query, params)
    rows = cursor.fetchall()
    activities = [dict(row) for row in rows]
    conn.close()
    
    return {
        "count": len(activities),
        "activities": activities
    }


# -------------------------------------------------------------
# 4. POST NEW ACTIVITY (With Certificate File Upload)
# -------------------------------------------------------------
@app.post("/api/activities")
async def create_activity(
    regd_no: str = Form(...),
    student_name: str = Form(...),
    class_year: str = Form(...),
    section: str = Form("A"),
    category: str = Form(...),
    title: str = Form(...),
    organization: str = Form(...),
    place: str = Form("Bhimavaram"),
    event_date: str = Form(...),
    to_date: Optional[str] = Form(None),
    duration: Optional[str] = Form(None),
    score_or_stipend: Optional[str] = Form(None),
    guide_or_mentor: Optional[str] = Form(None),
    paper_type: Optional[str] = Form(None),
    academic_year: str = Form("2025-26"),
    certificate: Optional[UploadFile] = File(None)
):
    certificate_path = None
    
    if certificate and certificate.filename:
        ext = os.path.splitext(certificate.filename)[1].lower()
        if ext not in [".pdf", ".jpg", ".jpeg", ".png"]:
            raise HTTPException(status_code=400, detail="Only PDF, JPG, and PNG files are allowed!")
            
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        safe_filename = f"SVECW_IT_{regd_no.upper()}_{timestamp}{ext}"
        destination = os.path.join(UPLOAD_DIR, safe_filename)
        
        with open(destination, "wb") as buffer:
            shutil.copyfileobj(certificate.file, buffer)
            
        certificate_path = f"/uploads/certificates/{safe_filename}"
        
    conn = get_db_connection()
    cursor = conn.cursor()
    
    cursor.execute('''
        INSERT INTO activities (
            regd_no, student_name, class_year, section, category, title, organization,
            place, event_date, to_date, duration, score_or_stipend, guide_or_mentor,
            paper_type, academic_year, certificate_file, status
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'APPROVED')
    ''', (
        regd_no.strip().upper(), student_name.strip().upper(), class_year, section, category,
        title.strip(), organization.strip(), place, event_date, to_date, duration,
        score_or_stipend, guide_or_mentor, paper_type, academic_year, certificate_path
    ))
    
    new_id = cursor.lastrowid
    conn.commit()
    conn.close()
    
    return {
        "success": True,
        "message": "Activity submitted successfully! Record saved to database.",
        "id": new_id
    }


# -------------------------------------------------------------
# 5. FACULTY VERIFICATION API
# -------------------------------------------------------------
class VerifyRequest(BaseModel):
    status: str
    faculty_remarks: Optional[str] = None
    verified_by: Optional[str] = "IT Faculty Coordinator"

@app.patch("/api/activities/{activity_id}/verify")
def verify_activity(activity_id: int, req: VerifyRequest):
    if req.status not in ["APPROVED", "REJECTED", "PENDING"]:
        raise HTTPException(status_code=400, detail="Status must be APPROVED, REJECTED, or PENDING")
        
    conn = get_db_connection()
    cursor = conn.cursor()
    
    cursor.execute('''
        UPDATE activities 
        SET status = ?, faculty_remarks = ?, verified_by = ?
        WHERE id = ?
    ''', (req.status, req.faculty_remarks, req.verified_by, activity_id))
    
    if cursor.rowcount == 0:
        conn.close()
        raise HTTPException(status_code=404, detail="Activity not found")
        
    conn.commit()
    conn.close()
    return {"success": True, "message": f"Activity marked as {req.status} successfully!"}


# -------------------------------------------------------------
# 6. ANALYTICS SUMMARY API
# -------------------------------------------------------------
@app.get("/api/analytics/summary")
def get_analytics():
    conn = get_db_connection()
    cursor = conn.cursor()
    
    cursor.execute("SELECT COUNT(*) FROM activities")
    total_records = cursor.fetchone()[0]
    
    cursor.execute("SELECT COUNT(DISTINCT regd_no) FROM activities")
    unique_students = cursor.fetchone()[0]
    
    cursor.execute("SELECT COUNT(*) FROM activities WHERE status = 'PENDING'")
    pending_count = cursor.fetchone()[0]
    
    cursor.execute("SELECT COUNT(*) FROM activities WHERE status = 'APPROVED'")
    approved_count = cursor.fetchone()[0]
    
    cursor.execute("SELECT COUNT(*) FROM activities WHERE strftime('%m', event_date) = '05'")
    may_count = cursor.fetchone()[0]
    
    cursor.execute("SELECT category, COUNT(*) as count FROM activities GROUP BY category")
    category_counts = {row["category"]: row["count"] for row in cursor.fetchall()}
    
    conn.close()
    
    return {
        "total_records": total_records,
        "unique_students": unique_students,
        "pending_count": pending_count,
        "approved_count": approved_count,
        "may_count": may_count,
        "category_counts": category_counts
    }

if __name__ == "__main__":
    import uvicorn
    print("🚀 Starting SVECW IT Activity Portal on http://127.0.0.1:8000 ...")
    uvicorn.run("app.py:app", host="127.0.0.1", port=8000, reload=True)