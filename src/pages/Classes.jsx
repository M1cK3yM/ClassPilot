import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import CreateClassPopup from "../components/CreateClassPopup.jsx";
import { classService } from "../utils/api";
import { useAuth } from "../context/AuthContext.jsx";

const Classes = () => {
  const [activeTab, setActiveTab] = useState("live");
  const [showPopup, setShowPopup] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const { user } = useAuth();

  const [classes, setClasses] = useState([]);

  // Calculate tab counts
  const liveCount = classes.filter((c) => c.status == "LIVE").length;
  const scheduledCount = classes.filter((c) => c.status == "INACTIVE").length;
  const completedCount = classes.filter((c) => c.status == "COMPLETED").length;

  const totalCount = classes.length;

  useEffect(() => {
    const fetchClasses = async () => {
      try {
        setLoading(true);
        const response = await classService.fetchClasses(user);
        setClasses(response);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      fetchClasses();
    }
  }, [user]);

  // Add a function to refresh classes (can be called when returning from streaming)
  const refreshClasses = async () => {
    try {
      setLoading(true);
      const response = await classService.fetchClasses(user);
      setClasses(response);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Listen for focus events to refresh classes when returning from streaming page
  useEffect(() => {
    const handleFocus = () => {
      refreshClasses();
    };

    window.addEventListener('focus', handleFocus);
    return () => window.removeEventListener('focus', handleFocus);
  }, [user]);

  const handleCreateClass = async (courseId, newClassData) => {
    try {
      const response = await classService.createClass(courseId, newClassData);
      console.log(response);
      setClasses((prev) => [...prev, response]);
    } catch (error) {
      console.error("Error creating class:", error);
    }
  };

  const handleClassBtn = async (classId) => {
    navigate(`/teacher/streaming/${classId}`);
  };

  const handleJoinClass = async (classId) => {
    navigate(`/student/consumer/${classId}`);
  };

  const renderClassCard = (classItem) => {
    const startDate = classItem.startingDate
      ? new Date(classItem.startingDate).toLocaleDateString()
      : "";
    const endDate = classItem.endingDate
      ? new Date(classItem.endingDate).toLocaleDateString()
      : "";

    return (
      <div key={classItem.id} className="class-card">
        <div className="class-header">
          <div className="class-icon" style={{ backgroundColor: "#9370DB" }}>
            <span className="material-icons" style={{ color: "white" }}>
              {classItem.status == "LIVE" ? "video_call" : "class"}
            </span>
          </div>
          <div className="class-status">
            <span
              className={`status-badge ${classItem.status == "LIVE" ? "active" : "inactive"}`}
            >
              {classItem.status == "LIVE" ? "Live" : classItem.status == "INACTIVE" ? "Scheduled" : "Completed"}
            </span>
          </div>
        </div>
        <div className="class-content">
          <h3 className="class-subject">{classItem.name}</h3>
          <p className="class-teacher">{classItem.instructorName}</p>
          <div className="class-info">
            {classItem.description && (
              <div className="info-item">
                <span className="material-icons">description</span>
                <span>{classItem.description}</span>
              </div>
            )}
            {startDate && (
              <div className="info-item">
                <span className="material-icons">event</span>
                <span>Starts: {startDate}</span>
              </div>
            )}
            {endDate && (
              <div className="info-item">
                <span className="material-icons">event</span>
                <span>Ends: {endDate}</span>
              </div>
            )}
            <div className="info-item">
              <span className="material-icons">people</span>
              <span>{classItem.capacity} students</span>
            </div>
          </div>
          <div className="class-actions">
            {classItem.status == "LIVE" &&
              (user.role === "TEACHER" ? (
                <button
                  onClick={() => handleClassBtn(classItem.id)}
                  className="preview-btn bg-purple-500 text-white px-4 py-2 rounded-full hover:bg-purple-600 transition flex items-center gap-2 shadow-lg"
                >
                  <span className="material-icons">preview</span>
                  Preview Class
                </button>
              ) : (
                <button
                  onClick={() => handleJoinClass(classItem.id)}
                  className="join-btn"
                >
                  Join Class
                  <span className="material-icons">video_call</span>
                </button>
              ))}
            {classItem.status == "INACTIVE" &&
              (user.role === "TEACHER" ? (
                <button
                  className="start-stream-btn bg-blue-500 text-white px-4 py-2 rounded-full hover:bg-blue-600 transition flex items-center gap-2 shadow-lg"
                  onClick={() => handleClassBtn(classItem.id)}
                >
                  <span className="material-icons">live_tv</span>
                  Start Streaming
                </button>
              ) : (
                <button className="reminder-btn">
                  Set Reminder
                  <span className="material-icons">notifications</span>
                </button>
              ))}
            {classItem.status == "COMPLETED" && (
              <button className="reminder-btn">
                Completed
                <span className="material-icons">check_circle</span>
              </button>
            )}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="classes-container">
      <div className="classes-header">
        <h1>Classes</h1>
        <div className="tabs">
          <button
            className={`tab-btn ${activeTab === "live" ? "active" : ""}`}
            onClick={() => setActiveTab("live")}
          >
            Live Classes
            <span className="badge">{liveCount}</span>
          </button>
          <button
            className={`tab-btn ${activeTab === "scheduled" ? "active" : ""}`}
            onClick={() => setActiveTab("scheduled")}
          >
            Scheduled
            <span className="badge">{scheduledCount}</span>
          </button>
          <button
            className={`tab-btn ${activeTab === "completed" ? "active" : ""}`}
            onClick={() => setActiveTab("completed")}
          >
            Completed
            <span className="badge">{completedCount}</span>
          </button>
        </div>
      </div>

      <div className="classes-grid">
        {activeTab === "live" &&
          classes.filter((c) => c.status == "LIVE").map(renderClassCard)}
        {activeTab === "scheduled" &&
          classes.filter((c) => c.status == "INACTIVE").map(renderClassCard)}
        {activeTab === "completed" &&
          classes.filter((c) => c.status == "COMPLETED").map(renderClassCard)}
      </div>

      {showPopup && user.role == "TEACHER" && (
        <CreateClassPopup
          onClose={() => setShowPopup(false)}
          onCreateClass={handleCreateClass}
          user={user}
        />
      )}

      {user.role == "TEACHER" && (
        <div className="fixed bottom-4 right-4 z-50">
          <button
            className="action-btn fixed-btn bg-green-500 text-white px-4 py-2 rounded-full hover:bg-green-600 transition flex items-center gap-2 shadow-lg"
            onClick={() => setShowPopup(true)}
          >
            <span className="material-icons">add</span>
            Create New Class
          </button>
        </div>
      )}
    </div>
  );
};

export default Classes;
