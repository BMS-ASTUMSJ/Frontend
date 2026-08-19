
import axios from "axios";

const API_URL =
  import.meta.env.VITE_API_URL || "http://localhost:5000/api";

const getToken = () => {
  return (
    localStorage.getItem("accessToken") ||
    localStorage.getItem("token") ||
    ""
  );
};


const getConfig = () => {
  const token = getToken();

  return {
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    withCredentials: true,
  };
};


const progressService = {

  createProgressContent: async (data) => {
    const response = await axios.post(
      `${API_URL}/progress/content`,
      data,
      getConfig()
    );

    return response.data;
  },

 

  getProgressContent: async (type = "all", week = "") => {
    const params = {};

    if (type && type !== "all") {
      params.type = type;
    }

    if (week) {
      params.week = week;
    }

    const response = await axios.get(
      `${API_URL}/progress/content`,
      {
        ...getConfig(),
        params,
      }
    );

    return response.data;
  },

  

  getContentById: async (contentId) => {
    const response = await axios.get(
      `${API_URL}/progress/content/${contentId}`,
      getConfig()
    );

    return response.data;
  },

  

  unpublishProgressContent: async (contentId) => {
    const response = await axios.patch(
      `${API_URL}/progress/content/${contentId}/unpublish`,
      {},
      getConfig()
    );

    return response.data;
  },

  

  getProgressDashboard: async () => {
    const response = await axios.get(
      `${API_URL}/progress/student/dashboard`,
      getConfig()
    );

    return response.data;
  },

  

  getStudentProgress: async (type = "all", week = "") => {
    const params = {};

    if (type && type !== "all") {
      params.type = type;
    }

    if (week) {
      params.week = week;
    }

    const response = await axios.get(
      `${API_URL}/progress/student/progress`,
      {
        ...getConfig(),
        params,
      }
    );

    return response.data;
  },

 
  getStudentSummary: async (type = "all", week = "") => {
    const params = {};

    if (type && type !== "all") {
      params.type = type;
    }

    if (week) {
      params.week = week;
    }

    const response = await axios.get(
      `${API_URL}/progress/student/summary`,
      {
        ...getConfig(),
        params,
      }
    );

    return response.data;
  },

  
  getStudentRank: async (type = "all", week = "") => {
    const params = {};

    if (type && type !== "all") {
      params.type = type;
    }

    if (week) {
      params.week = week;
    }

    const response = await axios.get(
      `${API_URL}/progress/student/rank`,
      {
        ...getConfig(),
        params,
      }
    );

    return response.data;
  },

 
  updateStudentProgress: async (contentId, data) => {
    const response = await axios.patch(
      `${API_URL}/progress/student/progress/${contentId}`,
      data,
      getConfig()
    );

    return response.data;
  },

  getOverallProgress: async (
    type = "all",
    week = "",
    batchId = ""
  ) => {
    const params = {};

    if (type && type !== "all") {
      params.type = type;
    }

    if (week) {
      params.week = week;
    }

    if (batchId) {
      params.batchId = batchId;
    }

    const response = await axios.get(
      `${API_URL}/progress/students/progress`,
      {
        ...getConfig(),
        params,
      }
    );

    return response.data;
  },


  getGenderProgress: async (
    gender,
    type = "all",
    week = "",
    batchId = ""
  ) => {
    const params = {};

    if (type && type !== "all") {
      params.type = type;
    }

    if (week) {
      params.week = week;
    }

    if (batchId) {
      params.batchId = batchId;
    }

    const response = await axios.get(
      `${API_URL}/progress/students/progress/${gender}`,
      {
        ...getConfig(),
        params,
      }
    );

    return response.data;
  },

  

  getMentorProgress: async (
    type = "all",
    week = "",
    batchId = ""
  ) => {
    const params = {};

    if (type && type !== "all") {
      params.type = type;
    }

    if (week) {
      params.week = week;
    }

    if (batchId) {
      params.batchId = batchId;
    }

    const response = await axios.get(
      `${API_URL}/progress/mentor/progress`,
      {
        ...getConfig(),
        params,
      }
    );

    return response.data;
  },

  
  getMentorProgressById: async (
    mentorId,
    type = "all",
    week = "",
    batchId = ""
  ) => {
    const params = {};

    if (type && type !== "all") {
      params.type = type;
    }

    if (week) {
      params.week = week;
    }

    if (batchId) {
      params.batchId = batchId;
    }

    const response = await axios.get(
      `${API_URL}/progress/mentor/${mentorId}/progress`,
      {
        ...getConfig(),
        params,
      }
    );

    return response.data;
  },


  getWeeklyProgress: async (week, batchId = "") => {
    const params = {};

    if (batchId) {
      params.batchId = batchId;
    }

    const response = await axios.get(
      `${API_URL}/progress/weekly/${week}`,
      {
        ...getConfig(),
        params,
      }
    );

    return response.data;
  },

 

  getOverview: async () => {
    return progressService.getOverallProgress();
  },

  getContent: async (type, week) => {
    return progressService.getProgressContent(type, week);
  },

  publishContent: async (data) => {
    return progressService.createProgressContent(data);
  },

  updateProgress: async (contentId, data) => {
    return progressService.updateStudentProgress(
      contentId,
      data
    );
  },

  getMyProgress: async (type, week) => {
    return progressService.getStudentProgress(
      type,
      week
    );
  },

  getStudentsProgress: async (type, week) => {
    return progressService.getOverallProgress(
      type,
      week
    );
  },

  submitProgress: async (contentId, data) => {
    return progressService.updateStudentProgress(
      contentId,
      data
    );
  },
};

export default progressService;