import React from "react";
import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { courseService, classService } from "../utils/api";
import { useAuth } from "../context/AuthContext.jsx";

const CourseDetail = () => {
  const { courseId } = useParams();
  console.log(courseId);
  const [course, setCourse] = useState(null);
  const [classes, setClasses] = useState([]);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    const fetchCourseDetails = async () => {
      try {
        const courseData = await courseService.getCourseById(courseId);
        console.log(courseData);
        setCourse(courseData);
      } catch (error) {
        console.error("Error fetching course details:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchCourseDetails();
  }, [courseId]);

  useEffect(() => {
    const fetchClasses = async () => {
      try {
        setLoading(true);
        const response = await classService.featchClasses(user);
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
              {classItem.status == "LIVE" ? "LIVE" : classItem.status == "INACTIVE" ? "Scheduled" : "Completed"}
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
  if (loading) return <div>Loading...</div>;
  if (!course) return <div>Course not found</div>;

  return (
    <div className="course-detail-container">
      <div className="course-header bg-white rounded-lg shadow-md p-6 flex items-center gap-6 mb-8">
        <div
          className="course-icon flex items-center justify-center w-20 h-20 rounded-xl"
          style={{ backgroundColor: course.color || "#6366F1" }}
        >
          <span className="material-icons text-4xl text-white">
            {course.icon || "school"}
          </span>
        </div>
        <div className="flex flex-col gap-2">
          <h2 className="text-3xl font-bold text-gray-900 mb-1">
            {course.courseName}
          </h2>
          <div className="flex flex-wrap gap-4 items-center">
            <div className="flex items-center gap-2 bg-blue-50 px-3 py-1 rounded-full text-blue-700 font-medium">
              <span className="material-icons text-base">person</span>
              Instructor:{" "}
              <span className="font-semibold">{course.instructors.join(", ")}</span>
            </div>
            <div className="flex items-center gap-2 bg-green-50 px-3 py-1 rounded-full text-green-700 font-medium">
              <span className="material-icons text-base">schedule</span>
              Credit Hours:{" "}
              <span className="font-semibold">{course.credits}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="classes-grid">
        {classes.length === 0 ? (
          <p>No classes found for this course</p>
        ) : (
          classes.map(renderClassCard)
        )}
      </div>
    </div>
  );
};

export default CourseDetail;
