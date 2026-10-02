import React, { useEffect, useState } from "react";
import axios from "axios";
import "./AdminAnnouncement.css";

const AnnouncementManagement = () => {
  // =========================
  // FORM STATES
  // =========================
  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");
  const [image, setImage] = useState("");
  const [type, setType] = useState("general");
  const [isPublished, setIsPublished] = useState(false);

  // =========================
  // ANNOUNCEMENT STATES
  // =========================
  const [announcements, setAnnouncements] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [messageText, setMessageText] = useState("");

  const token = localStorage.getItem("adminToken");

  // =========================
  // API
  // =========================
  const API_BASE = "http://localhost:5000/api/announcements";

  // =========================
  // FETCH ANNOUNCEMENTS
  // =========================
  const fetchAnnouncements = async () => {
    try {
      setLoading(true);

      const { data } = await axios.get(API_BASE, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setAnnouncements(data.announcements || []);
    } catch (err) {
      console.error("Fetch announcements error:", err);

      const serverMsg =
        err.response?.data?.message || err.message;

      setMessageText(`❌ Failed to fetch announcements: ${serverMsg}`);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnnouncements();
  }, []);

  // =========================
  // RESET FORM
  // =========================
  const resetForm = () => {
    setTitle("");
    setMessage("");
    setImage("");
    setType("general");
    setIsPublished(false);
    setEditingId(null);
  };

  // =========================
  // CREATE ANNOUNCEMENT
  // =========================
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!title.trim() || !message.trim()) {
      setMessageText("❌ Title and message are required.");
      return;
    }

    try {
      setLoading(true);

      await axios.post(
        API_BASE,
        {
          title,
          message,
          image,
          type,
          isPublished,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setMessageText("✅ Announcement created successfully!");

      resetForm();
      fetchAnnouncements();
    } catch (err) {
      console.error("Create announcement error:", err);

      const serverMsg =
        err.response?.data?.message || err.message;

      setMessageText(
        `❌ Failed to create announcement: ${serverMsg}`
      );
    } finally {
      setLoading(false);
    }
  };

  // =========================
  // UPDATE ANNOUNCEMENT
  // =========================
  const handleUpdate = async () => {
    if (!title.trim() || !message.trim()) {
      setMessageText("❌ Title and message are required.");
      return;
    }

    try {
      setLoading(true);

      await axios.put(
        `${API_BASE}/${editingId}`,
        {
          title,
          message,
          image,
          type,
          isPublished,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setMessageText("✅ Announcement updated successfully!");

      resetForm();
      fetchAnnouncements();
    } catch (err) {
      console.error("Update announcement error:", err);

      const serverMsg =
        err.response?.data?.message || err.message;

      setMessageText(
        `❌ Failed to update announcement: ${serverMsg}`
      );
    } finally {
      setLoading(false);
    }
  };

  // =========================
  // DELETE ANNOUNCEMENT
  // =========================
  const handleDelete = async (id) => {
    if (
      !window.confirm(
        "Are you sure you want to delete this announcement?"
      )
    ) {
      return;
    }

    try {
      setLoading(true);

      await axios.delete(`${API_BASE}/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setMessageText("✅ Announcement deleted successfully!");

      fetchAnnouncements();
    } catch (err) {
      console.error("Delete announcement error:", err);

      const serverMsg =
        err.response?.data?.message || err.message;

      setMessageText(
        `❌ Failed to delete announcement: ${serverMsg}`
      );
    } finally {
      setLoading(false);
    }
  };

  // =========================
  // START EDIT
  // =========================
  const startEdit = (announcement) => {
    setEditingId(announcement._id);

    setTitle(announcement.title || "");
    setMessage(announcement.message || "");
    setImage(announcement.image || "");
    setType(announcement.type || "general");
    setIsPublished(Boolean(announcement.isPublished));

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  // =========================
  // TOGGLE PUBLISH
  // =========================
  const togglePublish = async (announcement) => {
    try {
      setLoading(true);

      await axios.put(
        `${API_BASE}/${announcement._id}`,
        {
          isPublished: !announcement.isPublished,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setMessageText(
        announcement.isPublished
          ? "✅ Announcement unpublished."
          : "✅ Announcement published."
      );

      fetchAnnouncements();
    } catch (err) {
      console.error("Publish toggle error:", err);

      const serverMsg =
        err.response?.data?.message || err.message;

      setMessageText(
        `❌ Failed to change publication status: ${serverMsg}`
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="announcement-container">

      {/* =========================
          PAGE TITLE
      ========================= */}
      <h1 className="announcement-title">
        Announcement Management
      </h1>

      {messageText && (
        <p className="announcement-message">
          {messageText}
        </p>
      )}

      {/* =========================
          FORM
      ========================= */}
      <form
        className="announcement-form"
        onSubmit={
          editingId
            ? (e) => e.preventDefault()
            : handleSubmit
        }
      >
        <h2>
          {editingId
            ? "Edit Announcement"
            : "Create Announcement"}
        </h2>

        {/* TITLE */}
        <input
          type="text"
          placeholder="Announcement Title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
        />

        {/* MESSAGE */}
        <textarea
          placeholder="Announcement Message"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          rows={6}
          required
        />

        {/* IMAGE */}
        <input
          type="text"
          placeholder="Image URL (optional)"
          value={image}
          onChange={(e) => setImage(e.target.value)}
        />

        {/* TYPE */}
        <select
          value={type}
          onChange={(e) => setType(e.target.value)}
        >
          <option value="general">General</option>
          <option value="important">Important</option>
          <option value="event">Event</option>
          <option value="emergency">Emergency</option>
        </select>

        {/* PUBLISH */}
        <label className="publish-checkbox">
          <input
            type="checkbox"
            checked={isPublished}
            onChange={(e) =>
              setIsPublished(e.target.checked)
            }
          />

          Publish immediately
        </label>

        {/* BUTTONS */}
        <div className="announcement-form-actions">
          {editingId ? (
            <>
              <button
                type="button"
                className="announcement-btn"
                onClick={handleUpdate}
                disabled={loading}
              >
                {loading
                  ? "Updating..."
                  : "Update Announcement"}
              </button>

              <button
                type="button"
                className="announcement-cancel-btn"
                onClick={resetForm}
              >
                Cancel
              </button>
            </>
          ) : (
            <button
              type="submit"
              className="announcement-btn"
              disabled={loading}
            >
              {loading
                ? "Creating..."
                : "Create Announcement"}
            </button>
          )}
        </div>
      </form>

      {/* =========================
          ANNOUNCEMENT LIST
      ========================= */}
      <h2 className="announcement-subtitle">
        Existing Announcements
      </h2>

      {loading && announcements.length === 0 ? (
        <p>Loading announcements...</p>
      ) : announcements.length === 0 ? (
        <p>No announcements created yet.</p>
      ) : (
        <div className="announcement-list">

          {announcements.map((announcement) => (
            <div
              className="announcement-card"
              key={announcement._id}
            >
              {announcement.image && (
                <img
                  src={announcement.image}
                  alt={announcement.title}
                  className="announcement-image"
                />
              )}

              <h3>{announcement.title}</h3>

              <p className="announcement-card-message">
                {announcement.message}
              </p>

              <p>
                Type:{" "}
                <strong>{announcement.type}</strong>
              </p>

              <p>
                Status:{" "}
                <strong
                  className={
                    announcement.isPublished
                      ? "published"
                      : "draft"
                  }
                >
                  {announcement.isPublished
                    ? "Published"
                    : "Draft"}
                </strong>
              </p>

              {announcement.publishedAt && (
                <p>
                  Published:{" "}
                  {new Date(
                    announcement.publishedAt
                  ).toLocaleString()}
                </p>
              )}

              <div className="announcement-actions">

                <button
                  onClick={() =>
                    startEdit(announcement)
                  }
                >
                  ✏️ Edit
                </button>

                <button
                  onClick={() =>
                    togglePublish(announcement)
                  }
                >
                  {announcement.isPublished
                    ? "Unpublish"
                    : "Publish"}
                </button>

                <button
                  onClick={() =>
                    handleDelete(announcement._id)
                  }
                >
                  🗑 Delete
                </button>

              </div>
            </div>
          ))}

        </div>
      )}
    </div>
  );
};

export default AnnouncementManagement;