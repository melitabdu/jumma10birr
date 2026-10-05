import axios from "axios";

// ==========================================
// API BASE URL
// ==========================================

const API_BASE =
  "https://jumma10birr-eiasc.onrender.com/api/announcements";

// ==========================================
// GET PUBLISHED ANNOUNCEMENTS
// ==========================================

export const getAnnouncements = async () => {
  try {
    const response = await axios.get(
      `${API_BASE}/published`
    );

    console.log(
      "📢 Announcement API Response:",
      response.data
    );

    return response.data?.announcements || [];

  } catch (error) {
    console.error(
      "❌ Get announcements error:",
      error.response?.data || error.message
    );

    throw error;
  }
};

// ==========================================
// GET SINGLE ANNOUNCEMENT
// ==========================================

export const getAnnouncementById = async (id) => {
  try {
    const response = await axios.get(
      `${API_BASE}/${id}`
    );

    console.log(
      "📢 Single announcement:",
      response.data
    );

    return response.data?.announcement || null;

  } catch (error) {
    console.error(
      "❌ Get announcement error:",
      error.response?.data || error.message
    );

    throw error;
  }
};