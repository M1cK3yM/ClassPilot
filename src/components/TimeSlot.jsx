import React from "react";

const TimeSlot = ({ time, subject, unit, chapter, teacher }) => {
  console.log("TimeSlot Props:", { time, subject, unit, chapter, teacher });
  return (
    <div className={`time-slot ${subject.toLowerCase()}`}>
      <div className="time">{time}</div>
      <div className="class-details">
        <div className="subject-name">
          <span className="subject-icon"></span>
          {subject}
        </div>
        <div className="class-info">
          {unit} {chapter}
        </div>
        <div className="teacher">
          <img
            src="/teacher-avatar.png"
            alt={teacher}
            className="teacher-avatar"
          />
          {teacher}
        </div>
      </div>
    </div>
  );
};

export default TimeSlot;