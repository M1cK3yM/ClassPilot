import axios from "axios";

// const API_BASE_URL = "http://10.139.27.98:8080"; // API Gateway URL
const API_BASE_URL = "http://localhost:8080"; // API Gateway URL
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

export const authService = {
  login: async (username, password) => {
    try {
      const response = await api.post("/api/auth/login", {
        username,
        password,
      });
      console.log(response);
      return response.data;
    } catch (error) {
      console.log(response);
      throw (
        error.response?.data || { message: "An error occurred during login" }
      );
    }
  },
};

export const courseService = {
  fetchCourses: async (user) => {
    try {
      let response;
      if (user.role == "STUDENT") {
        response = await api.get(`/api/courses/user/${user.userId}/enrolled`);
        console.log(user);
      } else if (user.role == "TEACHER") {
        console.log("Teachers information:", user);
        response = await api.get(`/api/courses/user/${user.userId}/assigned`);
      }
      console.log(response);
      return response.data;
    } catch (error) {
      throw (
        error.response?.data || {
          message: "An error occurred while fetching courses",
        }
      );
    }
  },
  getCourseById: async (courseId) => {
    try {
      const response = await api.get(`/api/courses/${courseId}`);
      console.log(response.data);
      return response.data;
    } catch (error) {
      throw (
        error.response?.data || {
          message: "An error occurred while fetching course by id",
        }
      );
    }
  },
};

export const classService = {
  fetchClassesCourseId: async (user, courseId) => {
    try{
      const response = await api.get(`/api/courses/user/${user.userId}/course/${courseId}/classrooms`);
      console.log(response.data);
      return response.data;
    } catch (error) {
      throw (
        error.response?.data || {
          message: "An error occurred while fetching classes for course",
        }
      );
      
    }
  },
  featchClasses: async (user) => {
    try {
      let response;
      if (user.role == "STUDENT") {
        response = await api.get(`/api/courses/user/${user.userId}/${user.role.toLowerCase()}/classrooms`);
      } else if (user.role == "TEACHER") {
        response = await api.get(`/api/courses/user/${user.userId}/instructor/classrooms`);
      }
      console.log(response.data);
      return response.data;
    } catch (error) {
      throw (
        error.response?.data || {
          message: "An error occurred while fetching classes",
        }
      );
    }
  },

  createClass: async (courseId, classData) => {
    try {
      const response = await api.post(`/api/courses/create/${courseId}/class`, classData);
      console.log(response);
      return response.data;
    } catch (error) {
      console.log(error)
    }
  },
};

export default api;
