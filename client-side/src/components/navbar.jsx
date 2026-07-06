import React from "react";
import { NavLink, useNavigate } from "react-router-dom";
import "./navbar.css";
// import User from "../../../server-side/models/User";
function Navbar() {
    const navigate = useNavigate();
    const usr = JSON.parse(localStorage.getItem("user"));
    const userTypeLabel = usr?.role === "Admin" ? "Team Leader" : "Team Member";

    const handleLogout = () => {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        navigate("/");
    };

    return (
        <div>
            <nav className="navbar navbar-expand-lg app-navbar">
                <div className="container-fluid">
                    <NavLink className="navbar-brand" to="/home">Task Manager</NavLink>
                    <button className="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarSupportedContent" aria-controls="navbarSupportedContent" aria-expanded="false" aria-label="Toggle navigation">
                        <span className="navbar-toggler-icon"></span>
                    </button>
                    <div className="collapse navbar-collapse" id="navbarSupportedContent">
                        <ul className="navbar-nav me-auto mb-2 mb-lg-0 app-nav-links">
                            <li className="nav-item">
                                <NavLink className={({ isActive }) => `nav-link${isActive ? " active" : ""}`} aria-current="page" to="/home">Home</NavLink>
                            </li>
                            <li className="nav-item">
                                <NavLink className={({ isActive }) => `nav-link${isActive ? " active" : ""}`} to="/dashboard">Dashboard</NavLink>
                            </li>
                            <li className="nav-item">
                                <NavLink className={({ isActive }) => `nav-link${isActive ? " active" : ""}`} to="/profile">Profile</NavLink>
                            </li>
                            {usr && usr.role === "Admin" && (
                                <li className="nav-item">
                                    <NavLink className={({ isActive }) => `nav-link${isActive ? " active" : ""}`} to="/analysis">Analysis</NavLink>
                                </li>
                            )}
                            {usr && usr.role === "Admin" && (
                                <li className="nav-item">
                                    <NavLink className={({ isActive }) => `nav-link${isActive ? " active" : ""}`} to="/members">Members</NavLink>
                                </li>
                            )}
                        </ul>
                        {usr && (
                            <div className="navbar-user-panel">
                                <div className="navbar-user-meta">
                                    <span className="navbar-user-type">{userTypeLabel}</span>
                                    <span className="navbar-user-name">{usr?.email || "Signed in"}</span>
                                </div>
                                <button className="navbar-logout-btn" onClick={handleLogout} type="button">
                                    Logout
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </nav>
        </div>
    );
}
export default Navbar;