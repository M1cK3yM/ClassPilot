import React, { useState, useEffect } from "react";
import TimeSlot from "../components/TimeSlot.jsx";
import { classService } from "../utils/api";
import { useAuth } from "../context/AuthContext.jsx";

const Timetable = () => {
  const [activeDay, setActiveDay] = useState("");
  const [classes, setClasses] = useState([]);
  const { user } = useAuth();

  useEffect(() => {
    const fetchClasses = async () => {
      if (!user) return;
      try {
        const response = await classService.fetchClasses(user);
        console.log("Fetched Classes:", response);
        setClasses(response);
      } catch (error) {
        console.error("Error fetching classes:", error);
        setClasses([]);
      }
    };
    fetchClasses();
  }, [user]);

  // Group classes by full date string (YYYY-MM-DD)
  const timeSlotsByDay = classes.reduce((acc, classItem) => {
    if (!classItem.startingDate) return acc;

    const startDate = new Date(classItem.startingDate);
    const endDate = classItem.endingDate ? new Date(classItem.endingDate) : null;
    const dayKey = startDate.toISOString().split("T")[0]; // e.g., "2025-06-28"

    if (!acc[dayKey]) acc[dayKey] = [];

    acc[dayKey].push({
      time: `${startDate.toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      })} - ${
        endDate
          ? endDate.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
          : ""
      }`,
      subject: classItem.name,
      unit: classItem.description,
      chapter: classItem.description,
      teacher: classItem.instructorName || "",
    });

    return acc;
  }, {});

  // Calculate current week (Monday to Friday)
  const today = new Date();
  const dayOfWeek = today.getDay(); // 0 (Sun) - 6 (Sat)
  const monday = new Date(today);
  monday.setDate(today.getDate() - ((dayOfWeek + 6) % 7)); // Get Monday

  const weekDays = Array.from({ length: 5 }).map((_, i) => {
    const d = new Date(monday);
    d.setDate(monday.getDate() + i);
    return {
      day: d.toLocaleDateString(undefined, { weekday: "short" }),
      date: d.toISOString().split("T")[0], // Use ISO format for consistent key
      fullDate: d,
    };
  });

  // Set initial active day (today if in week, otherwise Monday)
  useEffect(() => {
    const todayISO = today.toISOString().split("T")[0];
    const found = weekDays.find((d) => d.date === todayISO);
    setActiveDay(found ? todayISO : weekDays[0].date);
  }, []);

  return (
    <div className="timetable-section">
      <div className="timetable-header">
        <h2>Timetable</h2>
        <div className="month-selector">
          {weekDays[0].fullDate.toLocaleString(undefined, {
            month: "long",
          })},{" "}
          {weekDays[0].fullDate.getFullYear()}
        </div>
      </div>

      <div className="week-days">
        {weekDays.map((day) => (
          <div
            key={day.date}
            className={`day-item ${activeDay === day.date ? "active" : ""}`}
            onClick={() => setActiveDay(day.date)}
          >
            <span className="day">{day.day}</span>
            <span className="date">{day.fullDate.getDate()}</span>
          </div>
        ))}
      </div>

      <div className="time-slots-container">
        <div className="time-slots">
          {timeSlotsByDay[activeDay]?.map((slot, index) => {
            console.log("Time Slot:", slot);
            return (
              <TimeSlot
                key={index}
                time={slot.time}
                subject={slot.subject}
                unit={slot.unit}
                chapter={slot.chapter}
                teacher={slot.teacher || ""}
              />
            );
          }) || (
            <p style={{ padding: "1rem", textAlign: "center" }}>
              No classes for this day.
            </p>
          )}
        </div>
     </div>
    </div>
  );
};

export default Timetable;
