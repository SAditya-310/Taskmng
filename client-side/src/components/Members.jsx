import React,{ useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Loader from "./loader.jsx";
import "./dashboard.css";
// import { set } from "mongoose";
function Members() {
    const token = localStorage.getItem("token");
    const [mems, setMems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [page, setPage] = useState(1);
    const tasksPerPage = 6;    
    const totalPages = Math.max(1, Math.ceil(mems.length / tasksPerPage));
    const startIndex = (page - 1) * tasksPerPage;
    const paginatedTasks = mems.slice(startIndex, startIndex + tasksPerPage);
    const [formData, setFormData] = useState({
        name:"",
        email:"",
        password:""
    });
    function fetchMems() {
      fetch("http://localhost:5000/members", {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
                "token": token
            }
      })
      .then(res => {
        if(res.ok){
          return res.json();
        } else {
          alert("Error fetching members");
        }
      })
      .then(data => {
        if(data){
          setMems(data);
        }
      })
      .catch(err => {
        console.error("Error fetching members:", err);
        alert("Error fetching members");
      });
    }
    function addMem(e){
        e.preventDefault();
        fetch("http://localhost:5000/addmember", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "token": token
            },
            body: JSON.stringify(formData)
        })
        .then(res => {
            if (res.ok) {
                return res.json();
            } else {
                return res.json().then(data => { throw new Error(data.message || "Error adding member"); });
            }
        })
        .then(data => {
            if (data && data.message === "Member added successfully") {
                alert("Member added successfully");
                setShowModal(false);
                fetchMems();
                setFormData({ name: "", email: "", password: "" });
            } else {
                alert(data?.message || "Error adding member");
            }
        })
        .catch(err => {
            console.error("Error adding member:", err);
            alert(err.message || "Error adding member");
        });
    }
    function deleteMem(id) {
        fetch(`http://localhost:5000/members/${id}`, {
            method: "DELETE",
            headers: {
                "Content-Type": "application/json",
                "token": token
            }
        })
        .then(res => {
            if (res.ok) {
                return res.json();
            } else {
                return res.json().then(data => { throw new Error(data.message || "Error deleting member"); });
            }
        })
        .then(data => {
            alert("Member deleted successfully");
            fetchMems();
        })
        .catch(err => {
            console.error("Error deleting member:", err);
            alert(err.message || "Error deleting member");
        });
    }
    useEffect(()=>{
        fetchMems();
        setLoading(false);
    }, []);
    useEffect(() => {
        if (page > totalPages) {
          setPage(totalPages);
        }
      }, [page, totalPages]);
    
      const handleInputChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };
    return (
        <div className="home-wrapper">
          <header className="dashboard-header">
            <div className="header-text-group">
              <h1 className="section-title">Members Overview</h1>
              <p className="section-subtitle">You have {mems.length} members in your team.</p>
            </div>
    
            <div className="header-actions">
              <button className="add-task-btn" onClick={() => setShowModal(true)}>
                + Add Member
              </button>
            </div>
          </header>
          <div className="task-list-container">
            <div className="list-header">
              <span>Member Detail</span>
              <span>Email</span>
              <span>Action</span>
            </div>
            {loading ? (<Loader />) : (mems.map((mem) => (
              <div key={mem._id} className="task-row-item">
                <div className="task-main-info">
                  {/* <div className={`category-dot ${(task.category || 'general').toLowerCase()}`}></div> */}
                  <div>
                    <div className="task-name-text">{mem.name}</div>
                  </div>
                </div>
                <div>{mem.email}</div>
                <div className="action-buttons">
                  <button
                    className="discard-action-btn"
                    onClick={() => deleteMem(mem._id)}
                  >
                    Discard
                  </button>
                </div>
              </div>
            )))}
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
                  <h3>Add New Member</h3>
                  <button className="close-btn" onClick={() => setShowModal(false)}>×</button>
                </div>
    
                <form onSubmit={addMem}>
                  <div className="modal-body">
                    <div className="input-field">
                      <label>Member Name</label>
                      <input name="name" type="text" value={formData.name} onChange={handleInputChange} placeholder="e.g., John Doe" required />
                    </div>
    
                    <div className="input-row">
                      <div className="input-field">
                        <label>Email</label>
                        <input name="email" type="email" value={formData.email} onChange={handleInputChange} placeholder="e.g., john.doe@example.com" required />
                      </div>
                      <div className="input-field">
                        <label>Password</label>
                        <input name="password" type="password" value={formData.password} onChange={handleInputChange} placeholder="e.g., ********" required />
                      </div>
                    </div>
                  </div>
    
                  <div className="modal-footer">
                    <button type="button" className="cancel-btn" onClick={() => setShowModal(false)}>Cancel</button>
                    <button type="submit" className="create-btn">Add Member</button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </div>
      );
}    
export default Members;