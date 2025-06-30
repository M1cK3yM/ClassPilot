import React, { useState, useEffect } from "react";
import { courseService } from "../utils/api";

const CreateClassPopup = ({ onClose, onCreateClass, user }) => {
  const [className, setClassName] = useState("");
  const [description, setDescription] = useState("");
  const [startingDate, setStartingDate] = useState("");
  const [startingTime, setStartingTime] = useState("");
  const [endingTime, setEndingTime] = useState("");
  const [selectedCourseId, setSelectedCourseId] = useState("");
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const coursesData = await courseService.fetchCourses(user);
        setCourses(coursesData);
      } catch (error) {
        console.error("Error fetching courses:", error);
        alert("Failed to fetch courses. Please try again later.");
      } finally {
        setLoading(false);
      }
    };
    fetchCourses();
  }, [user]);

  const handleSubmit = (e) => {
    e.preventDefault();
    // Basic validation
    if (
      !className ||
      !description ||
      !startingDate ||
      !startingTime ||
      !endingTime ||
      !selectedCourseId
    ) {
      alert("Please fill in all fields.");
      return;
    }

    // Combine date and times into Date objects
    const startDateTime = new Date(`${startingDate}T${startingTime}`);
    const endDateTime = new Date(`${startingDate}T${endingTime}`);

    // Call the onCreateClass function with the new RoomDTO structure
    onCreateClass(selectedCourseId, {
      name: className,
      description,
      instructorId: user.userId,
      instructorName: user.username,
      startingDate: startDateTime,
      endingDate: endDateTime,
    });
    // Clear form fields and close the popup
    setClassName("");
    setDescription("");
    setStartingDate("");
    setStartingTime("");
    setEndingTime("");
    setSelectedCourseId("");
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full flex justify-center items-center">
      <div className="popup-content bg-white p-6 rounded-lg shadow-xl w-96">
        <h2 className="text-xl font-bold mb-4">Create New Class</h2>
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label
              className="block text-gray-700 text-sm font-bold mb-2"
              htmlFor="courseSelect"
            >
              Select Course
            </label>
            <select
              id="courseSelect"
              value={selectedCourseId}
              onChange={(e) => setSelectedCourseId(e.target.value)}
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              required
              disabled={loading}
            >
              <option value="">Select a course...</option>
              {courses.map((course, index) => (
                <option key={index} value={course.courseId}>
                  {course.courseName}
                </option>
              ))}
            </select>
          </div>
          <div className="mb-4">
            <label
              className="block text-gray-700 text-sm font-bold mb-2"
              htmlFor="className"
            >
              Class Name
            </label>
            <input
              type="text"
              id="className"
              value={className}
              onChange={(e) => setClassName(e.target.value)}
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              required
            />
          </div>
          <div className="mb-4">
            <label
              className="block text-gray-700 text-sm font-bold mb-2"
              htmlFor="description"
            >
              Description
            </label>
            <textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              required
            />
          </div>
          <div className="mb-4">
            <label
              className="block text-gray-700 text-sm font-bold mb-2"
              htmlFor="startingDate"
            >
              Starting Date
            </label>
            <input
              type="date"
              id="startingDate"
              value={startingDate}
              onChange={(e) => setStartingDate(e.target.value)}
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              required
            />
          </div>
          <div className="mb-4">
            <label
              className="block text-gray-700 text-sm font-bold mb-2"
              htmlFor="startingTime"
            >
              Starting Time
            </label>
            <input
              type="time"
              id="startingTime"
              value={startingTime}
              onChange={(e) => setStartingTime(e.target.value)}
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              required
            />
          </div>
          <div className="mb-4">
            <label
              className="block text-gray-700 text-sm font-bold mb-2"
              htmlFor="endingTime"
            >
              Ending Time
            </label>
            <input
              type="time"
              id="endingTime"
              value={endingTime}
              onChange={(e) => setEndingTime(e.target.value)}
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              required
            />
          </div>
          <div className="flex items-center justify-between">
            <button
              type="submit"
              className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
            >
              Create Class
            </button>
            <button
              type="button"
              onClick={onClose}
              className="inline-block align-baseline font-bold text-sm text-blue-500 hover:text-blue-800"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateClassPopup;

