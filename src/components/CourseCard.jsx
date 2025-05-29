import React from "react";
import { useNavigate } from "react-router-dom";

// Color mapping for course names
const courseColorMap = {
  Database: "#4F46E5", // Indigo
  Programming: "#10B981", // Emerald
  Mathematics: "#F59E42", // Orange
  Physics: "#F43F5E", // Rose
  Chemistry: "#6366F1", // Blue
  // Add more as needed
};
const defaultColor = "#64748B"; // Slate

const CourseCard = ({ course, user }) => {
  const navigate = useNavigate();

  // Use color from course, or assign based on course name, or fallback to default
  const color =
    course.color || courseColorMap[course.courseName] || defaultColor;

  const handleContinueLearning = () => {
    navigate(`/${user.role.toLowerCase()}/courses/${course.courseId}`);
  };

  return (
    <>
      <div className="course-card shadow-md round">
        <div
          className="course-header"
          style={{ backgroundColor: color + "10" }}
        >
          <div
            className="course-icon"
            style={{ backgroundColor: color }}
          >
            <span className="material-icons" style={{ color: "white" }}>
              {course.icon}
            </span>
          </div>
        </div>
        <div className="course-content text-black">
          <h3 className="course-name">{course.courseName}</h3>
          {course.instructors && (
            <p className="course-teacher">Instructor : {course.instructors.join(", ")}</p>
          )}
          {course.NoOfStudents && (
            <p className="no-of-students">
              Number of Students: {course.NoOfStudents}
            </p>
          )}
          <div className="course-stats">
            <div className="stat">
              <p>Credit Hour : {course.credits}</p>
            </div>
          </div>
          <div className="course-actions">
            <button className="continue-btn" onClick={handleContinueLearning}>
              View Detail
              <span className="material-icons">arrow_forward</span>
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default CourseCard;
