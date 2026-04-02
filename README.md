# 🎓 EduManage — Full-Stack Student Management System

A complete, production-ready student management system built with React, Node.js, Express, and MongoDB.

---

## 📁 Project Structure

```
student-management-system/
├── package.json                  ← Root (run both servers together)
│
├── backend/
│   ├── server.js                 ← Entry point
│   ├── package.json
│   ├── .env.example              ← Copy to .env and fill in values
│   ├── config/
│   │   └── seed.js               ← Demo data seeder
│   ├── models/
│   │   ├── User.js
│   │   ├── Student.js
│   │   ├── Teacher.js
│   │   ├── Course.js
│   │   ├── Attendance.js
│   │   └── Grade.js
│   ├── controllers/
│   │   ├── auth.controller.js
│   │   ├── student.controller.js
│   │   ├── teacher.controller.js
│   │   ├── course.controller.js
│   │   ├── attendance.controller.js
│   │   ├── grade.controller.js
│   │   └── dashboard.controller.js
│   ├── routes/
│   │   ├── auth.routes.js
│   │   ├── student.routes.js
│   │   ├── teacher.routes.js
│   │   ├── course.routes.js
│   │   ├── attendance.routes.js
│   │   ├── grade.routes.js
│   │   └── dashboard.routes.js
│   └── middleware/
│       └── auth.middleware.js
│
└── frontend/
    ├── package.json
    ├── tailwind.config.js
    ├── .env.example
    ├── public/
    │   └── index.html
    └── src/
        ├── App.js                ← Router & protected routes
        ├── index.js
        ├── context/
        │   ├── AuthContext.js    ← Global auth state
        │   └── ThemeContext.js   ← Dark mode
        ├── services/
        │   └── api.js            ← All API calls (Axios)
        ├── styles/
        │   └── index.css         ← Tailwind + custom classes
        ├── components/
        │   └── common/
        │       ├── Layout.js
        │       ├── Sidebar.js
        │       ├── Navbar.js
        │       ├── Modal.js
        │       └── LoadingSpinner.js
        └── pages/
            ├── LoginPage.js
            ├── RegisterPage.js
            ├── DashboardPage.js  ← Bento grid with charts
            ├── StudentsPage.js   ← Full CRUD + pagination + search
            ├── TeachersPage.js   ← Full CRUD + pagination
            ├── CoursesPage.js    ← Card grid + filters
            ├── AttendancePage.js ← Mark/view attendance
            ├── GradesPage.js     ← Upload/view grades
            └── ProfilePage.js    ← Profile + change password
```

---

## ⚙️ Prerequisites

Make sure you have these installed:

| Tool       | Version  | Download |
|------------|----------|----------|
| Node.js    | v18+     | https://nodejs.org |
| npm        | v9+      | Included with Node.js |
| MongoDB    | v6+      | https://mongodb.com or use Atlas |

---

## 🚀 Setup Instructions (Step by Step)

### Step 1 — Clone / Download the project

```bash
cd student-management-system
```

### Step 2 — Set up the Backend

```bash
# Enter backend folder
cd backend

# Install dependencies
npm install

# Copy environment file
cp .env.example .env
```

Now open `backend/.env` and set your values:

```env
MONGO_URI=mongodb://localhost:27017/student_management
JWT_SECRET=replace_this_with_a_long_random_string_abc123xyz
PORT=5000
NODE_ENV=development
```

> 💡 **MongoDB Atlas (cloud):** If you don't have MongoDB installed locally, use a free Atlas cluster:
> 1. Go to https://cloud.mongodb.com
> 2. Create a free cluster
> 3. Get your connection string and paste it as `MONGO_URI`

### Step 3 — Seed Demo Data

```bash
# Still in the backend folder
npm run seed
```

This creates demo accounts:

| Role    | Email                | Password     |
|---------|----------------------|--------------|
| Admin   | admin@school.com     | Admin@123    |
| Teacher | sarah@school.com     | Teacher@123  |
| Student | alice@student.com    | Student@123  |

### Step 4 — Set up the Frontend

```bash
# Go to frontend folder
cd ../frontend

# Install dependencies
npm install

# Copy environment file
cp .env.example .env
```

The frontend `.env` should contain:
```env
REACT_APP_API_URL=http://localhost:5000/api
```

### Step 5 — Run the Application

**Option A: Run both together (from root folder)**
```bash
# Go back to root
cd ..

# Install concurrently
npm install

# Start both servers
npm run dev
```

**Option B: Run separately**
```bash
# Terminal 1 — Backend
cd backend && npm run dev

# Terminal 2 — Frontend
cd frontend && npm start
```

### Step 6 — Open in Browser

```
Frontend:  http://localhost:3000
Backend:   http://localhost:5000/api/health
```

---

## 🔌 API Reference

### Authentication
| Method | Endpoint               | Access  | Description         |
|--------|------------------------|---------|---------------------|
| POST   | /api/auth/register     | Public  | Register new user   |
| POST   | /api/auth/login        | Public  | Login & get token   |
| GET    | /api/auth/me           | Private | Get current user    |
| PUT    | /api/auth/change-password | Private | Change password  |

### Students
| Method | Endpoint               | Access          | Description         |
|--------|------------------------|-----------------|---------------------|
| GET    | /api/students          | Admin, Teacher  | List all students   |
| GET    | /api/students/:id      | Private         | Get one student     |
| POST   | /api/students          | Admin           | Create student      |
| PUT    | /api/students/:id      | Admin           | Update student      |
| DELETE | /api/students/:id      | Admin           | Delete student      |

### Teachers
| Method | Endpoint               | Access | Description         |
|--------|------------------------|--------|---------------------|
| GET    | /api/teachers          | Admin  | List all teachers   |
| POST   | /api/teachers          | Admin  | Create teacher      |
| PUT    | /api/teachers/:id      | Admin  | Update teacher      |
| DELETE | /api/teachers/:id      | Admin  | Delete teacher      |

### Courses
| Method | Endpoint               | Access          | Description         |
|--------|------------------------|-----------------|---------------------|
| GET    | /api/courses           | Private         | List all courses    |
| POST   | /api/courses           | Admin           | Create course       |
| PUT    | /api/courses/:id       | Admin           | Update course       |
| DELETE | /api/courses/:id       | Admin           | Delete course       |
| POST   | /api/courses/:id/enroll | Admin, Teacher | Enroll student      |

### Attendance
| Method | Endpoint                    | Access          | Description              |
|--------|-----------------------------|-----------------|--------------------------|
| POST   | /api/attendance             | Admin, Teacher  | Mark attendance          |
| GET    | /api/attendance/:studentId  | Private         | Get student attendance   |
| GET    | /api/attendance/course/:id  | Admin, Teacher  | Get course attendance    |

### Grades
| Method | Endpoint                  | Access          | Description         |
|--------|---------------------------|-----------------|---------------------|
| POST   | /api/grades               | Admin, Teacher  | Upload grades       |
| GET    | /api/grades/:studentId    | Private         | Get student grades  |
| GET    | /api/grades/course/:id    | Admin, Teacher  | Get course grades   |

### Dashboard
| Method | Endpoint              | Access  | Description          |
|--------|-----------------------|---------|----------------------|
| GET    | /api/dashboard/stats  | Admin   | Admin analytics      |
| GET    | /api/dashboard/teacher| Teacher | Teacher dashboard    |
| GET    | /api/dashboard/student| Student | Student dashboard    |

---

## 🎨 Features Overview

### Admin Dashboard
- Bento grid with stat cards (Students, Teachers, Courses, Attendance %)
- Bar chart: monthly enrollment trends
- Pie chart: grade distribution
- Recent students list
- Quick action links

### Students Management
- Full CRUD with modal forms
- Pagination (8 per page)
- Search by name, email, or student ID
- Filter by year / department
- Attendance progress bars
- Color-coded year badges

### Teachers Management
- Full CRUD with modal forms
- Search functionality
- Department color-coding
- Course assignment count

### Courses
- Card grid layout
- Enrollment progress bar
- Filter by semester
- Teacher assignment
- Capacity tracking

### Attendance
- **Teachers:** Select course + date → mark each student as Present/Absent/Late/Excused → Save
- **Students:** View own attendance history with summary stats

### Grades
- **Teachers:** Select course + student → enter assessments with weights → auto-calculate final grade + letter grade + GPA points
- **Students:** View full grade report with GPA, letter grades, progress bars

---

## 🛠️ Common Issues & Solutions

**MongoDB connection refused:**
- Make sure MongoDB is running: `mongod --dbpath /data/db`
- Or use MongoDB Atlas (cloud) — easier for beginners

**Port already in use:**
```bash
# Kill process on port 5000
npx kill-port 5000
# Kill process on port 3000
npx kill-port 3000
```

**`npm install` fails:**
- Make sure Node.js v18+ is installed: `node --version`
- Try deleting `node_modules` and `package-lock.json`, then re-run `npm install`

**CORS error in browser:**
- Make sure backend is running on port 5000
- Make sure `REACT_APP_API_URL` in frontend `.env` is correct
- Restart both servers after changing `.env` files

---

## 🌙 Dark Mode

Click the moon icon in the top-right navbar to toggle dark mode. The preference is saved to localStorage.

---

## 📦 Tech Stack Summary

| Layer      | Technology              |
|------------|-------------------------|
| Frontend   | React 18, React Router 6 |
| Styling    | Tailwind CSS            |
| Charts     | Recharts                |
| Icons      | Lucide React            |
| HTTP       | Axios                   |
| Backend    | Node.js, Express.js     |
| Database   | MongoDB, Mongoose       |
| Auth       | JWT (jsonwebtoken)      |
| Passwords  | bcryptjs                |
| Dev Tools  | nodemon, concurrently   |

---

Built with ❤️ for students, teachers, and administrators.
#   E d u M a n a g e  
 