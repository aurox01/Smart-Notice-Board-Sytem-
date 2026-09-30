# 📢 Enterprise Notice Board

A **real-time digital notice board system** designed for organizations, colleges, universities, and enterprises to publish and display important announcements through a centralized web application.

The system provides separate interfaces for **administrators** and **users**, allowing administrators to create and remove notices while connected users receive updates in real time without manually refreshing the page.

---

## 🚀 Features

### 👨‍💼 Admin Panel

* Create and publish new notices
* Add notice title and content
* Specify author
* Select department
* Set notice priority
* Delete/deactivate existing notices
* Manage announcements from a centralized interface

### 🖥️ Digital Notice Display

* Displays active notices
* Automatically receives newly published notices
* Real-time updates without page refresh
* Shows notice information such as:

  * Title
  * Content
  * Author
  * Department
  * Priority
  * Creation time

### ⚡ Real-Time Communication

The application uses **Socket.IO** to broadcast notice updates to connected clients.

When an administrator creates or deletes a notice, connected display clients are notified immediately.

### 🔌 REST API

The backend provides RESTful API endpoints for managing notices.

### 📱 Responsive Web Interface

The frontend is designed to work as a digital display as well as a normal web application.

---

# 🏗️ System Architecture

```text
                    ┌─────────────────────┐
                    │     Administrator   │
                    │     Admin Panel     │
                    └──────────┬──────────┘
                               │
                               │ HTTP Request
                               ▼
                    ┌─────────────────────┐
                    │   Node.js Server    │
                    │      Express.js     │
                    └──────────┬──────────┘
                               │
                 ┌─────────────┴─────────────┐
                 │                           │
                 ▼                           ▼
        ┌─────────────────┐        ┌─────────────────┐
        │    REST API     │        │    Socket.IO    │
        │ /api/notices    │        │ Real-Time Event │
        └────────┬────────┘        └────────┬────────┘
                 │                          │
                 ▼                          ▼
        ┌─────────────────┐        ┌─────────────────┐
        │ In-Memory Store │        │ Connected Users │
        │     Notices     │        │ Digital Display │
        └─────────────────┘        └─────────────────┘
```

---

# 🛠️ Technology Stack

| Technology     | Purpose                         |
| -------------- | ------------------------------- |
| **HTML5**      | Structure of web pages          |
| **CSS3**       | Styling and responsive UI       |
| **JavaScript** | Frontend functionality          |
| **Node.js**    | Backend runtime                 |
| **Express.js** | Web server and REST API         |
| **Socket.IO**  | Real-time communication         |
| **CORS**       | Cross-origin request handling   |
| **Nodemon**    | Development server auto-restart |

---

# 📂 Project Structure

```text
enterprise-notice-board/
│
├── public/
│   ├── admin.html
│   ├── display.html
│   └── ...
│
├── server.js
├── package.json
├── package-lock.json
├── .gitignore
└── README.md
```

### Important Files

#### `server.js`

Contains the backend application, REST API routes, Socket.IO configuration, notice management logic, and HTTP server.

#### `public/admin.html`

Provides the administrator interface for creating and deleting notices.

#### `public/display.html`

Provides the digital notice board interface where users can view active announcements.

#### `package.json`

Contains project metadata, dependencies, and npm
