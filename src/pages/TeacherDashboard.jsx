import React, { useState,useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {courseService, classService, studentService} from "../utils/api";
import { useAuth } from "../context/AuthContext.jsx";
import CourseCard from "../components/CourseCard.jsx";

const TeacherDashboard = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("upcoming");
  const [courses, setCourses] = useState([]);
  const [classes, setClasses] = useState([]);
  const [students, setStudents] = useState({});
  const [expandedCourse, setExpandedCourse] = useState(null);
  const [loadingStudents, setLoadingStudents] = useState({});
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


  const handleCourseToggle = async (courseId) => {
    if (expandedCourse === courseId) {
      setExpandedCourse(null);
    } else {
      setExpandedCourse(courseId);
      
      // Fetch students if not already loaded
      if (!students[courseId]) {
        setLoadingStudents(prev => ({ ...prev, [courseId]: true }));
        try {
          const studentsData = await studentService.fetchStudentsByCourse(courseId);
          setStudents(prev => ({ ...prev, [courseId]: studentsData }));
        } catch (err) {
          console.error("Error fetching students:", err);
          setError("Failed to fetch students for this course");
        } finally {
          setLoadingStudents(prev => ({ ...prev, [courseId]: false }));
        }
      }
    }
  };

  const renderStudentRow = (student, index) => (
    <tr key={index}>
      <td>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div style={{
            width: '32px',
            height: '32px',
            borderRadius: '50%',
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'white',
            fontSize: '0.875rem',
            fontWeight: '600'
          }}>
            {student.first_name.charAt(0)}{student.last_name.charAt(0)}
          </div>
          <div>
            <div style={{ fontWeight: '600', color: '#1f2937' }}>
              {student.first_name} {student.last_name}
            </div>
          </div>
        </div>
      </td>
      <td>
        <span style={{
          background: '#f3f4f6',
          padding: '0.25rem 0.5rem',
          borderRadius: '4px',
          fontSize: '0.75rem',
          fontFamily: 'Monaco, Menlo, Ubuntu Mono, monospace'
        }}>
          {student.username}
        </span>
      </td>
      <td>
        <span style={{
          background: '#dcfce7',
          color: '#166534',
          padding: '0.25rem 0.5rem',
          borderRadius: '4px',
          fontSize: '0.75rem',
          fontWeight: '500'
        }}>
          Present
        </span>
      </td>
      <td>
        <span style={{
          background: '#dbeafe',
          color: '#1e40af',
          padding: '0.25rem 0.5rem',
          borderRadius: '4px',
          fontSize: '0.75rem',
          fontWeight: '500'
        }}>
          3/5
        </span>
      </td>
      <td>
        <button
          className="action-btn small"
          onClick={() => navigate(`/students/${student.username}`)}
          style={{
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            color: 'white',
            border: 'none',
            padding: '0.5rem 1rem',
            borderRadius: '8px',
            fontSize: '0.8rem',
            fontWeight: '500',
            cursor: 'pointer',
            transition: 'all 0.2s ease',
            boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)'
          }}
          onMouseEnter={(e) => {
            e.target.style.transform = 'translateY(-1px)';
            e.target.style.boxShadow = '0 4px 8px rgba(0, 0, 0, 0.15)';
          }}
          onMouseLeave={(e) => {
            e.target.style.transform = 'translateY(0)';
            e.target.style.boxShadow = '0 2px 4px rgba(0, 0, 0, 0.1)';
          }}
        >
          View Details
        </button>
      </td>
    </tr>
  );

  const renderCourseWithStudents = (course) => {
    const isExpanded = expandedCourse === course.courseId;
    const courseStudents = students[course.courseId] || [];
    const isLoading = loadingStudents[course.courseId];

    return (
      <div key={course.courseId} className="course-students-section">
        <div 
          className="course-header"
          onClick={() => handleCourseToggle(course.courseId)}
          style={{ 
            cursor: 'pointer', 
            padding: '1.5rem', 
            border: '1px solid #e5e7eb', 
            borderRadius: '12px',
            marginBottom: '1rem',
            background: isExpanded 
              ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' 
              : 'linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            transition: 'all 0.3s ease',
            boxShadow: isExpanded 
              ? '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)'
              : '0 1px 3px rgba(0, 0, 0, 0.1)',
            transform: isExpanded ? 'translateY(-2px)' : 'translateY(0)'
          }}
        >
          <h3 style={{ 
            margin: 0, 
            color: isExpanded ? 'white' : '#1f2937',
            fontSize: '1.25rem',
            fontWeight: '600'
          }}>
            {course.courseName}
          </h3>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            {isLoading && (
              <span style={{ 
                color: isExpanded ? 'white' : '#6b7280',
                fontSize: '0.875rem'
              }}>
                Loading...
              </span>
            )}
            <span className="material-icons" style={{ 
              transform: isExpanded ? 'rotate(180deg)' : 'rotate(0deg)',
              transition: 'transform 0.3s ease',
              color: isExpanded ? 'white' : '#6b7280',
              fontSize: '1.5rem'
            }}>
              expand_more
            </span>
          </div>
        </div>
        
        {isExpanded && (
          <div className="students-table-container" style={{ marginLeft: '1rem' }}>
            <table className="students-table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Username</th>
                  <th>Attendance</th>
                  <th>Submissions</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {courseStudents.length > 0 ? (
                  courseStudents.map(renderStudentRow)
                ) : (
                  <tr className={isLoading ? 'loading-state' : 'empty-state'}>
                    <td colSpan="5" style={{ 
                      textAlign: 'center', 
                      padding: isLoading ? '2rem 1rem' : '3rem 1rem',
                      color: isLoading ? '#6b7280' : '#9ca3af',
                      fontStyle: isLoading ? 'normal' : 'italic',
                      background: '#f9fafb'
                    }}>
                      {isLoading ? (
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
                          <div style={{
                            width: '16px',
                            height: '16px',
                            border: '2px solid #e5e7eb',
                            borderTop: '2px solid #667eea',
                            borderRadius: '50%',
                            animation: 'spin 1s linear infinite'
                          }}></div>
                          Loading students...
                        </div>
                      ) : (
                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem' }}>
                          <span className="material-icons" style={{ fontSize: '2rem', color: '#d1d5db' }}>
                            people_outline
                          </span>
                          No students enrolled in this course.
                        </div>
                      )}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    );
  };


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
          <div className="students-section">
            <h3 style={{ marginBottom: '1rem' }}>Course Students</h3>
            {filteredCourses.length > 0 ? (
              filteredCourses.map(renderCourseWithStudents)
            ) : (
              <p style={{ padding: "1rem", textAlign: "center" }}>
                No courses available.
              </p>
            )}
          </div>
        )}

      </div>
    </div>
  );
};

export default TeacherDashboard;

