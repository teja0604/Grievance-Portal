# Smart Campus Grievance Portal

A modern web-based grievance management platform designed for educational institutions to streamline complaint submission, tracking, assignment, and resolution through a secure role-based workflow.

---

## Overview

Smart Campus Grievance Portal enables students to raise complaints and track their status while allowing administrators and staff to efficiently manage, assign, and resolve grievances.

The platform promotes transparency, accountability, and faster issue resolution through a centralized complaint management system.

---

## Features

### Student Features

* Secure authentication and authorization
* Register and login functionality
* Submit grievances with category and description
* Track complaint status in real-time
* View complaint history
* Receive updates on complaint progress
* Dashboard with complaint statistics

### Administrator Features

* Manage all complaints
* View complaint details
* Assign complaints to responsible staff
* Update complaint status
* Monitor complaint resolution workflow
* View analytics and reports
* Manage users and categories

### System Features

* Role-Based Access Control (RBAC)
* JWT Authentication
* Secure API architecture
* Responsive user interface
* Real-time complaint tracking
* RESTful API design
* PostgreSQL database integration
* Cloud database support using Neon

---

## Tech Stack

### Frontend

* React.js
* JavaScript
* HTML5
* CSS3
* Axios
* React Router

### Backend

* Node.js
* Express.js

### Database

* PostgreSQL
* Neon Database (Cloud PostgreSQL)

### Authentication

* JSON Web Token (JWT)
* Password Hashing

### Version Control

* Git
* GitHub

---

## Project Structure

```text
Campus_Complaint_System/
│
├── client/
│   ├── src/
│   ├── public/
│   └── package.json
│
├── server/
│   ├── controllers/
│   ├── routes/
│   ├── middleware/
│   ├── models/
│   └── package.json
│
├── README.md
└── .gitignore
```

---

## Installation

### Prerequisites

Install the following software:

* Node.js (v18 or later)
* Git
* PostgreSQL or Neon Database Account

---

## Clone Repository

```bash
git clone https://github.com/teja0604/Grievance-Portal.git

cd Grievance-Portal
```

---

## Install Dependencies

### Frontend

```bash
cd client

npm install
```

### Backend

```bash
cd server

npm install
```

---

## Environment Variables

Create a `.env` file inside the server folder.

```env
PORT=5000

DATABASE_URL=your_neon_postgresql_connection_string

JWT_SECRET=your_jwt_secret_key
```

Example:

```env
PORT=5000

DATABASE_URL=postgresql://username:password@host.neon.tech/database

JWT_SECRET=mysecretkey
```

---

## Run Backend

```bash
cd server

npm run dev
```

Backend will start at:

```text
http://localhost:5000
```

---

## Run Frontend

Open another terminal:

```bash
cd client

npm start
```

Frontend will start at:

```text
http://localhost:3000
```

---

## Database Setup

### Neon PostgreSQL

1. Create a Neon account.
2. Create a new project.
3. Copy the connection string.
4. Add the connection string to the `.env` file.
5. Start the backend server.

---

## Authentication Flow

```text
User Login
      ↓
JWT Token Generated
      ↓
Token Stored
      ↓
Protected Routes Access
      ↓
Role-Based Authorization
```

---

## Complaint Workflow

```text
Student Creates Complaint
           ↓
Complaint Submitted
           ↓
Admin Reviews Complaint
           ↓
Complaint Assigned
           ↓
Status Updated
           ↓
Issue Resolved
           ↓
Complaint Closed
```

---

## Security Features

* Password Hashing
* JWT Authentication
* Protected API Routes
* Input Validation
* Error Handling
* Role-Based Authorization

---

## Future Enhancements

* Email Notifications
* SMS Alerts
* Complaint Attachments
* Real-Time Notifications
* AI-Based Complaint Categorization
* Analytics Dashboard
* Mobile Application Support

---

## Contributors

Developed and maintained by:

**Krishna Teja**

GitHub: https://github.com/teja0604

---

## License

This project is developed for educational and academic purposes.

---

## Acknowledgement

This project was developed to improve grievance handling and communication between students and institutional authorities through a centralized digital platform.
