from pathlib import Path
from typing import Optional
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel

BASE_DIR = Path(__file__).resolve().parent
STATIC_DIR = BASE_DIR / "static"

app = FastAPI(
    title="Todo API",
    description="A simple, fast, and elegant Todo API built with FastAPI.",
    version="1.0.0",
)

# Enable CORS for cross-origin requests
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

todos = []


# Todo Model
class Todo(BaseModel):
    ID: Optional[int] = None
    title: str
    completed: bool = False


# Frontend Route
@app.get("/", response_class=FileResponse)
def serve_frontend():
    return FileResponse(STATIC_DIR / "index.html")


# Create Todo
@app.post("/todos")
def create_todo(todo: Todo):
    if todo.ID is None:
        todo.ID = max([t.ID for t in todos if t.ID is not None], default=0) + 1
    todos.append(todo)
    return {
        "message": "Todo added successfully",
        "data": todo,
    }


# Get All Todos
@app.get("/todos")
def get_todos():
    return todos


# Single Data Get
@app.get("/todos/{todo_id}")
def get_todo(todo_id: int):
    for todo in todos:
        if todo.ID == todo_id:
            return todo
    return {"Error": "Todo not found"}


# Update Existing Todo
@app.put("/todos/{todo_id}")
def update_todo(todo_id: int, updated_todo: Todo):
    for index, todo in enumerate(todos):
        if todo.ID == todo_id:
            if updated_todo.ID is None:
                updated_todo.ID = todo_id
            todos[index] = updated_todo
            return {
                "Message": "Todo updated successfully",
                "data": updated_todo,
            }
    return {"Error": "Todo not found"}


# Delete Todo
@app.delete("/todos/{todo_id}")
def Delete_todo(todo_id: int):
    for index, todo in enumerate(todos):
        if todo.ID == todo_id:
            todos.pop(index)
            return {"Message": "Data Deleted"}
    return {"Error": "Data Not Found"}


# Mount static assets
if STATIC_DIR.exists():
    app.mount("/static", StaticFiles(directory=STATIC_DIR), name="static")
