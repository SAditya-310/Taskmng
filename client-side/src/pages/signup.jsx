import React from "react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./signup.css";
function Signup(e) {
    const navigate = useNavigate();
    // e.preventDefault();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [Name, setName] = useState("");
    const handlesubmit = async () => {
        try {
            const res = await fetch("http://localhost:5000/signup", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ name: Name, email, password })
            });
            const data = await res.json();
            if (res.ok) {
                alert("Account created successfully!");
                navigate("/");
            } else {
                alert(data.message || data.errors?.[0]?.msg || "Signup failed");
            }
        }
        catch (err) {
            console.log(err);
            alert("Error connecting to server");
        }
    }
    return (
        <div className="signup-container">
            <div className="signup-card">

                <h3 className="signup-title">Create your account</h3>

                <input
                    className="signup-input"
                    type="text"
                    placeholder="Username"
                    value={Name}
                    onChange={(e) => setName(e.target.value)}
                />

                <input
                    className="signup-input"
                    type="email"
                    placeholder="Email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                />

                <input
                    className="signup-input"
                    type="password"
                    placeholder="Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                />

                <button className="signup-btn" onClick={handlesubmit}>
                    Sign Up
                </button>

                <div className="signup-footer">
                    Already have an account?
                    <span onClick={() => navigate("/")}> Login</span>
                </div>

            </div>
        </div>

    );
}
export default Signup;