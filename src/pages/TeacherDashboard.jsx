import React, { useState,useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {courseService} from "../utils/api";
import { useAuth } from "../context/AuthContext.jsx";
import CourseCard from "../components/CourseCard.jsx";

const TeacherDashboard = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("upcoming");
  const [courses, setCourses] = useState([]);
  const { user } = useAuth();
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const data = await courseService.fetchCourses(user);
        setCourses(data);
      } catch (err) {
        setError(err.message || "Failed to fetch courses");
      } finally{
        setLoading(false);
      }
    };

    fetchCourses();
  }, []);

    const filteredCourses = courses.filter((course) => {
    // Add defensive checks for `courseName` and `teacher`
    const courseName = course.courseName || ""; // Default to an empty string if undefined
    const teacher = course.teacher || ""; // Default to an empty string if undefined
    console.log(course);
    return (
      courseName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      teacher.toLowerCase().includes(searchTerm.toLowerCase())
    );
  });


  if (loading) return <p>Loading courses...</p>;
  if (error) return <p>Error: {error}</p>;
  // Sample data - In a real app, this would come from your backend
  const upcomingSessions = [
    {
      id: 1,
      subject: "Physics Lab",
      date: "2024-03-25",
      time: "10:00 AM - 12:00 PM",
      students: 24,
      lab: "Lab 101",
      status: "scheduled",
    },
    {
      id: 2,
      subject: "Chemistry Lab",
      date: "2024-03-26",
      time: "02:00 PM - 04:00 PM",
      students: 20,
      lab: "Lab 203",
      status: "scheduled",
    },
  ];

  // const assignedClasses = [
  //   {
  //     id: 1,
  //     name: "Physics 101",
  //     students: 30,
  //     schedule: "Mon, Wed 10:00 AM",
  //     room: "Room 301",
  //     nextSession: "2024-03-25",
  //   },
  //   {
  //     id: 2,
  //     name: "Chemistry 201",
  //     students: 25,
  //     schedule: "Tue, Thu 02:00 PM",
  //     room: "Room 205",
  //     nextSession: "2024-03-26",
  //   },
  // ];

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

  const resourceBookings = [
    {
      id: 1,
      resource: "Lab 101",
      date: "2024-03-25",
      time: "10:00 AM - 12:00 PM",
      status: "confirmed",
    },
    {
      id: 2,
      resource: "Projector Room",
      date: "2024-03-26",
      time: "02:00 PM - 04:00 PM",
      status: "pending",
    },
  ];

  // const renderSessionCard = (session) => (
  //   <div key={session.id} className="session-card">
  //     <div className="session-header">
  //       <h3>{session.subject}</h3>
  //       <span className={`status-badge ${session.status}`}>
  //         {session.status}
  //       </span>
  //     </div>
  //     <div className="session-details">
  //       <div className="detail-item">
  //         <span className="material-icons">event</span>
  //         <span>{session.date}</span>
  //       </div>
  //       <div className="detail-item">
  //         <span className="material-icons">schedule</span>
  //         <span>{session.time}</span>
  //       </div>
  //       <div className="detail-item">
  //         <span className="material-icons">location_on</span>
  //         <span>{session.lab}</span>
  //       </div>
  //       <div className="detail-item">
  //         <span className="material-icons">people</span>
  //         <span>{session.students} students</span>
  //       </div>
  //     </div>
  //     <div className="session-actions">
  //       <button
  //         className="action-btn primary"
  //         onClick={() => navigate(`/classes/${session.id}`)}
  //       >
  //         Start Session
  //       </button>
  //       <button className="action-btn secondary">View Roster</button>
  //     </div>
  //   </div>
  // );

  const renderClassCard = (classItem) => (
    <div key={classItem.id} className="class-card">
      <div className="class-header">
        <h3>{classItem.name}</h3>
        <span className="student-count">{classItem.students} students</span>
      </div>
      <div className="class-details">
        <div className="detail-item">
          <span className="material-icons">schedule</span>
          <span>{classItem.schedule}</span>
        </div>
        <div className="detail-item">
          <span className="material-icons">room</span>
          <span>{classItem.room}</span>
        </div>
        <div className="detail-item">
          <span className="material-icons">event</span>
          <span>Next: {classItem.nextSession}</span>
        </div>
      </div>
      <div className="class-actions">
        <button
          className="action-btn primary"
          onClick={() => navigate(`/classes/${classItem.id}/roster`)}
        >
          Manage Roster
        </button>
        <button className="action-btn secondary">View Attendance</button>
      </div>
    </div>
  );

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

  const renderResourceBooking = (booking) => (
    <div key={booking.id} className="booking-card">
      <div className="booking-header">
        <h3>{booking.resource}</h3>
        <span className={`status-badge ${booking.status}`}>
          {booking.status}
        </span>
      </div>
      <div className="booking-details">
        <div className="detail-item">
          <span className="material-icons">event</span>
          <span>{booking.date}</span>
        </div>
        <div className="detail-item">
          <span className="material-icons">schedule</span>
          <span>{booking.time}</span>
        </div>
      </div>
      <div className="booking-actions">
        <button className="action-btn secondary">Modify Booking</button>
        {booking.status === "pending" && (
          <button className="action-btn danger">Cancel</button>
        )}
      </div>
    </div>
  );

  return (
    <div className="teacher-dashboard">
      <div className="dashboard-header">
        <h1>Teacher Dashboard</h1>
        <div className="header-actions">
          <button
            className="action-btn primary"
            onClick={() => navigate("/schedule-session")}
          >
            Schedule New Session
          </button>
          <button
            className="action-btn secondary"
            onClick={() => navigate("/book-resource")}
          >
            Book Resource
          </button>
        </div>
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
          Assigned Classes
        </button>
        <button
          className={`tab-btn ${activeTab === "students" ? "active" : ""}`}
          onClick={() => setActiveTab("students")}
        >
          Student List
        </button>
        <button
          className={`tab-btn ${activeTab === "resources" ? "active" : ""}`}
          onClick={() => setActiveTab("resources")}
        >
          Resource Bookings
        </button>
      </div>

      <div className="dashboard-content">
        {activeTab === "upcoming" && (
          <div className="sessions-grid">
            {/* {upcomingSessions.map(renderSessionCard)} */}
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

        {activeTab === "resources" && (
          <div className="bookings-grid">
            {resourceBookings.map(renderResourceBooking)}
          </div>
        )}
      </div>
    </div>
  );
};

export default TeacherDashboard;

