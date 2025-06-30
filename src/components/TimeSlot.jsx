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
          {chapter}
        </div>
        <div className="teacher">
          <span className="material_icon">👨‍🏫 </span>
          {teacher}
        </div>
      </div>
    </div>
  );
};

export default TimeSlot;