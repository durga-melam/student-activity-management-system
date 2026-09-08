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

# App Initialization
app = FastAPI(
    title="SVECW IT Department Activity & Accreditation Portal",
    description="Backend API for Student Extracurricular, Hackathon, Internship & Certification Tracking",
    version="1.0.0"
)

# CORS Setup (Frontend & Backend integration)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Uploads Folder Setup
UPLOAD_DIR = os.path.join(os.path.dirname(__file__), "uploads", "certificates")
os.makedirs(UPLOAD_DIR, exist_ok=True)

# Static & Upload Files Serve Cheyadam
app.mount("/uploads", StaticFiles(directory=os.path.join(os.path.dirname(__file__), "uploads")), name="uploads")
STATIC_DIR = os.path.join(os.path.dirname(__file__), "static")
if os.path.exists(STATIC_DIR):
    app.mount("/static", StaticFiles(directory=STATIC_DIR), name="static")


# Database Startup check
init_db()


# -------------------------------------------------------------
# 1. ROOT ROUTE -> Serve Frontend UI
# -------------------------------------------------------------
@app.get("/")
def read_root():
    index_path = os.path.join(STATIC_DIR, "index.html")
    if os.path.exists(index_path):
        return FileResponse(index_path)
    return {"message": "SVECW IT Activity Portal API is running! Visit /docs for Swagger UI."}

@app.get("/styles.css")
def get_styles():
    css_path = os.path.join(STATIC_DIR, "styles.css")
    if os.path.exists(css_path):
        return FileResponse(css_path, media_type="text/css")
    return JSONResponse(status_code=404, content={"message": "styles.css not found"})

@app.get("/app.js")
def get_app_js():
    js_path = os.path.join(STATIC_DIR, "app.js")
    if os.path.exists(js_path):
        return FileResponse(js_path, media_type="application/javascript")
    return JSONResponse(status_code=404, content={"message": "app.js not found"})



# -------------------------------------------------------------
# 2. GET ACTIVITIES (With Month, Date Range & Multi-Filters)
# Jaya & Akshaya ee API ni use chestharu!
# -------------------------------------------------------------
@app.get("/api/activities")
def get_activities(
    month: Optional[str] = Query(None, description="Month in 'YYYY-MM' or 'MM' format (e.g. 2026-05 or 05)"),
    category: Optional[str] = Query(None, description="Category filter (e.g. Hackathon, Internship, NPTEL)"),
    class_year: Optional[str] = Query(None, description="Class (e.g. II IT, III IT, IV IT)"),
    status: Optional[str] = Query(None, description="Status (APPROVED, PENDING, REJECTED)"),
    search: Optional[str] = Query(None, description="Search by Name, Regd No, or Event Title"),
    from_date: Optional[str] = Query(None, description="Start Date (YYYY-MM-DD)"),
    to_date: Optional[str] = Query(None, description="End Date (YYYY-MM-DD)")
):
    conn = get_db_connection()
    cursor = conn.cursor()
    
    query = "SELECT * FROM activities WHERE 1=1"
    params = []
    
    # Month Filter (e.g. '2026-05' or '05')
    if month:
        if len(month) == 7:  # '2026-05'
            query += " AND strftime('%Y-%m', event_date) = ?"
            params.append(month)
        elif len(month) == 2:  # '05' (May)
            query += " AND strftime('%m', event_date) = ?"
            params.append(month)
            
    # Date Range Filter
    if from_date:
        query += " AND event_date >= ?"
        params.append(from_date)
    if to_date:
        query += " AND event_date <= ?"
        params.append(to_date)
        
    # Category Filter
    if category and category != "ALL":
        query += " AND category LIKE ?"
        params.append(f"%{category}%")
        
    # Class Filter (II IT, III IT, IV IT)
    if class_year and class_year != "ALL":
        query += " AND class_year = ?"
        params.append(class_year)
        
    # Status Filter
    if status and status != "ALL":
        query += " AND status = ?"
        params.append(status)
        
    # Search Query
    if search:
        query += " AND (regd_no LIKE ? OR student_name LIKE ? OR title LIKE ? OR organization LIKE ?)"
        search_pattern = f"%{search}%"
        params.extend([search_pattern, search_pattern, search_pattern, search_pattern])
        
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
# 3. POST NEW ACTIVITY (With Real Certificate File Upload)
# Akshaya submission form nunchi idhi hit avthundhi!
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
    
    # Save Certificate File securely if uploaded
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
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'PENDING')
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
        "message": "Activity submitted successfully! Awaiting faculty verification.",
        "id": new_id
    }


# -------------------------------------------------------------
# 4. FACULTY VERIFICATION (Approve / Reject with Remarks)
# -------------------------------------------------------------
class VerifyRequest(BaseModel):
    status: str  # 'APPROVED' or 'REJECTED'
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
# 5. ANALYTICS & SUMMARY (Dashboard Counters & Charts)
# -------------------------------------------------------------
@app.get("/api/analytics/summary")
def get_analytics():
    conn = get_db_connection()
    cursor = conn.cursor()
    
    # Total Counts
    cursor.execute("SELECT COUNT(*) FROM activities")
    total_records = cursor.fetchone()[0]
    
    cursor.execute("SELECT COUNT(DISTINCT regd_no) FROM activities")
    unique_students = cursor.fetchone()[0]
    
    cursor.execute("SELECT COUNT(*) FROM activities WHERE status = 'PENDING'")
    pending_count = cursor.fetchone()[0]
    
    cursor.execute("SELECT COUNT(*) FROM activities WHERE status = 'APPROVED'")
    approved_count = cursor.fetchone()[0]
    
    # May Month Activity Count (Meeru adigina specific requirement)
    cursor.execute("SELECT COUNT(*) FROM activities WHERE strftime('%m', event_date) = '05'")
    may_count = cursor.fetchone()[0]
    
    # Category Distribution
    cursor.execute("SELECT category, COUNT(*) as count FROM activities GROUP BY category")
    category_counts = {row["category"]: row["count"] for row in cursor.fetchall()}
    
    # Monthly Trends (Jan - Dec)
    cursor.execute('''
        SELECT strftime('%m', event_date) as month_num, COUNT(*) as count 
        FROM activities 
        GROUP BY month_num 
        ORDER BY month_num
    ''')
    monthly_trend = {row["month_num"]: row["count"] for row in cursor.fetchall()}
    
    conn.close()
    
    return {
        "total_records": total_records,
        "unique_students": unique_students,
        "pending_count": pending_count,
        "approved_count": approved_count,
        "may_count": may_count,
        "category_counts": category_counts,
        "monthly_trend": monthly_trend
    }


# -------------------------------------------------------------
# 6. DELETE ACTIVITY
# -------------------------------------------------------------
@app.delete("/api/activities/{activity_id}")
def delete_activity(activity_id: int):
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("DELETE FROM activities WHERE id = ?", (activity_id,))
    deleted = cursor.rowcount > 0
    conn.commit()
    conn.close()
    if not deleted:
        raise HTTPException(status_code=404, detail="Activity not found")
    return {"success": True, "message": "Activity deleted successfully"}


# -------------------------------------------------------------
# Run with Uvicorn
# -------------------------------------------------------------
if __name__ == "__main__":
    import uvicorn
    print("🚀 Starting SVECW IT Activity Portal on http://127.0.0.1:8000 ...")
    uvicorn.run("app:app", host="127.0.0.1", port=8000, reload=True)