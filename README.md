# Smart Hostel Management Portal 🏠

A beginner-friendly, robust, and feature-rich full-stack web application designed for streamlined hostel administration, room allocation, grievance redressal, visitor security logging, and automated fee monitoring.

Built specifically with clean architecture and beginner-friendly coding practices, making it perfect for college project submissions and technical interview demonstrations.

---

## 🌟 Key Features

### 🛡️ Role-Based Authentication (JWT)
- Separate secure login workflows for **Students** and **Administrators**.
- One-click demo credentials enabled on the login page for instant evaluator access.

### 🏢 Student Portal
- **Dashboard Overview**: Immediate visualization of allocated room number, current fee dues, and active grievance status.
- **Lodge Grievance**: Simple submission form to report maintenance issues (plumbing, electrical, Wi-Fi, carpentry).
- **Mess & Dining Feedback**: Interactive 5-star rating module with comments to rate breakfast, lunch, and dinner quality.

### 🚀 Administrator Command Center
- **Executive Analytics**: Real-time statistical counters for total enrolled students, unresolved grievances, daily security visitor logs, and outstanding fee totals.
- **Visual Analytics Charts**: Interactive **Chart.js** doughnut and bar charts visualizing grievance breakdown by status and average mess satisfaction ratings.
- **Grievance Management**: Review and update student complaints from `Pending` to `In Progress` or `Resolved` instantly.
- **Security Visitor Desk**: Check in incoming guests/parents, link them to resident hosts, and log real-time departure timestamps.
- **Fee Management Desk**: Search and filter students by pending balances, adjust due amounts, or mark accounts as fully settled with a single click.

---

## 🛠️ Technology Stack

### Frontend
- **React 19**: Modern functional components and React Hooks.
- **Tailwind CSS v4**: Utility-first CSS framework for clean, responsive, glassmorphism UI design.
- **Axios**: HTTP client configured with automated JWT interceptors.
- **Chart.js & React-Chartjs-2**: High-performance data visualization library.
- **Lucide React**: Clean, modern iconography.

### Backend
- **Flask 3**: Lightweight, robust Python web framework.
- **Flask-JWT-Extended**: Secure token-based authentication with claims storage.
- **SQLite3**: Serverless SQL database utilizing raw parameterized SQL queries (protecting against SQL injection without ORM overhead).
- **Bcrypt**: State-of-art password hashing.

---

## 📂 Clean Project Structure

```
SHMS/
│
├── backend/                  # Python Flask API & SQLite Backend
│   ├── venv/                 # Python Virtual Environment
│   ├── app.py                # Main Flask application & RESTful API routes
│   ├── models.py             # Database connector & raw SQL helper functions
│   ├── seed.py               # Demo database seeder script
│   ├── hostel.db             # SQLite database file
│   └── requirements.txt      # Backend Python dependencies
│
├── frontend/                 # React 19 Frontend Application
│   ├── src/
│   │   ├── components/       # Reusable UI components
│   │   │   ├── Navbar.jsx    # Top navigation header
│   │   │   ├── Sidebar.jsx   # Role-based responsive sidebar menu
│   │   │   └── ProtectedRoute.jsx # Role & JWT route authorization guard
│   │   ├── pages/            # Core feature views
│   │   │   ├── Login.jsx     # Split-screen auth with 1-click evaluator demo
│   │   │   ├── StudentDashboard.jsx # Student accommodation overview
│   │   │   ├── AdminDashboard.jsx   # Admin statistics & Chart.js analytics
│   │   │   ├── ComplaintPage.jsx    # Grievance lodging & status management
│   │   │   ├── VisitorPage.jsx      # Front gate check-in & departure desk
│   │   │   ├── FeeReminderPage.jsx  # Student billing & dues management
│   │   │   ├── MessFeedbackPage.jsx # Dining rating & feedback form
│   │   │   └── StudentsPage.jsx     # Full resident & room directory
│   │   ├── services/
│   │   │   └── api.js        # Axios instance with JWT interceptors
│   │   ├── App.jsx           # Root layout wrapper & route definitions
│   │   ├── main.jsx          # React DOM entry point
│   │   └── index.css         # Tailwind v4 configuration & base styles
│   ├── index.html            # Static HTML template
│   ├── package.json          # Node dependencies
│   └── vite.config.js        # Vite bundler configuration
│
├── README.md                 # Project Overview & Feature Documentation
├── SETUP_GUIDE.md            # Step-by-step local running instructions
├── DATABASE_SCHEMA.md        # Comprehensive SQLite table & query breakdown
└── INTERVIEW_EXPLANATION_GUIDE.md # Technical interview defense & prep manual
```

---

## 🚀 Quick Setup & Execution

For detailed, step-by-step installation instructions, please refer to the **[SETUP_GUIDE.md](./SETUP_GUIDE.md)** file.

### Summary
1. **Backend**: Navigate to `backend/`, activate `venv`, install dependencies, run `python seed.py` to seed demo data, and start the server with `python app.py` (runs on `http://localhost:5000`).
2. **Frontend**: Navigate to `frontend/`, run `npm install`, and start the development server with `npm run dev` (runs on `http://localhost:5173`).

---

## 👨‍💻 Demo Account Credentials

When testing the application, you can use the **Quick Evaluator Demo** buttons on the Login page, or manually enter the following demo accounts:

| Role | Username | Password | Notes |
| :--- | :--- | :--- | :--- |
| **Administrator** | `admin` | `admin123` | Full access to command center, analytics, visitor logging & fees |
| **Student (Room A-101)** | `student1` | `student123` | Access to room details, fee balance, complaints & mess rating |
| **Student (Room B-205)** | `student2` | `student123` | Active complaints and mess feedback records available |
| **Student (Room A-302)** | `student3` | `student123` | Fully settled fee balance (₹0 due) |

---
*Developed with clean architecture for academic excellence and technical interview success.*
