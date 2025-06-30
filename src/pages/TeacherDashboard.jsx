import React, { useState,useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {courseService, classService} from "../utils/api";
import { useAuth } from "../context/AuthContext.jsx";
import CourseCard from "../components/CourseCard.jsx";

const TeacherDashboard = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("upcoming");
  const [courses, setCourses] = useState([]);
  const [classes, setClasses] = useState([]);
  const { user } = useAuth();
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [coursesData, classesData] = await Promise.all([
          courseService.fetchCourses(user),
          classService.fetchClasses(user)
        ]);
        setCourses(coursesData);
        setClasses(classesData);
      } catch (err) {
        setError(err.message || "Failed to fetch data");
      } finally{
        setLoading(false);
      }
    };

    fetchData();
  }, [user]);

    const filteredCourses = courses.filter((course) => {
      // console.log("This is the course log :", course);
    // Add defensive checks for `courseName` and `teacher`
    const courseName = course.courseName || ""; // Default to an empty string if undefined
    const teacher = course.teacher || ""; // Default to an empty string if undefined
    console.log(course);
    return (
      courseName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      teacher.toLowerCase().includes(searchTerm.toLowerCase())
    );
  });

  // Filter scheduled classes (INACTIVE status)
  const scheduledClasses = classes.filter((classItem) => classItem.status === "INACTIVE");

  const renderSessionCard = (classItem) => {
    const startDate = classItem.startingDate
      ? new Date(classItem.startingDate).toLocaleDateString()
      : "";
    const startTime = classItem.startingDate
      ? new Date(classItem.startingDate).toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        })
      : "";
    const endTime = classItem.endingDate
      ? new Date(classItem.endingDate).toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        })
      : "";

    return (
      <div key={classItem.id} className="session-card">
        <div className="session-header">
          <h3>{classItem.name}</h3>
          <span className="status-badge scheduled">Scheduled</span>
        </div>
        <div className="session-details">
          <div className="detail-item">
            <span className="material-icons">event</span>
            <span>{startDate}</span>
          </div>
          <div className="detail-item">
            <span className="material-icons">schedule</span>
            <span>{startTime} - {endTime}</span>
          </div>
          <div className="detail-item">
            <span className="material-icons">description</span>
            <span>{classItem.description}</span>
          </div>
        </div>
        <div className="session-actions">
          <button
            className="action-btn primary"
            onClick={() => navigate(`/teacher/streaming/${classItem.id}`)}
          >
            Start Class
          </button>
        </div>
      </div>
    );
  };

  if (loading) return <p>Loading courses...</p>;
  if (error) return <p>Error: {error}</p>;

  const studentList = [
    {
      id: 1,
      name: "John Doe",
      class: "Physics 101",
      attendance: "85%",
      submissions: "8/10",
    },
    {
      id: 2,
      name: "Jane Smith",
      class: "Chemistry 201",
      attendance: "92%",
      submissions: "9/10",
    },
  ];


  const renderStudentRow = (student) => (
    <tr key={student.id}>
      <td>{student.name}</td>
      <td>{student.class}</td>
      <td>{student.attendance}</td>
      <td>{student.submissions}</td>
      <td>
        <button
          className="action-btn small"
          onClick={() => navigate(`/students/${student.id}`)}
        >
          View Details
        </button>
      </td>
    </tr>
  );


  return (
    <div className="teacher-dashboard">
      <div className="dashboard-header">
        <h1>Teacher Dashboard</h1>
      </div>

      <div className="dashboard-tabs">
        <button
          className={`tab-btn ${activeTab === "upcoming" ? "active" : ""}`}
          onClick={() => setActiveTab("upcoming")}
        >
          Upcoming Sessions
        </button>
        <button
          className={`tab-btn ${activeTab === "classes" ? "active" : ""}`}
          onClick={() => setActiveTab("classes")}
        >
          Assigned Courses
        </button>
        <button
          className={`tab-btn ${activeTab === "students" ? "active" : ""}`}
          onClick={() => setActiveTab("students")}
        >
          Student List
        </button>

      </div>

      <div className="dashboard-content">
        {activeTab === "upcoming" && (
          <div className="sessions-grid">
            {scheduledClasses.length > 0 ? (
              scheduledClasses.map(renderSessionCard)
            ) : (
              <p style={{ padding: "1rem", textAlign: "center" }}>
                No upcoming sessions scheduled.
              </p>
            )}
          </div>
        )}

        {activeTab === "classes" && (
          <div className="classes-grid">
            {filteredCourses.map((course, index) => (
              <CourseCard key={index} course={course} user={user} />
            ))}
          </div>
        )}

        {activeTab === "students" && (
          <div className="students-table-container">
            <table className="students-table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Class</th>
                  <th>Attendance</th>
                  <th>Submissions</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>{studentList.map(renderStudentRow)}</tbody>
            </table>
          </div>
        )}

      </div>
    </div>
  );
};

export default TeacherDashboard;

