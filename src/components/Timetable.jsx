import React, { useState } from "react";
import TimeSlot from "../components/TimeSlot.jsx";

const Timetable = () => {
  const [activeDay, setActiveDay] = useState("02");

  const timeSlotsByDay = {
    "01": [
      {
        time: "08:00 AM-08:45 AM",
        subject: "English",
        unit: "Unit 2 -Supplementary",
        chapter: "Chapter 7 - The midnight visitor",
        teacher: "Catherine",
      },
      {
        time: "08:45 AM-09:30 AM",
        subject: "Maths",
        unit: "Unit 2 -Suplementary",
        chapter: "Chapter 7 - Fourier Series",
        teacher: "Catherin",
      },
    ],
    "02": [
      {
        time: "09:30 AM-10:15 AM",
        subject: "Physics",
        unit: "Unit 2 -Suplementary",
        chapter: "Chapter 7 - Fourier Series",
        teacher: "Catherin",
      },
      {
        time: "10:15 AM-11:00 AM",
        subject: "Botany",
        unit: "Unit 2 -Suplementary",
        chapter: "Chapter 7 - Fourier Series",
        teacher: "Catherin",
      },
    ],
    "03": [
      {
        time: "11:00 AM-11:45 AM",
        subject: "Tamil",
        unit: "Unit 2 -Suplementary",
        chapter: "Chapter 7 - Fourier Series",
        teacher: "Catherin",
      },
      {
        time: "11:45 AM-12:30 PM",
        subject: "Chemistry",
        unit: "Unit 2 -Suplementary",
        chapter: "Chapter 7 - Fourier Series",
        teacher: "Catherin",
      },
    ],
    "04": [
      {
        time: "08:00 AM-09:45 AM",
        subject: "Compiler Design",
        unit: "Unit 2 - Compiler",
        chapter: "Chapter 7 - Fourier Series",
        teacher: "Catherin",
      },
      {
        time: "11:45 AM-01:30 PM",
        subject: "Automata and Complexity Theory",
        unit: "Unit 2 -Suplementary",
        chapter: "Chapter 7 - Fourier Series",
        teacher: "Achenef",
      },
    ],
  };

  const weekDays = [
    { day: "Mon", date: "01" },
    { day: "Tue", date: "02" },
    { day: "Wed", date: "03" },
    { day: "Thu", date: "04" },
    { day: "Fri", date: "05" },
  ];

  return (
    <div className="timetable-section">
      <div className="timetable-header">
        <h2>Timetable</h2>
        <div className="month-selector">May, 2025</div>
      </div>

      <div className="week-days">
        {weekDays.map((day) => (
          <div
            key={day.date}
            className={`day-item ${activeDay === day.date ? "active" : ""}`}
            onClick={() => setActiveDay(day.date)}
          >
            <span className="day">{day.day}</span>
            <span className="date">{day.date}</span>
          </div>
        ))}
      </div>

      <div className="time-slots-container">
        <div className="time-slots">
          {timeSlotsByDay[activeDay]?.map((slot, index) => (
            <TimeSlot
              key={index}
              time={slot.time}
              subject={slot.subject}
              unit={slot.unit}
              chapter={slot.chapter}
              teacher={slot.teacher}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default Timetable;

