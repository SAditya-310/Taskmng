import React, { useEffect, useState } from "react";
import "./Profile.css";
import Loader from "./loader";

function Profile() {
  const [profileData, setProfileData] = useState(null);
  const [loading, setLoading] = useState(true);
  const token = localStorage.getItem("token");

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await fetch("http://localhost:5000/profile", {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            token: token,
          },
        });

        const data = await res.json();

        if (res.ok) {
          setProfileData(data);
        } else {
          alert(data.message || "Failed to fetch profile data");
        }
      } catch (err) {
        console.error("Error fetching profile:", err);
        alert("Error connecting to server");
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [token]);

  if (loading) {
    return (
      <div className="profile-wrapper">
        <Loader/>
      </div>
    );
  }

  if (!profileData) {
    return (
      <div className="profile-wrapper">
        <div className="profile-card">No profile data found.</div>
      </div>
    );
  }

  return (
    <div className="profile-wrapper">
      <div className="profile-card">
        <h1 className="profile-title">My Profile</h1>
        <p className="profile-subtitle">Your account and productivity summary</p>

        <div className="profile-grid">
          <div className="profile-item">
            <span className="profile-label">Name</span>
            <span className="profile-value">{profileData.name}</span>
          </div>

          <div className="profile-item">
            <span className="profile-label">Email</span>
            <span className="profile-value">{profileData.email}</span>
          </div>

          <div className="profile-item">
            <span className="profile-label">Tasks Completed</span>
            <span className="profile-value">{profileData.completedTasks}</span>
          </div>

          <div className="profile-item">
            <span className="profile-label">Accuracy</span>
            <span className="profile-value">{profileData.accuracy}%</span>
            <small className="accuracy-note">
              ({profileData.completedTasks} completed out of {profileData.totalTasks} total tasks)
            </small>
          </div>
        </div>
      </div>
    </div>
  );
}
export default Profile;