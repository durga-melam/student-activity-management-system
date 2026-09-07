import sqlite3
import os

DB_NAME = "svecw_it_portal.db"

def get_db_connection():
    conn = sqlite3.connect(DB_NAME)
    conn.row_factory = sqlite3.Row  # Dict la access cheyadaniki
    return conn

def init_db():
    conn = get_db_connection()
    cursor = conn.cursor()
    
    # 1. Activities & Achievements Table (SVECW IT Department Exact Fields)
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS activities (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            regd_no TEXT NOT NULL,
            student_name TEXT NOT NULL,
            class_year TEXT NOT NULL,          -- 'II IT', 'III IT', 'IV IT'
            section TEXT DEFAULT 'A',          -- 'A', 'B', 'C'
            category TEXT NOT NULL,            -- 'Hackathon', 'Internship', 'Journal / Paper', 'NPTEL / Certification', 'Workshop'
            title TEXT NOT NULL,               -- Event Title / Paper Title / Internship Description
            organization TEXT NOT NULL,        -- Company / College / Journal Body (e.g. Google, SRKR, Springer, NPTEL)
            place TEXT DEFAULT 'Bhimavaram',   -- 'Bhimavaram', 'Vijayawada', 'Online', 'Bangalore'
            event_date TEXT NOT NULL,          -- YYYY-MM-DD (e.g. 2026-05-18 - Key for Month Filter)
            to_date TEXT,                      -- For Internships (e.g. 2026-08-01)
            duration TEXT,                     -- '3 months', '24 Hrs', '8 Weeks'
            score_or_stipend TEXT,             -- 'Rs. 1,35,000', '1st Prize', 'Elite + Silver (82%)'
            guide_or_mentor TEXT,              -- Project Guide (e.g. 'Dr. S. Ravi Kumar')
            paper_type TEXT,                   -- 'International' / 'National'
            academic_year TEXT DEFAULT '2025-26', -- '2024-25', '2025-26', '2026-27'
            certificate_file TEXT,             -- Uploaded file path in uploads/certificates/
            status TEXT DEFAULT 'PENDING',     -- 'PENDING', 'APPROVED', 'REJECTED'
            faculty_remarks TEXT,              -- Faculty comments
            verified_by TEXT,                  -- Faculty Name who approved
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    ''')
    
    # 2. Sample Data check - Real SVECW IT data pre-seed cheyadam (Testing kosam)
    cursor.execute("SELECT COUNT(*) FROM activities")
    count = cursor.fetchone()[0]
    
    if count == 0:
        sample_records = [
            # Internships (May & June 2025/2026 Records)
            ('22B01A1231', 'DEVAKOTI RENUKA GANGA', 'IV IT', 'A', 'Internship', 'Got internship with stipend Rs. 1,35,000', 'Google', 'Bangalore', '2025-05-12', '2025-08-01', '3 months', 'Rs. 1,35,000', 'Dr. S. Ravi Kumar', None, '2025-26', None, 'APPROVED', 'Verified offer letter', 'HOD IT'),
            ('21B01A12C6', 'NOUBATTULA BHAVYA SRI NAGA ANJANI DEVI', 'IV IT', 'B', 'Internship', 'Got internship with stipend Rs. 1,27,083', 'Adobe Systems India Private Limited', 'Noida', '2025-06-16', '2025-09-16', '3 months', 'Rs. 1,27,083', None, None, '2025-26', None, 'APPROVED', 'Verified', 'HOD IT'),
            ('24B01A1219', 'CHEEKURTHI NIRUPAMA', 'II IT', 'A', 'Internship', 'Completed a one month internship in UI/UX Design', 'Future Interns', 'Online', '2026-04-20', '2026-05-20', '1 month', 'Completed', None, None, '2025-26', None, 'APPROVED', 'Certificate verified', 'Class Incharge'),
            
            # Hackathons (May & Upcoming/Recent Records)
            ('24B01A12E3', 'RATNALA RENUKA DEVI', 'II IT', 'A', 'Hackathon', 'Amaravati Quantum Valley Hackathon-2025-Semi Final', 'SRKR Engineering College(A)', 'Bhimavaram', '2025-09-10', None, '24 Hrs', 'Semi-Finalist', None, None, '2025-26', None, 'APPROVED', 'Verified', 'Faculty Coordinator'),
            ('23B01A12B1', 'MEDIDI CHARANYA', 'III IT', 'B', 'Hackathon', 'OMNITRIX Hackathon 2025-Nationwide Challenge', 'Siddhartha Academy of Higher Education', 'Vijayawada', '2025-10-17', None, '36 Hrs', '1st Prize', None, None, '2025-26', None, 'APPROVED', 'Winner verified', 'Faculty Coordinator'),
            ('23B01A12A0', 'MANCHIKANTI LAKSHMI SRUTHI MANOJNA', 'III IT', 'A', 'Hackathon', '24 Hr National Level HACKOVERFLOW-2K25', 'SRKR Engineering College(A)', 'Bhimavaram', '2026-05-19', None, '24 Hrs', 'Participation', None, None, '2025-26', None, 'APPROVED', 'Verified', 'Faculty Coordinator'),
            
            # Papers & Journals
            ('20B01A1258', 'GOVARDHANAM DEVI SRIYA', 'IV IT', 'A', 'Journal / Paper', 'Optimized disease recognition in tomato plants using attention-driven neural networks and YOLOv7', 'Springer - Progress in AI', 'Online', '2025-11-20', None, None, 'Published', 'Dr. S. Ravi Kumar', 'International', '2025-26', None, 'APPROVED', 'DOI verified', 'Dr. S. Ravi Kumar'),
            
            # NPTEL / Certifications (May 2026 Records)
            ('23B01A1278', 'KESARI DEVI SUHITHA', 'III IT', 'A', 'NPTEL / Certification', 'NPTEL - Deep Learning and Cloud Architecture', 'NPTEL / SWAYAM - IIT Madras', 'Online', '2026-05-04', None, '12 Weeks', 'Elite + Gold (91%)', None, None, '2025-26', None, 'APPROVED', 'NPTEL roll verified', 'NPTEL Coordinator'),
            ('23B01A1251', 'GUNTUPALLI PRAMEELA NAGA SRI', 'III IT', 'B', 'NPTEL / Certification', 'AWS Certified Cloud Practitioner', 'Amazon Web Services', 'Online', '2026-05-22', None, 'Global Cert', 'Passed (880/1000)', None, None, '2025-26', None, 'PENDING', None, None)
        ]
        
        cursor.executemany('''
            INSERT INTO activities (
                regd_no, student_name, class_year, section, category, title, organization, 
                place, event_date, to_date, duration, score_or_stipend, guide_or_mentor, 
                paper_type, academic_year, certificate_file, status, faculty_remarks, verified_by
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        ''', sample_records)
        
    conn.commit()
    conn.close()
    print("✅ SVECW IT Department Database initialized successfully with sample data!")

if __name__ == "__main__":
    init_db()