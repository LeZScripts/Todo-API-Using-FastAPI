# 📝 Todo API & Dashboard Using FastAPI

A fast, lightweight, and modern Todo application built with **FastAPI** on the backend and a clean, responsive single-page web dashboard on the frontend.

---

## ✨ Features

- **⚡ High-Performance REST API**: Built using [FastAPI](https://fastapi.tiangolo.com/) with asynchronous endpoint support and data validation via Pydantic.
- **🎨 Interactive Web Dashboard**:
  - **Live Task Management**: Add, update, toggle completion, and delete tasks.
  - **Live Progress & Stats**: Instant counters for Total, Pending, and Completed tasks with a visual progress bar.
  - **Search & Filters**: Search tasks by title or ID; filter easily by All, Pending, or Completed.
  - **Inline Editing**: Quickly rename tasks or edit completion status via a clean modal interface.
  - **Toast Notifications**: Smooth visual feedback for all user actions.
  - **Responsive Design**: Beautiful typography, fluid transitions, and mobile-friendly layout.
- **📖 Auto-Generated Documentation**: Instant Swagger UI (`/docs`) and ReDoc (`/redoc`) API explorers.
- **🌐 CORS Enabled**: Cross-Origin Resource Sharing enabled for both local and decoupled frontend setups.

---

## 📁 Project Structure

```text
Todo API Using FastAPI/
├── main.py              # FastAPI application, data models, and REST endpoints
├── static/
│   ├── index.html       # Web dashboard markup
│   ├── style.css        # Responsive CSS styling and design system
│   └── app.js           # Frontend state management & fetch API calls
├── requirements.txt     # Python dependencies
├── .gitignore           # Git ignore configurations
└── README.md            # Project documentation
```

---

## 🚀 Getting Started

### 1. Prerequisites

Ensure you have **Python 3.8+** installed on your system.

### 2. Clone and Setup Environment

```bash
# Clone the repository (if applicable) or navigate to project directory
cd "Todo API Using FastAPI"

# Create a virtual environment
python3 -m venv venv

# Activate the virtual environment
# On Linux/macOS:
source venv/bin/activate
# On Windows:
# venv\Scripts\activate
```

### 3. Install Dependencies

```bash
pip install -r requirements.txt
```

### 4. Run the Server

Start the development server with auto-reload:

```bash
uvicorn main:app --reload
```

The application will be running at:
- **Web Dashboard**: [http://127.0.0.1:8000](http://127.0.0.1:8000)
- **Interactive Swagger Docs**: [http://127.0.0.1:8000/docs](http://127.0.0.1:8000/docs)
- **Alternative ReDoc**: [http://127.0.0.1:8000/redoc](http://127.0.0.1:8000/redoc)

---

## 📡 API Reference

| Method | Endpoint | Description | Request Body Example |
| :--- | :--- | :--- | :--- |
| `GET` | `/` | Serves the web frontend dashboard | _None_ |
| `GET` | `/todos` | Retrieve all todo items | _None_ |
| `GET` | `/todos/{todo_id}` | Retrieve a specific todo item by ID | _None_ |
| `POST` | `/todos` | Create a new todo item | `{"title": "Buy groceries", "completed": false}` |
| `PUT` | `/todos/{todo_id}` | Update an existing todo item | `{"title": "Buy groceries and cook", "completed": true}` |
| `DELETE` | `/todos/{todo_id}` | Delete a todo item by ID | _None_ |

> **Note**: For `POST /todos`, the `ID` is optional. If omitted, the backend automatically increments and assigns the next available ID.

---

## 💻 Example API Usage (cURL)

### Add a New Task
```bash
curl -X POST "http://127.0.0.1:8000/todos" \
     -H "Content-Type: application/json" \
     -d '{"title": "Complete FastAPI project"}'
```

### List All Tasks
```bash
curl -X GET "http://127.0.0.1:8000/todos"
```

### Update a Task
```bash
curl -X PUT "http://127.0.0.1:8000/todos/1" \
     -H "Content-Type: application/json" \
     -d '{"title": "Complete FastAPI project", "completed": true}'
```

### Delete a Task
```bash
curl -X DELETE "http://127.0.0.1:8000/todos/1"
```

---

## 🛠️ Tech Stack

- **Backend**: [FastAPI](https://fastapi.tiangolo.com/), [Pydantic](https://docs.pydantic.dev/), [Starlette](https://www.starlette.io/), [Uvicorn](https://www.uvicorn.org/)
- **Frontend**: HTML5, Modern CSS3 (CSS Variables, Flexbox/Grid), Vanilla JavaScript (ES6+ Fetch API)
- **Docs**: Swagger UI / OpenAPI 3.0
# Todo-API-Using-FastAPI
