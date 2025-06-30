import React from "react";
import Timetable from "../components/Timetable.jsx";

const Dashboard = () => {
  const classNotices = [
    { date: "26 Jun 2025", title: "Computer Programming basics" },
    { date: "30 Jun 2025", title: "Database configuration" },
    { date: "06 July 2025", title: "Computer Organization and architecture Test" },
    { date: "06 July 2025", title: "Research Methods Proposal Submission" },
    { date: "06 July 2025", title: "Multimedia system final exam" },
    { date: "16 July 2025", title: "Java programming special class" },
  ];

  const attendanceData = {
    present: 153,
    absent: 17,
    total: 170,
    currentMonth: 30,
  };

  return (
    <div className="dashboard-container">
      <div className="dashboard-grid">
        {/* Left Column */}
        <div className="left-column">
          <Timetable />

          {/* Attendance Section */}
          <div className="attendance-section">
            <h2>My Attendance</h2>
            <div className="attendance-stats">
              <div className="attendance-numbers">
                <div className="stat-item">
                  <span className="label">Present</span>
                  <span className="value">{attendanceData.present}</span>
                </div>
                <div className="stat-item">
                  <span className="label">Absent</span>
                  <span className="value">{attendanceData.absent}</span>
                </div>
                <div className="stat-item">
                  <span className="label">Total Working days</span>
                  <span className="value">{attendanceData.total}</span>
                </div>
              </div>
              <div className="current-month">
                <span className="days">{attendanceData.currentMonth}</span>
                <span className="label">days</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column */}
        <div className="right-column">
          {/* Class Noticeboard */}
          <div className="noticeboard class-notices">
            <h2>Class Noticeboard</h2>
            <div className="notices-list">
              {classNotices.map((notice, index) => (
                <div key={index} className="notice-item">
                  <div className="notice-date">{notice.date}</div>
                  <div className="notice-title">{notice.title}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
