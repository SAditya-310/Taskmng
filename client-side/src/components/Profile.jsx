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
        <div className="profile-empty-state">No profile data found.</div>
      </div>
    );
  }

  const isLeader = profileData.role === "Admin";
  const headline = isLeader ? "Team leader overview" : "Member progress overview";
  const summary = isLeader
    ? "Track the health of your team, member activity, and overall delivery rhythm."
    : "See your personal execution metrics and the team lead overseeing your work.";
  const primaryStats = isLeader
    ? [
        { label: "Team members", value: profileData.teamMembersCount ?? 0 },
        { label: "Active members", value: profileData.activeMembersCount ?? 0 },
        { label: "Assigned tasks", value: profileData.totalTasks ?? 0 },
        { label: "Completion rate", value: `${profileData.accuracy ?? 0}%` }
      ]
    : [
        { label: "Tasks completed", value: profileData.completedTasks ?? 0 },
        { label: "Tasks pending", value: profileData.pendingTasks ?? 0 },
        { label: "Tasks overdue", value: profileData.overdueTasks ?? 0 },
        { label: "Completion rate", value: `${profileData.accuracy ?? 0}%` }
      ];

  return (
    <div className="profile-wrapper">
      <div className="profile-shell">
        <div className="profile-hero">
          <div>
            <span className="profile-role-pill">{isLeader ? "Team Leader" : "Team Member"}</span>
            <h1 className="profile-title">{headline}</h1>
            <p className="profile-subtitle">{summary}</p>
          </div>

          <div className="profile-contact-card">
            <div className="profile-contact-label">Signed in as</div>
            <div className="profile-contact-name">{profileData.name}</div>
            <div className="profile-contact-email">{profileData.email}</div>
          </div>
        </div>

        <div className="profile-grid profile-grid-stats">
          {primaryStats.map((item) => (
            <div className="profile-item profile-stat-card" key={item.label}>
              <span className="profile-label">{item.label}</span>
              <span className="profile-value">{item.value}</span>
            </div>
          ))}
        </div>

        <div className="profile-grid profile-grid-details">
          <div className="profile-item profile-detail-card">
            <span className="profile-label">Name</span>
            <span className="profile-value">{profileData.name}</span>
          </div>

          <div className="profile-item profile-detail-card">
            <span className="profile-label">Email</span>
            <span className="profile-value">{profileData.email}</span>
          </div>

          {isLeader ? (
            <>
              <div className="profile-item profile-detail-card">
                <span className="profile-label">Pending tasks</span>
                <span className="profile-value">{profileData.pendingTasks ?? 0}</span>
                <small className="accuracy-note">Tasks waiting on the team queue.</small>
              </div>

              <div className="profile-item profile-detail-card">
                <span className="profile-label">Overdue tasks</span>
                <span className="profile-value">{profileData.overdueTasks ?? 0}</span>
                <small className="accuracy-note">Items needing immediate follow-up.</small>
              </div>
            </>
          ) : (
            <>
              <div className="profile-item profile-detail-card">
                <span className="profile-label">Team lead</span>
                <span className="profile-value">{profileData.managerName}</span>
                <small className="accuracy-note">{profileData.managerEmail || "No manager email available"}</small>
              </div>

              <div className="profile-item profile-detail-card">
                <span className="profile-label">Total tasks</span>
                <span className="profile-value">{profileData.totalTasks ?? 0}</span>
                <small className="accuracy-note">{profileData.completedTasks ?? 0} completed, {profileData.pendingTasks ?? 0} pending.</small>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
export default Profile;