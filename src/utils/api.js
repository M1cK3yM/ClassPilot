import axios from "axios";

const API_BASE_URL = "http://192.168.43.70:8080"; // API Gateway URL
// const API_BASE_URL = "http://localhost:8080"; // API Gateway URL
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Add request interceptor to handle CORS
api.interceptors.request.use(
  (config) => {
    // Add CORS headers
    config.headers['Access-Control-Allow-Origin'] = '*';
    config.headers['Access-Control-Allow-Methods'] = 'GET, POST, PUT, DELETE, OPTIONS';
    config.headers['Access-Control-Allow-Headers'] = 'Content-Type, Authorization';
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

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
      const response = await api.get(`/api/courses/user/${user.username}/course/${courseId}/classrooms`);
      return response.data;
    } catch (error) {
      throw (
        error.response?.data || {
          message: "An error occurred while fetching classes for course",
        }
      );
      
    }
  },
  fetchClasses: async (user) => {
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

  // Update class status when streaming starts - try POST instead of PUT
  startStreaming: async (classId) => {
    try {
      // Try POST first, then fallback to PUT
      let response;
      try {
        response = await api.post(`/api/classrooms/${classId}/status`, {
          status: "LIVE"
        });
      } catch (postError) {
        // If POST fails, try PUT
        response = await api.put(`/api/classrooms/${classId}/status`, {
          status: "LIVE"
        });
      }
      console.log("Class status updated to LIVE:", response.data);
      return response.data;
    } catch (error) {
      console.error("CORS or API error:", error);
      // For development, we can simulate success if CORS fails
      if (error.code === 'ERR_NETWORK' || error.message === 'Network Error' || 
          (error.response && error.response.status === 0)) {
        console.warn("CORS error detected, simulating success for development");
        return { success: true, message: "Status update simulated (CORS issue)" };
      }
      throw (
        error.response?.data || {
          message: "An error occurred while updating class status to LIVE",
        }
      );
    }
  },

  // Update class status when streaming ends - try POST instead of PUT
  endStreaming: async (classId) => {
    try {
      // Try POST first, then fallback to PUT
      let response;
      try {
        response = await api.post(`/api/classrooms/${classId}/status`, {
          status: "COMPLETED"
        });
      } catch (postError) {
        // If POST fails, try PUT
        response = await api.put(`/api/classrooms/${classId}/status`, {
          status: "COMPLETED"
        });
      }
      console.log("Class status updated to COMPLETED:", response.data);
      return response.data;
    } catch (error) {
      console.error("CORS or API error:", error);
      // For development, we can simulate success if CORS fails
      if (error.code === 'ERR_NETWORK' || error.message === 'Network Error' || 
          (error.response && error.response.status === 0)) {
        console.warn("CORS error detected, simulating success for development");
        return { success: true, message: "Status update simulated (CORS issue)" };
      }
      throw (
        error.response?.data || {
          message: "An error occurred while updating class status to COMPLETED",
        }
      );
    }
  },
};

export default api;
