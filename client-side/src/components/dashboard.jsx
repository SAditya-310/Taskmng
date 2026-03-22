import React, { useState } from "react";
import { useEffect } from "react";
import "./dashboard.css";
function Dashboard() {
  const [showModal, setShowModal] = useState(false);
  const [tasks, setTasks] = useState([]);
  const [status, setStatus] = useState("all");
  const [page, setPage] = useState(1);
  const tasksPerPage = 6;
  const [formData, setFormData] = useState({
    title: "",
    date: "",
    time: "",
    priority: 0,
  });
  const token = localStorage.getItem("token");
  const totalPages = Math.max(1, Math.ceil(tasks.length / tasksPerPage));
  const startIndex = (page - 1) * tasksPerPage;
  const paginatedTasks = tasks.slice(startIndex, startIndex + tasksPerPage);

  useEffect(() => {
    if (page > totalPages) {
      setPage(totalPages);
    }
  }, [page, totalPages]);

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };
  useEffect(() => {
    const gettask = async () => {
      try {
        const fet = await fetch(`http://localhost:5000/gettask?status=${status}`, {
          method: "GET",
          headers: { "Content-Type": "application/json", "token": token },
        });
        if (fet.ok) {
          const data = await fet.json();
          setTasks(data);
        } else {
          console.error("Failed to fetch tasks");
        }
      } catch (err) {
        console.error("Error fetching tasks:", err);
      }
    }
    checktask();
    gettask();
  }, [status]);
  const checktask = async () => {
    try {
      const res = await fetch("http://localhost:5000/getoverdue", {
        method: "GET",
        headers: { "Content-Type": "application/json", "token": token },
      });

      if (res.ok) {
        console.log("Overdue tasks updated");
      } else {
        console.error("Failed to update overdue tasks");
      }
    } catch (err) {
      console.error("Error checking overdue tasks:", err);
    }
  }
  const addtask = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch("http://localhost:5000/addtask", {
        method: "POST",
        headers: { "Content-Type": "application/json", "token": token },
        body: JSON.stringify(formData)
      });
      const data = await res.json();
      if (res.ok) {
        setTasks([...tasks, data]);
        setShowModal(false);
        setFormData({ title: "", date: "", time: "", priority: 0 });
        alert("Task added successfully!");
      } else {
        alert(data.message || data.errors?.[0]?.msg || "Error adding task");
      }
    } catch (err) {
      console.log(err);
      alert("Error connecting to server");
    }
  };

  const markDone = async (taskId) => {
    try {
      const res = await fetch(`http://localhost:5000/mark/${taskId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json", "token": token }
      });
      if (res.ok) {
        const updatedTask = await res.json();
        setTasks(tasks.map(task => task._id == taskId ? updatedTask.task : task));
        const msg = updatedTask.message;
        alert(msg);
      } else {
        const data = await res.json();
        alert(data.message || "Error marking task as done");
      }
    } catch (err) {
      console.log(err);
      alert("Error connecting to server");
    }
  };

  const deleteTask = async (taskId) => {
    const shouldDelete = window.confirm("Are you sure you want to discard this task?");
    if (!shouldDelete) return;

    try {
      const res = await fetch(`http://localhost:5000/task/${taskId}`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json", "token": token }
      });

      const data = await res.json();
      if (res.ok) {
        setTasks(tasks.filter(task => task._id !== taskId));
        alert(data.message || "Task discarded successfully");
      } else {
        alert(data.message || "Error deleting task");
      }
    } catch (err) {
      console.log(err);
      alert("Error connecting to server");
    }
  };

  return (
    <div className="home-wrapper">
      <header className="dashboard-header">
        <div className="header-text-group">
          <h1 className="section-title">Schedule Overview</h1>
          <p className="section-subtitle">You have {tasks.length} tasks scheduled.</p>
        </div>

        <div className="header-actions">
          {/* Filter Menu */}
          <div className="filter-wrapper">
            <div className="filter-icon-box">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="18" height="18" fill={status=="all"?"none": "#0ea5e9"} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M8.85746 12.5061C6.36901 10.6456 4.59564 8.59915 3.62734 7.44867C3.3276 7.09253 3.22938 6.8319 3.17033 6.3728C2.96811 4.8008 2.86701 4.0148 3.32795 3.5074C3.7889 3 4.60404 3 6.23433 3H17.7657C19.396 3 20.2111 3 20.672 3.5074C21.133 4.0148 21.0319 4.8008 20.8297 6.37281C20.7706 6.83191 20.6724 7.09254 20.3726 7.44867C19.403 8.60062 17.6261 10.6507 15.1326 12.5135C14.907 12.6821 14.7583 12.9567 14.7307 13.2614C14.4837 15.992 14.2559 17.4876 14.1141 18.2442C13.8853 19.4657 12.1532 20.2006 11.226 20.8563C10.6741 21.2466 10.0043 20.782 9.93278 20.1778C9.79643 19.0261 9.53961 16.6864 9.25927 13.2614C9.23409 12.9539 9.08486 12.6761 8.85746 12.5061Z" />
              </svg>
            </div>
            <select
              className="filter-dropdown"
              value={status}
              onChange={(e) => setStatus(e.target.value)}
            >
              <option value="all">All Tasks</option>
              <option value="pending">Pending</option>
              <option value="completed">Completed</option>
              <option value="overdue">Overdue</option>
            </select>
          </div>

          {/* New Task Button */}
          <button className="add-task-btn" onClick={() => setShowModal(true)}>
            + New Task
          </button>
        </div>
      </header>
      <div className="task-list-container">
        <div className="list-header">
          <span>Task Detail</span>
          <span>Due Date/Done At</span>
          <span>Status</span>
          <span>Action</span>
        </div>
        {paginatedTasks.map((task) => (
          <div key={task._id} className="task-row-item">
            <div className="task-main-info">
              <div className={`category-dot ${(task.category || 'general').toLowerCase()}`}></div>
              <div>
                <div className="task-name-text">{task.title}</div>
              </div>
            </div>
            <div className="task-date">
              {task.status === "completed"
                ? task.doneAt
                : (task.deadline ? new Date(task.deadline).toISOString().split('T')[0] : "N/A")
              }
              <span className="time-text">
                @{task.status === "completed" ? (task.doneTime || "00:00") : (task.time || "00:00")}
              </span>
            </div>
            <div>
              <span className={`priority-badge ${task.status === "completed" ? 'low' : 'high'}`}>
                {task.status}
              </span>
            </div>
            <div className="action-buttons">
              <button
                className="done-action-btn"
                onClick={() => markDone(task._id)}
                disabled={task.status === "completed" || task.status === "overdue"}
                style={{
                  opacity: task.status === "completed" || task.status === "overdue" ? 0.5 : 1,
                  cursor: task.status === "completed" || task.status === "overdue" ? 'not-allowed' : 'pointer'
                }}
              >
                {task.status === "completed" ? "✓ Completed" : "Mark Done"}
              </button>
              <button
                className="discard-action-btn"
                onClick={() => deleteTask(task._id)}
              >
                Discard
              </button>
            </div>
          </div>
        ))}
      </div>

      <div className="dashboard-pagination">
        <button
          className="page-btn"
          onClick={() => setPage((prev) => Math.max(1, prev - 1))}
          disabled={page === 1}
        >
          Prev
        </button>
        <span className="page-indicator">Page {page} of {totalPages}</span>
        <button
          className="page-btn"
          onClick={() => setPage((prev) => Math.min(totalPages, prev + 1))}
          disabled={page === totalPages}
        >
          Next
        </button>
      </div>

      {showModal && (
        <div className="modal-overlay">
          <div className="modal-box">
            <div className="modal-header">
              <h3>Create New Task</h3>
              <button className="close-btn" onClick={() => setShowModal(false)}>×</button>
            </div>

            <form onSubmit={addtask}>
              <div className="modal-body">
                <div className="input-field">
                  <label>Task Title</label>
                  <input name="title" type="text" value={formData.title} onChange={handleInputChange} placeholder="e.g., Study Java Generics" required />
                </div>

                <div className="input-row">
                  <div className="input-field">
                    <label>Due Date</label>
                    <input name="date" type="date" value={formData.date} onChange={handleInputChange} required />
                  </div>
                  <div className="input-field">
                    <label>Time</label>
                    <input name="time" type="time" value={formData.time} onChange={handleInputChange} />
                  </div>
                </div>

                <div className="input-field">
                  <label>Importance / Priority on a scale of 10</label>
                  <input name="priority" type="number" min="1" max="10" value={formData.priority} onChange={handleInputChange} required />
                </div>
              </div>

              <div className="modal-footer">
                <button type="button" className="cancel-btn" onClick={() => setShowModal(false)}>Cancel</button>
                <button type="submit" className="create-btn">Add to Schedule</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default Dashboard;