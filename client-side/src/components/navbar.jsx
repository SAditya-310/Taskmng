import React from "react";
import { Link } from "react-router-dom";
import "./navbar.css";
// import User from "../../../server-side/models/User";
function Navbar() {
    const usr = JSON.parse(localStorage.getItem("user"));
    const userTypeLabel = usr?.role === "Admin" ? "Team Leader" : "Team Member";
    return (
        <div>
            <nav className="navbar navbar-expand-lg bg-body-tertiary">
                <div className="container-fluid">
                    <Link className="navbar-brand" to="/">Task Manager</Link>
                    <button className="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarSupportedContent" aria-controls="navbarSupportedContent" aria-expanded="false" aria-label="Toggle navigation">
                        <span className="navbar-toggler-icon"></span>
                    </button>
                    <div className="collapse navbar-collapse" id="navbarSupportedContent">
                        <ul className="navbar-nav me-auto mb-2 mb-lg-0">
                            <li className="nav-item">
                                <Link className="nav-link active" aria-current="page" to="/home">Home</Link>
                            </li>
                            {/* <li className="nav-item">
                                <Link className="nav-link" to="/progress">Progress</Link>
                            </li> */}
                            <li className="nav-item">
                                <Link className="nav-link" to="/dashboard">Dashboard</Link>
                            </li>
                            <li className="nav-item">
                                <Link className="nav-link" to="/profile">Profile</Link>
                            </li>
                            {usr && usr.role === "Admin" && (
                                <li className="nav-item">
                                    <Link className="nav-link" to="/members">Members</Link>
                                </li>
                            )}
                        </ul>
                        {/* <form className="d-flex" role="search">
                            <input className="form-control me-2" type="search" placeholder="Search" aria-label="Search" />
                            <button className="btn btn-outline-success" type="submit">Search</button>
                        </form> */}
                        {usr && <div className="navbar-user-type">{userTypeLabel}</div>}
                    </div>
                </div>
            </nav>
        </div>
    );
}
export default Navbar;