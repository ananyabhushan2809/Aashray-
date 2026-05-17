"""
seed.py — Database Seeder
===========================
Run this file to populate the database with demo data.
This is useful for testing and interview demonstrations.

Usage:
    python seed.py
"""

import bcrypt
import models
from datetime import datetime, timedelta
import random
import sys

if hasattr(sys.stdout, 'reconfigure'):
    sys.stdout.reconfigure(encoding='utf-8')


def hash_password(password):
    """Hash a plain-text password using bcrypt."""
    return bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')


def seed_database():
    """Insert demo data into all tables."""
    
    # First, initialize tables
    models.init_db()
    
    print("🌱 Seeding database with demo data...")

    # --------------------
    # Demo Users
    # --------------------
    users = [
        # Admin account
        {
            "username": "admin",
            "password": hash_password("admin123"),
            "role": "admin",
            "name": "Dr. Rajesh Kumar",
            "room_number": None,
            "fees_due": 0
        },
        # Student accounts
        {
            "username": "student1",
            "password": hash_password("student123"),
            "role": "student",
            "name": "Arjun Mehta",
            "room_number": "A-101",
            "fees_due": 15000.00
        },
        {
            "username": "student2",
            "password": hash_password("student123"),
            "role": "student",
            "name": "Priya Sharma",
            "room_number": "B-205",
            "fees_due": 8500.00
        },
        {
            "username": "student3",
            "password": hash_password("student123"),
            "role": "student",
            "name": "Rahul Singh",
            "room_number": "A-302",
            "fees_due": 0.00
        },
        {
            "username": "student4",
            "password": hash_password("student123"),
            "role": "student",
            "name": "Sneha Patel",
            "room_number": "C-110",
            "fees_due": 22000.00
        },
        {
            "username": "student5",
            "password": hash_password("student123"),
            "role": "student",
            "name": "Amit Verma",
            "room_number": "B-401",
            "fees_due": 5000.00
        },
    ]

    user_ids = []
    for user in users:
        try:
            uid = models.create_user(
                username=user['username'],
                password_hash=user['password'],
                role=user['role'],
                name=user['name'],
                room_number=user['room_number'],
                fees_due=user['fees_due']
            )
            user_ids.append(uid)
            print(f"  ✅ Created user: {user['username']} (ID: {uid})")
        except Exception as e:
            print(f"  ⚠️  Skipped user {user['username']}: {e}")

    # --------------------
    # Demo Complaints
    # --------------------
    complaints = [
        (2, "Water heater not working in room A-101. It has been 3 days.", "Pending"),
        (2, "WiFi connectivity is very poor in Block A.", "In Progress"),
        (3, "Room door lock is broken. Need urgent repair.", "Resolved"),
        (3, "Bathroom tap is leaking continuously.", "Pending"),
        (4, "Lights flickering in room A-302.", "In Progress"),
        (5, "AC not cooling properly in room C-110.", "Pending"),
        (6, "Mosquito problem in Block B. Need fumigation.", "Pending"),
        (5, "Water supply issue on 3rd floor.", "Resolved"),
        (4, "Common room TV is not working.", "In Progress"),
        (6, "Need extra furniture in room B-401.", "Pending"),
    ]

    conn = models.get_db()
    for student_id, text, status in complaints:
        conn.execute(
            'INSERT INTO complaints (student_id, complaint_text, status) VALUES (?, ?, ?)',
            (student_id, text, status)
        )
    conn.commit()
    conn.close()
    print(f"  ✅ Created {len(complaints)} complaints")

    # --------------------
    # Demo Visitors
    # --------------------
    visitors = [
        ("Mr. Rakesh Mehta", 2, "Parent visit"),
        ("Ms. Sunita Sharma", 3, "Dropping off supplies"),
        ("Mr. Vikram Patel", 5, "Parent-teacher meeting"),
        ("Dr. Anita Verma", 6, "Medical checkup"),
        ("Mr. Suresh Kumar", 4, "Document collection"),
        ("Ms. Neha Singh", 4, "Sibling visit"),
        ("Mr. Deepak Gupta", 2, "Friend visit"),
    ]

    conn = models.get_db()
    for name, student_id, purpose in visitors:
        conn.execute(
            'INSERT INTO visitors (visitor_name, student_id, purpose) VALUES (?, ?, ?)',
            (name, student_id, purpose)
        )
    # Mark some visitors as exited
    conn.execute("UPDATE visitors SET exit_time = CURRENT_TIMESTAMP WHERE id IN (1, 2, 3)")
    conn.commit()
    conn.close()
    print(f"  ✅ Created {len(visitors)} visitor records")

    # --------------------
    # Demo Mess Feedback
    # --------------------
    meal_types = ['Breakfast', 'Lunch', 'Dinner']
    comments = [
        "Great food today!",
        "Could be better.",
        "Loved the dessert.",
        "Too spicy for my taste.",
        "Good variety of dishes.",
        "Rice was undercooked.",
        "Best meal this week!",
        "Need more vegetarian options.",
        "Chapati was fresh and soft.",
        "Dal was too watery.",
        "Excellent biryani!",
        "Salad was very fresh.",
    ]

    conn = models.get_db()
    for student_id in [2, 3, 4, 5, 6]:
        for _ in range(random.randint(2, 4)):
            conn.execute(
                'INSERT INTO mess_feedback (student_id, rating, comment, meal_type) VALUES (?, ?, ?, ?)',
                (student_id, random.randint(1, 5), random.choice(comments), random.choice(meal_types))
            )
    conn.commit()
    conn.close()
    print("  ✅ Created mess feedback records")

    # --------------------
    # Demo Meal Opt-Outs (Zero Wastage)
    # --------------------
    opt_outs = [
        (2, "Dinner", (datetime.now() + timedelta(days=0)).strftime("%Y-%m-%d"), "Going out with family"),
        (2, "Lunch", (datetime.now() + timedelta(days=1)).strftime("%Y-%m-%d"), "Attending seminar in city"),
        (3, "Breakfast", (datetime.now() + timedelta(days=0)).strftime("%Y-%m-%d"), "Fasting"),
        (4, "Dinner", (datetime.now() + timedelta(days=2)).strftime("%Y-%m-%d"), "Visiting home for weekend"),
        (5, "Lunch", (datetime.now() + timedelta(days=0)).strftime("%Y-%m-%d"), "Eating out with friends"),
    ]
    conn = models.get_db()
    for student_id, meal_type, date_str, reason in opt_outs:
        conn.execute(
            'INSERT INTO meal_opt_outs (student_id, meal_type, opt_out_date, reason) VALUES (?, ?, ?, ?)',
            (student_id, meal_type, date_str, reason)
        )
    conn.commit()
    conn.close()
    print(f"  ✅ Created {len(opt_outs)} meal opt-out records")

    print("\n" + "=" * 50)
    print("🎉 Database seeded successfully!")
    print("=" * 50)
    print("\n📋 Demo Accounts:")
    print("  Admin  → username: admin     | password: admin123")
    print("  Student→ username: student1  | password: student123")
    print("  Student→ username: student2  | password: student123")
    print("  Student→ username: student3  | password: student123")
    print("  Student→ username: student4  | password: student123")
    print("  Student→ username: student5  | password: student123")


if __name__ == '__main__':
    seed_database()
