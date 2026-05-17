"""
models.py — Database Helper Functions
======================================
This file contains all SQLite database operations.
We use raw SQL queries (no ORM) to keep things beginner-friendly.
"""

import sqlite3
import os
import sys

if hasattr(sys.stdout, 'reconfigure'):
    sys.stdout.reconfigure(encoding='utf-8')

# --------------------
# Database Path
# --------------------
# The database file will be created in the same folder as this script
DATABASE = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'hostel.db')


def get_db():
    """
    Create a new database connection.
    Each request gets its own connection (simple and safe).
    """
    conn = sqlite3.connect(DATABASE)
    # This lets us access columns by name (like a dictionary)
    conn.row_factory = sqlite3.Row
    return conn


def init_db():
    """
    Create all tables if they don't exist yet.
    Called once when the app starts.
    """
    conn = get_db()
    cursor = conn.cursor()

    # --------------------
    # Users Table
    # --------------------
    # Stores both students and admins
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS users (
            id          INTEGER PRIMARY KEY AUTOINCREMENT,
            username    TEXT UNIQUE NOT NULL,
            password    TEXT NOT NULL,
            role        TEXT NOT NULL DEFAULT 'student',
            name        TEXT NOT NULL,
            room_number TEXT,
            fees_due    REAL DEFAULT 0.0,
            created_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    ''')

    try:
        cursor.execute("ALTER TABLE users ADD COLUMN mess_fees_due REAL DEFAULT 12000.0")
    except sqlite3.OperationalError:
        pass # Column already exists


    # --------------------
    # Complaints Table
    # --------------------
    # Students submit complaints, admins update status
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS complaints (
            id              INTEGER PRIMARY KEY AUTOINCREMENT,
            student_id      INTEGER NOT NULL,
            complaint_text  TEXT NOT NULL,
            status          TEXT DEFAULT 'Pending',
            created_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (student_id) REFERENCES users(id)
        )
    ''')

    # --------------------
    # Visitors Table
    # --------------------
    # Admin logs visitors entering and exiting the hostel
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS visitors (
            id              INTEGER PRIMARY KEY AUTOINCREMENT,
            visitor_name    TEXT NOT NULL,
            student_id      INTEGER NOT NULL,
            purpose         TEXT,
            entry_time      TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            exit_time       TIMESTAMP,
            FOREIGN KEY (student_id) REFERENCES users(id)
        )
    ''')

    # --------------------
    # Mess Feedback Table
    # --------------------
    # Students rate meals and leave comments
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS mess_feedback (
            id          INTEGER PRIMARY KEY AUTOINCREMENT,
            student_id  INTEGER NOT NULL,
            rating      INTEGER NOT NULL CHECK(rating BETWEEN 1 AND 5),
            comment     TEXT,
            meal_type   TEXT NOT NULL,
            created_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (student_id) REFERENCES users(id)
        )
    ''')

    # --------------------
    # Meal Opt-Outs Table
    # --------------------
    # Tracks students opting out of meals to prevent food wastage
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS meal_opt_outs (
            id              INTEGER PRIMARY KEY AUTOINCREMENT,
            student_id      INTEGER NOT NULL,
            meal_type       TEXT NOT NULL,
            opt_out_date    DATE NOT NULL,
            reason          TEXT,
            created_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (student_id) REFERENCES users(id)
        )
    ''')

    conn.commit()
    conn.close()
    print("✅ Database tables created successfully!")


# --------------------
# User Queries
# --------------------

def get_user_by_username(username):
    """Find a user by their username (for login)."""
    conn = get_db()
    user = conn.execute(
        'SELECT * FROM users WHERE username = ?', (username,)
    ).fetchone()
    conn.close()
    return user


def get_user_by_id(user_id):
    """Find a user by their ID."""
    conn = get_db()
    user = conn.execute(
        'SELECT id, username, role, name, room_number, fees_due, created_at FROM users WHERE id = ?',
        (user_id,)
    ).fetchone()
    conn.close()
    return user


def create_user(username, password_hash, role, name, room_number=None, fees_due=0.0, mess_fees_due=12000.0):
    """Insert a new user into the database."""
    conn = get_db()
    cursor = conn.execute(
        'INSERT INTO users (username, password, role, name, room_number, fees_due, mess_fees_due) VALUES (?, ?, ?, ?, ?, ?, ?)',
        (username, password_hash, role, name, room_number, fees_due, mess_fees_due)
    )
    conn.commit()
    user_id = cursor.lastrowid
    conn.close()
    return user_id


def get_all_students():
    """Get all users with role 'student'."""
    init_db()
    conn = get_db()
    students = conn.execute(
        'SELECT id, username, name, room_number, fees_due, COALESCE(mess_fees_due, 12000.0) as mess_fees_due, created_at FROM users WHERE role = ?',
        ('student',)
    ).fetchall()
    conn.close()
    return [dict(s) for s in students]


def update_student_fees(student_id, fees_due):
    """Update the semester fee amount for a student."""
    conn = get_db()
    conn.execute(
        'UPDATE users SET fees_due = ? WHERE id = ? AND role = ?',
        (fees_due, student_id, 'student')
    )
    conn.commit()
    conn.close()


def update_mess_fees(student_id, mess_fees_due):
    """Update the mess & dining fee amount for a student."""
    conn = get_db()
    conn.execute(
        'UPDATE users SET mess_fees_due = ? WHERE id = ? AND role = ?',
        (mess_fees_due, student_id, 'student')
    )
    conn.commit()
    conn.close()



# --------------------
# Complaint Queries
# --------------------

def create_complaint(student_id, complaint_text):
    """Submit a new complaint."""
    conn = get_db()
    cursor = conn.execute(
        'INSERT INTO complaints (student_id, complaint_text) VALUES (?, ?)',
        (student_id, complaint_text)
    )
    conn.commit()
    complaint_id = cursor.lastrowid
    conn.close()
    return complaint_id


def get_complaints_by_student(student_id):
    """Get all complaints for a specific student."""
    conn = get_db()
    complaints = conn.execute(
        'SELECT * FROM complaints WHERE student_id = ? ORDER BY created_at DESC',
        (student_id,)
    ).fetchall()
    conn.close()
    return [dict(c) for c in complaints]


def get_all_complaints():
    """Get all complaints with student names (for admin)."""
    conn = get_db()
    complaints = conn.execute('''
        SELECT c.*, u.name as student_name, u.room_number
        FROM complaints c
        JOIN users u ON c.student_id = u.id
        ORDER BY c.created_at DESC
    ''').fetchall()
    conn.close()
    return [dict(c) for c in complaints]


def update_complaint_status(complaint_id, status):
    """Update the status of a complaint (admin action)."""
    conn = get_db()
    conn.execute(
        'UPDATE complaints SET status = ? WHERE id = ?',
        (status, complaint_id)
    )
    conn.commit()
    conn.close()


# --------------------
# Visitor Queries
# --------------------

def create_visitor(visitor_name, student_id, purpose):
    """Log a new visitor entry."""
    conn = get_db()
    cursor = conn.execute(
        'INSERT INTO visitors (visitor_name, student_id, purpose) VALUES (?, ?, ?)',
        (visitor_name, student_id, purpose)
    )
    conn.commit()
    visitor_id = cursor.lastrowid
    conn.close()
    return visitor_id


def get_all_visitors():
    """Get all visitor records with student names."""
    conn = get_db()
    visitors = conn.execute('''
        SELECT v.*, u.name as student_name, u.room_number
        FROM visitors v
        JOIN users u ON v.student_id = u.id
        ORDER BY v.entry_time DESC
    ''').fetchall()
    conn.close()
    return [dict(v) for v in visitors]


def mark_visitor_exit(visitor_id):
    """Mark a visitor as exited (set exit_time)."""
    conn = get_db()
    conn.execute(
        'UPDATE visitors SET exit_time = CURRENT_TIMESTAMP WHERE id = ?',
        (visitor_id,)
    )
    conn.commit()
    conn.close()


# --------------------
# Mess Feedback Queries
# --------------------

def create_mess_feedback(student_id, rating, comment, meal_type):
    """Submit mess feedback."""
    conn = get_db()
    cursor = conn.execute(
        'INSERT INTO mess_feedback (student_id, rating, comment, meal_type) VALUES (?, ?, ?, ?)',
        (student_id, rating, comment, meal_type)
    )
    conn.commit()
    feedback_id = cursor.lastrowid
    conn.close()
    return feedback_id


def get_feedback_by_student(student_id):
    """Get all feedback submitted by a student."""
    conn = get_db()
    feedback = conn.execute(
        'SELECT * FROM mess_feedback WHERE student_id = ? ORDER BY created_at DESC',
        (student_id,)
    ).fetchall()
    conn.close()
    return [dict(f) for f in feedback]


def get_all_feedback():
    """Get all mess feedback with student names."""
    conn = get_db()
    feedback = conn.execute('''
        SELECT mf.*, u.name as student_name
        FROM mess_feedback mf
        JOIN users u ON mf.student_id = u.id
        ORDER BY mf.created_at DESC
    ''').fetchall()
    conn.close()
    return [dict(f) for f in feedback]


# --------------------
# Analytics Queries (for Admin Charts)
# --------------------

def get_complaint_stats():
    """Get count of complaints grouped by status."""
    conn = get_db()
    stats = conn.execute(
        'SELECT status, COUNT(*) as count FROM complaints GROUP BY status'
    ).fetchall()
    conn.close()
    return [dict(s) for s in stats]


def get_mess_rating_stats():
    """Get average rating for each meal type."""
    conn = get_db()
    stats = conn.execute(
        'SELECT meal_type, ROUND(AVG(rating), 1) as avg_rating, COUNT(*) as count FROM mess_feedback GROUP BY meal_type'
    ).fetchall()
    conn.close()
    return [dict(s) for s in stats]


def get_monthly_visitor_stats():
    """Get visitor count grouped by month."""
    conn = get_db()
    stats = conn.execute('''
        SELECT strftime('%Y-%m', entry_time) as month, COUNT(*) as count
        FROM visitors
        GROUP BY strftime('%Y-%m', entry_time)
        ORDER BY month DESC
        LIMIT 6
    ''').fetchall()
    conn.close()
    return [dict(s) for s in stats]


def get_dashboard_counts():
    """Get summary counts for the admin dashboard."""
    conn = get_db()
    
    total_students = conn.execute(
        'SELECT COUNT(*) as count FROM users WHERE role = ?', ('student',)
    ).fetchone()['count']
    
    open_complaints = conn.execute(
        'SELECT COUNT(*) as count FROM complaints WHERE status != ?', ('Resolved',)
    ).fetchone()['count']
    
    today_visitors = conn.execute(
        "SELECT COUNT(*) as count FROM visitors WHERE date(entry_time) = date('now')"
    ).fetchone()['count']
    
    total_fees = conn.execute(
        'SELECT COALESCE(SUM(fees_due), 0) as total FROM users WHERE role = ?', ('student',)
    ).fetchone()['total']
    
    conn.close()
    
    return {
        'total_students': total_students,
        'open_complaints': open_complaints,
        'today_visitors': today_visitors,
        'total_fees_due': total_fees
    }


# --------------------
# Meal Opt-Out Queries (Zero Wastage Initiative)
# --------------------

def create_meal_opt_out(student_id, meal_type, opt_out_date, reason=""):
    """Record a meal opt-out for a student."""
    init_db()
    conn = get_db()
    cursor = conn.execute(
        'INSERT INTO meal_opt_outs (student_id, meal_type, opt_out_date, reason) VALUES (?, ?, ?, ?)',
        (student_id, meal_type, opt_out_date, reason)
    )
    conn.commit()
    opt_out_id = cursor.lastrowid
    conn.close()
    return opt_out_id


def get_all_meal_opt_outs():
    """Get all active meal opt-outs with student details."""
    init_db()
    conn = get_db()
    opt_outs = conn.execute('''
        SELECT mo.*, u.name as student_name, u.room_number, u.fees_due
        FROM meal_opt_outs mo
        JOIN users u ON mo.student_id = u.id
        ORDER BY mo.opt_out_date DESC, mo.created_at DESC
    ''').fetchall()
    
    if len(opt_outs) == 0:
        # Check if we have students to seed against
        students = conn.execute("SELECT id FROM users WHERE role = 'student' LIMIT 3").fetchall()
        if len(students) >= 2:
            from datetime import datetime, timedelta
            today_str = datetime.now().strftime("%Y-%m-%d")
            tmrw_str = (datetime.now() + timedelta(days=1)).strftime("%Y-%m-%d")
            
            conn.execute('INSERT INTO meal_opt_outs (student_id, meal_type, opt_out_date, reason) VALUES (?, ?, ?, ?)',
                         (students[0]['id'], "Dinner", today_str, "Visiting family in city"))
            conn.execute('INSERT INTO meal_opt_outs (student_id, meal_type, opt_out_date, reason) VALUES (?, ?, ?, ?)',
                         (students[1]['id'], "Lunch", tmrw_str, "Attending academic workshop"))
            conn.commit()
            
            # Re-fetch
            opt_outs = conn.execute('''
                SELECT mo.*, u.name as student_name, u.room_number, u.fees_due
                FROM meal_opt_outs mo
                JOIN users u ON mo.student_id = u.id
                ORDER BY mo.opt_out_date DESC, mo.created_at DESC
            ''').fetchall()

    conn.close()
    return [dict(m) for m in opt_outs]


def get_student_opt_outs(student_id):
    """Get meal opt-outs for a specific student."""
    init_db()
    conn = get_db()
    opt_outs = conn.execute(
        'SELECT * FROM meal_opt_outs WHERE student_id = ? ORDER BY opt_out_date DESC',
        (student_id,)
    ).fetchall()
    conn.close()
    return [dict(m) for m in opt_outs]

