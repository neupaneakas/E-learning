# E-Learning Project - Code Documentation

This document explains the structure and functionality of the E-learning project code, including the backend API, frontend logic, and the automation scripts used for version control.

## 1. Project Structure Overview

The project is a full-stack web application with a Node.js/Express backend and a vanilla HTML/JS frontend.

```
D:\Nursery\New project\
├── backend/            # Server-side code
│   └── server.js      # Main Express server and API endpoints
├── data/              # JSON database files
│   ├── courses.json   # Course inventory
│   ├── users.json     # User accounts
│   └── user-courses.json # Enrollments and progress
├── js/                # Frontend logic
│   ├── api.js         # API wrapper functions
│   └── auth.js        # Authentication handling
├── pages/             # HTML pages
│   ├── about.html
│   ├── courses.html
│   ├── profile.html
│   └── ...
├── index.html         # Homepage
├── style.css          # Main stylesheet
└── auto_commit.ps1    # Git automation script
```

## 2. Automation Script (`auto_commit.ps1`)

This PowerShell script was created to automate the process of committing files one by one with a time delay, mimicking a staggered development timeline.

### How it works:
1. **Checks Git Status**: It runs `git status` to find all modified or untracked files.
2. **Filters List**: It excludes itself (`auto_commit.ps1`) and processes valid paths.
3. **Loop**: It iterates through every file found.
4. **Action**:
   - `git add <file>`: Stages the specific file.
   - `git commit`: Commits just that file with a message like "Update filename.ext".
   - `git push`: Immediately pushes the change to GitHub.
5. **Delay**: If there are more files, it waits **5 minutes** (`Start-Sleep -Seconds 300`) before processing the next one.

**Usage:**
Run in PowerShell:
```powershell
.\auto_commit.ps1
```

## 3. Backend Logic (`backend/server.js`)

The backend is built with **Express.js** and uses a file-based JSON database system (NoSQL-style).

### Key Features:
- **Middleware**: Uses `cors` for cross-origin requests and `express.json` for parsing request bodies.
- **Database**: 
  - `loadCourses()`, `loadUsers()`: Helper functions to read from JSON files in the `data/` directory.
  - `saveUsers()`: Writes updates back to the JSON files.
- **API Endpoints**:
  - `GET /api/courses`: Returns list of courses with filtering.
  - `POST /api/auth/login`: Validates credentials against `users.json`.
  - `POST /api/enroll/:courseId`: Enrolls a user in a course by updating `user-courses.json`.

## 4. Frontend Logic (`js/api.js`)

This file acts as the bridge between the HTML pages and the Backend API.

### `const API` Object:
This object contains async methods that handle `fetch` requests:
- `getCourses(category, search)`: Calls the backend to get filtered courses.
- `submitInstructorApplication(formData)`: Sends form data to the registration endpoint.
- `getCourse(id)`: Fetches details for a specific course.

### `const Utils` Object:
Helper functions for UI tasks:
- `formatPrice(price)`: Formats numbers as Nepali currency (e.g., "रू 1,000").
- `generateStars(rating)`: Creates star rating HTML (★/☆).

## 5. How to view this validation
Since this is a Markdown file, you can view it directly in VS Code. To create a PDF:
1. Open this file in VS Code.
2. Press `Ctrl + Shift + P`.
3. Type "Markdown: Open Preview".
4. Right-click the preview and select "Print" -> "Save as PDF".
