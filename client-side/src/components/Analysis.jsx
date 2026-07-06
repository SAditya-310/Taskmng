import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./analysis.css";
import Loader from "./loader";

function Analysis() {
  const navigate = useNavigate();
  const token = localStorage.getItem("token");
  const user = JSON.parse(localStorage.getItem("user"));
  const isAdmin = user?.role === "Admin";

  const [loading, setLoading] = useState(true);
  const [report, setReport] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchAnalysis = async () => {
      if (!token) {
        navigate("/");
        return;
      }

      if (!isAdmin) {
        setError("Only admins can view team analysis.");
        setLoading(false);
        return;
      }

      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 20000);

        const [membersRes, tasksRes] = await Promise.all([
          fetch("http://localhost:5000/members", {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
              token,
            },
            signal: controller.signal,
          }),
          fetch("http://localhost:5000/getmanagertask?status=all", {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
              token,
            },
            signal: controller.signal,
          }),
        ]);

        if (!membersRes.ok) {
          const memberData = await membersRes.json().catch(() => ({}));
          throw new Error(memberData.message || "Failed to load team members");
        }

        if (!tasksRes.ok) {
          const taskData = await tasksRes.json().catch(() => ({}));
          throw new Error(taskData.message || "Failed to load team tasks");
        }

        const [members, tasks] = await Promise.all([
          membersRes.json(),
          tasksRes.json(),
        ]);

        const res = await fetch("http://localhost:5000/team-analysis", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            token,
          },
          body: JSON.stringify({ members, tasks }),
          signal: controller.signal,
        });

        const data = await res.json();
        clearTimeout(timeoutId);

        if (res.ok) {
          setReport(data);
          setError("");
        } else {
          setError(data.message || data.error || "Failed to generate analysis");
        }
      } catch (err) {
        console.error("Error loading analysis:", err);
        setError(err.name === "AbortError" ? "Analysis request timed out." : "Error connecting to server");
      } finally {
        setLoading(false);
      }
    };

    fetchAnalysis();
  }, [isAdmin, token]);

  if (loading) {
    return (
      <div className="analysis-wrapper">
        <Loader />
      </div>
    );
  }

  if (error) {
    return (
      <div className="analysis-wrapper">
        <div className="analysis-empty-state">{error}</div>
      </div>
    );
  }

  if (!report) {
    return (
      <div className="analysis-wrapper">
        <div className="analysis-empty-state">No analysis available yet.</div>
      </div>
    );
  }

  return (
    <div className="analysis-wrapper">
      <div className="analysis-shell">
        <header className="analysis-hero">
          <div>
            <span className="analysis-badge">AI Team Performance Report</span>
            <h1 className="analysis-title">Team analysis report</h1>
            <p className="analysis-subtitle">
              A concise sprint report generated from current team data.
            </p>
          </div>

          <div className="analysis-source-card">
            <div className="analysis-source-label">Report source</div>
            <div className="analysis-source-value">Gemini</div>
            <div className="analysis-source-note">Based on current tasks and members</div>
          </div>
        </header>

        <section className="analysis-summary-card">
          <h2 className="analysis-section-title">Summary</h2>
          <p className="analysis-summary-text">{report.overallSummary}</p>
          <div className="analysis-metrics">
            <div className="analysis-metric">
              <span>Productivity</span>
              <strong>{report.productivity}</strong>
            </div>
            <div className="analysis-metric">
              <span>Deadline health</span>
              <strong>{report.deadlineHealth}</strong>
            </div>
            <div className="analysis-metric">
              <span>Workload balance</span>
              <strong>{report.workloadBalance}</strong>
            </div>
          </div>
        </section>

        <section className="analysis-grid analysis-grid-three">
          <article className="analysis-card">
            <h3>Manager insight</h3>
            <ul>
              {(report.managerInsight || []).map((item, index) => (
                <li key={`insight-${index}`}>{item}</li>
              ))}
            </ul>
          </article>
        </section>

        <section className="analysis-section">
          <div className="analysis-section-head">
            <h2>Employees</h2>
            <p>Professional summary for each team member.</p>
          </div>

          <div className="analysis-grid analysis-grid-members">
            {(report.employees || []).map((employee) => (
              <article className="analysis-member-card" key={employee.name}>
                <div className="analysis-member-head">
                  <div>
                    <h3>{employee.name}</h3>
                  </div>
                </div>

                <p className="analysis-member-summary">{employee.summary}</p>
              </article>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}

export default Analysis;