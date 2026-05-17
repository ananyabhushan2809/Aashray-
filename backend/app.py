"""
app.py — Smart Hostel Management Portal (Backend)
===================================================
This is the main Flask application file.
All API routes are organized in sections for clarity.

Sections:
  1. Imports & Config
  2. Auth Routes (login, register)
  3. Student Routes (profile, complaints, fees, feedback)
  4. Admin Routes (dashboard, students, complaints, visitors, fees, analytics)
"""

from flask import Flask, request, jsonify
from flask_cors import CORS
from flask_jwt_extended import (
    JWTManager, create_access_token, create_refresh_token,
    jwt_required, get_jwt_identity, get_jwt
)
import bcrypt
from datetime import timedelta
import models
import sys

if hasattr(sys.stdout, 'reconfigure'):
    sys.stdout.reconfigure(encoding='utf-8')


# --------------------
# App Config
# --------------------

app = Flask(__name__)

# CORS — allow React frontend to call our API
CORS(app, resources={r"/api/*": {"origins": "*"}})

# JWT Configuration
app.config['JWT_SECRET_KEY'] = 'super-secret-hostel-key-change-in-production'
app.config['JWT_ACCESS_TOKEN_EXPIRES'] = timedelta(hours=1)
app.config['JWT_REFRESH_TOKEN_EXPIRES'] = timedelta(days=30)

jwt = JWTManager(app)

# Initialize the database when app starts
models.init_db()


# --------------------
# Helper Functions
# --------------------

def admin_required(fn):
    """
    Custom decorator to check if the logged-in user is an admin.
    Use this on top of @jwt_required() for admin-only routes.
    """
    from functools import wraps
    @wraps(fn)
    @jwt_required()
    def wrapper(*args, **kwargs):
        claims = get_jwt()
        if claims.get('role') != 'admin':
            return jsonify({"error": "Admin access required"}), 403
        return fn(*args, **kwargs)
    return wrapper


# ============================================================
#                       AUTH ROUTES
# ============================================================

@app.route('/api/auth/register', methods=['POST'])
def register():
    """
    Register a new user (student or admin).
    
    Expected JSON body:
    {
        "username": "john",
        "password": "pass123",
        "name": "John Doe",
        "role": "student",        (optional, defaults to "student")
        "room_number": "A-101"    (optional)
    }
    """
    data = request.get_json()

    # Validate required fields
    if not data or not data.get('username') or not data.get('password') or not data.get('name'):
        return jsonify({"error": "Username, password, and name are required"}), 400

    # Check if username already exists
    existing = models.get_user_by_username(data['username'])
    if existing:
        return jsonify({"error": "Username already taken"}), 409

    # Hash the password using bcrypt
    password_hash = bcrypt.hashpw(
        data['password'].encode('utf-8'),
        bcrypt.gensalt()
    ).decode('utf-8')

    # Create the user
    role = data.get('role', 'student')
    room_number = data.get('room_number', None)
    
    user_id = models.create_user(
        username=data['username'],
        password_hash=password_hash,
        role=role,
        name=data['name'],
        room_number=room_number
    )

    return jsonify({
        "message": "User registered successfully!",
        "user_id": user_id
    }), 201


@app.route('/api/auth/login', methods=['POST'])
def login():
    """
    Login and receive JWT tokens.
    
    Expected JSON body:
    {
        "username": "john",
        "password": "pass123"
    }
    
    Returns access_token and refresh_token.
    """
    data = request.get_json()

    if not data or not data.get('username') or not data.get('password'):
        return jsonify({"error": "Username and password are required"}), 400

    # Find the user
    user = models.get_user_by_username(data['username'])
    if not user:
        return jsonify({"error": "Invalid username or password"}), 401

    # Verify password
    if not bcrypt.checkpw(data['password'].encode('utf-8'), user['password'].encode('utf-8')):
        return jsonify({"error": "Invalid username or password"}), 401

    # Create JWT tokens with user info in claims
    additional_claims = {"role": user['role'], "name": user['name']}
    
    access_token = create_access_token(
        identity=str(user['id']),
        additional_claims=additional_claims
    )
    refresh_token = create_refresh_token(
        identity=str(user['id']),
        additional_claims=additional_claims
    )

    return jsonify({
        "message": "Login successful!",
        "access_token": access_token,
        "refresh_token": refresh_token,
        "user": {
            "id": user['id'],
            "username": user['username'],
            "name": user['name'],
            "role": user['role'],
            "room_number": user['room_number']
        }
    }), 200


@app.route('/api/auth/refresh', methods=['POST'])
@jwt_required(refresh=True)
def refresh():
    """Get a new access token using a refresh token."""
    current_user = get_jwt_identity()
    claims = get_jwt()
    
    new_token = create_access_token(
        identity=current_user,
        additional_claims={"role": claims.get('role'), "name": claims.get('name')}
    )
    return jsonify({"access_token": new_token}), 200


# ============================================================
#                     STUDENT ROUTES
# ============================================================

@app.route('/api/student/profile', methods=['GET'])
@jwt_required()
def student_profile():
    """Get the logged-in student's profile."""
    user_id = get_jwt_identity()
    user = models.get_user_by_id(int(user_id))
    
    if not user:
        return jsonify({"error": "User not found"}), 404
    
    return jsonify(dict(user)), 200


@app.route('/api/student/complaints', methods=['GET'])
@jwt_required()
def get_student_complaints():
    """Get all complaints submitted by the logged-in student."""
    user_id = get_jwt_identity()
    complaints = models.get_complaints_by_student(int(user_id))
    return jsonify(complaints), 200


@app.route('/api/student/complaints', methods=['POST'])
@jwt_required()
def submit_complaint():
    """
    Submit a new complaint.
    
    Expected JSON body:
    {
        "complaint_text": "Water heater not working in room A-101"
    }
    """
    user_id = get_jwt_identity()
    data = request.get_json()

    if not data or not data.get('complaint_text'):
        return jsonify({"error": "Complaint text is required"}), 400

    complaint_id = models.create_complaint(
        student_id=int(user_id),
        complaint_text=data['complaint_text']
    )

    return jsonify({
        "message": "Complaint submitted successfully!",
        "complaint_id": complaint_id
    }), 201


@app.route('/api/student/fees', methods=['GET'])
@jwt_required()
def get_student_fees():
    """Get the fee status for the logged-in student."""
    user_id = get_jwt_identity()
    user = models.get_user_by_id(int(user_id))
    
    if not user:
        return jsonify({"error": "User not found"}), 404
    
    return jsonify({
        "name": user['name'],
        "room_number": user['room_number'],
        "fees_due": user['fees_due']
    }), 200


@app.route('/api/student/mess-feedback', methods=['POST'])
@jwt_required()
def submit_mess_feedback():
    """
    Submit mess feedback.
    
    Expected JSON body:
    {
        "rating": 4,
        "meal_type": "Lunch",
        "comment": "Good food today!"
    }
    """
    user_id = get_jwt_identity()
    data = request.get_json()

    if not data or not data.get('rating') or not data.get('meal_type'):
        return jsonify({"error": "Rating and meal type are required"}), 400

    if data['rating'] < 1 or data['rating'] > 5:
        return jsonify({"error": "Rating must be between 1 and 5"}), 400

    if data['meal_type'] not in ['Breakfast', 'Lunch', 'Dinner']:
        return jsonify({"error": "Meal type must be Breakfast, Lunch, or Dinner"}), 400

    feedback_id = models.create_mess_feedback(
        student_id=int(user_id),
        rating=data['rating'],
        comment=data.get('comment', ''),
        meal_type=data['meal_type']
    )

    return jsonify({
        "message": "Feedback submitted successfully!",
        "feedback_id": feedback_id
    }), 201


@app.route('/api/student/mess-feedback', methods=['GET'])
@jwt_required()
def get_student_feedback():
    """Get all mess feedback submitted by the logged-in student."""
    user_id = get_jwt_identity()
    feedback = models.get_feedback_by_student(int(user_id))
    return jsonify(feedback), 200


@app.route('/api/student/meal-opt-out', methods=['POST'])
@jwt_required()
def student_meal_opt_out():
    """
    Opt out of a meal for a specific date (Zero Wastage).
    
    Expected JSON body:
    {
        "meal_type": "Dinner",
        "opt_out_date": "2026-05-18",
        "reason": "Visiting home"
    }
    """
    user_id = get_jwt_identity()
    data = request.get_json()

    if not data or not data.get('meal_type') or not data.get('opt_out_date'):
        return jsonify({"error": "Meal type and date are required"}), 400

    opt_out_id = models.create_meal_opt_out(
        student_id=int(user_id),
        meal_type=data['meal_type'],
        opt_out_date=data['opt_out_date'],
        reason=data.get('reason', '')
    )

    return jsonify({
        "message": f"Successfully opted out of {data['meal_type']} on {data['opt_out_date']}!",
        "opt_out_id": opt_out_id
    }), 201


@app.route('/api/student/meal-opt-outs', methods=['GET'])
@jwt_required()
def get_student_opt_outs_endpoint():
    """Get all meal opt-outs for the logged-in student."""
    user_id = get_jwt_identity()
    opt_outs = models.get_student_opt_outs(int(user_id))
    return jsonify(opt_outs), 200



# ============================================================
#                      ADMIN ROUTES
# ============================================================

@app.route('/api/admin/dashboard', methods=['GET'])
@admin_required
def admin_dashboard():
    """Get dashboard statistics for the admin."""
    stats = models.get_dashboard_counts()
    return jsonify(stats), 200


@app.route('/api/admin/students', methods=['GET'])
@admin_required
def get_all_students():
    """Get a list of all registered students."""
    students = models.get_all_students()
    return jsonify(students), 200


@app.route('/api/admin/complaints', methods=['GET'])
@admin_required
def get_all_complaints():
    """Get all complaints from all students."""
    complaints = models.get_all_complaints()
    return jsonify(complaints), 200


@app.route('/api/admin/complaints/<int:complaint_id>', methods=['PUT'])
@admin_required
def update_complaint(complaint_id):
    """
    Update the status of a complaint.
    
    Expected JSON body:
    {
        "status": "In Progress"   // or "Resolved" or "Pending"
    }
    """
    data = request.get_json()

    if not data or not data.get('status'):
        return jsonify({"error": "Status is required"}), 400

    valid_statuses = ['Pending', 'In Progress', 'Resolved']
    if data['status'] not in valid_statuses:
        return jsonify({"error": f"Status must be one of: {valid_statuses}"}), 400

    models.update_complaint_status(complaint_id, data['status'])
    return jsonify({"message": "Complaint status updated!"}), 200


@app.route('/api/admin/visitors', methods=['GET'])
@admin_required
def get_all_visitors():
    """Get all visitor records."""
    visitors = models.get_all_visitors()
    return jsonify(visitors), 200


@app.route('/api/admin/visitors', methods=['POST'])
@admin_required
def log_visitor():
    """
    Log a new visitor entry.
    
    Expected JSON body:
    {
        "visitor_name": "Mr. Sharma",
        "student_id": 2,
        "purpose": "Parent visit"
    }
    """
    data = request.get_json()

    if not data or not data.get('visitor_name') or not data.get('student_id'):
        return jsonify({"error": "Visitor name and student ID are required"}), 400

    visitor_id = models.create_visitor(
        visitor_name=data['visitor_name'],
        student_id=data['student_id'],
        purpose=data.get('purpose', '')
    )

    return jsonify({
        "message": "Visitor logged successfully!",
        "visitor_id": visitor_id
    }), 201


@app.route('/api/admin/visitors/<int:visitor_id>/exit', methods=['PUT'])
@admin_required
def visitor_exit(visitor_id):
    """Mark a visitor as exited."""
    models.mark_visitor_exit(visitor_id)
    return jsonify({"message": "Visitor marked as exited!"}), 200


@app.route('/api/admin/fees', methods=['GET'])
@admin_required
def get_all_fees():
    """Get fee information for all students."""
    students = models.get_all_students()
    return jsonify(students), 200


@app.route('/api/admin/fees/<int:student_id>', methods=['PUT'])
@admin_required
def update_fees(student_id):
    """
    Update fees for a student.
    
    Expected JSON body:
    {
        "fees_due": 5000.00
    }
    """
    data = request.get_json()

    if data is None or data.get('fees_due') is None:
        return jsonify({"error": "fees_due is required"}), 400

    models.update_student_fees(student_id, data['fees_due'])
    return jsonify({"message": "Fee updated successfully!"}), 200


@app.route('/api/admin/analytics', methods=['GET'])
@admin_required
def get_analytics():
    """Get analytics data for charts."""
    return jsonify({
        "complaint_stats": models.get_complaint_stats(),
        "mess_ratings": models.get_mess_rating_stats(),
        "monthly_visitors": models.get_monthly_visitor_stats()
    }), 200


@app.route('/api/admin/mess-fees/<int:student_id>', methods=['PUT'])
@admin_required
def update_mess_fee_endpoint(student_id):
    """
    Update mess fees for a student.
    
    Expected JSON body:
    {
        "mess_fees_due": 0.00
    }
    """
    data = request.get_json()
    if data is None or data.get('mess_fees_due') is None:
        return jsonify({"error": "mess_fees_due is required"}), 400

    models.update_mess_fees(student_id, data['mess_fees_due'])
    return jsonify({"message": "Mess fee status updated successfully!"}), 200


@app.route('/api/admin/meal-opt-outs', methods=['GET'])
@admin_required
def get_admin_meal_opt_outs():
    """Get all student meal opt-outs (Zero Wastage Tracker)."""
    opt_outs = models.get_all_meal_opt_outs()
    return jsonify(opt_outs), 200


@app.route('/api/admin/meal-opt-outs', methods=['POST'])
@admin_required
def admin_create_meal_opt_out():
    """
    Record a meal opt-out directly as Admin/Mess Lead.
    
    Expected JSON body:
    {
        "student_id": 2,
        "meal_type": "Lunch",
        "opt_out_date": "2026-05-18",
        "reason": "Attending seminar"
    }
    """
    data = request.get_json()
    if not data or not data.get('student_id') or not data.get('meal_type') or not data.get('opt_out_date'):
        return jsonify({"error": "student_id, meal_type, and opt_out_date are required"}), 400

    opt_out_id = models.create_meal_opt_out(
        student_id=int(data['student_id']),
        meal_type=data['meal_type'],
        opt_out_date=data['opt_out_date'],
        reason=data.get('reason', 'Admin log')
    )
    return jsonify({"message": "Opt-out recorded successfully!", "opt_out_id": opt_out_id}), 201



# ============================================================
#                    RUN THE APP
# ============================================================

if __name__ == '__main__':
    print("🏠 Smart Hostel Management Portal — Backend")
    print("📡 Running on http://localhost:5000")
    print("=" * 50)
    app.run(debug=True, port=5000)
