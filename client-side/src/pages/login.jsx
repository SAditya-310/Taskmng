import React from "react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Link } from "react-router-dom";
import "./login.css";

function Login() {
    const navigate = useNavigate();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");

    const handlesubmit = async () => {
        try {
            const res = await fetch("http://localhost:5000/login", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({ email, password }) // ❌ removed type
            });

            const data = await res.json();

            if (res.ok && data.token) {
                localStorage.setItem("token", data.token);
                localStorage.setItem("user", JSON.stringify(data.user)); // ✅ store user from backend
                if (data.user.role === "Admin") {
                    navigate("/Home");
                } else {
                    navigate("/Home");
                }
            } else {
                alert(data.message || "Invalid credentials");
            }
        } catch (err) {
            console.log(err);
            alert("Error connecting to server");
        }
    };

    return (
        <div className="login-container">
            <div className="login-card">

                <h3 className="login-title">Sign in to Task Manager</h3>

                <input
                    className="login-input"
                    type="text"
                    placeholder="Email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                />

                <input
                    className="login-input"
                    type="password"
                    placeholder="Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                />

                {/* ❌ removed select */}

                <button className="login-btn" onClick={handlesubmit}>
                    Login
                </button>

                <Link className="sign" to="/signup">
                    Don't have an account? Sign up
                </Link>

                <div className="login-footer">
                    Stay focused. Finish your most important task today.
                </div>

            </div>
        </div>
    );
}

export default Login;