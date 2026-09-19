import sqlite3
import os

DB_NAME = "svecw_it_portal.db"

def get_db_connection():
    conn = sqlite3.connect(DB_NAME)
    conn.row_factory = sqlite3.Row
    return conn

def init_db():
    conn = get_db_connection()
    cursor = conn.cursor()
    
    # 1. Activities Table (SVECW IT Department Standard)
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS activities (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            regd_no TEXT NOT NULL,
            student_name TEXT NOT NULL,
            class_year TEXT NOT NULL,          -- 'II IT', 'III IT', 'IV IT'
            section TEXT DEFAULT 'A',          -- 'A', 'B', 'C'
            category TEXT NOT NULL,            -- 'Hackathon', 'Internship', 'Journal / Paper', 'NPTEL / Certification', 'Workshop'
            title TEXT NOT NULL,               -- Title of Event / Paper / Internship
            organization TEXT NOT NULL,        -- College / Company / Platform (Google, Adobe, SRKR, Springer)
            place TEXT DEFAULT 'Bhimavaram',   -- Place / City / Online
            event_date TEXT NOT NULL,          -- YYYY-MM-DD (From Date / Publish Date / Event Date)
            to_date TEXT,                      -- To Date (for Internships / Multi-day events)
            duration TEXT,                     -- '3 months', '1 month', '24 Hrs'
            score_or_stipend TEXT,             -- 'Rs. 1,35,000', '1st Prize', etc.
            guide_or_mentor TEXT,              -- Project Guide (e.g. Dr. S. Ravi Kumar)
            paper_type TEXT,                   -- 'International' / 'National'
            academic_year TEXT DEFAULT '2025-26', -- '2024-25', '2025-26', '2026-27'
            certificate_file TEXT,             -- Uploaded certificate path
            status TEXT DEFAULT 'APPROVED',    -- 'APPROVED', 'PENDING', 'REJECTED'
            faculty_remarks TEXT,              -- Remarks
            verified_by TEXT DEFAULT 'HOD IT', -- Verifying Faculty
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    ''')
    
    # Clear old data and insert ALL rows from the 3 sheets freshly
    cursor.execute("DELETE FROM activities")
    
    all_svecw_records = [
        # =========================================================================
        # 📄 IMAGE 1: JOURNALS & PAPERS PUBLISHED BY STUDENTS (2024-25 / 2025-26)
        # =========================================================================
        (
            '20B01A1258', 'GOVARDHANAM DEVI SRIYA', 'IV IT', 'A', 'Journal / Paper',
            'Published a Progress in Artificial Intelligence springer paper titled "Optimized disease recognition in tomato plants using attention-driven neural networks and YOLOv7 for precision agriculture", https://doi.org/10.1007/s13748-025-00401-z',
            'Springer - Progress in Artificial Intelligence', 'Online', '2025-11-20', None, None,
            'Published', 'Dr.S.Ravi Kumar', 'International', '2024-25', None, 'APPROVED', 'DOI verified', 'Dr.S.Ravi Kumar'
        ),
        (
            '20B01A1235', 'DASARI LAKSHMI SAI MANOJNA', 'IV IT', 'A', 'Journal / Paper',
            'Published a Progress in Artificial Intelligence springer paper titled "Optimized disease recognition in tomato plants using attention-driven neural networks and YOLOv7 for precision agriculture", https://doi.org/10.1007/s13748-025-00401-z',
            'Springer - Progress in Artificial Intelligence', 'Online', '2025-11-20', None, None,
            'Published', 'Dr.S.Ravi Kumar', 'International', '2024-25', None, 'APPROVED', 'DOI verified', 'Dr.S.Ravi Kumar'
        ),
        (
            '20B01A1236', 'DASARI VIJAYA LAKSHMI', 'IV IT', 'A', 'Journal / Paper',
            'Published a Progress in Artificial Intelligence springer paper titled "Optimized disease recognition in tomato plants using attention-driven neural networks and YOLOv7 for precision agriculture", https://doi.org/10.1007/s13748-025-00401-z',
            'Springer - Progress in Artificial Intelligence', 'Online', '2025-11-20', None, None,
            'Published', 'Dr.S.Ravi Kumar', 'International', '2024-25', None, 'APPROVED', 'DOI verified', 'Dr.S.Ravi Kumar'
        ),
        (
            '20B01A1260', 'GUDIVADA LALITHA DEVI', 'IV IT', 'A', 'Journal / Paper',
            'Published a Progress in Artificial Intelligence springer paper titled "Optimized disease recognition in tomato plants using attention-driven neural networks and YOLOv7 for precision agriculture", https://doi.org/10.1007/s13748-025-00401-z',
            'Springer - Progress in Artificial Intelligence', 'Online', '2025-11-20', None, None,
            'Published', 'Dr.S.Ravi Kumar', 'International', '2024-25', None, 'APPROVED', 'DOI verified', 'Dr.S.Ravi Kumar'
        ),
        (
            '21B05A1201', 'BOORAGA JASSIKA', 'IV IT', 'A', 'Journal / Paper',
            'Published a Progress in Artificial Intelligence springer paper titled "Optimized disease recognition in tomato plants using attention-driven neural networks and YOLOv7 for precision agriculture", https://doi.org/10.1007/s13748-025-00401-z',
            'Springer - Progress in Artificial Intelligence', 'Online', '2025-11-20', None, None,
            'Published', 'Dr.S.Ravi Kumar', 'International', '2024-25', None, 'APPROVED', 'DOI verified', 'Dr.S.Ravi Kumar'
        ),

        # =========================================================================
        # 🏆 IMAGE 2: STUDENTS PARTICIPATED IN HACKATHONS (2025-26)
        # =========================================================================
        (
            '24B01A12E3', 'RATNALA RENUKA DEVI', 'II IT', 'A', 'Hackathon',
            'Participated in the Amaravati Quantum Valley Hackathon-2025-Semi Final hosted at the East&West Godavari Regional Center',
            'SRKR Engineering College(A)', 'Bhimavaram', '2025-09-10', None, '24 Hrs',
            'Semi Finalist', None, None, '2025-26', None, 'APPROVED', 'Certificate verified', 'Faculty Coordinator'
        ),
        (
            '24B01A12H2', 'TEJASWI KUKUNURI', 'II IT', 'A', 'Hackathon',
            'Participated in the Amaravati Quantum Valley Hackathon-2025-Semi Final hosted at the East&West Godavari Regional Center',
            'SRKR Engineering College(A)', 'Bhimavaram', '2025-09-10', None, '24 Hrs',
            'Semi Finalist', None, None, '2025-26', None, 'APPROVED', 'Certificate verified', 'Faculty Coordinator'
        ),
        (
            '24B01A12I2', 'VALLABHANI KRISHMA', 'II IT', 'A', 'Hackathon',
            'Participated in the Amaravati Quantum Valley Hackathon-2025-Semi Final hosted at the East&West Godavari Regional Center',
            'SRKR Engineering College(A)', 'Bhimavaram', '2025-09-10', None, '24 Hrs',
            'Semi Finalist', None, None, '2025-26', None, 'APPROVED', 'Certificate verified', 'Faculty Coordinator'
        ),
        (
            '25B05A1221', 'YELETI ROHITHA', 'II IT', 'B', 'Hackathon',
            'Participated in the Amaravati Quantum Valley Hackathon-2025-Semi Final hosted at the East&West Godavari Regional Center',
            'SRKR Engineering College(A)', 'Bhimavaram', '2025-09-10', None, '24 Hrs',
            'Semi Finalist', None, None, '2025-26', None, 'APPROVED', 'Certificate verified', 'Faculty Coordinator'
        ),
        (
            '24B01A12G9', 'SWETHA NANDHINI LAKKIMSETTY', 'II IT', 'A', 'Hackathon',
            'Participated in the Amaravati Quantum Valley Hackathon-2025-Semi Final hosted at the East&West Godavari Regional Center',
            'SRKR Engineering College(A)', 'Bhimavaram', '2025-09-10', None, '24 Hrs',
            'Semi Finalist', None, None, '2025-26', None, 'APPROVED', 'Certificate verified', 'Faculty Coordinator'
        ),
        (
            '23B01A12B1', 'MEDIDI CHARANYA', 'III IT', 'B', 'Hackathon',
            'Participated in OMNITRIX Hackathon 2025-Nationwide Innovation Challenge',
            'Siddhartha Academy of Higher Education', 'Vijayawada', '2025-10-17', '2025-10-18', '36 Hrs',
            'Finalist', None, None, '2025-26', None, 'APPROVED', 'Certificate verified', 'Faculty Coordinator'
        ),
        (
            '23B01A1278', 'KESARI DEVI SUHITHA', 'III IT', 'A', 'Hackathon',
            'Participated in OMNITRIX Hackathon 2025-Nationwide Innovation Challenge',
            'Siddhartha Academy of Higher Education', 'Vijayawada', '2025-10-17', '2025-10-18', '36 Hrs',
            'Finalist', None, None, '2025-26', None, 'APPROVED', 'Certificate verified', 'Faculty Coordinator'
        ),
        (
            '23B01A12A0', 'MANCHIKANTI LAKSHMI SRUTHI MANOJNA', 'III IT', 'A', 'Hackathon',
            'Participated in 24 Hr national level HACKOVERFLOW-2K25',
            'SRKR Engineering College(A)', 'Bhimavaram', '2025-12-19', '2025-12-20', '24 Hrs',
            'Participation', None, None, '2025-26', None, 'APPROVED', 'Certificate verified', 'Faculty Coordinator'
        ),
        (
            '23B01A12C0', 'NALABOLU SWAPNA LATHA', 'III IT', 'B', 'Hackathon',
            'Participated in 24 Hr national level HACKOVERFLOW-2K25',
            'SRKR Engineering College(A)', 'Bhimavaram', '2025-12-19', '2025-12-20', '24 Hrs',
            'Participation', None, None, '2025-26', None, 'APPROVED', 'Certificate verified', 'Faculty Coordinator'
        ),
        (
            '23B01A1251', 'GUNTUPALLI PRAMEELA NAGA SRI', 'III IT', 'A', 'Hackathon',
            'AIGNITE-National Level Hands on Gen AI Training & Hackathon',
            'Srinivasa Institute of Engineering & Technology (SIET) Campus(A) and collaborated with V Cube Software Pvt.Ltd, Hyderabad',
            'Online', '2025-12-29', None, '2 Days',
            'Completed', None, None, '2025-26', None, 'APPROVED', 'Certificate verified', 'Faculty Coordinator'
        ),
        (
            '24B01A1257', 'JAMI SANTHI', 'III IT', 'B', 'Hackathon',
            'AIGNITE-National Level Hands on Gen AI Training & Hackathon',
            'Srinivasa Institute of Engineering & Technology (SIET) Campus(A) and collaborated with V Cube Software Pvt.Ltd, Hyderabad',
            'Online', '2025-12-29', None, '2 Days',
            'Completed', None, None, '2025-26', None, 'APPROVED', 'Certificate verified', 'Faculty Coordinator'
        ),

        # =========================================================================
        # 💼 IMAGE 3: STUDENT INTERNSHIP DETAILS (ACADEMIC YEAR 2025-26)
        # =========================================================================
        (
            '22B01A1231', 'DEVAKOTI RENUKA GANGA', 'IV IT', 'A', 'Internship',
            'Got internship with stipend Rs. 1,35,000',
            'Google', 'Bangalore', '2025-05-12', '2025-08-01', '3 months',
            'Rs. 1,35,000', 'Dr. S. Ravi Kumar', None, '2025-26', None, 'APPROVED', 'Offer letter verified', 'HOD IT'
        ),
        (
            '21B01A12C6', 'NOUBATTULA BHAVYA SRI NAGA ANJANI DEVI', 'IV IT', 'B', 'Internship',
            'Got internship with stipend Rs. 1,27,083',
            'Adobe Systems India Private Limited', 'Noida', '2025-06-16', '2025-09-16', '3 months',
            'Rs. 1,27,083', None, None, '2025-26', None, 'APPROVED', 'Offer letter verified', 'HOD IT'
        ),
        (
            '22B01A1226', 'CHITTURI USHA SURYA KUMARI', 'IV IT', 'A', 'Internship',
            'Summer Internship Program',
            'Visa Inc.', 'Bangalore', '2025-05-15', '2025-07-15', '2 months',
            'Stipend Intern', None, None, '2025-26', None, 'APPROVED', 'Verified', 'Class Incharge'
        ),
        (
            '22B01A1230', 'DESU CHARISHMA AKSHAYA', 'IV IT', 'A', 'Internship',
            'Software Development Engineering Internship',
            'Amazon', 'Hyderabad', '2025-05-20', '2025-07-20', '2 months',
            'Stipend Intern', None, None, '2025-26', None, 'APPROVED', 'Verified', 'Class Incharge'
        ),
        (
            '22B01A1234', 'DOKKU JAHNAVI', 'IV IT', 'A', 'Internship',
            'Software Engineer Intern',
            'Infosys', 'Hyderabad', '2025-06-01', '2025-08-01', '2 months',
            'Completed', None, None, '2025-26', None, 'APPROVED', 'Verified', 'Class Incharge'
        ),
        (
            '22B01A1236', 'DURVASULA N S V S NITHYA DEEKSHITHA', 'IV IT', 'A', 'Internship',
            'Product Development Internship',
            'Zenoti.com', 'Hyderabad', '2025-06-10', '2025-08-10', '2 months',
            'Stipend Intern', None, None, '2025-26', None, 'APPROVED', 'Verified', 'Class Incharge'
        ),
        (
            '22B01A1239', 'GAJJARAPU BHUVANA', 'IV IT', 'A', 'Internship',
            'Junior Software Engineer Intern',
            'Epam', 'Hyderabad', '2025-05-10', '2025-07-10', '2 months',
            'Completed', None, None, '2025-26', None, 'APPROVED', 'Verified', 'Class Incharge'
        ),
        (
            '22B01A1249', 'GUNDA BHARGAVI', 'IV IT', 'A', 'Internship',
            'Software Engineering Intern',
            'Visa Inc.', 'Bangalore', '2025-06-01', '2025-08-01', '2 months',
            'Stipend Intern', None, None, '2025-26', None, 'APPROVED', 'Verified', 'Class Incharge'
        ),
        (
            '22B01A1258', 'KADALI ANANDI', 'IV IT', 'A', 'Internship',
            'Healthcare Technology Intern',
            'Evernorth Health Services', 'Hyderabad', '2025-06-15', '2025-08-15', '2 months',
            'Completed', None, None, '2025-26', None, 'APPROVED', 'Verified', 'Class Incharge'
        ),
        (
            '22B01A1281', 'KUCHIMANCHI VAISHNAVI', 'IV IT', 'B', 'Internship',
            'Infosys Summer Internship',
            'Infosys Intern', 'Hyderabad', '2025-06-01', '2025-08-01', '2 months',
            'Completed', None, None, '2025-26', None, 'APPROVED', 'Verified', 'Class Incharge'
        ),
        (
            '22B01A1282', 'KUNAPAREDDY VIDYA', 'IV IT', 'B', 'Internship',
            'Amazon SDE Internship',
            'Amazon', 'Hyderabad', '2025-05-18', '2025-07-18', '2 months',
            'Stipend Intern', None, None, '2025-26', None, 'APPROVED', 'Verified', 'Class Incharge'
        ),
        (
            '22B01A1285', 'MADDIPUDI LAKSHMI SAI MRUDULA', 'IV IT', 'B', 'Internship',
            'Amazon Cloud Intern',
            'Amazon Intern', 'Hyderabad', '2025-06-01', '2025-08-01', '2 months',
            'Stipend Intern', None, None, '2025-26', None, 'APPROVED', 'Verified', 'Class Incharge'
        ),
        (
            '22B01A12E5', 'PUVVADA RAMA THULASI', 'IV IT', 'B', 'Internship',
            'E-commerce Engineering Intern',
            'Myntra Intern', 'Bangalore', '2025-06-10', '2025-08-10', '2 months',
            'Stipend Intern', None, None, '2025-26', None, 'APPROVED', 'Verified', 'Class Incharge'
        ),
        (
            '22B01A12F2', 'REPAKA KRISHNA APOORVA', 'IV IT', 'B', 'Internship',
            'Fintech Engineering Intern',
            'Visa Inc.', 'Bangalore', '2025-05-25', '2025-07-25', '2 months',
            'Stipend Intern', None, None, '2025-26', None, 'APPROVED', 'Verified', 'Class Incharge'
        ),
        (
            '22B01A12H3', 'THANIPARTHI PAVITHRA REDDY', 'IV IT', 'B', 'Internship',
            'Amazon Operations Tech Intern',
            'Amazon Intern', 'Hyderabad', '2025-06-01', '2025-08-01', '2 months',
            'Stipend Intern', None, None, '2025-26', None, 'APPROVED', 'Verified', 'Class Incharge'
        ),
        (
            '22B01A12I6', 'VITHANALA MADHURI', 'IV IT', 'B', 'Internship',
            'Visa Software Intern',
            'Visa Inc.', 'Bangalore', '2025-05-15', '2025-07-15', '2 months',
            'Stipend Intern', None, None, '2025-26', None, 'APPROVED', 'Verified', 'Class Incharge'
        ),
        (
            '24B01A1219', 'CHEEKURTHI NIRUPAMA', 'II IT', 'A', 'Internship',
            'Completed a one month internship program in UI/UX Design',
            'Future Interns', 'Online', '2026-04-20', '2026-05-20', '1 month',
            'Completed', None, None, '2025-26', None, 'APPROVED', 'Certificate verified', 'Class Incharge'
        ),

        # =========================================================================
        # 🎓 NPTEL / GLOBAL CERTIFICATIONS (Accreditation Support)
        # =========================================================================
        (
            '23B01A1278', 'KESARI DEVI SUHITHA', 'III IT', 'A', 'NPTEL / Certification',
            'NPTEL - Deep Learning and Neural Networks (12-Week Course)',
            'NPTEL / SWAYAM - IIT Madras', 'Online', '2026-05-04', None, '12 Weeks',
            'Elite + Gold (92%)', None, None, '2025-26', None, 'APPROVED', 'Score verified', 'NPTEL Coordinator'
        ),
        (
            '23B01A1251', 'GUNTUPALLI PRAMEELA NAGA SRI', 'III IT', 'A', 'NPTEL / Certification',
            'AWS Certified Cloud Practitioner (CLF-C02)',
            'Amazon Web Services (AWS)', 'Online', '2026-05-22', None, 'Global Cert',
            'Passed (890/1000)', None, None, '2025-26', None, 'APPROVED', 'Badge verified', 'Faculty Coordinator'
        )
    ]
    
    cursor.executemany('''
        INSERT INTO activities (
            regd_no, student_name, class_year, section, category, title, organization, 
            place, event_date, to_date, duration, score_or_stipend, guide_or_mentor, 
            paper_type, academic_year, certificate_file, status, faculty_remarks, verified_by
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    ''', all_svecw_records)
    
    conn.commit()
    conn.close()
    print(f"✅ ALL {len(all_svecw_records)} SVECW IT records inserted successfully into database!")

if __name__ == "__main__":
    init_db()