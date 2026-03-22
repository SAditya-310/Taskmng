import React, { useEffect, useState } from "react";
import "./Home.css";
function Home() {
  const token = localStorage.getItem("token");
  console.log(token);
  const [task, setTask] = useState(null);
  const [refreshKey, setRefreshKey] = useState(0);
  const [comp, setComp] = useState([]);
  const [ak, setAk] = useState(false);
  const [count, setCount] = useState(0);
  const [cntpd, setCntpd] = useState(0);
  const fetchPriorityTask = async () => {
    try {
      const res = await fetch("http://localhost:5000/getprioritytask", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          "token": token
        }
      });
      if (!res.ok) throw new Error("Failed to fetch tasks");
      const data = await res.json();
      setCount(data.count);
      setCntpd(data.cntpd);
      setTask(data.task);
    } catch (err) {
      console.error("Error fetching priority task:", err);
      setTask(null);
    }
  };
  const toptwo = async () => {
    try {
      const res = await fetch("http://localhost:5000/getcompleted", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          "token": token
        }
      });
      if (!res.ok) throw new Error("Failed to fetch completed tasks");
      const data = await res.json();
      setComp(data);
    } catch (err) {
      console.error("Error fetching completed tasks:", err);
    }
  };
  useEffect(() => {
    fetchPriorityTask();
    toptwo();
  }, [refreshKey]);
  const markTaskDone = async () => {
    if (!task || !task._id) {
      alert("No task to mark as done");
      return;
    }
    try {
      const res = await fetch(`http://localhost:5000/mark/${task._id}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "token": token
        }
      });
      if (res.ok) {
        alert("Task completed!");
        setRefreshKey(prev => prev + 1);
      } else {
        const data = await res.json();
        alert(data.message || "Error marking task as done");
      }
    } catch (err) {
      console.error(err);
      alert("Error connecting to server");
    }
  };
  return (
    <div className="home-wrapper">
      <header className="header-group">
        <h1 className="section-title">Focus Dashboard</h1>
        <p className="section-subtitle">Systems active. Complete the high-impact task below.</p>
      </header>
      <section className="primary-card">
        <div className="task-action-row">
          <div className="task-info">
            <span className="primary-label">Current Priority</span>
            <h2 className="primary-task">{task ? task.title : "No tasks available"}</h2>
            <div style={{ marginTop: '4px', fontSize: '13px', color: '#64748b' }}>
              Yours Regular Tasks
            </div>
          </div>
          <div className="deadline-pill">
            <span style={{ fontSize: '16px' }}>⏳</span>
            Due {task ? task.deadline : "N/A"}, {task ? task.time : "N/A"}
          </div>
          <button className="primary-btn" onClick={markTaskDone} disabled={!task}>
            Mark as Done ✓
          </button>
        </div>
      </section>
      <div className="grid-row">
        <div className="small-card">
          <h5>⚡ Peak Productivity</h5>
          <p>You've completed {count} tasks in the last 24 hours.</p>
        </div>
        <div className="small-card">
          <h5>📚 Next in Queue</h5>
          <p>You have {cntpd!=0?cntpd:`No`} pending tasks to be finished.</p>
        </div>
      </div>
      <section className="recent-section">
        <h4 style={{ fontSize: '15px', color: '#64748b', marginBottom: '16px', fontWeight: '600' }}>
          Recently Completed Tasks
        </h4>
        {comp.length > 0 ? (
          <>
            <div className="recent-item">
              <span style={{ color: "#222", fontWeight: 600, fontSize: "16px", letterSpacing: "0.3px" }}>
                {comp[0]?.title}
              </span>
              <span className="status-tag">DONE</span>
            </div>
            {comp.length > 1 && (
              <div className="recent-item">
                <span style={{ color: "#222", fontWeight: 600, fontSize: "16px", letterSpacing: "0.3px" }}>
                  {comp[1]?.title}
                </span>
                <span className="status-tag">DONE</span>
              </div>
            )}
          </>
        ) : (
          <div className="recent-item" style={{ justifyContent: 'center', color: '#94a3b8' }}>
            No completed tasks yet. Complete your first task to see it here!
          </div>
        )}
      </section>
    </div>
  );
}
export default Home;