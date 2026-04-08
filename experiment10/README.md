# Experiment 10: Student Management Dashboard 🚀

An end-to-end full-stack robust Student Management Dashboard featuring real PHP APIs, role-based database connections, and real-time frontend synchronization.

## 🎯 Objectives
- Build a fully functional API using object-oriented PHP and PDO.
- Integrate CRUD operations (Create, Read, Update, Delete) into a single dashboard interface.
- Implement robust exception handling for database connections.
- Ensure cross-origin resource sharing (CORS) or properly scoped asynchronous requests using JS Fetch API.

## 🛠️ Tech Stack & Features
- **Frontend Core**: HTML5, Modern CSS Variables (Light/Dark Ready)
- **Client Logic**: Vanilla JavaScript (Async/Await & DOM manipulation)
- **Backend Core**: PHP (REST-like endpoints)
- **Database**: MySQL (using PDO for secure bindings)

## 🗂️ File Structure
- `index.html`: Main dashboard UI containing modal forms and the responsive data table.
- `style.css` / `script.js`: Associated aesthetic styling and frontend API communication.
- `config.php`: Central PDO database connection protocol holding backend credentials.
- `database.sql`: Schema definition file required to set up the DB locally or on phpMyAdmin.
- `insert.php`, `fetch.php`, `update.php`, `delete.php`: Dedicated REST endpoints processing JSON arrays and responding symmetrically.

## 🚀 How to Run Locally

1. **Prerequisite**: Ensure you have XAMPP, WAMP, or an equivalent local server running.
2. **Database Setup**:
   - Open phpMyAdmin (usually `http://localhost/phpmyadmin`).
   - Import the `database.sql` script to create the `student_management` database and the `students` table.
3. **Configure the Project**:
   - Ensure the repository is located inside your `htdocs` (XAMPP) or `www` (WAMP) path.
   - If your local MySQL setup has a root password, update `config.php` accordingly.
4. **Deploy**:
   - Navigate to `http://localhost/webtech_bishal/experiment10` in your web browser. 

## 🌐 Live Application

This project is officially deployed and live on a production cloud environment. 
You can view and interact with the live dashboard API here:
👉 **[https://student.gt.tc](https://student.gt.tc)**
