import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Navbar from "./components/navbar";
import Home from './components/Home';
import Dashboard from './components/dashboard';
import Profile from './components/Profile';
import PrivateLayout from './components/private';
import Login from './pages/login';
import Signup from './pages/signup';
function App() {
    return (
        <Router>
            <Routes>
                <Route path="/" element={<Login />} />
                <Route path="/signup" element={<Signup />} />
                <Route element={<PrivateLayout />}>
                    <Route path="/home" element={<Home />} />
                    <Route path="/dashboard" element={<Dashboard />} />
                    <Route path="/progress" element={<div>Progress Page</div>} />
                    <Route path="/profile" element={<Profile />} />
                </Route>
            </Routes>
        </Router>
    );
}
export default App;