# Database Schema & SQL Query Architecture 🗄️

The Smart Hostel Management Portal utilizes a serverless **SQLite3** database (`hostel.db`). To keep the codebase beginner-friendly, transparent, and robust for technical interviews, we use **raw parameterized SQL queries** rather than an ORM (Object-Relational Mapper) like SQLAlchemy. This demonstrates fundamental database understanding and clean protection against SQL injection vulnerabilities.

---

## 📊 Database Entity Relationship Diagram

```
+-----------------------------------------------------------------------+
|                                USERS                                  |
|-----------------------------------------------------------------------|
| PK  | id          | INTEGER AUTOINCREMENT                             |
| UK  | username    | TEXT UNIQUE NOT NULL                              |
|     | password    | TEXT (Bcrypt Hash) NOT NULL                       |
|     | role        | TEXT NOT NULL DEFAULT 'student' ('student'|'admin')|
|     | name        | TEXT NOT NULL                                     |
|     | room_number | TEXT NULLABLE (e.g. 'A-101')                      |
|     | fees_due    | REAL DEFAULT 0.0                                  |
|     | created_at  | TIMESTAMP DEFAULT CURRENT_TIMESTAMP               |
+-----------------------------------------------------------------------+
        |                  |                  |
        | 1:N              | 1:N              | 1:N
        v                  v                  v
+------------------+ +------------------+ +------------------+
|    COMPLAINTS    | |     VISITORS     | |  MESS_FEEDBACK   |
|------------------| |------------------| |------------------|
| PK | id          | | PK | id          | | PK | id          |
| FK | student_id  | | FK | student_id  | | FK | student_id  |
|    | text        | |    | visitor_name| |    | rating (1..5)|
|    | status      | |    | purpose     | |    | comment     |
|    | created_at  | |    | entry_time  | |    | meal_type   |
|    |             | |    | exit_time   | |    | created_at  |
+------------------+ +------------------+ +------------------+
```

---

## 📂 Detailed Table Definitions

### 1. `users` Table
Stores authentication and profile records for both **Students** and **Administrators**.

| Column Name | Data Type | Constraints | Description |
| :--- | :--- | :--- | :--- |
| `id` | `INTEGER` | `PRIMARY KEY AUTOINCREMENT` | Unique identifier for each account. |
| `username` | `TEXT` | `UNIQUE, NOT NULL` | Login identifier (e.g., `student1`, `admin`). |
| `password` | `TEXT` | `NOT NULL` | Bcrypt hashed password string. |
| `role` | `TEXT` | `NOT NULL, DEFAULT 'student'` | Differentiates `'student'` from `'admin'`. |
| `name` | `TEXT` | `NOT NULL` | Full display name (e.g., `Arjun Mehta`). |
| `room_number`| `TEXT` | `NULLABLE` | Allocated room code (e.g., `A-101`). Null for admins. |
| `fees_due` | `REAL` | `DEFAULT 0.0` | Total outstanding dues in rupees. |
| `created_at` | `TIMESTAMP` | `DEFAULT CURRENT_TIMESTAMP` | Account creation timestamp. |

---

### 2. `complaints` Table
Tracks maintenance requests and student grievances.

| Column Name | Data Type | Constraints | Description |
| :--- | :--- | :--- | :--- |
| `id` | `INTEGER` | `PRIMARY KEY AUTOINCREMENT` | Unique complaint ticket ID. |
| `student_id` | `INTEGER` | `FOREIGN KEY REFERENCES users(id)`| ID of the lodging student. |
| `complaint_text`| `TEXT` | `NOT NULL` | Description of the grievance. |
| `status` | `TEXT` | `DEFAULT 'Pending'` | Workflow state: `Pending`, `In Progress`, or `Resolved`. |
| `created_at` | `TIMESTAMP` | `DEFAULT CURRENT_TIMESTAMP` | Submission timestamp. |

---

### 3. `visitors` Table
Logs front gate security check-ins and check-outs.

| Column Name | Data Type | Constraints | Description |
| :--- | :--- | :--- | :--- |
| `id` | `INTEGER` | `PRIMARY KEY AUTOINCREMENT` | Unique visitor log ID. |
| `visitor_name`| `TEXT` | `NOT NULL` | Full name of the incoming guest. |
| `student_id` | `INTEGER` | `FOREIGN KEY REFERENCES users(id)`| Resident student being visited. |
| `purpose` | `TEXT` | `NULLABLE` | Stated reason (e.g., `Parent visit`). |
| `entry_time` | `TIMESTAMP` | `DEFAULT CURRENT_TIMESTAMP` | Automatic gate check-in timestamp. |
| `exit_time` | `TIMESTAMP` | `NULLABLE` | Departure timestamp. Null when still on campus. |

---

### 4. `mess_feedback` Table
Captures meal satisfaction scores and dining comments.

| Column Name | Data Type | Constraints | Description |
| :--- | :--- | :--- | :--- |
| `id` | `INTEGER` | `PRIMARY KEY AUTOINCREMENT` | Unique review ID. |
| `student_id` | `INTEGER` | `FOREIGN KEY REFERENCES users(id)`| Resident submitting feedback. |
| `rating` | `INTEGER` | `NOT NULL, CHECK(rating BETWEEN 1 AND 5)`| 5-star score. |
| `comment` | `TEXT` | `NULLABLE` | Qualitative dining remarks. |
| `meal_type` | `TEXT` | `NOT NULL` | Category: `Breakfast`, `Lunch`, or `Dinner`. |
| `created_at` | `TIMESTAMP` | `DEFAULT CURRENT_TIMESTAMP` | Review submission timestamp. |

---

## ⚡ Core SQL Queries & Logic (Beginner Friendly)

All SQL operations in `models.py` utilize parameterized tuples `(?, ?)` to eliminate SQL injection vulnerabilities.

### 1. User Authentication (Login Lookup)
```sql
SELECT * FROM users WHERE username = ?;
```

### 2. Admin Dashboard Aggregations
To power the executive counters efficiently:
```sql
-- Total Students
SELECT COUNT(*) as count FROM users WHERE role = 'student';

-- Open Complaints
SELECT COUNT(*) as count FROM complaints WHERE status != 'Resolved';

-- Today's Visitors
SELECT COUNT(*) as count FROM visitors WHERE date(entry_time) = date('now');

-- Total Outstanding Fees
SELECT COALESCE(SUM(fees_due), 0) as total FROM users WHERE role = 'student';
```

### 3. Relational Joins for Admin Views
Joining foreign keys to fetch student names and room numbers alongside records:

#### Complaints with Student Info:
```sql
SELECT c.*, u.name as student_name, u.room_number
FROM complaints c
JOIN users u ON c.student_id = u.id
ORDER BY c.created_at DESC;
```

#### Visitors with Host Student Info:
```sql
SELECT v.*, u.name as student_name, u.room_number
FROM visitors v
JOIN users u ON v.student_id = u.id
ORDER BY v.entry_time DESC;
```

### 4. Analytics Data for Chart.js
Grouping and aggregating for chart visualizers:

#### Grievance Status Distribution:
```sql
SELECT status, COUNT(*) as count FROM complaints GROUP BY status;
```

#### Average Mess Rating by Meal Type:
```sql
SELECT meal_type, ROUND(AVG(rating), 1) as avg_rating, COUNT(*) as count 
FROM mess_feedback 
GROUP BY meal_type;
```
